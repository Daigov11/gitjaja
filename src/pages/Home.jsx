import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../services/productsService";

var BRAND;
var LOGO_URL;
var PHONE;
var IG_URL;
var FB_URL;
var TT_URL;

var SLIDES;
var CART_KEY;

BRAND = "Harinas Don Pepito";
LOGO_URL =
  "https://images.jumpseller.com/store/don-pepito/store/logo/WhatsApp_20Image_202026-01-14_20at_2009.51.33.jpeg?1768402713";

PHONE = "913701849";
IG_URL = "https://www.instagram.com/harinasdonpepito/";
FB_URL = "https://www.facebook.com/harinasdonpepito";
TT_URL = "https://www.tiktok.com/@harinasdonpepito";

SLIDES = [
  {
    img: "https://api-centralizador.apiworking.pe/images/9c1eb75a-2f2f-4cf4-9dbd-6a3ffcb3204a.png",
    title: "Insumos para tu negocio",
    subtitle: "Harinas, abarrotes y más",
  },
  {
    img: "https://api-centralizador.apiworking.pe/images/c79dec89-a567-4648-b73a-3235daaeecc0.png",
    title: "Catálogo simple y rápido",
    subtitle: "Busca, filtra y consulta por WhatsApp",
  },
  {
    img: "https://images.squarespace-cdn.com/content/v1/561718ebe4b062a227c4fcf2/1660fbf1-657e-43ad-9615-f2f02ce93dc6/azu%CC%81car.png",
    title: "Sin checkout (por ahora)",
    subtitle: "Arma tu lista y pide precios por WhatsApp",
  },
];

CART_KEY = "dp_cart_interest_v1";

