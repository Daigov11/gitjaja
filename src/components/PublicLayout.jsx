import { Outlet, Link, useLocation,NavLink } from "react-router-dom";
import { useMemo, useState, useEffect, useRef, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCategories } from "../services/categoriesService";
import { listProducts } from "../services/productsService";
import { BD_NAME } from "../services/appConfig";
import { queryKeys, ENTITY_STALE_TIME } from "../services/queryKeys";
import AppImage from "./AppImage";
import {
  BRAND,
  LOGO_URL,
  LOGO_FALLBACK,
  PHONE,
  IG_URL,
  FB_URL,
  TT_URL,
  CART_KEY,
  HELP_FLOAT_IMG_URL,
  HELP_FLOAT_FALLBACK,
  HELP_FLOAT_TEXT,
  QR_IMG_URL,
  QR_FALLBACK,
  NAV_ITEMS,
} from "../config/publicSiteConfig";

/* las imágenes del menú traen el texto a distinto tamaño; se compensa para igualarlo */
var NAV_IMG_SIZE = {
  "/brand/nav/quienesomos.png": "h-10 lg:h-[3.05rem]",
  "/brand/nav/trabajaconnosotroso.png": "h-10 lg:h-[3.1rem]",
};

var NAV_IMAGES = {
  "/": "/brand/nav/inic.png",
  "/categoria": "/brand/nav/catalogo.png",
  "/aboutus": "/brand/nav/quienesomos.png",
  "/trabaja-con-nosotros": "/brand/nav/trabajaconnosotroso.png",
};

function navImageFor(it) {
  if (it.label === "Ubicación") return "/brand/nav/ubicacion.png";
  if (it.label === "Promociones") return "/brand/nav/promociones.png";
  return NAV_IMAGES[it.href] || null;
}

function isNavActive(it, pathname) {
  var promo = pathname.toUpperCase().indexOf("PROMOCIONES") !== -1;
  if (it.type !== "route") return false;
  if (it.href === "/") return pathname === "/";
  if (it.label === "Promociones") return pathname.indexOf("/categoria/") === 0 && promo;
  if (it.href === "/categoria") return pathname === "/categoria" || (pathname.indexOf("/categoria/") === 0 && !promo);
  return pathname === it.href;
}

var MAX_CATS;
var BRAND_LOGOS;

BRAND_LOGOS = [
  { src: "https://corporacionmarles.com/wp-content/uploads/2022/06/brand-alicorp.png", alt: "Alicorp" },
  { src: "https://corporacionmarles.com/wp-content/uploads/2022/06/brand-bakels.png", alt: "Bakels" },
  { src: "https://corporacionmarles.com/wp-content/uploads/2022/06/brand-excellent.png", alt: "Excellent" },
  { src: "https://corporacionmarles.com/wp-content/uploads/2022/06/brand-fleischmann.png", alt: "Fleischmann" },
  { src: "https://corporacionmarles.com/wp-content/uploads/2022/06/brand-leite.png", alt: "Leite" },
  { src: "https://corporacionmarles.com/wp-content/uploads/2022/06/brand-lesafre.png", alt: "Lesaffre" },
  { src: "https://corporacionmarles.com/wp-content/uploads/2022/06/brand-ludafa.png", alt: "Ludafa" },
  { src: "https://corporacionmarles.com/wp-content/uploads/2022/06/brand-puratos.png", alt: "Puratos" },
  { src: "https://corporacionmarles.com/wp-content/uploads/2022/06/brand-richs.png", alt: "Rich's" },
];
var IG_ICON_IMG;
var FB_ICON_IMG;
var TT_ICON_IMG;

IG_ICON_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/500px-Instagram_icon.png";
FB_ICON_IMG =
  "https://img.freepik.com/vector-premium/vector-logo-facebook-vector-logo-oficial-facebook-ilustrador-logo-facebook_1002350-1803.jpg?semt=ais_user_personalization&w=740&q=80";
TT_ICON_IMG =
  "https://img.freepik.com/psd-premium/logotipo-tiktok-circulo-negro-superposicion-roja-azul_1131634-494.jpg?semt=ais_hybrid&w=740&q=80";

var CART_ICON_IMG;
CART_ICON_IMG = "https://cdn-icons-png.flaticon.com/512/3144/3144456.png";

/* UI */
var HEADER_BG;

/* ====== CONFIG ====== */
MAX_CATS = 300;
var WA_ICON_IMG;

WA_ICON_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/960px-WhatsApp.svg.png"
/* ✅ Verde manzana */
HEADER_BG = "#fad02c";

