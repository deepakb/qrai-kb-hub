"use client";

import { useReducer, useCallback } from "react";

// Generic type parameters for the action state hook
export type ActionState = {
  status: string;
  message?: string;
  [key: string]: any;
};

type ActionReducer<T> = (state: T, action: { type: string; payload: Partial<T> }) => T;

// Custom hook to replace the missing useActionState from React
export function useActionState<T extends ActionState>(
  action: (formData: FormData) => Promise<T>,
  initialState: T
): [T, (formData: FormData) => Promise<T>] {
  const reducer: ActionReducer<T> = (state, action) => {
    if (action.type === "update") {
      return { ...state, ...action.payload };
    }
    return state;
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const formAction = useCallback(
    async (formData: FormData) => {
      const result = await action(formData);
      dispatch({ type: "update", payload: result });
      return result;
    },
    [action]
  );

  return [state, formAction];
}