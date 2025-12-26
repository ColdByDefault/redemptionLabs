import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain password with a hashed password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Create a new user
 */
export async function createUser(data: {
  username: string;
  email: string;
  password: string;
}) {
  const hashedPassword = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      hashedPassword,
      enabledPlugins: [],
    },
  });
}

/**
 * Update user's enabled plugins
 */
export async function updateUserPlugins(userId: string, plugins: string[]) {
  return prisma.user.update({
    where: { id: userId },
    data: { enabledPlugins: plugins },
  });
}

/**
 * Toggle a plugin for a user
 */
export async function toggleUserPlugin(
  userId: string,
  pluginId: string,
  enable: boolean
) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const currentPlugins = user.enabledPlugins;
  let newPlugins: string[];

  if (enable) {
    newPlugins = currentPlugins.includes(pluginId)
      ? currentPlugins
      : [...currentPlugins, pluginId];
  } else {
    newPlugins = currentPlugins.filter((p) => p !== pluginId);
  }

  return updateUserPlugins(userId, newPlugins);
}
