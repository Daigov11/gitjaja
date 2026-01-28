import { Outlet, Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCategories } from "../services/categoriesService";
import { listProducts } from "../services/productsService";
import { BD_NAME } from "../services/appConfig";

var BRAND;
var LOGO_URL;
var PHONE;
var IG_URL;
var FB_URL;
var TT_URL;
var HELP_FLOAT_IMG_URL;
var HELP_FLOAT_TEXT;

var CART_KEY;
var NAV_ITEMS;

var MAX_CATS;

BRAND = "Harinas Don Pepito";
LOGO_URL =
  "https://api-centralizador.apiworking.pe/images/79070813-72aa-4907-a24c-3531c22c69f7.png";

PHONE = "946762926";
HELP_FLOAT_IMG_URL =
  "http://api-centralizador.apiworking.pe/images/73456618-7161-440a-8903-3ed53667c759.png";

HELP_FLOAT_TEXT = "Hola, necesito ayuda con mi pedido.";

IG_URL = "https://www.instagram.com/harinasdonpepito/";
FB_URL = "https://www.facebook.com/harinasdonpepito";
TT_URL = "https://www.tiktok.com/@harinasdonpepito";

CART_KEY = "dp_cart_interest_v1";
MAX_CATS = 300;

/* ✅ IMPORTANTE: catálogo debe ser "/categoria" para funcionar desde /producto/:id */
NAV_ITEMS = [
  { label: "Inicio", href: "/", type: "route" },
  { label: "Catálogo", href: "/categoria", type: "route" },
  { label: "Ubicación", href: "https://maps.app.goo.gl/zD8DvAwfFnhtJKJd9", type: "ext" },
];

