import { MdDialog, MdTextButton } from "@/wrappers/materialWeb";
import { useEffect, useRef } from "react";
import type { MdDialog as MdDialogType } from "@material/web/dialog/dialog";

interface Props {
  open: boolean;
  headline: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Diálogo de "¿seguro?" para las acciones que destruyen datos. */
export default function ConfirmDialog({
  open,
  headline,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<MdDialogType>(null);

  useEffect(() => {
    if (open) dialogRef.current?.show();
    else dialogRef.current?.close();
  }, [open]);

  useEffect(() => {
    dialogRef.current?.addEventListener("closed", onCancel);
    return () => {
      dialogRef.current?.removeEventListener("closed", onCancel);
    };
  }, [dialogRef, onCancel]);

  return (
    <MdDialog ref={dialogRef}>
      <div slot="headline">
        <h1 className="md-typescale-headline-small">{headline}</h1>
      </div>
      <div slot="content">
        <p className="md-typescale-body-medium">{body}</p>
      </div>
      <div slot="actions">
        <MdTextButton onClick={onCancel}>Cancel</MdTextButton>
        <MdTextButton onClick={onConfirm}>{confirmLabel}</MdTextButton>
      </div>
    </MdDialog>
  );
}
