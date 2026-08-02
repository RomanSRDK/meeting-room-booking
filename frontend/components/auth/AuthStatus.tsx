"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { currentUserQueryOptions } from "@/queries/auth-queries";

export function AuthStatus() {
  const {
    data: user,
    isPending,
    isError,
    error,
  } = useQuery(currentUserQueryOptions);

  if (isPending) {
    return <p>Checking authentication...</p>;
  }

  if (isError) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return <p>User is not authenticated.</p>;
    }

    return <p>Failed to check authentication.</p>;
  }

  return (
    <div>
      <p>Authenticated user:</p>
      <p>{user.name}</p>
      <p>{user.email}</p>
    </div>
  );
}
