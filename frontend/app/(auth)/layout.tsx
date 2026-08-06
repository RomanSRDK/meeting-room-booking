"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Loader } from "@/components/Loader/Loader";
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
    refetch,
  } = useQuery(currentUserQueryOptions);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    router.replace("/");
  }, [currentUser, router]);

  if (isPending) {
    return <Loader label="Checking authentication..." />;
  }

  if (isError) {
    return (
      <main>
        <section>
          <h1>Unable to check authentication</h1>

          <p>The server is currently unavailable. Please try again.</p>

          <button type="button" onClick={() => refetch()}>
            Try again
          </button>
        </section>
      </main>
    );
  }

  if (currentUser) {
    return <Loader label="Redirecting..." />;
  }

  return children;
}
