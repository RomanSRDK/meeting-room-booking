import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        Developed by Roman Serdiuk ·{" "}
        <Link
          className={styles.link}
          href="https://github.com/RomanSRDK"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
      </p>
    </footer>
  );
}
