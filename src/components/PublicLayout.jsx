import { Outlet, Link, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCategories } from "../services/categoriesService";
import { listProducts } from "../services/productsService";
import { BD_NAME } from "../services/appConfig";
var QR_IMG_URL;
QR_IMG_URL = "https://api-centralizador.apiworking.pe/images/f215cdb4-12d8-439b-80ea-f1a5300ac3af.png";

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
BRAND = "Harinas Don Pepito";
LOGO_URL =
  "https://api-centralizador.apiworking.pe/images/76975c79-6992-49f6-ae0e-e17694c5aaf8.png";

PHONE = "946762926";
HELP_FLOAT_IMG_URL =
  "https://api-centralizador.apiworking.pe/images/74d3532e-bd3c-4f6c-a4c6-8a465495bec8.png";

HELP_FLOAT_TEXT = "Hola, necesito ayuda con mi pedido.";

IG_URL = "https://www.instagram.com/harinasdonpepito/";
FB_URL = "https://www.facebook.com/harinasdonpepito";
TT_URL = "https://www.tiktok.com/@harinasdonpepito";

CART_KEY = "dp_cart_interest_v1";
MAX_CATS = 300;
var WA_ICON_IMG;

WA_ICON_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/960px-WhatsApp.svg.png"
/* ✅ Verde manzana */
HEADER_BG = "#8BC34A";

/* ✅ IMPORTANTE: catálogo debe ser "/categoria" para funcionar desde /producto/:id */
NAV_ITEMS = [
  { label: "Inicio", href: "/", type: "route" },
  { label: "Quienes somos", href: "/aboutus", type: "route" },

  /* 👇 este item se renderiza como botón con mega menú */
  { label: "Catálogo", href: "/categoria", type: "route" },

  { label: "Ubicación", href: "https://maps.app.goo.gl/zD8DvAwfFnhtJKJd9", type: "ext" },
  { label: "Promociones", href: "/categoria/" + encodeURIComponent("PROMOCIONES"), type: "route" },
  { label: "Trabaja con nosotros", href: "/trabaja-con-nosotros", type: "route" },
];


