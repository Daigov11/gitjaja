import { useEffect, useState } from "react";
import { uploadImage } from "../services/imagesService";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

var CategorySchema;

CategorySchema = z.object({
  categoryName: z.string().min(2, "Nombre requerido").max(255, "Máx 255"),
  categoryDesc: z.string().max(2000, "Máx 2000").optional().or(z.literal("")),
  categoryImageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  categoryStatus: z.boolean(),
});

export default function CategoryModal(props) {
  var open;
  var mode;
  var title;

  var f;

  var file, setFile;
  var preview, setPreview;
  var uploading, setUploading;
  var uploadErr, setUploadErr;

  open = !!props.open;
  mode = props.mode || "create";
  title = mode === "edit" ? "Editar categoría" : "Nueva categoría";

  f = useForm({
    resolver: zodResolver(CategorySchema),
    defaultValues: buildDefaults(props),
    mode: "onSubmit",
  });

  file = useState(null);
  setFile = file[1];
  file = file[0];

  preview = useState("");
  setPreview = preview[1];
  preview = preview[0];

  uploading = useState(false);
  setUploading = uploading[1];
  uploading = uploading[0];

  uploadErr = useState("");
  setUploadErr = uploadErr[1];
  uploadErr = uploadErr[0];

  useEffect(
    function () {
      var url;

      if (!file) {
        setPreview("");
        return;
      }

      url = URL.createObjectURL(file);
      setPreview(url);

      return function () {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      };
    },
    [file, setPreview]
  );

  useEffect(
    function () {
      if (!open) return;

      f.reset(buildDefaults(props));
      setFile(null);
      setUploadErr("");

      function onKey(e) {
        if (e.key === "Escape") {
          if (props.onClose) props.onClose();
        }
      }

      window.addEventListener("keydown", onKey);
      return function () {
        window.removeEventListener("keydown", onKey);
      };
    },
    [open, props.initialCategory]
  );

  if (!open) return null;

async function submit(values) {
  var up, imgUrl, payload;

  setUploadErr("");

  imgUrl = values.categoryImageUrl ? String(values.categoryImageUrl) : "";

  // 1) Si hay archivo, sube primero y usa esa URL
  if (file) {
    try {
      setUploading(true);
      up = await uploadImage(file);

      // OJO: ajusta esto según lo que realmente devuelve tu servicio
      imgUrl = up && up.url ? String(up.url) : "";

      if (!imgUrl) {
        throw new Error("Upload OK pero no vino 'url' en la respuesta");
      }
    } catch (e) {
      setUploadErr(String(e && e.message ? e.message : e));
      setUploading(false);
      return;
    } finally {
      setUploading(false);
    }
  }

  // 2) Payload FINAL en snake_case (lo que espera tu API)
  payload = {};
  payload.category_name = values.categoryName || "";
  payload.category_desc = values.categoryDesc ? String(values.categoryDesc) : "";
  payload.category_status = values.categoryStatus ? 1 : 0;
  payload.category_image_url = imgUrl ? imgUrl : null;

  // console.log("PAYLOAD FINAL", payload);

  if (props.onSubmit) props.onSubmit(payload, mode);
}


  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={function () {
          if (uploading || f.formState.isSubmitting || props.busy) return;
          if (props.onClose) props.onClose();
        }}
      />

      {/* panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <div className="text-xs font-semibold text-slate-500">Administración • Categorías</div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">{title}</div>
            </div>

            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              onClick={function () {
                if (uploading || f.formState.isSubmitting || props.busy) return;
                if (props.onClose) props.onClose();
              }}
              type="button"
              disabled={uploading || f.formState.isSubmitting || props.busy}
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
                  {/* nombre */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Nombre de la categoría</label>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                      placeholder="Ej: Cocoa"
                      disabled={uploading || props.busy}
                      {...f.register("categoryName")}
                    />
                    <FieldError msg={f.formState.errors.categoryName} />
                  </div>

                  {/* descripción */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Descripción</label>
                    <textarea
                      className="mt-2 min-h-[92px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                      placeholder="Describe la categoría..."
                      disabled={uploading || props.busy}
                      {...f.register("categoryDesc")}
                    />
                    <FieldError msg={f.formState.errors.categoryDesc} />
                  </div>

                  {/* imagen url */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Imagen URL (opcional)</label>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                      placeholder="https://..."
                      disabled={uploading || props.busy}
                      {...f.register("categoryImageUrl")}
                    />
                    <FieldError msg={f.formState.errors.categoryImageUrl} />
                  </div>

                  {/* upload image */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-extrabold text-slate-700">Subir imagen (opcional)</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Si seleccionas un archivo, se subirá y reemplazará la URL al guardar.
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading || props.busy}
                      className="mt-3 block w-full text-sm"
                      onChange={function (e) {
                        var f1;

                        setUploadErr("");
                        f1 = e && e.target && e.target.files ? e.target.files[0] : null;
                        setFile(f1 || null);

                        // Para evitar que una URL inválida bloquee el submit si usarás archivo
                        if (f1) f.setValue("categoryImageUrl", "");
                      }}
                    />

                    {uploadErr ? (
                      <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{uploadErr}</div>
                    ) : null}

                    {file ? (
                      <div className="mt-3 text-xs font-semibold text-slate-700">
                        Archivo: <span className="font-bold text-slate-900">{file.name}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* estado */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <div>
                      <div className="text-xs font-extrabold text-slate-700">Estado</div>
                      <div className="text-xs text-slate-500">Activo / Inactivo</div>
                    </div>

                    <select
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800"
                      disabled={uploading || props.busy}
                      value={f.watch("categoryStatus") ? "1" : "0"}
                      onChange={function (e) {
                        f.setValue("categoryStatus", e.target.value === "1");
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
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-slate-700">Vista previa</div>
                  {uploading ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800">
                      Subiendo imagen...
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="h-44 bg-slate-100">
                    {preview ? (
                      <img alt="preview-file" src={preview} className="h-44 w-full object-cover" />
                    ) : f.watch("categoryImageUrl") ? (
                      <img alt="preview-url" src={f.watch("categoryImageUrl")} className="h-44 w-full object-cover" />
                    ) : (
                      <div className="flex h-44 items-center justify-center text-xs font-bold text-slate-500">Sin imagen</div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="text-lg font-extrabold text-slate-900">{f.watch("categoryName") || "Nombre de la categoría"}</div>

                    <div className="mt-2 text-sm text-slate-600">{f.watch("categoryDesc") || "Descripción de la categoría..."}</div>

                    <div className="mt-3">
                      {f.watch("categoryStatus") ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                  <b>Tip:</b> Si subes imagen por archivo, no necesitas escribir la URL.
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                disabled={uploading || f.formState.isSubmitting || props.busy}
                className={
                  "rounded-xl border px-4 py-2.5 text-sm font-extrabold " +
                  (uploading || f.formState.isSubmitting || props.busy
                    ? "border-slate-200 bg-white text-slate-300"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")
                }
                onClick={function () {
                  if (uploading || f.formState.isSubmitting || props.busy) return;
                  if (props.onClose) props.onClose();
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={uploading || f.formState.isSubmitting || props.busy}
                className={
                  "rounded-xl px-4 py-2.5 text-sm font-extrabold text-white " +
                  (uploading || f.formState.isSubmitting || props.busy ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-800")
                }
              >
                {uploading ? "Subiendo imagen..." : mode === "edit" ? "Guardar cambios" : "Crear categoría"}
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
  return <div className="mt-2 text-xs font-bold text-red-700">{String(props.msg.message || props.msg)}</div>;
}

function buildDefaults(props) {
  var c;
  var img;

  c = props.initialCategory || null;

  img = "";
  if (c && c.category_image_url) img = String(c.category_image_url);
  if (!img && c && c.categoryImageUrl) img = String(c.categoryImageUrl);

  return {
    categoryName: (c && c.category_name) || "",
    categoryDesc: (c && c.category_desc) || "",
    categoryImageUrl: img || "",
    categoryStatus: c ? !!c.category_status : true,
  };
}

function normalize(values) {
  var out;

out = {};
out.category_name = values.categoryName || "";
out.category_desc = values.categoryDesc ? String(values.categoryDesc) : "";
out.category_status = values.categoryStatus ? 1 : 0;
out.category_image_url = values.categoryImageUrl ? String(values.categoryImageUrl) : null;


  return out;
}