export default function PublicLayout() {
  var location = useLocation();
  var qSearch, setQSearch;
  var cart, setCart;
  var cartOpen, setCartOpen;

  /* ✅ Drawer categorías (mobile) */
  var catOpen, setCatOpen;
  var catQuery, setCatQuery;

  /* ✅ Mega menú categorías (desktop) */
  var megaOpen, setMegaOpen;
  var megaQuery, setMegaQuery;
  var megaRef;

  var qCats, qProd;
  var okCats, catsApi;
  var okProd, prodsApi;

  var catsAll, catsShown;
  var catsMegaFiltered;
  var megaCols;
  /* ✅ Mobile: Catálogo desplegable dentro del drawer */
  var mobCatalogOpen, setMobCatalogOpen;

  mobCatalogOpen = useState(true);
  setMobCatalogOpen = mobCatalogOpen[1];
  mobCatalogOpen = mobCatalogOpen[0];

  megaRef = useRef(null);

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

  megaOpen = useState(false);
  setMegaOpen = megaOpen[1];
  megaOpen = megaOpen[0];

  megaQuery = useState("");
  setMegaQuery = megaQuery[1];
  megaQuery = megaQuery[0];

  qCats = useQuery({
    queryKey: queryKeys.categories(BD_NAME),
    queryFn: listCategories,
    staleTime: ENTITY_STALE_TIME,
  });

  /* fallback útil: si categorías falla, saco categorías desde productos */
  qProd = useQuery({
    queryKey: queryKeys.products(BD_NAME),
    queryFn: listProducts,
    staleTime: ENTITY_STALE_TIME,
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

  /* Drawer (mobile): filtra por catQuery */
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

  /* Mega menú (desktop): filtra por megaQuery */
  catsMegaFiltered = useMemo(
    function () {
      var qx, out, i, c;
      qx = String(megaQuery || "").toLowerCase().trim();
      out = [];

      for (i = 0; i < catsAll.length; i = i + 1) {
        c = catsAll[i];
        if (!c) continue;
        if (qx && String(c).toLowerCase().indexOf(qx) === -1) continue;
        out.push(c);
      }

      return out;
    },
    [catsAll, megaQuery]
  );

  megaCols = useMemo(
    function () {
      return chunkColumns(catsMegaFiltered, 3);
    },
    [catsMegaFiltered]
  );

  /* ✅ UX: bloquear scroll del drawer + cerrar con ESC */
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
    [catOpen, setCatOpen]
  );

  /* ✅ Mega menú: cerrar con click afuera + ESC (solo desktop mega) */
  useEffect(
    function () {
      function onDoc(e) {
        var el;
        el = megaRef.current;

        if (!megaOpen) return;
        if (el && !el.contains(e.target)) setMegaOpen(false);
      }

      function onEsc(e) {
        if (e && e.key === "Escape") setMegaOpen(false);
      }

      document.addEventListener("mousedown", onDoc);
      window.addEventListener("keydown", onEsc);

      return function () {
        document.removeEventListener("mousedown", onDoc);
        window.removeEventListener("keydown", onEsc);
      };
    },
    [megaOpen, megaRef, setMegaOpen]
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

  function openMegaCats() {
    setMegaOpen(true);
    setMegaQuery("");
  }

  function toggleMegaCats() {
    if (megaOpen) {
      setMegaOpen(false);
      return;
    }
    openMegaCats();
  }

  return (
    <div className="public-site min-h-screen w-full bg-brand-cream flex flex-col">
      <ScrollToTop />
      {/*  HEADER   */}
      <header className="sticky top-0 z-40 w-full">
        <div className="relative w-full overflow-hidden bg-brand-yellow">
          <img src="/brand/espiga-izq.png" alt="" aria-hidden="true" className="pointer-events-none absolute -left-6 top-0 hidden h-full w-auto opacity-40 md:block" />
          <img src="/brand/espiga-izq.png" alt="" aria-hidden="true" className="pointer-events-none absolute -right-6 top-0 hidden h-full w-auto -scale-x-100 opacity-40 md:block" />
          {/* ✅ ANTES: max-w-7xl -> ahora FULL WIDTH */}
          <div className="relative mx-auto w-full max-w-none px-3 sm:px-5 lg:px-10 2xl:px-14">
            {/* ===== Desktop (arreglado: no se sale en <1920) ===== */}
            <div className="hidden md:grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 lg:gap-6 py-2">
              {/* IZQ: Logo */}
              <div className="shrink-0">
                <Link to="/" className="flex items-center">
                  <img
                    src="/brand/logo-header.png"
                    alt="Don Pepito - Tu aliado en cada receta"
                    className="h-32 w-auto object-contain lg:h-44 2xl:h-52"
                  />
                </Link>
              </div>

              {/* DER: Search + redes + carrito */}
              <div className="flex min-w-0 items-center justify-end gap-1.5 lg:gap-3">
                {/* ✅ Search: ahora SE ENCOGE, ya no empuja el header */}
                <div className="flex min-w-0 flex-1 max-w-[320px] lg:max-w-[420px] xl:max-w-[520px] 2xl:max-w-[560px] items-stretch overflow-hidden rounded-full border border-brand-brown/20 bg-brand-cream shadow-sm">
                  <input
                    value={qSearch}
                    onChange={function (e) {
                      setQSearch(e.target.value);
                    }}
                    placeholder="Buscar productos..."
                    className="min-w-0 w-full px-4 py-2.5 text-m font-semibold text-brand-brown outline-none placeholder:text-brand-brown/50 bg-transparent"
                  />
                  <button
                    type="button"
                    className="inline-flex w-11 lg:w-12 items-center justify-center bg-brand-brown text-brand-yellow hover:bg-brand-brown-dark"
                    title="Buscar"
                    aria-label="Buscar"
                  >
                    <SearchIcon />
                  </button>
                </div>

                <button
                  onClick={function () {
                    setCartOpen(true);
                  }}
                  className="relative inline-flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-brand-brown shadow hover:bg-brand-brown-dark"
                  title="Carrito"
                  aria-label="Abrir carrito"
                >
                  <AppImage
                    src={CART_ICON_IMG}
                    alt="Carrito"
                    className="h-6 w-6 lg:h-7 lg:w-7 object-contain"
                    loading="lazy"
                    draggable="false"
                   fallback="/placeholder-product.svg" />
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[22px] items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-m font-extrabold text-slate-900 shadow">
                    {cart.length}
                  </span>
                </button>
              </div>

              {/* REDES: 4 en columna, con separador */}
              <div className="flex flex-col items-center gap-1 border-l-2 border-brand-brown/40 py-1 pl-4 lg:pl-6">
                {[
                  { href: IG_URL, title: "Instagram", icon: <InstagramIcon /> },
                  { href: FB_URL, title: "Facebook", icon: <FacebookIcon /> },
                  { href: TT_URL, title: "TikTok", icon: <TikTokIcon /> },
                  { href: "https://wa.me/51" + cleanPhone(PHONE), title: "WhatsApp", icon: <WhatsAppIcon /> },
                ].map(function (r) {
                  return (
                    <a
                      key={r.title}
                      href={r.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-brown text-brand-yellow hover:bg-brand-brown-dark lg:h-9 lg:w-9 [&>svg]:h-5 [&>svg]:w-5"
                      title={r.title}
                      aria-label={r.title}
                    >
                      {r.icon}
                    </a>
                  );
                })}
              </div>
            </div>


            {/* ===== Mobile ===== */}
            <div className="flex items-center gap-3 py-3 md:hidden">
              <button
                onClick={function () {
                  setCatOpen(true);
                  setCatQuery("");
                }}
                className="inline-flex items-center justify-center rounded-xl bg-brand-brown p-2 text-brand-yellow hover:bg-brand-brown-dark"
                aria-label="Abrir categorías"
                title="Categorías"
              >
                <MenuIcon />
              </button>

              <Link to="/" className="flex items-center">
                {/* ✅ logo mobile un poquito más grande */}
                <AppImage
                  src={LOGO_URL}
                  fallback={LOGO_FALLBACK}
                  alt="Don Pepito"
                  className="h-14 w-auto object-contain"
                  loading="eager"
                />
              </Link>

<div className="ml-auto flex items-center gap-2">
  <button
    onClick={function () {
      setCartOpen(true);
    }}
    className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-brown shadow-md hover:bg-brand-brown-dark active:scale-[0.98]"
    aria-label="Abrir carrito"
    title="Carrito"
  >
    <AppImage
      src={CART_ICON_IMG}
      alt=""
      className="h-6 w-6 object-contain"
      loading="lazy"
      draggable="false"
     fallback="/placeholder-product.svg" />

    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[12px] font-extrabold leading-none text-slate-900 ring-2 ring-brand-brown">
      {cart.length > 99 ? "99+" : cart.length}
    </span>
  </button>
</div>

            </div>

            {/* Search mobile */}
            <div className="pb-3 md:hidden">
              <div className="relative w-full">
                <input
                  value={qSearch}
                  onChange={function (e) {
                    setQSearch(e.target.value);
                  }}
                  placeholder="Buscar productos..."
                  className="w-full rounded-full border border-brand-brown/20 bg-brand-cream px-5 py-2.5 text-m font-semibold text-brand-brown outline-none placeholder:text-brand-brown/50 focus:border-brand-brown"
                />
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-brown">
                  <SearchIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Barra de menú (desktop) */}
        <div className="hidden w-full bg-brand-brown md:block">
          <div className="mx-auto w-full max-w-none px-3 sm:px-5 lg:px-10 2xl:px-14 py-1.5">
              <div className="relative min-w-0" ref={megaRef}>
                <nav className="flex w-full flex-nowrap items-center justify-between">
                  <Link to="/" aria-label="Inicio" className="shrink-0 pr-2" onClick={function () { setMegaOpen(false); }}>
                    <img src="/brand/nav/home.png" alt="" className="h-10 w-10 lg:h-11 lg:w-11" />
                  </Link>
                  {NAV_ITEMS.map(function (it, i) {
                    var img = navImageFor(it);
                    var active = isNavActive(it, location.pathname);
                    var cls =
                      "relative inline-flex items-center rounded-lg px-2 py-1.5 lg:px-3 hover:bg-white/10" +
                      (active && it.href !== "/" ? " after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-yellow" : "");
                    var content = img ? (
                      <img src={img} alt={it.label} className={(NAV_IMG_SIZE[img] || "h-7 lg:h-9") + " w-auto -my-1"} draggable="false" />
                    ) : (
                      <span className="text-lg font-bold text-brand-cream">{it.label}</span>
                    );

                    var el;

                    if (it.label === "Catálogo") {
                      el = (
                        <button
                          type="button"
                          onClick={toggleMegaCats}
                          className={cls}
                          aria-expanded={megaOpen ? "true" : "false"}
                          title="Ver categorías"
                        >
                          {content}
                        </button>
                      );
                    } else if (it.type === "route") {
                      el = (
                        <Link to={it.href} className={cls} aria-current={active ? "page" : undefined}>
                          {content}
                        </Link>
                      );
                    } else {
                      el = (
                        <a href={it.href} target="_blank" rel="noreferrer" className={cls}>
                          {content}
                        </a>
                      );
                    }

                    return (
                      <Fragment key={"nav" + i}>
                        {i > 0 ? <span aria-hidden="true" className="h-7 w-px shrink-0 bg-brand-yellow/60" /> : null}
                        {el}
                      </Fragment>
                    );
                  })}
                </nav>

{/* ✅ MEGA MENÚ (responsive + scroll interno, sin perder “ver todo”) */}
{megaOpen ? (
  <div className="absolute left-0 top-full mt-3 w-[92vw] max-w-[980px] overflow-hidden rounded-2xl bg-brand-brown shadow-2xl ring-1 ring-black/10">
    {/* ✅ Alto máximo relativo al viewport (evita “tengo que alejar”) */}
    <div className="flex max-h-[calc(100vh-160px)] flex-col p-4 md:p-5">
      {/* Header (siempre visible) */}
      <div className="shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-m font-extrabold text-white">CATEGORÍAS</div>

          <div className="ml-auto w-[220px] max-w-[55vw] md:w-[280px]">
            <input
              value={megaQuery}
              onChange={function (e) {
                setMegaQuery(e.target.value);
              }}
              placeholder="Filtrar..."
              className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-m font-semibold text-white placeholder:text-white/60 outline-none focus:border-white/40"
            />
          </div>
        </div>

        <div className="mt-3">
          <Link
            to="/categoria"
            onClick={function () {
              setMegaOpen(false);
              window.scrollTo(0, 0);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-m font-extrabold text-white hover:bg-white/15"
            title="Ver todas las categorías"
          >
            Ver todas <span className="opacity-80">→</span>
          </Link>
        </div>
      </div>

      {/* ✅ Lista scrolleable (aquí va TODO) */}
      <div className="mt-4 flex-1 overflow-auto pr-1">
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {megaCols.map(function (col, ci) {
            return (
              <div key={"mcol" + ci} className="min-w-0">
                {col.map(function (name, k) {
                  var href;
                  href = "/categoria/" + encodeURIComponent(String(name || ""));

                  return (
                    <Link
                      key={"mcat" + ci + "_" + k}
                      to={href}
                      onClick={function () {
                        setMegaOpen(false);
                        window.scrollTo(0, 0);
                      }}
                      className="block truncate rounded-lg px-2 py-1.5 text-[12px] font-semibold leading-tight text-white/90 hover:bg-white/10 hover:text-white md:text-[13px]"
                      title={name}
                    >
                      {String(name || "")}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer tip (visible) */}
      <div className="mt-3 shrink-0 text-m font-semibold text-white/70">
        Tip: escribe para filtrar rápido una categoría.
      </div>
    </div>
  </div>
) : null}

              </div>
          </div>
        </div>
      </header>

      {/* ✅ Barra mini de marcas (debajo del header) */}
      <BrandMarquee />
      {/* ✅ Drawer lateral (mobile): SOLO categorías */}
      {/* ✅ Drawer lateral (mobile): MENÚ + Catálogo(▾) + Redes */}
      {catOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/45"
            onClick={function () {
              setCatOpen(false);
            }}
          />

          {/* ✅ Panel ahora en modo columna para poder scrollear cómodo */}
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-2xl flex flex-col">
            {/* Header fijo */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="text-m font-extrabold text-slate-900">MENÚ</div>

              <button
                onClick={function () {
                  setCatOpen(false);
                }}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                aria-label="Cerrar menú"
                title="Cerrar"
              >
                <XIcon />
              </button>
            </div>

            {/* Body scrolleable */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {/* ===== MENÚ PRINCIPAL ===== */}
              <div className="rounded-2xl border border-slate-200 bg-white">
                {/* Inicio */}
                <Link
                  to="/"
                  onClick={function () {
                    setCatOpen(false);
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center justify-between border-b border-slate-200 px-4 py-4 text-m font-extrabold text-slate-900"
                >
                  <span>Inicio</span>
                  <ChevronIcon />
                </Link>

                {/* Quienes somos */}
                <Link
                  to="/aboutus"
                  onClick={function () {
                    setCatOpen(false);
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center justify-between border-b border-slate-200 px-4 py-4 text-m font-extrabold text-slate-900"
                >
                  <span>Quienes somos</span>
                  <ChevronIcon />
                </Link>

                {/* Catálogo ▾ (desplegable) */}
                <button
                  type="button"
                  onClick={function () {
                    setMobCatalogOpen(!mobCatalogOpen);
                  }}
                  className="w-full flex items-center justify-between border-b border-slate-200 px-4 py-4 text-m font-extrabold text-slate-900"
                  aria-expanded={mobCatalogOpen ? "true" : "false"}
                  title="Ver categorías"
                >
                  <span>Catálogo</span>
                  <span className={"transition-transform " + (mobCatalogOpen ? "rotate-90" : "")}>
                    <ChevronIcon />
                  </span>
                </button>

                {/* CONTENIDO del Catálogo (categorías) */}
                {mobCatalogOpen ? (
                  <div className="px-4 pb-4 pt-3">
                    <div className="relative">
                      <input
                        value={catQuery}
                        onChange={function (e) {
                          setCatQuery(e.target.value);
                        }}
                        placeholder="Buscar categoría..."
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-m font-semibold text-slate-900 outline-none focus:border-emerald-400"
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
                        className="flex items-center justify-between border-b border-slate-200 py-4 text-m font-extrabold text-slate-900"
                      >
                        <span className="uppercase">Ver todas</span>
                        <ChevronIcon />
                      </Link>

                      {qCats.isLoading && catsAll.length === 0 ? (
                        <div className="py-6 text-m font-semibold text-slate-600">Cargando categorías…</div>
                      ) : null}

                      {!qCats.isLoading && catsAll.length === 0 ? (
                        <div className="py-6 text-m font-semibold text-slate-600">No hay categorías.</div>
                      ) : null}

                      <div className="mt-1">
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
                              className="flex items-center justify-between border-b border-slate-200 py-4 text-m font-extrabold text-slate-900"
                              title={name}
                            >
                              <span className="uppercase">{name}</span>
                              <ChevronIcon />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Ubicación */}
                <a
                  href="https://maps.app.goo.gl/zD8DvAwfFnhtJKJd9"
                  target="_blank"
                  rel="noreferrer"
                  onClick={function () {
                    setCatOpen(false);
                  }}
                  className="flex items-center justify-between border-b border-slate-200 px-4 py-4 text-m font-extrabold text-slate-900"
                >
                  <span>Ubicación</span>
                  <ChevronIcon />
                </a>

                {/* Promociones */}
                <Link
                  to={"/categoria/" + encodeURIComponent("PROMOCIONES")}
                  onClick={function () {
                    setCatOpen(false);
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center justify-between border-b border-slate-200 px-4 py-4 text-m font-extrabold text-slate-900"
                >
                  <span>Promociones</span>
                  <ChevronIcon />
                </Link>

                {/* Trabaja con nosotros */}
                <Link
                  to="/trabaja-con-nosotros"
                  onClick={function () {
                    setCatOpen(false);
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center justify-between px-4 py-4 text-m font-extrabold text-slate-900"
                >
                  <span>Trabaja con nosotros</span>
                  <ChevronIcon />
                </Link>
              </div>

              {/* ===== REDES SOCIALES ===== */}
            {/* ✅ Drawer footer: Redes SIEMPRE visibles (más importante en mobile) */}
            <div className="shrink-0 border-t border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-m font-extrabold text-slate-900">Síguenos</div>
                <div className="text-[12px] font-extrabold text-slate-500">Promos • Recetas • Novedades</div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={function () {
                    setCatOpen(false);
                  }}
                  className="
                    group flex flex-col items-center justify-center rounded-2xl
                    bg-[#fad02c]/15 ring-1 ring-[#fad02c]/30 p-3
                    hover:bg-[#fad02c]/25 active:scale-[0.98] transition
                  "
                  aria-label="Abrir Instagram"
                  title="Instagram"
                >
                  <AppImage
                    src={IG_ICON_IMG}
                    alt="Instagram"
                    className="h-9 w-9 rounded-full object-cover"
                    loading="lazy"
                    draggable="false"
                   fallback="/placeholder-product.svg" />
                  <div className="mt-2 text-[12px] font-extrabold text-slate-900">Instagram</div>
                </a>

                <a
                  href={FB_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={function () {
                    setCatOpen(false);
                  }}
                  className="
                    group flex flex-col items-center justify-center rounded-2xl
                    bg-[#fad02c]/15 ring-1 ring-[#fad02c]/30 p-3
                    hover:bg-[#fad02c]/25 active:scale-[0.98] transition
                  "
                  aria-label="Abrir Facebook"
                  title="Facebook"
                >
                  <AppImage
                    src={FB_ICON_IMG}
                    alt="Facebook"
                    className="h-9 w-9 rounded-full object-cover"
                    loading="lazy"
                    draggable="false"
                   fallback="/placeholder-product.svg" />
                  <div className="mt-2 text-[12px] font-extrabold text-slate-900">Facebook</div>
                </a>

                <a
                  href={TT_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={function () {
                    setCatOpen(false);
                  }}
                  className="
                    group flex flex-col items-center justify-center rounded-2xl
                    bg-[#fad02c]/15 ring-1 ring-[#fad02c]/30 p-3
                    hover:bg-[#fad02c]/25 active:scale-[0.98] transition
                  "
                  aria-label="Abrir TikTok"
                  title="TikTok"
                >
                  <AppImage
                    src={TT_ICON_IMG}
                    alt="TikTok"
                    className="h-9 w-9 rounded-full object-cover"
                    loading="lazy"
                    draggable="false"
                   fallback="/placeholder-product.svg" />
                  <div className="mt-2 text-[12px] font-extrabold text-slate-900">TikTok</div>
                </a>
              </div>

              <div className="mt-3 text-[12px] font-semibold text-slate-600">
                Tip: en redes subimos ofertas y productos nuevos.
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

      {/* ✅ BOTÓN FLOTANTE "¿NECESITAS AYUDA?" */}
      <HelpWhatsappFloat />

      {/* ✅ FOOTER NUEVO (tipo retail) - ACCENT #fad02c */}
      <footer className="w-full bg-[#fad02c] text-white">
        {/* barra superior accent */}
        <div className="h-1 w-full bg-[#fad02c]" />

        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="py-10">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-3">
                  <AppImage
                    src={LOGO_URL}
                    fallback={LOGO_FALLBACK}
                    alt={BRAND}
                    className="h-30 w-auto object-contain"
                  />
                  <div className="leading-tight"></div>
                </div>

                <div className="mt-4 space-y-2 text-m font-semibold text-black">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#fad02c]">
                      <PinIcon />
                    </span>
                    <span>Lima, Perú (envíos a todo el país)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#fad02c]">
                      <ClockIcon />
                    </span>
                    <span>Lun–Sáb • Atención rápida</span>
                    
                  </div>
                </div>

{/* ✅ CONTACTOS (click-to-call) */}
<div className="mt-3 flex flex-wrap gap-2">
  <a
    href={"tel:+51" + cleanPhone("932140855")}
    className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/95 px-4 py-2 text-m font-extrabold text-slate-900 hover:bg-white"
    title="Llamar 932 140 855"
  >
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#fad02c]/20">
      ☎
    </span>
   932 140 855
  </a>

  <a
    href={"tel:+51" + cleanPhone(PHONE)}
    className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/95 px-4 py-2 text-m font-extrabold text-slate-900 hover:bg-white"
    title="Llamar 946 762 926"
  >
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#fad02c]/20">
      ☎
    </span>
    946 762 926
  </a>
</div>

                <div className="mt-4 space-y-2 text-m font-semibold text-black">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#fad02c]">
                      <PinIcon />
                    </span>
                    <span>TIENDA FISICA</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#fad02c]">
                      <ClockIcon />
                    </span>
<a
  href="https://www.google.com/maps/place/Don+Pepito/@-12.0418426,-76.9491586,19.29z/data=!4m7!3m6!1s0x9105c78eaf0b2b4f:0x3e8ed60d3d283c2e!8m2!3d-12.041896!4d-76.9489964!15sChZkb24gcGVwaXRvIHByb2R1Y3RvcmVzkgEKd2hvbGVzYWxlcuABAA!16s%2Fg%2F11sts4_sgg?entry=tts&g_ep=EgoyMDI2MDExOS4wIPu8ASoASAFQAw%3D%3D&skid=de6c4340-406c-45b3-89c9-0da802cf57dc"
  target="_blank"
  rel="noreferrer"
  className="hover:underline"
  title="Abrir en Google Maps"
>
  Mercado de Productores de Santa Anita, Pj. Productores #54-56,  Distrito de Santa Anita 15011
</a>
                    
                  </div>
                </div>
              </div>

              <div>
                <FooterTitle>MENÚ</FooterTitle>
                <div className="mt-4 space-y-2">
                  <FooterLink href="/">Inicio</FooterLink>
                  <FooterLink href="/categorias">Categorías</FooterLink>
                  <FooterLink href="/PROMOCIONES">Promociones</FooterLink>
                  <FooterLink href="/contacto">Contacto</FooterLink>
                </div>
              </div>

              <div>
                <FooterTitle>SERVICIO AL CLIENTE</FooterTitle>
                <div className="mt-4 space-y-2">
                  <FooterLink href="/envios">Envíos y cobertura</FooterLink>
                  <FooterLink href="/pagos">Formas de pago</FooterLink>
                  <FooterLink href="/faq">Preguntas frecuentes</FooterLink>
                  <FooterLink href="/terminos">Términos y condiciones</FooterLink>
                  <FooterLink href="/privacidad">Política de privacidad</FooterLink>
                </div>
              </div>

              <div>
                <FooterTitle>REDES SOCIALES</FooterTitle>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={IG_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200  px-4 py-2 text-m font-extrabold text-slate-800 hover:border-[#fad02c]/40 hover:bg-[#fad02c]/5"
                  >
                    <AppImage
                      src={IG_ICON_IMG}
                      alt="Instagram"
                      className="h-7 w-7 rounded object-contain"
                     fallback="/placeholder-product.svg" />
                    Instagram
                  </a>

                  <a
                    href={FB_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200  px-4 py-2 text-m font-extrabold text-slate-800 hover:border-[#fad02c]/40 hover:bg-[#fad02c]/5"
                  >
                    <AppImage
                      src={FB_ICON_IMG}
                      alt="Facebook"
                      className="h-7 w-7 rounded object-contain"
                     fallback="/placeholder-product.svg" />
                    Facebook
                  </a>

                  <a
                    href={TT_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200  px-4 py-2 text-m font-extrabold text-slate-800 hover:border-[#fad02c]/40 hover:bg-[#fad02c]/5"
                  >
                    <AppImage
                      src={TT_ICON_IMG}
                      alt="TikTok"
                      className="h-7 w-7 rounded object-contain"
                     fallback="/placeholder-product.svg" />
                    TikTok
                  </a>
                </div>

                {/* ✅ QR (solo imagen, el link ya está dentro del QR) */}
                <div className="mt-6">
                  <div className="w-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <AppImage
                      src={QR_IMG_URL}
                      fallback={QR_FALLBACK}
                      alt={"QR " + BRAND}
                      className="h-40 w-40 rounded-xl object-contain"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="border-t border-slate-200 py-6 text-xl font-semibold text-slate-500">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                © {new Date().getFullYear()} {BRAND} — Tienda Web
              </div>
              <div className="text-slate-400">
                Mercado de Productores de Santa Anita, Pj 54, Santa Anita 15011
              </div>
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

          {/* ✅ PANEL RESPONSIVE (header fijo + body scroll + footer fijo) */}
          <div className="absolute right-0 top-0 h-[100dvh] w-full sm:max-w-md bg-white shadow-xl flex flex-col">
            {/* Header fijo */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <div className="text-m font-extrabold text-slate-900">Tu consulta</div>
                <div className="text-m font-semibold text-slate-600">Lista de productos de interés</div>
              </div>

              <button
                className="rounded-xl border border-slate-200 px-3 py-2 text-m font-extrabold text-slate-700 hover:bg-slate-50"
                onClick={function () {
                  setCartOpen(false);
                }}
              >
                Cerrar
              </button>
            </div>

            {/* Body con scroll */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-m font-semibold text-slate-700">
                  Aún no agregaste productos. Usa el botón “Agregar / Quitar” en las tarjetas.
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(function (x) {
                    return (
                      <div key={"c" + x.id_product} className="rounded-2xl border border-slate-200 p-3">
                        <div className="text-m font-extrabold text-slate-900">{x.product_name}</div>
                        <div className="mt-1 text-m font-semibold text-slate-600">{x.category_name || "—"}</div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="text-m font-extrabold text-slate-700">
                            {x.has_price ? "S/ " + Number(x.price || 0).toFixed(2) : " "}
                          </div>

                          <button
                            onClick={function () {
                              toggleInCart({ id_product: x.id_product });
                            }}
                            className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-m font-extrabold text-slate-700 hover:bg-slate-50"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer fijo */}
            <div className="shrink-0 border-t border-slate-200 p-4 bg-white">
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={cart.length === 0}
                  onClick={openWalinkFromCart}
                  className={
                    "flex-1 rounded-2xl px-4 py-3 text-m font-extrabold text-white " +
                    (cart.length === 0 ? "bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-700")
                  }
                >
                  Hacer Pedido
                </button>

                <button
                  disabled={cart.length === 0}
                  onClick={clearCart}
                  className={
                    "rounded-2xl border px-4 py-3 text-m font-extrabold " +
                    (cart.length === 0
                      ? "border-slate-200 text-slate-300"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50")
                  }
                >
                  Vaciar
                </button>
              </div>

              <div className="mt-3 text-m font-semibold text-slate-500">
                Recuerda revisar tus productos antes de hacer un pedido.
              </div>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}

/* ====== helpers ====== */
function readCart() {
  var raw, data;
  raw = localStorage.getItem(CART_KEY);
  try {
    data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
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

/* ✅ divide en columnas para mega menú */
function chunkColumns(arr, cols) {
  var out, i, perCol, start, end;
  out = [];
  if (!arr || !arr.length) return out;

  perCol = Math.ceil(arr.length / cols);
  i = 0;

  while (i < cols) {
    start = i * perCol;
    end = start + perCol;
    out.push(arr.slice(start, end));
    i = i + 1;
  }

  return out;
}

/* ====== icons ====== */
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
function cleanPhone(v) {
  var s;
  s = v == null ? "" : String(v);
  s = s.replace(/[^0-9]/g, "");
  return s;
}

function FooterTitle(props) {
  return <div className="text-m font-extrabold tracking-wide text-black">{props.children}</div>;
}

function FooterLink(props) {
  return (
    <a href={props.href} className="block text-m font-semibold text-slate-600 hover:text-slate-900">
      {props.children}
    </a>
  );
}

function TagPill(props) {
  return <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">{props.children}</div>;
}

function PayBadge(props) {
  return <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-extrabold text-slate-700">{props.label}</div>;
}

function TrustItem(props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-800">{props.icon}</div>
        <div>
          <div className="text-m font-extrabold text-slate-900">{props.title}</div>
          <div className="mt-1 text-m font-semibold text-slate-600">{props.desc}</div>
        </div>
      </div>
    </div>
  );
}

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

/* mini icons redes footer */
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
function BrandMarquee() {
  var row, i;

  row = [];
  for (i = 0; i < BRAND_LOGOS.length; i = i + 1) row.push(BRAND_LOGOS[i]);
  for (i = 0; i < BRAND_LOGOS.length; i = i + 1) row.push(BRAND_LOGOS[i]); /* duplicado para loop */

  return (
    <div className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="relative overflow-hidden py-2">
          {/* fades laterales */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-white to-transparent" />

          <div className="dp-marquee flex w-max items-center gap-14">
            {row.map(function (b, k) {
              return (
                <img
                  key={"b" + k}
                  src={b.src}
                  alt={b.alt}
                  loading="lazy"
                  className="
          h-10 w-auto select-none object-contain opacity-90
          md:h-12 lg:h-20
        "
                  draggable="false"
                />
              );
            })}
          </div>


          <style>{`
            @keyframes dpMarqueeMove {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .dp-marquee{
              animation: dpMarqueeMove 22s linear infinite;
              will-change: transform;
            }
            .dp-marquee:hover{
              animation-play-state: paused;
            }
          `}</style>
        </div>
      </div>
    </div>
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
      <AppImage
        src={HELP_FLOAT_IMG_URL}
        fallback={HELP_FLOAT_FALLBACK}
        alt="¿Necesitas ayuda?"
        className="h-50 w-50 select-none drop-shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-transform"
        draggable="false"
      />
    </a>
  );
}
function ScrollToTop() {
  var loc;

  loc = useLocation();

  useEffect(
    function () {
      var id, el;

      // ✅ Si existe hash (ej: #catalogo), scrollea a ese id
      if (loc && loc.hash) {
        id = String(loc.hash || "").replace("#", "");
        el = id ? document.getElementById(id) : null;

        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "auto", block: "start" });
          return;
        }
      }

      // ✅ En navegación normal (ej /producto/:id): ir arriba
      window.scrollTo(0, 0);
    },
    [loc]
  );

  return null;
}
