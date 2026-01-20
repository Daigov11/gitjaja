import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

var ProductSchema;

ProductSchema = z
  .object({
    category_name: z.string().min(1, "Selecciona una categoría"),
    product_name: z.string().min(2, "Nombre requerido").max(255, "Máx 255"),
    product_desc: z.string().max(3000, "Máx 3000").optional().or(z.literal("")),
    product_url: z.string().url("URL inválida").optional().or(z.literal("")),
    product_image_url: z.string().url("URL inválida").optional().or(z.literal("")),
    has_price: z.boolean(),
    price: z.preprocess(
      function (v) {
        if (v === "" || v === null || typeof v === "undefined") return null;
        return Number(v);
      },
      z.number().nonnegative("Precio inválido").nullable()
    ),
    product_status: z.boolean(),
  })
  .superRefine(function (val, ctx) {
    if (val.has_price && (val.price === null || isNaN(val.price))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Precio requerido",
        path: ["price"],
      });
    }
  });

export default function ProductModal(props) {
  var open;
  var mode;
  var title;

  var f;
  var hasPrice;

  open = !!props.open;
  mode = props.mode || "create";
  title = mode === "edit" ? "Editar producto" : "Nuevo producto";

  f = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: buildDefaults(props),
    mode: "onSubmit",
  });

  hasPrice = !!f.watch("has_price");

  useEffect(function () {
    if (!open) return;

    f.reset(buildDefaults(props));

    function onKey(e) {
      if (e.key === "Escape") {
        if (props.onClose) props.onClose();
      }
    }

    window.addEventListener("keydown", onKey);
    return function () {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, props.initialProduct, props.defaultCategoryName]);

  if (!open) return null;

  function submit(values) {
    var payload;

    payload = normalize(values);

    if (props.onSubmit) {
      props.onSubmit(payload, mode);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={function () {
          if (props.onClose) props.onClose();
        }}
      />

      {/* panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <div className="text-xs font-semibold text-slate-500">
                Administración • Productos
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">{title}</div>
            </div>

            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              onClick={function () {
                if (props.onClose) props.onClose();
              }}
              type="button"
            >
              ✕
            </button>
          </div>

          {/* body */}
          <form onSubmit={f.handleSubmit(submit)}>
            <div className="grid gap-0 md:grid-cols-2">
              {/* left: form */}
              <div className="p-5">
                <div className="grid gap-4">
                  {/* categoría */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">
                      Categoría
                    </label>

                    {props.categoryOptions && props.categoryOptions.length ? (
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                        {...f.register("category_name")}
                      >
                        <option value="">Selecciona</option>
                        {props.categoryOptions.map(function (c) {
                          return (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                        placeholder="Ej: Panadería"
                        {...f.register("category_name")}
                      />
                    )}

                    <FieldError msg={f.formState.errors.category_name} />
                  </div>

                  {/* nombre */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">
                      Nombre del producto
                    </label>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                      placeholder="Ej: Pan de James"
                      {...f.register("product_name")}
                    />
                    <FieldError msg={f.formState.errors.product_name} />
                  </div>

                  {/* descripción */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">
                      Descripción
                    </label>
                    <textarea
                      className="mt-2 min-h-[92px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                      placeholder="Describe el producto..."
                      {...f.register("product_desc")}
                    />
                    <FieldError msg={f.formState.errors.product_desc} />
                  </div>

                  {/* url */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-extrabold text-slate-700">
                        URL (opcional)
                      </label>
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                        placeholder="https://..."
                        {...f.register("product_url")}
                      />
                      <FieldError msg={f.formState.errors.product_url} />
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-slate-700">
                        Imagen URL (opcional)
                      </label>
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                        placeholder="https://..."
                        {...f.register("product_image_url")}
                      />
                      <FieldError msg={f.formState.errors.product_image_url} />
                    </div>
                  </div>

                  {/* precio */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <div>
                        <div className="text-xs font-extrabold text-slate-700">
                          ¿Tiene precio?
                        </div>
                        <div className="text-xs text-slate-500">
                          Si no, se mostrará “¡CONSÚLTALO!”
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-slate-900"
                        {...f.register("has_price")}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-slate-700">
                        Precio
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        disabled={!hasPrice}
                        className={
                          "mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-slate-300 " +
                          (hasPrice
                            ? "border-slate-200 bg-white"
                            : "border-slate-200 bg-slate-100 text-slate-400")
                        }
                        placeholder="0.00"
                        {...f.register("price")}
                      />
                      <FieldError msg={f.formState.errors.price} />
                    </div>
                  </div>

                  {/* estado */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <div>
                      <div className="text-xs font-extrabold text-slate-700">
                        Estado
                      </div>
                      <div className="text-xs text-slate-500">
                        Activo / Inactivo
                      </div>
                    </div>

                    <select
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800"
                      value={f.watch("product_status") ? "1" : "0"}
                      onChange={function (e) {
                        f.setValue("product_status", e.target.value === "1");
                      }}
                    >
                      <option value="1">Activo</option>
                      <option value="0">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* right: preview */}
              <div className="border-t border-slate-200 bg-slate-50 p-5 md:border-l md:border-t-0">
                <div className="text-xs font-extrabold text-slate-700">Vista previa</div>

                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="h-44 bg-slate-100">
                    {f.watch("product_image_url") ? (
                      <img
                        alt="preview"
                        src={f.watch("product_image_url")}
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center text-xs font-bold text-slate-500">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="text-xs font-bold text-slate-500">
                      {f.watch("category_name") || "Categoría"}
                    </div>

                    <div className="mt-1 text-lg font-extrabold text-slate-900">
                      {f.watch("product_name") || "Nombre del producto"}
                    </div>

                    <div className="mt-2 text-sm text-slate-600">
                      {f.watch("product_desc") || "Descripción del producto..."}
                    </div>

                    <div className="mt-3">
                      {f.watch("has_price") ? (
                        <span className="text-base font-extrabold text-slate-900">
                          S/{" "}
                          {f.watch("price") !== null && f.watch("price") !== ""
                            ? Number(f.watch("price") || 0).toFixed(2)
                            : "0.00"}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800">
                          ¡CONSÚLTALO!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                  <b>Nota:</b> Cuando llegue el endpoint de upload, aquí cambiaremos “Imagen URL”
                  por “Subir imagen”.
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                onClick={function () {
                  if (props.onClose) props.onClose();
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-slate-800"
              >
                {mode === "edit" ? "Guardar cambios" : "Crear producto"}
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
  var p;
  var cat;

  p = props.initialProduct || null;
  cat = props.defaultCategoryName || "";

  return {
    category_name: (p && p.category_name) || cat || "",
    product_name: (p && p.product_name) || "",
    product_desc: (p && p.product_desc) || "",
    product_url: (p && p.product_url) || "",
    product_image_url: (p && p.product_image_url) || "",
    has_price: p ? !!p.has_price : true,
    price: p && p.has_price ? p.price : null,
    product_status: p ? !!p.product_status : true,
  };
}

function normalize(values) {
  var out;

  out = {};
  out.category_name = values.category_name || "";
  out.product_name = values.product_name || "";
  out.product_desc = values.product_desc ? String(values.product_desc) : "";

  out.product_url = values.product_url ? String(values.product_url) : null;
  out.product_image_url = values.product_image_url ? String(values.product_image_url) : null;

  out.has_price = !!values.has_price;

  if (out.has_price) out.price = values.price;
  else out.price = null;

  out.product_status = !!values.product_status;

  return out;
}
