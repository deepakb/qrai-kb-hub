"use client";

import { useChat } from "@ai-sdk/react";
import Link from "next/link";
import { signOutUser } from "@/app/actions/auth-actions";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold">QRAI Knowledge Base</h1>
        <form action={signOutUser}>
          <button type="submit" className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
            Sign out
          </button>
        </form>
      </header>

      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              <div>
                <div className="font-bold">{m.role}</div>
                <p>
                  {m.content.length > 0 ? (
                    m.content
                  ) : (
                    <span className="italic font-light">{"calling tool: " + m?.toolInvocations?.[0].toolName}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
          <input
            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded shadow-xl"
            value={input}
            placeholder="Ask a question or share knowledge..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
}