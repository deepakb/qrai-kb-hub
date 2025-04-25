"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { hashSync, genSaltSync } from "bcrypt-ts";
import { signIn } from "./auth";
import { eq } from "drizzle-orm";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export type LoginResult = {
  status: "success" | "error" | "idle";
  message?: string;
};

export type RegisterResult = {
  status: "success" | "error" | "user_exists" | "idle";
  message?: string;
};

export async function login(formData: FormData): Promise<LoginResult> {
  try {
    const { email, password } = authSchema.parse({
      email: formData.get("email"),
      password: formData.get("password")
    });

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      return { status: "error", message: "Invalid email or password" };
    }

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(err => `${err.path}: ${err.message}`).join(", ");
      return { status: "error", message: fieldErrors };
    }
    return { status: "error", message: "Something went wrong" };
  }
}

export async function register(formData: FormData): Promise<RegisterResult> {
  try {
    const { email, password } = authSchema.parse({
      email: formData.get("email"),
      password: formData.get("password")
    });

    // Check if user already exists
    const existingUser = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { status: "user_exists", message: "User with this email already exists" };
    }

    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);

    // Create user
    await db.insert(users).values({
      email,
      password: hashedPassword
    });

    // Sign in the new user
    await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(err => `${err.path}: ${err.message}`).join(", ");
      return { status: "error", message: fieldErrors };
    }
    return { status: "error", message: "Registration failed" };
  }
}