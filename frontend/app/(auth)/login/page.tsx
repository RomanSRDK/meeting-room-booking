import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/Auth/LoginForm/LoginForm";
import styles from "./LoginPage.module.css";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to manage your meeting room bookings.",
};

export default function LoginPage() {
  return (
    <main className={styles.main}>
      <section className={styles.container}>
        <h1 className={styles.title}>Log in</h1>

        <LoginForm />

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link className={styles.link} href="/register" prefetch={false}>
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
