"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
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

const FOCUSABLE_ELEMENTS_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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

  const modalRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const closeDisabledRef = useRef(closeDisabled);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    closeDisabledRef.current = closeDisabled;
  }, [closeDisabled]);

  useEffect(() => {
    const modalElement = modalRef.current;

    if (!modalElement) {
      return;
    }

    const modal: HTMLElement = modalElement;

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    function getFocusableElements() {
      return Array.from(
        modal.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR),
      );
    }

    const firstFocusableElement = getFocusableElements()[0];

    if (firstFocusableElement) {
      firstFocusableElement.focus();
    } else {
      modal.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!closeDisabledRef.current) {
          onCloseRef.current();
        }

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        modal.focus();

        return;
      }

      if (event.shiftKey) {
        if (
          document.activeElement === firstElement ||
          document.activeElement === modal
        ) {
          event.preventDefault();
          lastElement.focus();
        }

        return;
      }

      if (
        document.activeElement === lastElement ||
        !modal.contains(document.activeElement)
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (
        previouslyFocusedElement &&
        document.contains(previouslyFocusedElement)
      ) {
        previouslyFocusedElement.focus();
      }
    };
  }, []);

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
        ref={modalRef}
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
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
