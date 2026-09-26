import { useCallback, useMemo, useState } from "react";
import { NotificationsContext } from "./notificationsContext";

var nextId = 1;

// Reemplaza alert() con toasts accesibles (role="status"/"alert") y consistentes en toda la app.
export function NotificationsProvider(props) {
  var items, setItems;
  var notify, dismiss, value;

  items = useState([]);
  setItems = items[1];
  items = items[0];

  dismiss = useCallback(
    function (id) {
      setItems(function (prev) {
        return prev.filter(function (it) {
          return it.id !== id;
        });
      });
    },
    [setItems]
  );

  notify = useCallback(
    function (input) {
      var item;
      var text = typeof input === "string" ? input : input && input.text;
      var type = (typeof input === "object" && input && input.type) || "info";
      var id = nextId++;

      item = { id: id, text: text, type: type };
      setItems(function (prev) {
        return prev.concat([item]);
      });

      setTimeout(function () {
        dismiss(id);
      }, 5000);
    },
    [dismiss, setItems]
  );

  value = useMemo(function () {
    return { notify: notify };
  }, [notify]);

  return (
    <NotificationsContext.Provider value={value}>
      {props.children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
        aria-live="polite"
        role="status"
      >
        {items.map(function (it) {
          return (
            <div
              key={it.id}
              role={it.type === "err" ? "alert" : "status"}
              className={
                "rounded-xl border px-4 py-3 text-m font-bold shadow-lg " +
                (it.type === "err"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : it.type === "ok"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-800")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <span>{it.text}</span>
                <button
                  type="button"
                  onClick={function () {
                    dismiss(it.id);
                  }}
                  className="shrink-0 text-slate-400 hover:text-slate-700"
                  aria-label="Cerrar notificación"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NotificationsContext.Provider>
  );
}