export default function Home() {
  var q;
  var ok, items, activeItems;

  var qSearch, setQSearch;
  var cat, setCat;

  var slide, setSlide;

  var cartOpen, setCartOpen;
  var cart, setCart;

  qSearch = useState("");
  setQSearch = qSearch[1];
  qSearch = qSearch[0];

  cat = useState("ALL");
  setCat = cat[1];
  cat = cat[0];

  slide = useState(0);
  setSlide = slide[1];
  slide = slide[0];

  cartOpen = useState(false);
  setCartOpen = cartOpen[1];
  cartOpen = cartOpen[0];

  cart = useState(readCart());
  setCart = cart[1];
  cart = cart[0];

  q = useQuery({
    queryKey: ["public_products", "don_pepito_web"],
    queryFn: listProducts,
  });

  ok = q.data && (q.data.codResponse === "1" || q.data.codResponse === 1);
  items = ok && q.data.data ? q.data.data : [];

  activeItems = useMemo(
    function () {
      return items.filter(function (p) {
        return !!p && !!p.product_status;
      });
    },
    [items]
  );

  useEffect(
    function () {
      var t;
      t = setInterval(function () {
        setSlide(function (s) {
          var next;
          next = s + 1;
          if (next >= SLIDES.length) next = 0;
          return next;
        });
      }, 5000);

      return function () {
        clearInterval(t);
      };
    },
    [setSlide]
  );

  function categoriesFrom(items2) {
    var map, i, c, keys;
    map = {};
    for (i = 0; i < items2.length; i = i + 1) {
      c = items2[i] && items2[i].category_name ? String(items2[i].category_name) : "";
      if (c) map[c] = true;
    }
    keys = Object.keys(map);
    keys.sort();
    return keys;
  }

  function applyFilters(items2, q2, cat2) {
    var qx, out, i, p, text, inCat;
    qx = (q2 || "").toLowerCase().trim();
    out = [];

    for (i = 0; i < items2.length; i = i + 1) {
      p = items2[i];
      inCat = cat2 === "ALL" || String(p.category_name || "") === String(cat2);

      text =
        String(p.product_name || "") +
        " " +
        String(p.product_desc || "") +
        " " +
        String(p.category_name || "");

      if (inCat && (!qx || text.toLowerCase().indexOf(qx) !== -1)) {
        out.push(p);
      }
    }
    return out;
  }

  function onPrev() {
    var next;
    next = slide - 1;
    if (next < 0) next = SLIDES.length - 1;
    setSlide(next);
  }

  function onNext() {
    var next;
    next = slide + 1;
    if (next >= SLIDES.length) next = 0;
    setSlide(next);
  }

  function toggleInCart(p) {
    var next, exists, i;

    exists = false;
    for (i = 0; i < cart.length; i = i + 1) {
      if (String(cart[i].id_product) === String(p.id_product)) exists = true;
    }

    if (exists) {
      next = cart.filter(function (x) {
        return String(x.id_product) !== String(p.id_product);
      });
    } else {
      next = cart.concat([
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
    setCart(next);
  }

  function openWalinkFromCart() {
    var url;
    url = buildWalink(cart);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function clearCart() {
    writeCart([]);
    setCart([]);
  }

  var cats, filtered;
  cats = categoriesFrom(activeItems);
  filtered = applyFilters(activeItems, qSearch, cat);

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/home" className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Don Pepito"
              className="h-11 w-11 rounded-full border border-slate-200 object-cover"
            />
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-slate-900">{BRAND}</div>
              <div className="text-xs font-semibold text-slate-600">
                Catálogo y consulta por WhatsApp
              </div>
            </div>
          </Link>

          <div className="ml-auto flex w-full max-w-xl items-center gap-2">
            <div className="relative w-full">
              <input
                value={qSearch}
                onChange={function (e) {
                  setQSearch(e.target.value);
                }}
                placeholder="Buscar productos..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <a
                href={IG_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                title="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href={FB_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                title="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href={TT_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                title="TikTok"
              >
                <TikTokIcon />
              </a>
            </div>

            <button
              onClick={function () {
                setCartOpen(true);
              }}
              className="relative inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white shadow hover:bg-emerald-700"
            >
              WhatsApp
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {cart.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero carousel */}
      <section className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-sm">
            <div
              className="h-[220px] w-full bg-cover bg-center md:h-[320px]"
              style={{
                backgroundImage: "url('" + SLIDES[slide].img + "')",
              }}
            >
              <div className="h-full w-full bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-transparent">
                <div className="flex h-full flex-col justify-end p-6 md:p-10">
                  <div className="max-w-xl">
                    <div className="text-2xl font-extrabold tracking-tight text-white md:text-4xl">
                      {SLIDES[slide].title}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white/90 md:text-base">
                      {SLIDES[slide].subtitle}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href="#catalogo"
                        className="rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-900 hover:bg-slate-100"
                      >
                        Ver catálogo ↓
                      </a>
                      <button
                        onClick={function () {
                          setCartOpen(true);
                        }}
                        className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-700"
                      >
                        Consultar por WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900 shadow hover:bg-white"
              aria-label="Anterior"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900 shadow hover:bg-white"
              aria-label="Siguiente"
            >
              <ChevronRight />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {SLIDES.map(function (_, i) {
                return (
                  <button
                    key={"dot" + i}
                    onClick={function () {
                      setSlide(i);
                    }}
                    className={
                      "h-2.5 w-2.5 rounded-full " +
                      (i === slide ? "bg-white" : "bg-white/40 hover:bg-white/70")
                    }
                    aria-label={"Ir a slide " + (i + 1)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalogo" className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-extrabold text-emerald-700">Catálogo</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                Explora por categorías
              </div>
            </div>
            <div className="text-sm font-bold text-slate-600">
              {filtered.length} productos
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Tab
              active={cat === "ALL"}
              onClick={function () {
                setCat("ALL");
              }}
              label="Todas"
            />
            {cats.map(function (c) {
              return (
                <Tab
                  key={c}
                  active={cat === c}
                  onClick={function () {
                    setCat(c);
                  }}
                  label={c}
                />
              );
            })}
          </div>

          {/* States */}
          {q.isLoading ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-600">Cargando productos…</div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Skel />
                <Skel />
                <Skel />
              </div>
            </div>
          ) : null}

          {!q.isLoading && ok === false ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-extrabold text-amber-800">
                {q.data && q.data.message ? q.data.message : "No se pudo obtener datos"}
              </div>
            </div>
          ) : null}

          {/* Cards */}
          {!q.isLoading && ok ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(function (p) {
                return (
                  <ProductCard
                    key={p.id_product}
                    p={p}
                    inCart={isInCart(cart, p.id_product)}
                    onToggle={function () {
                      toggleInCart(p);
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={LOGO_URL}
                  alt="Don Pepito"
                  className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{BRAND}</div>
                  <div className="text-xs font-semibold text-slate-600">
                    Consulta precios por WhatsApp
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm font-semibold text-slate-700">
                <div>RUC: 20608795457</div>
                <div className="mt-1">
                  Contacto:{" "}
                  <a className="text-emerald-700 hover:underline" href={"tel:+51" + PHONE}>
                    +51 {PHONE}
                  </a>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-extrabold text-slate-900">Enlaces</div>
              <div className="mt-3 grid gap-2 text-sm font-semibold">
                <a
                  className="text-slate-700 hover:text-emerald-700 hover:underline"
                  href="https://consumidor.gob.pe/libro-de-reclamaciones/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Libro de reclamaciones
                </a>
                <a
                  className="text-slate-700 hover:text-emerald-700 hover:underline"
                  href="https://maps.app.goo.gl/zD8DvAwfFnhtJKJd9"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver ubicación (Maps)
                </a>
              </div>
            </div>

            <div>
              <div className="text-sm font-extrabold text-slate-900">Síguenos</div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                >
                  <InstagramIcon />
                  Instagram
                </a>
                <a
                  href={FB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                >
                  <FacebookIcon />
                  Facebook
                </a>
                <a
                  href={TT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                >
                  <TikTokIcon />
                  TikTok
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6 text-xs font-semibold text-slate-500">
            © {new Date().getFullYear()} Don Pepito — Catálogo informativo. Precios sujetos a confirmación.
          </div>
        </div>
      </footer>

      {/* WhatsApp Cart Modal */}
      {cartOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={function () {
              setCartOpen(false);
            }}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Tu consulta</div>
                <div className="text-xs font-semibold text-slate-600">
                  Lista de productos de interés
                </div>
              </div>
              <button
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                onClick={function () {
                  setCartOpen(false);
                }}
              >
                Cerrar
              </button>
            </div>

            <div className="p-4">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  Aún no agregaste productos. Usa el botón “Agregar / Quitar” en las tarjetas.
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(function (x) {
                    return (
                      <div
                        key={"c" + x.id_product}
                        className="rounded-2xl border border-slate-200 p-3"
                      >
                        <div className="text-sm font-extrabold text-slate-900">
                          {x.product_name}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-600">
                          {x.category_name || "—"}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs font-extrabold text-slate-700">
                            {x.has_price ? "S/ " + Number(x.price || 0).toFixed(2) : "¡CONSÚLTALO!"}
                          </div>
                          <button
                            onClick={function () {
                              toggleInCart({ id_product: x.id_product });
                            }}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  disabled={cart.length === 0}
                  onClick={openWalinkFromCart}
                  className={
                    "flex-1 rounded-2xl px-4 py-3 text-sm font-extrabold text-white " +
                    (cart.length === 0 ? "bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-700")
                  }
                >
                  Enviar por WhatsApp
                </button>
                <button
                  disabled={cart.length === 0}
                  onClick={clearCart}
                  className={
                    "rounded-2xl border px-4 py-3 text-sm font-extrabold " +
                    (cart.length === 0
                      ? "border-slate-200 text-slate-300"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50")
                  }
                >
                  Vaciar
                </button>
              </div>

              <div className="mt-3 text-xs font-semibold text-slate-500">
                Nota: esto no es compra. Solo arma tu lista y pide precios.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- helpers ---------- */

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

/* ---------- small UI components ---------- */

function Tab(props) {
  return (
    <button
      onClick={props.onClick}
      className={
        "rounded-2xl px-4 py-2 text-sm font-extrabold transition " +
        (props.active
          ? "bg-emerald-600 text-white shadow"
          : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
      }
    >
      {props.label}
    </button>
  );
}

function ProductCard(props) {
  var p, hasImg;

  p = props.p;
  hasImg = !!(p && p.product_image_url);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-40 w-full bg-slate-100">
        {hasImg ? (
          <img
            src={p.product_image_url}
            alt={p.product_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-extrabold text-slate-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-extrabold text-emerald-700">
            {p.category_name || "—"}
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
            Activo
          </span>
        </div>

        <div className="mt-2 text-base font-extrabold text-slate-900">
          {p.product_name}
        </div>

        <div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-600">
          {p.product_desc || "—"}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          {p.has_price ? (
            <div className="text-sm font-extrabold text-slate-900">
              S/ {Number(p.price || 0).toFixed(2)}
            </div>
          ) : (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800">
              ¡CONSÚLTALO!
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={props.onToggle}
              className={
                "rounded-2xl px-3 py-2 text-xs font-extrabold " +
                (props.inCart
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
              }
              title={props.inCart ? "Quitar de la consulta" : "Agregar a la consulta"}
            >
              {props.inCart ? "Quitar" : "Agregar"}
            </button>

            <Link
              to={"/producto/" + p.id_product}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
            >
              Ver detalle →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Skel() {
  return <div className="h-44 rounded-3xl bg-slate-100" />;
}

/* ---------- icons ---------- */

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M17.5 6.5h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 8h3V5h-3c-2.2 0-4 1.8-4 4v3H7v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 3v10.2a3.8 3.8 0 1 1-3-3.7V6.3a7 7 0 1 0 6 6.9V9.6c.9.8 2 1.3 3.2 1.4V8a4.6 4.6 0 0 1-3.2-1.4A5 5 0 0 1 14 3Z"
        fill="currentColor"
      />
    </svg>
  );
}
