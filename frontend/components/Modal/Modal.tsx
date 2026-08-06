"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

import styles from "./Modal.module.css";

type ModalSize = "default" | "wide";

type ModalProps = {
  children: ReactNode;
  title: string;
  description?: string;
  onClose: () => void;
  closeDisabled?: boolean;
  closeButtonLabel?: string;
  size?: ModalSize;
};

export function Modal({
  children,
  title,
  description,
  onClose,
  closeDisabled = false,
  closeButtonLabel = "Close modal",
  size = "default",
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || closeDisabled) {
        return;
      }

      onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDisabled, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || closeDisabled) {
      return;
    }

    onClose();
  }

  const modalClassName =
    size === "wide" ? `${styles.modal} ${styles.wide}` : styles.modal;

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>

            {description && (
              <p className={styles.description} id={descriptionId}>
                {description}
              </p>
            )}
          </div>

          <button
            className={styles.closeButton}
            type="button"
            aria-label={closeButtonLabel}
            disabled={closeDisabled}
            onClick={onClose}
          >
            <IoClose aria-hidden="true" />
          </button>
        </header>

        {children}
      </section>
    </div>,
    document.body,
  );
}
