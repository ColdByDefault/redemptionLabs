"use server";

import { auth } from "@/auth";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { getPluginById, clearPluginCache } from "@/lib/plugin-registry";

const execAsync = promisify(exec);

// File to signal rebuild is needed
const REBUILD_FLAG = path.join(process.cwd(), ".rebuild-pending");

export interface InstallResult {
  success: boolean;
  message: string;
  requiresRestart?: boolean;
}

/**
 * Install a plugin package from GitHub Packages
 */
export async function installPluginAction(
  pluginId: string
): Promise<InstallResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" };
  }

  const plugin = getPluginById(pluginId);
  if (!plugin) {
    return { success: false, message: "Plugin not found" };
  }

  if (!plugin.packageName) {
    return { success: false, message: "Plugin is not installable" };
  }

  try {
    // Install the package
    const installCmd = `npm install ${plugin.packageName} --registry=https://npm.pkg.github.com`;
    console.log(`Installing plugin: ${installCmd}`);

    const { stdout, stderr } = await execAsync(installCmd, {
      cwd: process.cwd(),
      timeout: 120000, // 2 minute timeout
    });

    console.log("Install stdout:", stdout);
    if (stderr) console.log("Install stderr:", stderr);

    // Clear plugin cache so next scan picks up the new plugin
    clearPluginCache();

    // Create rebuild flag file
    await writeFile(REBUILD_FLAG, new Date().toISOString());

    return {
      success: true,
      message: `${plugin.name} installed successfully. Rebuild required.`,
      requiresRestart: true,
    };
  } catch (error) {
    console.error("Failed to install plugin:", error);
    return {
      success: false,
      message: `Failed to install ${plugin.name}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Uninstall a plugin package
 */
export async function uninstallPluginAction(
  pluginId: string
): Promise<InstallResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" };
  }

  const plugin = getPluginById(pluginId);
  if (!plugin) {
    return { success: false, message: "Plugin not found" };
  }

  if (!plugin.packageName) {
    return { success: false, message: "Plugin is not uninstallable" };
  }

  try {
    // Uninstall the package
    const uninstallCmd = `npm uninstall ${plugin.packageName}`;
    console.log(`Uninstalling plugin: ${uninstallCmd}`);

    const { stdout, stderr } = await execAsync(uninstallCmd, {
      cwd: process.cwd(),
      timeout: 60000, // 1 minute timeout
    });

    console.log("Uninstall stdout:", stdout);
    if (stderr) console.log("Uninstall stderr:", stderr);

    // Clear plugin cache
    clearPluginCache();

    // Create rebuild flag file
    await writeFile(REBUILD_FLAG, new Date().toISOString());

    return {
      success: true,
      message: `${plugin.name} uninstalled. Rebuild required.`,
      requiresRestart: true,
    };
  } catch (error) {
    console.error("Failed to uninstall plugin:", error);
    return {
      success: false,
      message: `Failed to uninstall ${plugin.name}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Trigger app rebuild
 */
export async function rebuildAppAction(): Promise<InstallResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    console.log("Starting app rebuild...");

    // Run build command
    const { stdout, stderr } = await execAsync("npm run build", {
      cwd: process.cwd(),
      timeout: 300000, // 5 minute timeout
    });

    console.log("Build stdout:", stdout);
    if (stderr) console.log("Build stderr:", stderr);

    // Remove rebuild flag
    try {
      await unlink(REBUILD_FLAG);
    } catch {
      // Flag might not exist
    }

    return {
      success: true,
      message: "App rebuilt successfully. Please restart the app.",
      requiresRestart: true,
    };
  } catch (error) {
    console.error("Failed to rebuild app:", error);
    return {
      success: false,
      message: `Build failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Check if rebuild is pending
 */
export async function isRebuildPending(): Promise<boolean> {
  try {
    await readFile(REBUILD_FLAG);
    return true;
  } catch {
    return false;
  }
}
