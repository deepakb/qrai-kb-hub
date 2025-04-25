"use server";

import { signOut as nextAuthSignOut } from "@/app/(auth)/auth";

export async function signOutUser() {
  await nextAuthSignOut({ redirectTo: "/login" });
}