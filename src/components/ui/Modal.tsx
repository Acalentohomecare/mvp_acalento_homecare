import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-[300px] overflow-y-auto rounded-[18px] bg-surface-raised p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-display text-[16.5px] font-semibold">{title}</span>
          <X size={18} className="cursor-pointer" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}
