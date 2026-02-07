import { Link, useOutletContext } from "react-router-dom";

/* ===== TOP-LEVEL DEFAULTS ===== */
var DEFAULT_BRAND;
var DEFAULT_LOGO_URL;

DEFAULT_BRAND = "Harinas Don Pepito";
DEFAULT_LOGO_URL =
  "https://api-centralizador.apiworking.pe/images/34e75a99-76be-4c2f-aa6f-af05e71d93a7.png";

export default function AboutUs() {
  var ctx;

  var BRAND;
  var LOGO_URL;
  var PHONE;

  ctx = useOutletContext();
  if (!ctx) ctx = {};

  BRAND = ctx.BRAND || DEFAULT_BRAND;

  /* ✅ if ctx.LOGO_URL is empty, fallback to DEFAULT_LOGO_URL */
  LOGO_URL = ctx.LOGO_URL ? ctx.LOGO_URL : DEFAULT_LOGO_URL;

  PHONE = ctx.PHONE || "";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border bg-white">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-2xl">
            <div className="text-m font-extrabold uppercase tracking-widest text-emerald-700">
              Nosotros
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-mlate-900 md:text-4xl">
              Conoce más sobre {BRAND}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-mlate-600">
              Don Pepito es una empresa dedicada a la comercialización y distribución de insumos para la panadería,
              pastelería y abarrotes. Ofrecemos productos de calidad como harinas, mantecas, margarinas y una amplia
              variedad de artículos esenciales, atendiendo con compromiso, puntualidad y precios justos a panaderos,
              negocios y familias. Nuestro objetivo es ser un aliado confiable para el crecimiento de nuestros clientes.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="rounded-full bg-emerald-700 px-5 py-2.5 text-m font-extrabold text-white hover:bg-emerald-800"
              >
                Ver catálogo
              </Link>

              <a
                href={PHONE ? "https://wa.me/51" + String(PHONE).replace(/\D/g, "") : "#"}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-slate-900 px-5 py-2.5 text-m font-extrabold text-white hover:bg-slate-800"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center">
            {LOGO_URL ? (
              <img
                src={LOGO_URL}
                alt={BRAND}
                className="h-20 w-auto object-contain md:h-28"
                loading="lazy"
                draggable="false"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-2xl bg-slate-100 text-m font-extrabold text-mlate-500 md:h-32 md:w-32">
                LOGO
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bloques */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-6">
          <div className="text-m font-black text-mlate-900">Misión</div>
          <p className="mt-2 text-m leading-relaxed text-mlate-600">
Satisfacer la demanda de los clientes, distribuyendo productos de alta calidad para la panificación, repostería y el consumo masivo.    </p>
        </div>

        <div className="rounded-3xl border bg-white p-6">
          <div className="text-m font-black text-mlate-900">Visión</div>
          <p className="mt-2 text-m leading-relaxed text-mlate-600">
Consolidarnos como un proveedor líder en insumos de panadería y abarrotes, ampliando nuestra red de distribución.      </p>
        </div>

        <div className="rounded-3xl border bg-white p-6">
          <div className="text-m font-black text-mlate-900">Valores</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-m text-mlate-600">
            <li>Calidad</li>
            <li>Responsabilidad</li>
            <li>Rapidez</li>
            <li>Trato cercano</li>
          </ul>
        </div>
      </div>

      {/* CTA final */}
      <div className="mt-8 overflow-hidden rounded-3xl border bg-emerald-900 text-white">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <div className="text-xl font-black">¿Necesitas una cotización?</div>
            <div className="mt-1 text-m text-white/80">Escríbenos y te ayudamos con tu pedido.</div>
          </div>

          <a
            href={PHONE ? "https://wa.me/51" + String(PHONE).replace(/\D/g, "") : "#"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-m font-black text-emerald-900 hover:bg-white/90"
          >
            Hablar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
