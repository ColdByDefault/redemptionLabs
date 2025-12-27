"use server";

import { signIn, signOut } from "@/auth";
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/auth";
import { safeAction } from "@/lib/safe-action";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function loginAction(data: LoginInput) {
  return safeAction(async () => {
    const validated = loginSchema.parse(data);

    try {
      await signIn("credentials", {
        identifier: validated.identifier,
        password: validated.password,
        redirect: false,
      });

      return { success: true };
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            throw new Error("Invalid email/username or password");
          default:
            throw new Error("Something went wrong");
        }
      }
      throw error;
    }
  });
}

export async function registerAction(data: RegisterInput) {
  return safeAction(async () => {
    const validated = registerSchema.parse(data);

    // Check if email already exists
    const existingEmail = await getUserByEmail(validated.email);
    if (existingEmail) {
      throw new Error("Email already registered");
    }

    // Check if username already exists
    const existingUsername = await getUserByUsername(validated.username);
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Create the user
    const user = await createUser({
      username: validated.username,
      email: validated.email,
      password: validated.password,
    });

    // Sign in the user
    await signIn("credentials", {
      identifier: validated.email,
      password: validated.password,
      redirect: false,
    });

    return { success: true, userId: user.id };
  });
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
