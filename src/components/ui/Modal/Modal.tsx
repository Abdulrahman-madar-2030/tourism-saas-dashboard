"use client";

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

type ModalProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>> | (() => void);
  children: ReactNode;
  className?: string;
};

export default function Modal({
  isOpen,
  onClose,
  children,
  className = "",
}: ModalProps) {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setModalRoot(document.getElementById("modal-root"));
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !modalRoot) return null;

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={`
          relative w-full max-w-5xl bg-background rounded-2xl shadow-lg p-8
          animate-fadeIn overflow-hidden
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 left-1 z-10 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close modal"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    modalRoot,
  );
}
