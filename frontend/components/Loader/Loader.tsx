import styles from "./Loader.module.css";

type LoaderProps = {
  label?: string;
};

export function Loader({ label = "Loading..." }: LoaderProps) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />

      <span className={styles.label}>{label}</span>
    </div>
  );
}
