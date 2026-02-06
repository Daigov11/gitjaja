import { useOutletContext } from "react-router-dom";
import { useState } from "react";

function normalizePhone(raw) {
  var p;
  p = String(raw || "").replace(/\D/g, "");

  if (!p) return "";
  if (p.startsWith("51")) return p;
  if (p.length === 9) return "51" + p; // típico Perú sin prefijo
  return p;
}

export default function WorkWithUs() {
  var ctx;

  var BRAND;
  var PHONE;

  var form, setForm;

  ctx = useOutletContext();
  if (!ctx) ctx = {};

  BRAND = ctx.BRAND || "Harinas Don Pepito";
  PHONE = normalizePhone(ctx.PHONE || "946762926");

  [form, setForm] = useState({
    nombre: "",
    telefono: "",
    puesto: "",
    mensaje: "",
  });

  function onChange(e) {
    var name, value;
    var next;

    name = e.target.name;
    value = e.target.value;

    next = {};
    Object.assign(next, form);
    next[name] = value;

    setForm(next);
  }

  function buildMessage() {
    var parts;
    var msg;

    parts = [];
    parts.push("Hola, quiero trabajar con ustedes.");
    parts.push("Empresa: " + BRAND);
    if (form.nombre) parts.push("Nombre: " + form.nombre);
    if (form.telefono) parts.push("Teléfono: " + form.telefono);
    if (form.puesto) parts.push("Puesto: " + form.puesto);
    if (form.mensaje) parts.push("Mensaje: " + form.mensaje);

    msg = parts.join("\n");
    return msg;
  }

  function onSubmit(e) {
    var text, url;
    e.preventDefault();

    text = encodeURIComponent(buildMessage());
    url = PHONE ? "https://wa.me/" + PHONE + "?text=" + text : "";

    if (url) window.open(url, "_blank", "noreferrer");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="overflow-hidden rounded-3xl border bg-white">
        <div className="p-6 md:p-10">
          <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
            Trabaja con nosotros
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Únete a {BRAND}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
            Estamos creciendo. Si te interesa formar parte del equipo, envíanos tus datos
            y te contactamos. También puedes escribirnos directo por WhatsApp.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Info */}
            <div className="rounded-3xl border bg-slate-50 p-6">
              <div className="text-sm font-black text-slate-900">Puestos frecuentes</div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Ventas / Atención al cliente</li>
                <li>Reparto / Conductor</li>
                <li>Almacén</li>
                <li>Administración</li>
              </ul>

              <div className="mt-6 text-sm font-black text-slate-900">Recomendación</div>
              <div className="mt-2 text-sm text-slate-700">
                Indica tu experiencia, disponibilidad y distrito / zona.
              </div>

              <div className="mt-6 rounded-2xl bg-white p-4 text-sm text-slate-700">
                <div className="font-extrabold text-slate-900">Tip</div>
                <div className="mt-1">
                  Si tienes CV, puedes enviarlo por WhatsApp luego de abrir el chat.
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="rounded-3xl border bg-white p-6">
              <div className="text-sm font-black text-slate-900">Envíanos tus datos</div>

              <div className="mt-4 grid gap-3">
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  placeholder="Nombre completo"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
                />

                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={onChange}
                  placeholder="Teléfono (opcional)"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
                />

                <input
                  name="puesto"
                  value={form.puesto}
                  onChange={onChange}
                  placeholder="Puesto al que postulas (opcional)"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
                />

                <textarea
                  name="mensaje"
                  value={form.mensaje}
                  onChange={onChange}
                  placeholder="Cuéntanos brevemente tu experiencia / disponibilidad"
                  rows="4"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="mt-5 w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-800"
              >
                Enviar por WhatsApp
              </button>

              <div className="mt-3 text-center text-xs text-slate-500">
                Se abrirá WhatsApp con el mensaje listo para enviar.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
