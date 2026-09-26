// Diálogo de confirmación accesible y reutilizable, para reemplazar window.confirm().
export default function ConfirmDialog(props) {
  if (!props.open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="absolute inset-0 bg-black/50" onClick={props.onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="border-b border-slate-200 px-5 py-4">
            <div id="confirm-dialog-title" className="text-lg font-extrabold text-slate-900">
              {props.title}
            </div>
            <div id="confirm-dialog-message" className="mt-1 text-m text-slate-600">
              {props.message}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-5 py-4">
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-m font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              onClick={props.onCancel}
              type="button"
              disabled={props.busy}
              autoFocus
            >
              {props.cancelText || "Cancelar"}
            </button>
            <button
              className="rounded-xl bg-red-600 px-4 py-2.5 text-m font-extrabold text-white hover:bg-red-700 disabled:opacity-50"
              onClick={props.onConfirm}
              type="button"
              disabled={props.busy}
            >
              {props.confirmText || "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
