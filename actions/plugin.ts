"use server";

import { auth } from "@/auth";
import { toggleUserPlugin, getUserById } from "@/lib/auth";
import { safeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";

export async function togglePluginAction(pluginId: string, enable: boolean) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const user = await toggleUserPlugin(session.user.id, pluginId, enable);

    revalidatePath("/marketplace");
    revalidatePath("/", "layout"); // Revalidate navbar

    return { enabledPlugins: user.enabledPlugins };
  });
}

export async function getEnabledPluginsAction() {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const user = await getUserById(session.user.id);
    if (!user) {
      throw new Error("User not found");
    }

    return { enabledPlugins: user.enabledPlugins };
  });
}
