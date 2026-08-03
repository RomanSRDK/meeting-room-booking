import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/Auth/RegisterForm/RegisterForm";

import styles from "./RegisterPage.module.css";

export const metadata: Metadata = {
  title: "Register",
  description: "Create an account to book meeting rooms.",
};

export default function RegisterPage() {
  return (
    <main className={styles.main}>
      <section className={styles.container}>
        <h1 className={styles.title}>Create an account</h1>

        <RegisterForm />

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link className={styles.link} href="/login">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
