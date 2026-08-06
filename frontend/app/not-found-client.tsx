"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import css from "./not-found.module.css";

const REDIRECT_DELAY_MS = 5000;

export default function NotFoundClient() {
  const router = useRouter();

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      router.replace("/");
    }, REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [router]);

  return (
    <main className={css.main}>
      <section className={css.card}>
        <span className={css.statusCode}>404</span>

        <div className={css.content}>
          <h1 className={css.title}>Page not found</h1>

          <p className={css.description}>
            Sorry, the page you are looking for does not exist or may have been
            moved.
          </p>

          <p className={css.redirectNotice}>
            You will be redirected to the homepage in a few seconds.
          </p>
        </div>

        <Link href="/" className={css.backButton}>
          Go to homepage
        </Link>
      </section>
    </main>
  );
}
