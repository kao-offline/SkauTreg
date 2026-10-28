"use client";

import { createContext, useContext, useEffect, useId, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import styles from "./Modal.module.css";

const ModalTitleId = createContext<string | undefined>(undefined);

type DivProps = HTMLAttributes<HTMLDivElement>;

export function ModalShell({
  children,
  className,
  onClose,
  width,
  maxHeight,
  ...props
}: DivProps & {
  children: ReactNode;
  onClose?: () => void;
  width?: string;
  maxHeight?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  const style = {
    ...(width ? { "--modal-width": width } : null),
    ...(maxHeight ? { "--modal-max-height": maxHeight } : null),
    ...props.style,
  } as CSSProperties;

  return (
    <dialog ref={dialogRef} className={styles.overlay} aria-modal="true"
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"] || (props["aria-label"] ? undefined : titleId)}
      onKeyDown={event => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]:not([tabindex='-1'])"))
          .filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onCancel={event => { event.preventDefault(); onClose?.(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose?.(); }}>
      <ModalTitleId.Provider value={titleId}>
        <div
          className={[styles.shell, className].filter(Boolean).join(" ")}
          onClick={(event) => event.stopPropagation()}
          {...props}
          style={style}
        >
          {children}
        </div>
      </ModalTitleId.Provider>
    </dialog>
  );
}

export function ModalHeader({ children, className, ...props }: DivProps) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function ModalTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const titleId = useContext(ModalTitleId);
  return (
    <h2 id={titleId} className={[styles.title, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </h2>
  );
}

export function ModalBody({ children, className, ...props }: DivProps) {
  return (
    <div className={[styles.body, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className, ...props }: DivProps) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function ModalCloseButton({ onClick, "aria-label": ariaLabel = "Zavřít" }: { onClick: () => void; "aria-label"?: string }) {
  return (
    <Button type="button" variant="icon" size="sm" shape="circle" onClick={onClick} aria-label={ariaLabel}>
      <X size={20} strokeWidth={3} />
    </Button>
  );
}
