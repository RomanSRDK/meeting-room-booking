"use client";

import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

import styles from "./BackButton.module.css";

type BackButtonProps = {
  label?: string;
};

export function BackButton({ label = "Back" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      className={styles.button}
      type="button"
      onClick={() => {
        router.push("/");
      }}
    >
      <IoArrowBack className={styles.icon} aria-hidden="true" />

      <span>{label}</span>
    </button>
  );
}