export default function PublicLayout() {
  var qSearch, setQSearch;
  var cart, setCart;
  var cartOpen, setCartOpen;

  /* ✅ Drawer categorías */
  var catOpen, setCatOpen;
  var catQuery, setCatQuery;

  var qCats, qProd;
  var okCats, catsApi;
  var okProd, prodsApi;

  var catsAll, catsShown;

  qSearch = useState("");
  setQSearch = qSearch[1];
  qSearch = qSearch[0];

  cart = useState(readCart());
  setCart = cart[1];
  cart = cart[0];

  cartOpen = useState(false);
  setCartOpen = cartOpen[1];
  cartOpen = cartOpen[0];

  catOpen = useState(false);
  setCatOpen = catOpen[1];
  catOpen = catOpen[0];

  catQuery = useState("");
  setCatQuery = catQuery[1];
  catQuery = catQuery[0];

  qCats = useQuery({
    queryKey: ["public_categories", BD_NAME],
    queryFn: listCategories,
  });

  /* fallback útil: si categorías falla, saco categorías desde productos */
  qProd = useQuery({
    queryKey: ["public_products", BD_NAME],
    queryFn: listProducts,
  });

  okCats = qCats.data && (qCats.data.codResponse === "1" || qCats.data.codResponse === 1);
  catsApi = okCats && qCats.data.data ? qCats.data.data : [];

  okProd = qProd.data && (qProd.data.codResponse === "1" || qProd.data.codResponse === 1);
  prodsApi = okProd && qProd.data.data ? qProd.data.data : [];

  catsAll = useMemo(
    function () {
      var list;
      list = buildCategoryList(catsApi, prodsApi);
      return (list || []).slice(0, MAX_CATS);
    },
    [catsApi, prodsApi]
  );

  catsShown = useMemo(
    function () {
      var qx, out, i, c;
      qx = String(catQuery || "").toLowerCase().trim();
      out = [];

      for (i = 0; i < catsAll.length; i = i + 1) {
        c = catsAll[i];
        if (!c) continue;
        if (qx && String(c).toLowerCase().indexOf(qx) === -1) continue;
        out.push(c);
      }
      return out;
    },
    [catsAll, catQuery]
  );

  /* ✅ UX: bloquear scroll + cerrar con ESC */
  useEffect(
    function () {
      function onKey(e) {
        if (e && e.key === "Escape") setCatOpen(false);
      }

      if (catOpen) {
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
      } else {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      }

      return function () {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    },
    [catOpen]
  );

  function toggleInCart(p) {
    var exists, i, next, id;

    if (!p) return;

    id = typeof p.id_product !== "undefined" && p.id_product !== null ? p.id_product : null;
    if (id === null) return;

    exists = false;
    for (i = 0; i < cart.length; i = i + 1) {
      if (String(cart[i].id_product) === String(id)) exists = true;
    }

    /* ✅ si no viene nombre/desc (ej: quitar desde modal), igual funciona */
    if (exists) {
      next = cart.filter(function (x) {
        return String(x.id_product) !== String(id);
      });
      writeCart(next);
      setCart(next);
      return;
    }

    next = cart.concat([
      {
        id_product: id,
        product_name: p.product_name || "Producto",
        category_name: p.category_name || "",
        has_price: !!p.has_price,
        price: p.price,
      },
    ]);

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

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full">
        <div className="w-full bg-emerald-700">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3">
            {/* ✅ Hamburguesa: SOLO categorías / Drawer lateral */}
            <button
              onClick={function () {
                setCatOpen(true);
                setCatQuery("");
              }}
              className="inline-flex items-center justify-center rounded-xl bg-white/10 p-2 text-white hover:bg-white/15 md:hidden"
              aria-label="Abrir categorías"
              title="Categorías"
            >
              <MenuIcon />
            </button>

            <Link to="/" className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="Don Pepito"
className="h-10 w-auto object-contain md:h-30" />

            </Link>

            {/* Search (desktop) */}
            <div className="ml-auto hidden w-full max-w-xl items-center gap-2 md:flex">
              <div className="relative w-full">
                <input
                  value={qSearch}
                  onChange={function (e) {
                    setQSearch(e.target.value);
                  }}
                  placeholder="Buscar productos..."
                  className="w-full rounded-full border border-white/25 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-white"
                />
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <SearchIcon />
                </div>
              </div>

              <button
                onClick={function () {
                  setCartOpen(true);
                }}
                className="relative inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow hover:bg-amber-200"
                title="Armar lista y consultar"
              >
                Carrito
                <span className="rounded-full bg-slate-900/10 px-2 py-0.5 text-xs">{cart.length}</span>
              </button>
            </div>

            {/* Mobile WA */}
            <div className="ml-auto flex items-center gap-2 md:hidden">
              <button
                onClick={function () {
                  setCartOpen(true);
                }}
                className="relative inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-2 text-sm font-extrabold text-slate-900 shadow hover:bg-amber-200"
                aria-label="Abrir WhatsApp"
              >
                CA
                <span className="rounded-full bg-slate-900/10 px-2 py-0.5 text-xs">{cart.length}</span>
              </button>
            </div>
          </div>

          {/* Search mobile */}
          <div className="mx-auto w-full max-w-7xl px-4 pb-3 md:hidden">
            <div className="relative w-full">
              <input
                value={qSearch}
                onChange={function (e) {
                  setQSearch(e.target.value);
                }}
                placeholder="Buscar productos..."
                className="w-full rounded-full border border-white/25 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-white"
              />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                <SearchIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Menu bar (desktop) */}
<div className="hidden w-full bg-amber-400 md:block">
  <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-2">
    <nav className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-black/90">
      {NAV_ITEMS.map(function (it, i) {
        if (it.type === "route") {
          return (
            <Link
              key={"nav" + i}
              to={it.href}
              className="rounded-full px-4 py-2 hover:bg-black/20 hover:text-black"
            >
              {it.label}
            </Link>
          );
        }

        return (
          <a
            key={"nav" + i}
            href={it.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-4 py-2 hover:bg-black/20 hover:text-black"
          >
            {it.label}
          </a>
        );
      })}
    </nav>

    <div className="ml-auto flex items-center gap-2">
      <a
        href={IG_URL}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-black/10 p-2 text-black hover:bg-black/20"
        title="Instagram"
      >
        <InstagramIcon />
      </a>

      <a
        href={FB_URL}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-black/10 p-2 text-black hover:bg-black/20"
        title="Facebook"
      >
        <FacebookIcon />
      </a>

      <a
        href={TT_URL}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-black/10 p-2 text-black hover:bg-black/20"
        title="TikTok"
      >
        <TikTokIcon />
      </a>
    </div>
  </div>
</div>

      </header>

      {/* ✅ Drawer lateral (como la imagen): SOLO categorías, NO pantalla completa */}
      {catOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/45"
            onClick={function () {
              setCatOpen(false);
            }}
          />

          <div className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="text-sm font-extrabold text-slate-900">CATEGORÍAS</div>
              <button
                onClick={function () {
                  setCatOpen(false);
                }}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                aria-label="Cerrar categorías"
              >
                <XIcon />
              </button>
            </div>

            <div className="p-4">
              {/* buscador (sigue siendo “solo categorías”) */}
              <div className="relative">
                <input
                  value={catQuery}
                  onChange={function (e) {
                    setCatQuery(e.target.value);
                  }}
                  placeholder="Buscar categoría..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchIcon />
                </div>
              </div>

              <div className="mt-3">
                <Link
                  to="/categoria"
                  onClick={function () {
                    setCatOpen(false);
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center justify-between border-b border-slate-200 py-4 text-sm font-extrabold text-slate-900"
                >
                  <span className="uppercase">Ver todas</span>
                  <ChevronIcon />
                </Link>

                {qCats.isLoading && catsAll.length === 0 ? (
                  <div className="py-6 text-sm font-semibold text-slate-600">Cargando categorías…</div>
                ) : null}

                {!qCats.isLoading && catsAll.length === 0 ? (
                  <div className="py-6 text-sm font-semibold text-slate-600">No hay categorías.</div>
                ) : null}

                <div className="max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
                  {catsShown.map(function (name, i) {
                    var href;
                    href = "/categoria/" + encodeURIComponent(String(name || ""));

                    return (
                      <Link
                        key={"cat_" + i}
                        to={href}
                        onClick={function () {
                          setCatOpen(false);
                          window.scrollTo(0, 0);
                        }}
                        className="flex items-center justify-between border-b border-slate-200 py-4 text-sm font-extrabold text-slate-900"
                      >
                        <span className="uppercase">{name}</span>
                        <ChevronIcon />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* CONTENIDO DE PÁGINAS */}
      <div className="flex-1">
        <Outlet
          context={{
            qSearch: qSearch,
            setQSearch: setQSearch,
            cart: cart,
            toggleInCart: toggleInCart,
            setCartOpen: setCartOpen,
          }}
        />
      </div>
      {/* ✅ BOTÓN FLOTANTE "¿NECESITAS AYUDA?" (SIEMPRE VISIBLE) */}
      <HelpWhatsappFloat />

{/* ✅ FOOTER NUEVO (tipo retail) */}
<footer className="w-full border-t border-slate-200 bg-white text-slate-700">
  <div className="mx-auto w-full max-w-7xl px-4">
    {/* Barra de confianza (envíos / pagos / seguro) */}
    <div className="py-7">
      <div className="grid gap-3 sm:grid-cols-3">
        <TrustItem
          icon={<TruckIcon />}
          title="Envíos a todo el Perú"
          desc="Delivery y agencia • Lima y provincias"
        />
        <TrustItem
          icon={<CardIcon />}
          title="Todos los medios de pago"
          desc="Efectivo • Transferencia • Tarjetas • Yape/Plin"
        />
        <TrustItem
          icon={<ShieldIcon />}
          title="Compra segura"
          desc="Atención rápida por WhatsApp"
        />
      </div>
    </div>

    {/* Métodos de pago (franja) */}
    <div className="border-y border-slate-200 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-extrabold tracking-widest text-slate-500">
          MÉTODOS DE PAGO
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PayBadge label="EFECTIVO" />
          <PayBadge label="TRANSFERENCIA" />
          <PayBadge label="VISA" />
          <PayBadge label="MASTERCARD" />
          <PayBadge label="AMEX" />
          <PayBadge label="YAPE" />
          <PayBadge label="PLIN" />
        </div>
      </div>
    </div>

    {/* Contenido */}
    <div className="py-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marca + contacto */}
        <div>
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt={BRAND} className="h-30 w-auto object-contain" />
            <div className="leading-tight">
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-slate-400"><PinIcon /></span>
              <span>Lima, Perú (envíos a todo el país)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400"><ClockIcon /></span>
              <span>Lun–Sáb • Atención rápida</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={"tel:+51" + cleanPhone(PHONE)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
              title={"Llamar +51 " + PHONE}
            >
              <PhoneMiniIcon />
              +51 {PHONE}
            </a>

            <a
              href={"https://wa.me/51" + cleanPhone(PHONE)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-800"
              title="Escríbenos por WhatsApp"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
            Haz tu lista y envíala por WhatsApp. Te cotizamos y coordinamos el envío.
          </div>
        </div>

        {/* Menú */}
        <div>
          <FooterTitle>MENÚ</FooterTitle>
          <div className="mt-4 space-y-2">
            <FooterLink href="/">Inicio</FooterLink>
            <FooterLink href="/categorias">Categorías</FooterLink>
            <FooterLink href="/productos">Productos</FooterLink>
            <FooterLink href="/promociones">Promociones</FooterLink>
            <FooterLink href="/contacto">Contacto</FooterLink>
          </div>
        </div>

        {/* Servicio al cliente */}
        <div>
          <FooterTitle>SERVICIO AL CLIENTE</FooterTitle>
          <div className="mt-4 space-y-2">
            <FooterLink href="/envios">Envíos y cobertura</FooterLink>
            <FooterLink href="/pagos">Formas de pago</FooterLink>
            <FooterLink href="/faq">Preguntas frecuentes</FooterLink>
            <FooterLink href="/terminos">Términos y condiciones</FooterLink>
            <FooterLink href="/privacidad">Política de privacidad</FooterLink>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <TagPill>Envío</TagPill>
            <TagPill>Recojo</TagPill>
            <TagPill>Agencia</TagPill>
            <TagPill>Mayorista</TagPill>
          </div>
        </div>

        {/* Redes */}
        <div>
          <FooterTitle>REDES SOCIALES</FooterTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={IG_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
            >
              <InstagramMiniIcon />
              Instagram
            </a>

            <a
              href={FB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
            >
              <FacebookMiniIcon />
              Facebook
            </a>

            <a
              href={TT_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
            >
              <TikTokMiniIcon />
              TikTok
            </a>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold text-slate-600">
            <div className="text-sm font-extrabold text-slate-900">Envíos + Pagos</div>
            <div className="mt-1">Trabajamos con todo medio de pago y enviamos a todo el Perú.</div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-slate-200 py-6 text-xs font-semibold text-slate-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} {BRAND} — Tienda Web</div>
        <div className="text-slate-400">Envíos • Medios de pago • Atención por WhatsApp</div>
      </div>
    </div>
  </div>
</footer>

      {/* MODAL WHATSAPP */}
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
                <div className="text-xs font-semibold text-slate-600">Lista de productos de interés</div>
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
                      <div key={"c" + x.id_product} className="rounded-2xl border border-slate-200 p-3">
                        <div className="text-sm font-extrabold text-slate-900">{x.product_name}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-600">{x.category_name || "—"}</div>
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
                  Hacer Pedido
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
                Recuerda revisar tus productos antes de hacer un pedido.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* helpers */
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

function buildCategoryList(catItemsApi, products) {
  var out, map, i, name;

  map = {};
  out = [];

  if (catItemsApi && catItemsApi.length) {
    for (i = 0; i < catItemsApi.length; i = i + 1) {
      name =
        catItemsApi[i] && catItemsApi[i].category_name ? String(catItemsApi[i].category_name) : "";
      name = name.trim();
      if (name && !map[name]) {
        map[name] = true;
        out.push(name);
      }
    }
  }

  if (!out.length && products && products.length) {
    for (i = 0; i < products.length; i = i + 1) {
      name = products[i] && products[i].category_name ? String(products[i].category_name) : "";
      name = name.trim();
      if (name && !map[name]) {
        map[name] = true;
        out.push(name);
      }
    }
  }

  out.sort(function (a, b) {
    return String(a).localeCompare(String(b));
  });

  return out;
}

/* icons */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
      <path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ✅ icons extra para el footer */
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.5 3.5h3l1.2 5-2 1.2c1.1 2.2 2.9 4 5.1 5.1l1.2-2 5 1.2v3c0 .8-.6 1.5-1.4 1.5-8.3.3-15.1-6.5-14.8-14.8 0-.8.7-1.4 1.5-1.4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 17 17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 7h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function cleanPhone(v) {
  var s;
  s = v == null ? "" : String(v);
  s = s.replace(/[^0-9]/g, "");
  return s;
}

function FooterTitle(props) {
  return (
    <div className="text-sm font-extrabold tracking-wide text-emerald-700">
      {props.children}
    </div>
  );
}

function FooterLink(props) {
  return (
    <a
      href={props.href}
      className="block text-sm font-semibold text-slate-600 hover:text-slate-900"
    >
      {props.children}
    </a>
  );
}

function TagPill(props) {
  return (
    <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
      {props.children}
    </div>
  );
}

function PayBadge(props) {
  return (
    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-extrabold text-slate-700">
      {props.label}
    </div>
  );
}

function TrustItem(props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-800">
          {props.icon}
        </div>
        <div>
          <div className="text-sm font-extrabold text-slate-900">{props.title}</div>
          <div className="mt-1 text-xs font-semibold text-slate-600">{props.desc}</div>
        </div>
      </div>
    </div>
  );
}

/* ---- mini icons (svg) ---- */

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 7h11v10H3V7Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 10h4l3 3v4h-7v-7Z" stroke="currentColor" strokeWidth="2" />
      <path d="M6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" stroke="currentColor" strokeWidth="2" />
      <path d="M17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
      <path d="M7 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 20 7v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4Z" stroke="currentColor" strokeWidth="2" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s7-5 7-12a7 7 0 1 0-14 0c0 7 7 12 7 12Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PhoneMiniIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.5 3h3l1 5-2 1c1.5 3 3.5 5 6.5 6.5l1-2 5 1v3c0 1-1 2-2 2-9 0-16-7-16-16 0-1 1-2 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 11.5a8.5 8.5 0 1 1-16.2 3.7L3 21l5.9-1.7A8.5 8.5 0 0 1 20 11.5Z" stroke="currentColor" strokeWidth="2" />
      <path d="M9 9c.3 2 3 5 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* Si ya tienes tus icons de redes, puedes borrar estos 3 */
function InstagramMiniIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" />
      <path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function FacebookMiniIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 9h3V6h-3a4 4 0 0 0-4 4v3H7v3h3v6h3v-6h3l1-3h-4v-3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function TikTokMiniIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 3v12a4 4 0 1 1-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 6c1.5 2 3.5 3 6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function HelpWhatsappFloat() {
  var phone, href, text;

  phone = "51" + cleanPhone(PHONE);
  text = HELP_FLOAT_TEXT || "Hola, necesito ayuda.";
  href = "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 z-[45] block"
      aria-label="¿Necesitas ayuda?"
      title="¿Necesitas ayuda?"
    >
      <img
        src={HELP_FLOAT_IMG_URL}
        alt="¿Necesitas ayuda?"
        className="h-40 w-40 select-none drop-shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-transform"
        draggable="false"
      />
    </a>
  );
}
