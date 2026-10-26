import { useEffect, useRef, type MouseEvent } from 'react';

/** Wires a native <dialog> to an `open` flag; clicking the backdrop closes it. */
export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return {
    ref,
    onClose,
    onClick: (e: MouseEvent<HTMLDialogElement>) => { if (e.target === e.currentTarget) onClose(); },
  };
}
