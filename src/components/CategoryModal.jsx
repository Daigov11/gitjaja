import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

var CategorySchema;

CategorySchema = z.object({
  category_name: z.string().min(2, "Nombre requerido").max(255, "Máx 255"),
  category_desc: z.string().max(3000, "Máx 3000").optional().or(z.literal("")),
  category_status: z.boolean(),
});

export default function CategoryModal(props) {
  var open;
  var mode;
  var title;

  var f;
  var busy;

  open = !!props.open;
  mode = props.mode || "create";
  title = mode === "edit" ? "Editar categoría" : "Nueva categoría";

  busy = !!props.busy;

  f = useForm({
    resolver: zodResolver(CategorySchema),
    defaultValues: buildDefaults(props),
    mode: "onSubmit",
  });

  useEffect(function () {
    if (!open) return;

    f.reset(buildDefaults(props));

    function onKey(e) {
      if (e.key === "Escape") {
        if (busy) return;
        if (props.onClose) props.onClose();
      }
    }

    window.addEventListener("keydown", onKey);
    return function () {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, props.initialCategory, busy]);

  if (!open) return null;

  function submit(values) {
    var payload;

    if (busy) return;

    payload = normalize(values);

    if (props.onSubmit) {
      props.onSubmit(payload, mode);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={function () {
          if (busy) return;
          if (props.onClose) props.onClose();
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <div className="text-xs font-semibold text-slate-500">
                Administración • Categorías
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">{title}</div>
            </div>

            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              onClick={function () {
                if (busy) return;
                if (props.onClose) props.onClose();
              }}
              type="button"
              disabled={busy}
            >
              ✕
            </button>
          </div>

          <form onSubmit={f.handleSubmit(submit)}>
            <div className="p-5">
              <div className="grid gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Nombre</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300 disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Ej: Harinas"
                    disabled={busy}
                    {...f.register("category_name")}
                  />
                  <FieldError msg={f.formState.errors.category_name} />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700">
                    Descripción (opcional)
                  </label>
                  <textarea
                    className="mt-2 min-h-[92px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300 disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Describe la categoría..."
                    disabled={busy}
                    {...f.register("category_desc")}
                  />
                  <FieldError msg={f.formState.errors.category_desc} />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <div>
                    <div className="text-xs font-extrabold text-slate-700">Estado</div>
                    <div className="text-xs text-slate-500">Activo / Inactivo</div>
                  </div>

                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 disabled:opacity-50"
                    value={f.watch("category_status") ? "1" : "0"}
                    onChange={function (e) {
                      if (busy) return;
                      f.setValue("category_status", e.target.value === "1");
                    }}
                    disabled={busy}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold text-slate-700">Vista previa</div>

                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-extrabold text-slate-900">
                        {f.watch("category_name") || "Nombre de categoría"}
                      </div>

                      {f.watch("category_desc") ? (
                        <div className="mt-1 break-words text-sm text-slate-600">
                          {f.watch("category_desc")}
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-slate-400">Sin descripción</div>
                      )}
                    </div>

                    {f.watch("category_status") ? (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                        Activo
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                onClick={function () {
                  if (busy) return;
                  if (props.onClose) props.onClose();
                }}
                disabled={busy}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-50"
                disabled={busy}
              >
                {busy ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Crear categoría"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FieldError(props) {
  if (!props.msg) return null;
  return (
    <div className="mt-2 text-xs font-bold text-red-700">
      {String(props.msg.message || props.msg)}
    </div>
  );
}

function buildDefaults(props) {
  var c;
  c = props.initialCategory || null;

  return {
    category_name: (c && c.category_name) || "",
    category_desc: (c && c.category_desc) || "",
    category_status: c ? !!c.category_status : true,
  };
}

function normalize(values) {
  var out;
  out = {};
  out.category_name = values.category_name || "";
  out.category_desc = values.category_desc ? String(values.category_desc) : "";
  out.category_status = !!values.category_status;
  return out;
}
