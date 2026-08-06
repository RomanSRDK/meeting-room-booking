"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { currentUserQueryOptions } from "@/queries/auth-queries";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();

  const {
    data: currentUser,
    isPending,
    isError,
  } = useQuery(currentUserQueryOptions);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    router.replace("/");
  }, [currentUser, router]);

  if (isPending) {
    return <p>Checking authentication...</p>;
  }

  if (isError) {
    return (
      <main>
        <p>Failed to check authentication</p>
      </main>
    );
  }

  if (currentUser) {
    return null;
  }

  return children;
}
