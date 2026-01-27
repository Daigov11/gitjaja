import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../services/productsService";
import { BD_NAME } from "../services/appConfig";

/* ===== TOP-LEVEL VARS ===== */
var CART_KEY;
var PHONE;

CART_KEY = "dp_cart_interest_v1";
PHONE = "946762926";

export default function ProductDetail() {
  var params, id;
  var ctx;

  var q, ok, items, product;

  var tab, setTab;
  var toast, setToast;

  var cartLocal, setCartLocal;
  var cart, toggleInCart, openCartUi;

  var related;

  params = useParams();
  id = params && params.id ? params.id : "";

  ctx = useOutletContext ? useOutletContext() : null;
  if (!ctx) ctx = {};

  tab = useState("desc");
  setTab = tab[1];
  tab = tab[0];

  toast = useState("");
  setToast = toast[1];
  toast = toast[0];

  /* fallback local cart */
  cartLocal = useState(readCart());
  setCartLocal = cartLocal[1];
  cartLocal = cartLocal[0];

  cart = Array.isArray(ctx.cart) ? ctx.cart : cartLocal;

  toggleInCart =
    typeof ctx.toggleInCart === "function"
      ? ctx.toggleInCart
      : function (p) {
          var exists, i, next;

          exists = false;
          for (i = 0; i < cartLocal.length; i = i + 1) {
            if (String(cartLocal[i].id_product) === String(p.id_product)) exists = true;
          }

          if (exists) {
            next = cartLocal.filter(function (x) {
              return String(x.id_product) !== String(p.id_product);
            });
          } else {
            next = cartLocal.concat([
              {
                id_product: p.id_product,
                product_name: p.product_name,
                category_name: p.category_name,
                has_price: !!p.has_price,
                price: p.price,
              },
            ]);
          }

          writeCart(next);
          setCartLocal(next);
        };

  openCartUi = function () {
    if (typeof ctx.setCartOpen === "function") {
      ctx.setCartOpen(true);
      return;
    }
    window.open(buildWalink(cart), "_blank", "noopener,noreferrer");
  };

  q = useQuery({
    queryKey: ["public_products", BD_NAME],
    queryFn: listProducts,
  });

  ok = q.data && (q.data.codResponse === "1" || q.data.codResponse === 1);
  items = ok && q.data.data ? q.data.data : [];

  product = useMemo(
    function () {
      var i, p;
      for (i = 0; i < items.length; i = i + 1) {
        p = items[i];
        if (String(p.id_product) === String(id)) return p;
      }
      return null;
    },
    [items, id]
  );

  /* relacionados por misma categoría */
  related = useMemo(
    function () {
      var out, i, p, catName;

      out = [];
      if (!product) return out;

      catName = String(product.category_name || "").trim();
      if (!catName) return out;

      for (i = 0; i < items.length; i = i + 1) {
        p = items[i];
        if (!p || !p.product_status) continue;
        if (String(p.id_product) === String(product.id_product)) continue;
        if (String(p.category_name || "").trim() !== catName) continue;
        out.push(p);
        if (out.length >= 12) break;
      }

      return out;
    },
    [items, product]
  );

  useEffect(
    function () {
      var t;
      if (!toast) return;
      t = setTimeout(function () {
        setToast("");
      }, 1600);
      return function () {
        clearTimeout(t);
      };
    },
    [toast, setToast]
  );

  function onShare() {
    var url;
    url = window.location && window.location.href ? window.location.href : "";
    if (!url) return;

    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(function () {
          setToast("Enlace copiado ✅");
        })
        .catch(function () {
          setToast("No se pudo copiar");
        });
    } else {
      setToast("Copia manual: " + url);
    }
  }

  function onToggleMain() {
    toggleInCart(product);
    setToast(isInCart(cart, product.id_product) ? "Quitado de tu lista" : "Agregado a tu lista");
  }

  /* states */
  if (q.isLoading) {
    return (
      <div className="w-full bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="h-72 rounded-2xl bg-slate-100" />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="h-5 w-32 rounded bg-slate-100" />
              <div className="mt-3 h-8 w-4/5 rounded bg-slate-100" />
              <div className="mt-4 h-16 rounded bg-slate-100" />
              <div className="mt-6 h-10 w-40 rounded bg-slate-100" />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="h-12 rounded-2xl bg-slate-100" />
                <div className="h-12 rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ok || !product) {
    return (
      <div className="w-full bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-extrabold text-slate-900">Producto no encontrado</div>
            <Link
              className="mt-3 inline-block text-sm font-extrabold text-emerald-700 hover:underline"
              to="/"
            >
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      {/* Toast */}
      {toast ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-extrabold text-white shadow">
          {toast}
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:underline">
            Inicio
          </Link>
          <span>›</span>
          <Link to="/categoria" className="hover:underline">
            Catálogo
          </Link>
          <span>›</span>
          <span className="text-slate-700">{product.category_name || "Categoría"}</span>
        </div>

        {/* MAIN */}
        <div className="mt-4 grid gap-6 lg:grid-cols-12">
          {/* LEFT: GALLERY */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative bg-slate-50">
                {product.product_image_url ? (
                  <img
                    src={product.product_image_url}
                    alt={product.product_name}
                    className="h-[340px] w-full object-contain p-6 transition-transform duration-300 hover:scale-[1.03] md:h-[540px]"
                    loading="lazy"
                    draggable="false"
                  />
                ) : (
                  <div className="flex h-[340px] items-center justify-center text-sm font-extrabold text-slate-400 md:h-[540px]">
                    Sin imagen
                  </div>
                )}

                {/* chips top-left */}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold text-white">
                    {product.product_status ? "Disponible" : "No disponible"}
                  </span>

                  {product.has_price ? (
                    <span className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-extrabold text-white">
                      Precio visible
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-extrabold text-white">
                      Consulta precio
                    </span>
                  )}
                </div>
              </div>

              {/* action bar (like ecommerce) */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 p-4">
                <button
                  onClick={openCartUi}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-700"
                >
                  <WhatsIcon /> Ver mi lista
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{cart.length}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onShare}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                  >
                    <ShareIcon /> Compartir
                  </button>

                  <Link
                    to="/categoria"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                  >
                    ← Volver
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: INFO */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  {product.category_name || "—"}
                </div>

                <div className="text-[11px] font-extrabold text-slate-500">
                  ID: {String(product.id_product || "-")}
                </div>
              </div>

              <div className="mt-3 text-2xl font-extrabold leading-tight text-slate-900 md:text-3xl">
                {product.product_name}
              </div>

              <div className="mt-3 text-sm font-semibold text-slate-700">
                {product.product_desc || "—"}
              </div>

              {/* price block */}
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold text-slate-600">Precio</div>
                    {product.has_price ? (
                      <div className="mt-1 text-2xl font-extrabold text-red-600">
                        S/ {Number(product.price || 0).toFixed(2)}
                      </div>
                    ) : (
                      <div className="mt-1 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800">
                        ¡CONSÚLTALO!
                      </div>
                    )}
                  </div>

                  <div className="text-right text-xs font-semibold text-slate-600">
                    <div className="font-extrabold text-slate-700">WhatsApp</div>
                    <div>+51 {PHONE}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip icon={<ShieldIcon />} label="Compra segura" />
                  <Chip icon={<BoxIcon />} label="Stock sujeto a confirmación" />
                  <Chip icon={<ClockIcon />} label="Respuesta rápida" />
                </div>
              </div>

              {/* CTA */}
              <div className="mt-5 grid gap-3">
                <button
                  onClick={onToggleMain}
                  className={
                    "w-full rounded-2xl px-5 py-3 text-sm font-extrabold " +
                    (isInCart(cart, product.id_product)
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-emerald-600 text-white hover:bg-emerald-700")
                  }
                >
                  {isInCart(cart, product.id_product)
                    ? "Quitar de mi consulta"
                    : "Agregar al carrito"}
                </button>

                <button
                  onClick={openCartUi}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                >
                  ¡PEDIR!
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  <TabBtn active={tab === "desc"} onClick={function () { setTab("desc"); }} label="Descripción" />
                  <TabBtn active={tab === "info"} onClick={function () { setTab("info"); }} label="Información" />
                  <TabBtn active={tab === "help"} onClick={function () { setTab("help"); }} label="Cómo comprar" />
                </div>

                <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-4">
                  {tab === "desc" ? (
                    <div className="text-sm font-semibold leading-relaxed text-slate-700">
                      {product.product_desc ? product.product_desc : "Este producto no tiene descripción aún."}
                    </div>
                  ) : null}

                  {tab === "info" ? (
                    <div className="grid gap-3 text-sm font-semibold text-slate-700">
                      <RowInfo k="Categoría" v={product.category_name || "—"} />
                      <RowInfo k="ID producto" v={String(product.id_product || "—")} />
                      <RowInfo k="Precio" v={product.has_price ? "Visible" : "Consultar"} />
                      <RowInfo k="Estado" v={product.product_status ? "Activo" : "Inactivo"} />
                    </div>
                  ) : null}

                  {tab === "help" ? (
                    <div className="space-y-2 text-sm font-semibold text-slate-700">
                      <div className="flex gap-2">
                        <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-extrabold text-white">
                          1
                        </span>
                        <div>Agrega productos a tu lista (“mi consulta”).</div>
                      </div>
                      <div className="flex gap-2">
                        <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-extrabold text-white">
                          2
                        </span>
                        <div>Abre “Enviar consulta por WhatsApp”.</div>
                      </div>
                      <div className="flex gap-2">
                        <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-extrabold text-white">
                          3
                        </span>
                        <div>Te respondemos con precios y disponibilidad.</div>
                      </div>
                      <div className="mt-3 text-xs font-semibold text-slate-500">
                        Nota: esto no es checkout; es catálogo informativo + consulta.
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* optional external url */}
              {product.product_url ? (
                <div className="mt-5 text-sm font-semibold">
                  <a
                    className="text-emerald-700 hover:underline"
                    href={product.product_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver enlace del producto
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* RELACIONADOS */}
        <div className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold text-emerald-700">Sugerencias</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                Productos relacionados
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-600">
                Más de la categoría: <span className="font-extrabold">{product.category_name || "—"}</span>
              </div>
            </div>

            <Link to="/categoria" className="text-sm font-extrabold text-emerald-700 hover:underline">
              Ver catálogo →
            </Link>
          </div>

          {related && related.length ? (
            <RelatedRow items={related} cart={cart} onToggle={toggleInCart} />
          ) : (
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600">
              Aún no hay productos relacionados para esta categoría.
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom bar (like ecommerce) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-extrabold text-slate-900">{product.product_name}</div>
            {product.has_price ? (
              <div className="text-sm font-extrabold text-red-600">
                S/ {Number(product.price || 0).toFixed(2)}
              </div>
            ) : (
              <div className="text-xs font-extrabold text-amber-700">Consultar</div>
            )}
          </div>

          <button
            onClick={function () {
              toggleInCart(product);
              setToast(isInCart(cart, product.id_product) ? "Quitado" : "Agregado");
            }}
            className={
              "rounded-2xl px-4 py-3 text-xs font-extrabold " +
              (isInCart(cart, product.id_product)
                ? "bg-slate-900 text-white"
                : "bg-emerald-600 text-white")
            }
          >
            {isInCart(cart, product.id_product) ? "Quitar" : "Agregar"}
          </button>

          <button
            onClick={openCartUi}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold text-slate-800"
          >
            WA ({cart.length})
          </button>
        </div>
      </div>

      {/* Spacer for mobile bar */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

/* ===== helpers ===== */
function readCart() {
  var raw, data;
  raw = localStorage.getItem(CART_KEY);
  try {
    data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data;
  } catch (e) {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items || []));
}

function isInCart(cart, id) {
  var i;
  for (i = 0; i < cart.length; i = i + 1) {
    if (String(cart[i].id_product) === String(id)) return true;
  }
  return false;
}

function buildWalink(cart) {
  var base, text, i, lines, item, msg;
  base = "https://wa.me/51" + PHONE;

  lines = [];
  lines.push("Hola, te escribo desde la página donpepito.pe y estoy interesado en estos productos:");
  lines.push("");

  for (i = 0; i < cart.length; i = i + 1) {
    item = cart[i];
    text = "- " + String(item.product_name || "Producto");
    if (item.category_name) text = text + " (" + item.category_name + ")";
    lines.push(text);
  }

  lines.push("");
  lines.push("Por favor ser amable de compartir los precios.");

  msg = encodeURIComponent(lines.join("\n"));
  return base + "?text=" + msg;
}

/* ===== small UI ===== */
function TabBtn(props) {
  return (
    <button
      onClick={props.onClick}
      className={
        "rounded-2xl px-4 py-2 text-xs font-extrabold transition " +
        (props.active
          ? "bg-emerald-600 text-white"
          : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
      }
    >
      {props.label}
    </button>
  );
}

function RowInfo(props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs font-extrabold text-slate-500">{props.k}</div>
      <div className="text-right text-sm font-extrabold text-slate-800">{props.v}</div>
    </div>
  );
}

function Chip(props) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-slate-700 ring-1 ring-slate-200">
      <span className="text-slate-500">{props.icon}</span>
      {props.label}
    </span>
  );
}

/* relacionados: carrusel */
function RelatedRow(props) {
  var ref;
  ref = useRef(null);

  function scrollByDir(dir) {
    var el, w;
    el = ref.current;
    if (!el) return;
    w = el.clientWidth || 700;
    el.scrollBy({ left: dir * Math.floor(w * 0.85), behavior: "smooth" });
  }

  return (
    <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="relative">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {props.items.map(function (p) {
            return (
              <div key={"rel_" + p.id_product} className="min-w-[240px] max-w-[240px]">
                <MiniCard p={p} cart={props.cart} onToggle={props.onToggle} />
              </div>
            );
          })}
        </div>

        <button
          onClick={function () {
            scrollByDir(-1);
          }}
          className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/90 p-3 text-white shadow hover:bg-slate-900"
          aria-label="Anterior"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={function () {
            scrollByDir(1);
          }}
          className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/90 p-3 text-white shadow hover:bg-slate-900"
          aria-label="Siguiente"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

function MiniCard(props) {
  var p, hasImg, inCart;

  p = props.p;
  hasImg = !!(p && p.product_image_url);
  inCart = isInCart(props.cart || [], p.id_product);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="h-40 w-full bg-white">
        {hasImg ? (
          <img
            src={p.product_image_url}
            alt={p.product_name}
            className="h-full w-full object-contain p-3"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-extrabold text-slate-300">
            Sin imagen
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="text-[11px] font-bold text-slate-500">{p.category_name || "—"}</div>

        <div className="mt-1 min-h-[44px] text-sm font-extrabold text-slate-900">
          {p.product_name}
        </div>

        <div className="mt-3 flex items-center justify-between">
          {p.has_price ? (
            <div className="text-sm font-extrabold text-red-600">
              S/ {Number(p.price || 0).toFixed(2)}
            </div>
          ) : (
            <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800">
              ¡CONSÚLTALO!
            </div>
          )}

          <button
            onClick={function () {
              props.onToggle(p);
            }}
            className={
              "rounded-full px-4 py-2 text-xs font-extrabold " +
              (inCart
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
            }
          >
            {inCart ? "Quitar" : "Agregar"}
          </button>
        </div>

        <div className="mt-3">
          <Link
            to={"/producto/" + p.id_product}
            className="block w-full rounded-2xl bg-emerald-600 px-4 py-2.5 text-center text-xs font-extrabold text-white hover:bg-emerald-700"
          >
            Ver detalle →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ===== icons ===== */
function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M20.5 11.9a8.5 8.5 0 0 1-12.6 7.4L3 21l1.8-4.8A8.5 8.5 0 1 1 20.5 11.9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 9.4c.2-.5.4-.5.6-.5h.5c.1 0 .3 0 .4.3l.7 1.7c.1.2.1.4 0 .5l-.3.4c-.1.1-.2.3 0 .6.2.3.6 1.1 1.4 1.8.9.8 1.7 1 2 .9l.5-.2c.2-.1.3 0 .5.1l1.6.7c.3.1.3.3.3.4 0 .2-.1.7-.6 1-.5.4-1.1.4-1.5.3-.4-.1-1.7-.5-3.2-1.8-1.4-1.2-2.2-2.6-2.4-3-.2-.4-.6-1.2-.6-1.8s.2-.9.3-1.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 8a3 3 0 1 0-2.8-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 12l6-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 12l6 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M17 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M17 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22s8-4 8-10V6l-8-4-8 4v6c0 6 8 10 8 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 8l-9 5-9-5 9-5 9 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M21 8v8l-9 5-9-5V8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 13v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
