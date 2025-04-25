"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { register, RegisterResult } from "../actions";
import { useActionState } from "../hooks";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");

  const [state, formAction] = useActionState<RegisterResult>(register, {
    status: "idle",
  });

  useEffect(() => {
    if (state.status === "error") {
      toast.error(state.message || "Registration failed");
    } else if (state.status === "user_exists") {
      toast.error(state.message || "User with this email already exists");
    } else if (state.status === "success") {
      startTransition(() => {
        router.push("/chat");
        router.refresh();
      });
    }
  }, [state.status, state.message, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold text-center">Create an account</h1>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Join QRAI-KB-Hub to create your own knowledge base
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="your@email.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="6+ characters"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
            >
              {isPending ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="text-sm text-center">
            <span>Already have an account? </span>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}