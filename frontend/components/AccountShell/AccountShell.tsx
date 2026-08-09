"use client";

import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import { currentUserQueryOptions } from "@/queries/auth-queries";

import styles from "./AccountShell.module.css";

type AccountShellProps = {
  children: ReactNode;
};

export function AccountShell({ children }: AccountShellProps) {
  const router = useRouter();

  const { data: user, isPending, isError } = useQuery(currentUserQueryOptions);

  useEffect(() => {
    if (!isPending && !isError && !user) {
      router.replace("/login");
    }
  }, [isPending, isError, user, router]);

  if (isPending) {
    return (
      <main className={styles.state}>
        <p>Loading...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className={styles.state}>
        <p>Failed to load user</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
}
