import type { User } from "@/types/auth";
import { LogoutButton } from "@/components/Auth/LogoutButton/LogoutButton";
import styles from "./Header.module.css";

type HeaderProps = {
  user: User;
};

export function Header({ user }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <p className={styles.logo}>Meeting Room Booking</p>

        <div className={styles.user}>
          <span className={styles.userName}>{user.name}</span>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