export default function PublicLayout() {
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
    [catOpen]
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
    [megaOpen]
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
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      <ScrollToTop />
      {/*  HEADER   */}
      <header className="sticky top-0 z-40 w-full">
        <div className="w-full" style={{ backgroundColor: HEADER_BG }}>
          {/* ✅ ANTES: max-w-7xl -> ahora FULL WIDTH */}
          <div className="mx-auto w-full max-w-none px-3 sm:px-5 lg:px-10 2xl:px-14">
            {/* ===== Desktop (arreglado: no se sale en <1920) ===== */}
            <div className="hidden md:grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 lg:gap-6 py-3 lg:py-4">
              {/* IZQ: NAV */}
              <div className="relative min-w-0" ref={megaRef}>
                <nav className="flex flex-wrap items-center gap-1 lg:gap-2">
                  {NAV_ITEMS.map(function (it, i) {
                    var cls;

                    /* ✅ en pantallas medianas baja un poco padding/fuente para que no empuje */
                    cls =
                      "rounded-md px-2 lg:px-3 py-2 text-[13px] lg:text-[15px] xl:text-[16px] font-extrabold text-white/95 hover:bg-white/10 hover:text-white";

                    if (it.label === "Catálogo") {
                      return (
                        <button
                          key={"nav" + i}
                          type="button"
                          onClick={toggleMegaCats}
                          className={cls + " inline-flex items-center gap-2"}
                          aria-expanded={megaOpen ? "true" : "false"}
                          title="Ver categorías"
                        >
                          Catálogo <span className="text-white/80">▾</span>
                        </button>
                      );
                    }

                    if (it.type === "route") {
                      return (
                        <Link key={"nav" + i} to={it.href} className={cls}>
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
                        className={cls}
                      >
                        {it.label}
                      </a>
                    );
                  })}
                </nav>

                {/* ✅ MEGA MENÚ (igual que tenías) */}
                {megaOpen ? (
                  <div className="absolute left-0 top-full mt-3 w-[920px] max-w-[92vw] rounded-2xl bg-[#0B3D57] p-5 shadow-2xl ring-1 ring-black/10">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-extrabold text-white">CATEGORÍAS</div>

                      <div className="ml-auto w-[280px] max-w-[48vw]">
                        <input
                          value={megaQuery}
                          onChange={function (e) {
                            setMegaQuery(e.target.value);
                          }}
                          placeholder="Filtrar..."
                          className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white placeholder:text-white/60 outline-none focus:border-white/40"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        to="/categoria"
                        onClick={function () {
                          setMegaOpen(false);
                          window.scrollTo(0, 0);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/15"
                        title="Ver todas las categorías"
                      >
                        Ver todas <span className="opacity-80">→</span>
                      </Link>
                    </div>

                    <div className="mt-4 grid gap-6 md:grid-cols-3">
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
                                  className="block rounded-lg px-2 py-1.5 text-[13px] font-semibold text-white/90 hover:bg-white/10 hover:text-white"
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

                    <div className="mt-4 text-xs font-semibold text-white/70">
                      Tip: escribe para filtrar rápido una categoría.
                    </div>
                  </div>
                ) : null}
              </div>

              {/* CENTRO: Logo */}
              <div className="shrink-0">
                <Link to="/" className="flex items-center justify-center">
                  <img
                    src={LOGO_URL}
                    alt="Don Pepito"
                    className="h-16 sm:h-20 lg:h-24 2xl:h-28 w-auto object-contain"
                  />
                </Link>
              </div>

              {/* DER: Search + redes + carrito */}
              <div className="flex min-w-0 items-center justify-end gap-1.5 lg:gap-3">
                {/* ✅ Search: ahora SE ENCOGE, ya no empuja el header */}
                <div className="flex min-w-0 flex-1 max-w-[320px] lg:max-w-[420px] xl:max-w-[520px] 2xl:max-w-[560px] items-stretch overflow-hidden rounded-xl border border-white/25 bg-white shadow-sm">
                  <input
                    value={qSearch}
                    onChange={function (e) {
                      setQSearch(e.target.value);
                    }}
                    placeholder="Buscar productos..."
                    className="min-w-0 w-full px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    className="inline-flex w-11 lg:w-12 items-center justify-center border-l border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    title="Buscar"
                    aria-label="Buscar"
                  >
                    <SearchIcon />
                  </button>
                </div>

                {/* ✅ Redes: un pelín más compactas en tamaños medianos */}
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-black/15 p-1.5 lg:p-2 hover:bg-black/25"
                  title="Instagram"
                >
                  <img
                    src={IG_ICON_IMG}
                    alt="Instagram"
                    className="h-5 w-5 lg:h-6 lg:w-6 rounded-full object-cover"
                    loading="lazy"
                    draggable="false"
                  />
                </a>

                <a
                  href={FB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-black/15 p-1.5 lg:p-2 hover:bg-black/25"
                  title="Facebook"
                >
                  <img
                    src={FB_ICON_IMG}
                    alt="Facebook"
                    className="h-5 w-5 lg:h-6 lg:w-6 rounded-full object-cover"
                    loading="lazy"
                    draggable="false"
                  />
                </a>

                <a
                  href={TT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-black/15 p-1.5 lg:p-2 hover:bg-black/25"
                  title="TikTok"
                >
                  <img
                    src={TT_ICON_IMG}
                    alt="TikTok"
                    className="h-5 w-5 lg:h-6 lg:w-6 rounded-full object-cover"
                    loading="lazy"
                    draggable="false"
                  />
                </a>

                <button
                  onClick={function () {
                    setCartOpen(true);
                  }}
                  className="relative inline-flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-orange-500 shadow hover:bg-orange-400"
                  title="Carrito"
                  aria-label="Abrir carrito"
                >
                  <img
                    src={CART_ICON_IMG}
                    alt="Carrito"
                    className="h-6 w-6 lg:h-7 lg:w-7 object-contain"
                    loading="lazy"
                    draggable="false"
                  />
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[22px] items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-extrabold text-slate-900 shadow">
                    {cart.length}
                  </span>
                </button>
              </div>
            </div>


            {/* ===== Mobile ===== */}
            <div className="flex items-center gap-3 py-3 md:hidden">
              <button
                onClick={function () {
                  setCatOpen(true);
                  setCatQuery("");
                }}
                className="inline-flex items-center justify-center rounded-xl bg-black/15 p-2 text-white hover:bg-black/25"
                aria-label="Abrir categorías"
                title="Categorías"
              >
                <MenuIcon />
              </button>

              <Link to="/" className="flex items-center">
                {/* ✅ logo mobile un poquito más grande */}
                <img src={LOGO_URL} alt="Don Pepito" className="h-14 w-auto object-contain" />
              </Link>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={function () {
                    setCartOpen(true);
                  }}
                  className="relative inline-flex items-center gap-2 rounded-full bg-orange-500 px-3 py-2 text-sm font-extrabold text-white shadow hover:bg-orange-400"
                  aria-label="Abrir carrito"
                >
                  CA
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs text-slate-900">
                    {cart.length}
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
                  className="w-full rounded-full border border-white/25 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-white"
                />
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <SearchIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Barra mini de marcas (debajo del header) */}
      <BrandMarquee />
      {/* ✅ Drawer lateral (mobile): SOLO categorías */}
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

      {/* ✅ BOTÓN FLOTANTE "¿NECESITAS AYUDA?" */}
      <HelpWhatsappFloat />

      {/* ✅ FOOTER NUEVO (tipo retail) - ACCENT #8BC34A */}
      <footer className="w-full bg-[#8BC34A] text-white">
        {/* barra superior accent */}
        <div className="h-1 w-full bg-[#8BC34A]" />

        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="py-10">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-3">
                  <img src={LOGO_URL} alt={BRAND} className="h-30 w-auto object-contain" />
                  <div className="leading-tight"></div>
                </div>

                <div className="mt-4 space-y-2 text-sm font-semibold text-black">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#8BC34A]">
                      <PinIcon />
                    </span>
                    <span>Lima, Perú (envíos a todo el país)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#8BC34A]">
                      <ClockIcon />
                    </span>
                    <span>Lun–Sáb • Atención rápida</span>
                  </div>
                </div>

<div className="mt-4 flex flex-wrap gap-2">
  <a
    href={"https://wa.me/51" + cleanPhone(PHONE)}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-2 rounded-2xl bg-[#8BC34A] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#7CB342]"
    title="Escríbenos por WhatsApp"
  >
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-white/40">
      <img
        src={WA_ICON_IMG}
        alt="WhatsApp"
        className="h-5 w-5 object-contain"
        loading="lazy"
        draggable="false"
      />
    </span>
    WhatsApp
  </a>
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

                <div className="mt-5 flex flex-wrap gap-2">
                  <TagPill>Envío</TagPill>
                  <TagPill>Recojo</TagPill>
                  <TagPill>Agencia</TagPill>
                  <TagPill>Mayorista</TagPill>
                </div>
              </div>

              <div>
                <FooterTitle>REDES SOCIALES</FooterTitle>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={IG_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:border-[#8BC34A]/40 hover:bg-[#8BC34A]/5"
                  >
                    <img
                      src={IG_ICON_IMG}
                      alt="Instagram"
                      className="h-5 w-5 rounded object-contain"
                    />
                    Instagram
                  </a>

                  <a
                    href={FB_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:border-[#8BC34A]/40 hover:bg-[#8BC34A]/5"
                  >
                    <img
                      src={FB_ICON_IMG}
                      alt="Facebook"
                      className="h-5 w-5 rounded object-contain"
                    />
                    Facebook
                  </a>

                  <a
                    href={TT_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:border-[#8BC34A]/40 hover:bg-[#8BC34A]/5"
                  >
                    <img
                      src={TT_ICON_IMG}
                      alt="TikTok"
                      className="h-5 w-5 rounded object-contain"
                    />
                    TikTok
                  </a>
                </div>

                {/* ✅ QR (solo imagen, el link ya está dentro del QR) */}
                <div className="mt-6">
                  <div className="w-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <img
                      src={QR_IMG_URL}
                      alt={"QR " + BRAND}
                      className="h-28 w-28 rounded-xl object-contain"
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

      {/* Body con scroll */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4">
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

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="text-xs font-extrabold text-slate-700">
                      {x.has_price ? "S/ " + Number(x.price || 0).toFixed(2) : "¡CONSÚLTALO!"}
                    </div>

                    <button
                      onClick={function () {
                        toggleInCart({ id_product: x.id_product });
                      }}
                      className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
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

/* ====== helpers ====== */
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
  return <div className="text-sm font-extrabold tracking-wide text-black">{props.children}</div>;
}

function FooterLink(props) {
  return (
    <a href={props.href} className="block text-sm font-semibold text-slate-600 hover:text-slate-900">
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
          <div className="text-sm font-extrabold text-slate-900">{props.title}</div>
          <div className="mt-1 text-xs font-semibold text-slate-600">{props.desc}</div>
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

          <div className="dp-marquee flex w-max items-center gap-10">
            {row.map(function (b, k) {
              return (
                <img
                  key={"b" + k}
                  src={b.src}
                  alt={b.alt}
                  loading="lazy"
                  className="h-6 w-auto select-none object-contain opacity-90 md:h-7"
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
      <img
        src={HELP_FLOAT_IMG_URL}
        alt="¿Necesitas ayuda?"
        className="h-40 w-40 select-none drop-shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-transform"
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
    [loc.pathname, loc.hash]
  );

  return null;
}
