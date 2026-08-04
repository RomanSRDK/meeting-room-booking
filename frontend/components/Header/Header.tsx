"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/Auth/LogoutButton/LogoutButton";
import type { User } from "@/types/auth";
import styles from "./Header.module.css";

type HeaderProps = {
  user: User;
};

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  const isSchedulePage = pathname === "/";
  const isMyBookingsPage = pathname.startsWith("/my-bookings");

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link className={styles.logo} href="/">
          Meeting Room Booking
        </Link>

        <nav className={styles.navigation} aria-label="Main navigation">
          <Link
            className={`${styles.navigationLink} ${
              isSchedulePage ? styles.activeNavigationLink : ""
            }`}
            href="/"
            aria-current={isSchedulePage ? "page" : undefined}
          >
            Schedule
          </Link>

          <Link
            className={`${styles.navigationLink} ${
              isMyBookingsPage ? styles.activeNavigationLink : ""
            }`}
            href="/my-bookings"
            aria-current={isMyBookingsPage ? "page" : undefined}
          >
            My bookings
          </Link>
        </nav>

        <div className={styles.user}>
          <span className={styles.userName}>{user.name}</span>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
