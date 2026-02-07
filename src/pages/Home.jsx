import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../services/productsService";
import { listCategories } from "../services/categoriesService";
import { BD_NAME } from "../services/appConfig";

/* ====== TOP-LEVEL VARS ====== */

var SLIDES;
var HOME_CAT_IDS;
var PROMO_BLOCKS;
var HOME_AFTER_4CATS_IMG;

HOME_AFTER_4CATS_IMG =
  "https://api-centralizador.apiworking.pe/images/f28b3dde-d053-44a5-b6c9-7cb90ccb17ca.png";
var HOME_AFTER_4CATS_IMG_MOBILE;

HOME_AFTER_4CATS_IMG_MOBILE =
  "https://api-centralizador.apiworking.pe/images/761c0511-4760-4d2d-8015-7f49ec6bee23.png";

SLIDES = [
  {
    img: "https://api-centralizador.apiworking.pe/images/bcf79159-5c66-416c-99a8-909c8cfc5502.png",
    title: "Insumos para tu negocio",
    subtitle: "Harinas, abarrotes y más",
  },
  {
    img: "https://api-centralizador.apiworking.pe/images/db0bf253-e767-4eec-9c36-9510a41e1c5d.png",
    title: "Catálogo simple y rápido",
    subtitle: "Busca, filtra y consulta por WhatsApp",
  },
  {
    img: "https://api-centralizador.apiworking.pe/images/95866e5e-1d2e-4a88-88da-68241741e473.png",
    title: "Todos los productos de Perú",
    subtitle: "Arma tu lista y pide precios consulta los precios",
  },
];
var SLIDES_MOBILE;

SLIDES_MOBILE = [
  {
    img: "https://api-centralizador.apiworking.pe/images/84b33ac8-ef82-4974-80fa-db663ee87288.png",
    title: "Don Pepito",
    subtitle: "",
  },
  {
    img: "https://api-centralizador.apiworking.pe/images/cfc6619f-3c52-403f-8587-d76e7c0e7323.png",
    title: "Don Pepito",
    subtitle: "",
  },
  {
    img: "https://api-centralizador.apiworking.pe/images/84b33ac8-ef82-4974-80fa-db663ee87288.png",
    title: "Don Pepito",
    subtitle: "",
  },
];

HOME_CAT_IDS = ["3", "4", "6", "10"];
var DON_PEPITO_STORY_IMG;

DON_PEPITO_STORY_IMG = "https://img.sorianoticias.com/imagenes/2020-03/Pan_2.jpg";

/* Bloques como la imagen: banner + 4 productos */
PROMO_BLOCKS = [
  {
    catId: "3",
    title: "Productos más vendidos",
    img: "https://api-centralizador.apiworking.pe/images/c304fb50-9270-489c-91d0-50b0add2ce00.png",
    cta: "Categoria",
    side: "left",
    max: 4,
  },
  {
    catId: "4",
    title: "Productos más visitados",
    img: "https://api-centralizador.apiworking.pe/images/8e4a0c06-4350-4815-b8ff-361be5504837.png",
    cta: "Categoria",
    side: "right",
    max: 4,
  },

  /* ✅ Reutilizamos imágenes que YA tienes */
  {
    catId: "6",
    title: "Ofertas y destacados",
    img: "https://api-centralizador.apiworking.pe/images/c304fb50-9270-489c-91d0-50b0add2ce00.png",
    cta: "Categoria",
    side: "left",
    max: 4,
  },
  {
    catId: "10",
    title: "Recomendados para ti",
    img: "https://api-centralizador.apiworking.pe/images/8e4a0c06-4350-4815-b8ff-361be5504837.png",
    cta: "Categoria",
    side: "right",
    max: 4,
  },
];

export default function Home() {
  var ctx;
  var nav;
  nav = useNavigate();

  var q, qCats;
  var ok, items, activeItems;
  var okCats, catItemsApi;

  var slide, setSlide;
  var cat, setCat;
var isMobile, setIsMobile;
var slidesUse, slidesLen;

/* detect mobile ( < md ) */
isMobile = useState(false);
setIsMobile = isMobile[1];
isMobile = isMobile[0];

useEffect(function () {
  var m, onCh;

  if (typeof window === "undefined") return;
  if (!window.matchMedia) return;

  m = window.matchMedia("(max-width: 767px)");

  onCh = function () {
    setIsMobile(!!m.matches);
  };

  onCh();

  if (m.addEventListener) m.addEventListener("change", onCh);
  else m.addListener(onCh);

  return function () {
    if (m.removeEventListener) m.removeEventListener("change", onCh);
    else m.removeListener(onCh);
  };
}, [setIsMobile]);

/* slides to use */
slidesUse = useMemo(
  function () {
    return isMobile ? SLIDES_MOBILE : SLIDES;
  },
  [isMobile]
);

slidesLen = slidesUse && slidesUse.length ? slidesUse.length : 0;

/* clamp slide when switching desktop/mobile */
useEffect(
  function () {
    if (!slidesLen) return;
    if (slide >= slidesLen) setSlide(0);
  },
  [slide, slidesLen, setSlide]
);

/* autoplay based on slidesUse length */
useEffect(
  function () {
    var t;

    if (!slidesLen) return;

    t = setInterval(function () {
      setSlide(function (s) {
        var next;
        next = s + 1;
        if (next >= slidesLen) next = 0;
        return next;
      });
    }, 5000);

    return function () {
      clearInterval(t);
    };
  },
  [setSlide, slidesLen]
);

  var qSearch, cart, toggleInCart, setCartOpen;

  var catsHome, filtered, showGrid;
  var promoData, catsAfterPromos;

  ctx = useOutletContext();
  if (!ctx) ctx = {};

  qSearch = typeof ctx.qSearch !== "undefined" ? ctx.qSearch : "";
  cart = Array.isArray(ctx.cart) ? ctx.cart : [];
  toggleInCart =
    typeof ctx.toggleInCart === "function" ? ctx.toggleInCart : function () {};
  setCartOpen =
    typeof ctx.setCartOpen === "function" ? ctx.setCartOpen : function () {};

  /* slide */
  slide = useState(0);
  setSlide = slide[1];
  slide = slide[0];

  /* categoría */
  cat = useState("ALL");
  setCat = cat[1];
  cat = cat[0];

  q = useQuery({
    queryKey: ["public_products", BD_NAME],
    queryFn: listProducts,
  });

  qCats = useQuery({
    queryKey: ["public_categories", BD_NAME],
    queryFn: listCategories,
  });

  ok = q.data && (q.data.codResponse === "1" || q.data.codResponse === 1);
  items = ok && q.data.data ? q.data.data : [];

  okCats =
    qCats.data && (qCats.data.codResponse === "1" || qCats.data.codResponse === 1);
  catItemsApi = okCats && qCats.data.data ? qCats.data.data : [];

  activeItems = useMemo(
    function () {
      return (items || []).filter(function (p) {
        return !!p && !!p.product_status;
      });
    },
    [items]
  );

  /* CATS HOME SOLO por IDs */
  catsHome = pickHomeCategoriesFixedIds(catItemsApi, activeItems, HOME_CAT_IDS);

  /* Bloques promo (id 3 y 4) */
  promoData = buildPromoBlocks(catItemsApi, activeItems, PROMO_BLOCKS);

  /* No repetir en las filas de abajo */
  catsAfterPromos = filterOutCatsByNames(catsHome, promoData);

  /* filtros */
  filtered = applyFilters(activeItems, qSearch, cat).slice(0, 60);
  showGrid = !!(String(qSearch || "").trim() || cat !== "ALL");

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
function onPrev() {
  var next;
  if (!slidesLen) return;

  next = slide - 1;
  if (next < 0) next = slidesLen - 1;
  setSlide(next);
}

function onNext() {
  var next;
  if (!slidesLen) return;

  next = slide + 1;
  if (next >= slidesLen) next = 0;
  setSlide(next);
}

  function openCartUi() {
    setCartOpen(true);
  }

  /* ✅ NUEVO: navegación real */
  function goCategorias() {
    nav("/categoria");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goCategoriaNombre(name) {
    var href;
    href = categoryHref(name);
    nav(href);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="w-full bg-slate-50 overflow-x-hidden">
{/* Hero carousel (desktop + mobile slides) */}
<section className="w-full bg-slate-900">
  <div className="relative w-full overflow-hidden">
    <div
      className="
        relative w-full
        h-[62vh] min-h-[340px] max-h-[720px]
        md:h-[55vh] md:min-h-[320px] md:max-h-[560px]
        bg-slate-100
      "
    >
      <img
        src={slidesUse[slide] ? slidesUse[slide].img : ""}
        alt={slidesUse[slide] ? slidesUse[slide].title : "Slide"}
        className="
          absolute inset-0 h-full w-full
          object-contain md:object-cover
          object-center
        "
        draggable="false"
      />

      {/* overlays */}
      <div className="absolute inset-0 bg-black/0 md:bg-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-black/0 to-black/0 md:from-black/35 pointer-events-none" />

      <button
        onClick={onPrev}
        className="
          absolute left-2 md:left-3 top-1/2 -translate-y-1/2
          rounded-full bg-white/95 p-2 md:p-3
          text-slate-900 shadow hover:bg-white
        "
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <button
        onClick={onNext}
        className="
          absolute right-2 md:right-3 top-1/2 -translate-y-1/2
          rounded-full bg-white/95 p-2 md:p-3
          text-slate-900 shadow hover:bg-white
        "
        aria-label="Siguiente"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <div className="absolute bottom-3 md:bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {(slidesUse || []).map(function (_, i) {
          return (
            <button
              key={"dot" + i}
              onClick={function () {
                setSlide(i);
              }}
              className={
                "h-2.5 w-2.5 md:h-3 md:w-3 rounded-full ring-1 ring-white/30 " +
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
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-8">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div></div>
          </div>

          {/* States */}
          {q.isLoading || qCats.isLoading ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <div className="text-m font-semibold text-mlate-600">Cargando catálogo…</div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Skel />
                <Skel />
                <Skel />
              </div>
            </div>
          ) : null}

          {!q.isLoading && ok === false ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <div className="text-m font-extrabold text-amber-800">
                {q.data && q.data.message ? q.data.message : "No se pudo obtener datos"}
              </div>
            </div>
          ) : null}

          {/* Contenido */}
          {!q.isLoading && ok ? (
            <div className="mt-6">
              {showGrid ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Breadcrumb
                      cat={cat}
                      onGoHome={function () {
                        setCat("ALL");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onGoCatalog={function () {
                        setCat("ALL");
                        window.location.hash = "catalogo";
                      }}
                    />

                    <div className="text-m font-bold text-mlate-600">
                      {(filtered || []).length} productos
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {(filtered || []).map(function (p) {
                      return (
                        <ProductCardV2
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
                </div>
              ) : (
                /* Vista HOME ordenada (PROMO BLOCKS para 3,4,6,10) */
                <div className="space-y-10">
                                    {/* ✅ 2) Luego: ¿Qué es Don Pepito? */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
                    <div className="text-center text-2xl font-extrabold tracking-tight text-mlate-900 md:text-3xl">
                      ¿Quienes somos?
                    </div>

<div className="mt-6 grid items-center gap-6 md:grid-cols-12 md:gap-10">
  {/* Texto */}
  <div className="md:col-span-7">
    <div className="space-y-4 text-lg font-semibold leading-relaxed text-slate-700 md:text-3xl">
      <p>
        Don Pepito es una empresa dedicada a la comercialización y distribución de insumos para la panadería, pastelería y abarrotes. Ofrecemos productos de calidad como harinas, mantecas, margarinas y una amplia variedad de artículos esenciales, atendiendo con compromiso, puntualidad y precios justos a panaderos, negocios y familias. Nuestro objetivo es ser un aliado confiable para el crecimiento de nuestros clientes.
      </p>
    </div>
  </div>

  {/* Imagen derecha */}
  <div className="md:col-span-5">
    <div className="overflow-hidden rounded-3xl ring-1 ring-slate-200">
      <img
        src={DON_PEPITO_STORY_IMG}
        alt="Pan Don Pepito"
        className="h-[240px] w-full object-cover md:h-[360px]"
        loading="lazy"
        draggable="false"
      />
    </div>
  </div>
</div>

                  </div>
                  {/* ✅ 1) Primero: los 4 promo blocks */}
                  {(promoData || []).map(function (b, i) {
                    return (
                      <PromoBlock
                        key={"promo_" + i}
                        b={b}
                        onGoCats={goCategorias}
                        onGoCat={function () {
                          goCategoriaNombre(b.catName);
                        }}
                      />
                    );
                  })}



{/* ✅ 3) Luego: banner full width (PC vs Mobile) */}
<div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
  <img
    src={isMobile ? HOME_AFTER_4CATS_IMG_MOBILE : HOME_AFTER_4CATS_IMG}
    alt="Don Pepito"
    className="block w-full h-auto"
    loading="lazy"
    draggable="false"
  />
</div>


                  {/* (opcional) si mañana agregas más categorías fuera de 3,4,6,10 */}
                  {(catsAfterPromos || []).map(function (c) {
                    var rowItems;
                    rowItems = takeProductsByCategory(activeItems, c, 12);
                    if (!rowItems.length) return null;

                    return (
                      <CategoryRow
                        key={"row_" + c}
                        title={c}
                        items={rowItems}
                        onSeeAll={function () {
                          goCategoriaNombre(c);
                        }}
                        cart={cart}
                        onToggle={toggleInCart}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

/* ---------- core helpers ---------- */

function applyFilters(items2, q2, cat2) {
  var qx, out, i, p, text, inCat, c1, c2;
  qx = (q2 || "").toLowerCase().trim();
  out = [];

  c2 = String(cat2 || "").trim();

  for (i = 0; i < (items2 || []).length; i = i + 1) {
    p = items2[i] || {};
    c1 = String(p.category_name || "").trim();

    inCat = c2 === "ALL" || c1 === c2;

    text = String(p.product_name || "") + " " + String(p.product_desc || "") + " " + c1;

    if (inCat && (!qx || text.toLowerCase().indexOf(qx) !== -1)) out.push(p);
  }

  return out;
}

function isInCart(cart, id) {
  var i;
  for (i = 0; i < (cart || []).length; i = i + 1) {
    if (String(cart[i].id_product) === String(id)) return true;
  }
  return false;
}

/* ids -> nombres (en el orden de ids) */
function pickHomeCategoriesFixedIds(catItemsApi, products, ids) {
  var map, counts, out, i, j, it, p, id, name, pid, cname;

  map = {};
  if (catItemsApi && catItemsApi.length) {
    for (i = 0; i < catItemsApi.length; i = i + 1) {
      it = catItemsApi[i] || {};
      id = "";
      if (typeof it.id_category !== "undefined") id = String(it.id_category).trim();
      else if (typeof it.idCategory !== "undefined") id = String(it.idCategory).trim();
      else if (typeof it.id !== "undefined") id = String(it.id).trim();

      name = it.category_name ? String(it.category_name).trim() : "";
      if (id && name) map[id] = name;
    }
  }

  counts = {};
  for (j = 0; j < (products || []).length; j = j + 1) {
    p = products[j] || {};
    pid = typeof p.id_category !== "undefined" ? String(p.id_category).trim() : "";
    cname = p.category_name ? String(p.category_name).trim() : "";
    if (pid) counts[pid] = (counts[pid] || 0) + 1;
    if (cname) counts[cname] = (counts[cname] || 0) + 1;
  }

  out = [];
  for (i = 0; i < (ids || []).length; i = i + 1) {
    id = String(ids[i]).trim();
    name = map[id] || "";
    if (!name) continue;
    if ((counts[id] || 0) <= 0 && (counts[name] || 0) <= 0) continue;
    out.push(name);
  }

  return out;
}

function getCategoryNameById(catItemsApi, id, products) {
  var i, it, cid, name;

  for (i = 0; i < (catItemsApi || []).length; i = i + 1) {
    it = catItemsApi[i] || {};
    cid = "";
    if (typeof it.id_category !== "undefined") cid = String(it.id_category).trim();
    else if (typeof it.idCategory !== "undefined") cid = String(it.idCategory).trim();
    else if (typeof it.id !== "undefined") cid = String(it.id).trim();

    if (cid === String(id).trim()) {
      name = it.category_name ? String(it.category_name).trim() : "";
      if (name) return name;
    }
  }

  for (i = 0; i < (products || []).length; i = i + 1) {
    it = products[i] || {};
    cid = typeof it.id_category !== "undefined" ? String(it.id_category).trim() : "";
    if (cid === String(id).trim()) {
      name = it.category_name ? String(it.category_name).trim() : "";
      if (name) return name;
    }
  }

  return "";
}

function takeProductsByCategory(items, catName, max) {
  var out, i, p, c;
  out = [];

  for (i = 0; i < (items || []).length; i = i + 1) {
    p = items[i] || {};
    c = p.category_name ? String(p.category_name).trim() : "";
    if (c === String(catName).trim()) {
      out.push(p);
      if (out.length >= (max || 12)) break;
    }
  }

  return out;
}

function takeProductsByCategoryId(items, catId, catName, max) {
  var out, i, p, pid, cname;
  out = [];

  for (i = 0; i < (items || []).length; i = i + 1) {
    p = items[i] || {};
    pid = typeof p.id_category !== "undefined" ? String(p.id_category).trim() : "";
    cname = p.category_name ? String(p.category_name).trim() : "";

    if (pid === String(catId).trim() || (catName && cname === String(catName).trim())) {
      out.push(p);
      if (out.length >= (max || 4)) break;
    }
  }

  return out;
}

function buildPromoBlocks(catItemsApi, products, blocks) {
  var out, i, b, name, items;

  out = [];
  for (i = 0; i < (blocks || []).length; i = i + 1) {
    b = blocks[i] || {};
    name = getCategoryNameById(catItemsApi, b.catId, products);
    if (!name) continue;

    items = takeProductsByCategoryId(products, b.catId, name, b.max || 4);

    out.push({
      catId: String(b.catId || ""),
      catName: name,
      title: String(b.title || ""),
      img: String(b.img || ""),
      cta: String(b.cta || "Categoria"),
      side: String(b.side || "left"),
      items: items,
    });
  }

  return out;
}

function filterOutCatsByNames(cats, promoData) {
  var map, i, out, name;

  map = {};
  for (i = 0; i < (promoData || []).length; i = i + 1) {
    name = promoData[i] && promoData[i].catName ? String(promoData[i].catName).trim() : "";
    if (name) map[name] = true;
  }

  out = [];
  for (i = 0; i < (cats || []).length; i = i + 1) {
    name = String(cats[i] || "").trim();
    if (!name) continue;
    if (map[name] === true) continue;
    out.push(name);
  }

  return out;
}

function Breadcrumb(props) {
  var c;

  c = String(props.cat || "").trim();

  return (
    <div className="flex flex-wrap items-center gap-2 text-m font-extrabold text-mlate-600">
      <button type="button" onClick={props.onGoHome} className="hover:underline" title="Ir a inicio">
        Inicio
      </button>

      <span className="text-mlate-400">›</span>

      <button type="button" onClick={props.onGoCatalog} className="hover:underline" title="Ir a catálogo">
        Catálogo
      </button>

      {c && c !== "ALL" ? (
        <>
          <span className="text-mlate-400">›</span>
          <span className="text-mlate-900">{c}</span>
        </>
      ) : null}
    </div>
  );
}

/* ---------- small UI components ---------- */

function Tab(props) {
  return (
    <button
      onClick={props.onClick}
      className={
        "rounded-2xl px-4 py-2 text-m font-extrabold transition " +
        (props.active
          ? "bg-emerald-600 text-white shadow"
          : "border border-slate-200 bg-white text-mlate-800 hover:bg-slate-50")
      }
    >
      {props.label}
    </button>
  );
}

/* ✅ PROMO BLOCK con 2 rutas:
   - Amarillo: /categoria
   - Banner / Ver todo / Verde: /categoria/<Nombre> (encode) */
function PromoBlock(props) {
  var b, bannerCls, productsCls;
  var bannerBtnLabel, shopBtnLabel, catName;

  b = props.b || {};
  catName = String(b.catName || "").trim();

  bannerCls = "lg:col-span-5 " + (b.side === "right" ? "lg:order-2" : "lg:order-1");
  productsCls = "lg:col-span-7 " + (b.side === "right" ? "lg:order-1" : "lg:order-2");

  bannerBtnLabel = "Ir a catalogo";

  shopBtnLabel = String(b.cta || "").trim();
  if (!shopBtnLabel) shopBtnLabel = "Categoria";

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Banner */}
      <div className={bannerCls}>
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          {/* ✅ Banner clickeable: /categoria/<catName> */}
          <button
            type="button"
            onClick={props.onGoCat}
            className="block w-full cursor-pointer"
            aria-label={"Ver categoría " + catName}
            title={"Ver " + catName}
          >
            <img src={b.img} alt={b.title} className="h-full w-full object-cover" />
          </button>

          <div className="p-4">
            {/* ✅ Amarillo: /categoria */}
            <button
              onClick={props.onGoCats}
              className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-m font-extrabold text-mlate-900 hover:bg-amber-300"
              type="button"
            >
              {bannerBtnLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className={productsCls}>
        <div className="flex items-end justify-between gap-3">
          <div className="text-2xl font-extrabold text-mlate-900">{b.title}</div>

          {/* ✅ /categoria/<catName> */}
          <button
            onClick={props.onGoCat}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-m font-extrabold text-mlate-800 hover:bg-slate-50"
            type="button"
          >
            Ver todo →
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(b.items || []).map(function (p) {
            return <ProductCardMini key={"mini_" + p.id_product} p={p} />;
          })}
        </div>

        {/* ✅ Verde: /categoria/<catName> */}
        <div className="mt-5">
          <button
            onClick={props.onGoCat}
            className="w-full rounded-2xl bg-emerald-900 px-4 py-3 text-m font-extrabold text-white hover:bg-emerald-800"
            type="button"
          >
            {shopBtnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow(props) {
  var ref;
  ref = useRef(null);

  function scrollByDir(dir) {
    var el, w;
    el = ref.current;
    if (!el) return;
    w = el.clientWidth || 600;
    el.scrollBy({ left: dir * Math.floor(w * 0.85), behavior: "smooth" });
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-m font-extrabold text-mlate-900">{props.title}</div>
          <div className="text-m font-semibold text-mlate-500">Destacados de la categoría</div>
        </div>

        <button
          onClick={props.onSeeAll}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-m font-extrabold text-mlate-800 hover:bg-slate-50"
        >
          Ver todo →
        </button>
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {props.items.map(function (p) {
            return (
              <div key={"p_" + p.id_product} className="min-w-[240px] max-w-[240px]">
                <ProductCardV2
                  p={p}
                  inCart={isInCart(props.cart, p.id_product)}
                  onToggle={function () {
                    props.onToggle(p);
                  }}
                />
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

/* Mini cards (como imagen) */
function ProductCardMini(props) {
  var p, hasImg, priceText, href;

  p = props.p;
  hasImg = !!(p && p.product_image_url);
  priceText = p && p.has_price ? "S/ " + Number(p.price || 0).toFixed(2) : "";
  href = productHref(p);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <button
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-mlate-700 hover:bg-white"
        aria-label="Favorito"
        type="button"
      >
        <HeartIcon />
      </button>

      {/* ✅ Imagen clickeable */}
      <div className="h-28 w-full">
        {href ? (
          <Link
            to={href}
            className="group block h-full w-full"
            title="Ver detalle"
            aria-label={"Ver detalle de " + (p && p.product_name ? p.product_name : "producto")}
          >
            {hasImg ? (
              <img
                src={p.product_image_url}
                alt={p.product_name}
                className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                loading="lazy"
                draggable="false"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-m font-extrabold text-mlate-300">
                Sin imagen
              </div>
            )}
          </Link>
        ) : hasImg ? (
          <img
            src={p.product_image_url}
            alt={p.product_name}
            className="h-full w-full object-contain"
            loading="lazy"
            draggable="false"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-m font-extrabold text-mlate-300">
            Sin imagen
          </div>
        )}
      </div>

      <div className="mt-3">
        {/* ✅ Título clickeable */}
        <div className="min-h-[40px] text-m font-extrabold text-mlate-900">
          {href ? (
            <Link to={href} className="hover:underline" title="Ver detalle">
              {p.product_name}
            </Link>
          ) : (
            p.product_name
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          {p.has_price ? (
            <div className="text-lg font-extrabold text-mlate-900">{priceText}</div>
          ) : (
            <div className="rounded-full bg-amber-50 px-3 py-1 text-m font-extrabold text-amber-800"> VER
               
            </div>
          )}

          <div className="text-m font-extrabold text-mlate-900">
            5 <span className="text-amber-500">★</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Card normal */
function ProductCardV2(props) {
  var p, hasImg, priceText, href;

  p = props.p;
  hasImg = !!(p && p.product_image_url);
  priceText = p && p.has_price ? "S/ " + Number(p.price || 0).toFixed(2) : "";
  href = productHref(p);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* ✅ Imagen clickeable */}
      {href ? (
        <Link
          to={href}
          className="group block h-44 w-full bg-white relative"
          title="Ver detalle"
          aria-label={"Ver detalle de " + (p && p.product_name ? p.product_name : "producto")}
        >
          {hasImg ? (
            <img
              src={p.product_image_url}
              alt={p.product_name}
              className="h-full w-full object-contain p-3 transition-transform duration-200 group-hover:scale-[1.03]"
              loading="lazy"
              draggable="false"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-m font-extrabold text-mlate-300">
              Sin imagen
            </div>
          )}

          {/* mini hint en hover */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="text-m font-extrabold text-white">Ver detalle →</div>
          </div>
        </Link>
      ) : (
        <div className="h-44 w-full bg-white">
          {hasImg ? (
            <img
              src={p.product_image_url}
              alt={p.product_name}
              className="h-full w-full object-contain p-3"
              loading="lazy"
              draggable="false"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-m font-extrabold text-mlate-300">
              Sin imagen
            </div>
          )}
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="text-[20px] font-bold text-mlate-500">{p.category_name || "—"}</div>

        {/* ✅ Título también clickeable */}
        <div className="mt-1 min-h-[44px] text-m font-extrabold text-mlate-900">
          {href ? (
            <Link to={href} className="hover:underline" title="Ver detalle">
              {p.product_name}
            </Link>
          ) : (
            p.product_name
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          {p.has_price ? (
            <div className="text-lg font-extrabold text-red-600">{priceText}</div>
          ) : (
            <div className="rounded-full bg-amber-50 px-3 py-1 text-m font-extrabold text-amber-800">
               
            </div>
          )}

          {/* ✅ Este botón NO navega */}
          <button
            onClick={props.onToggle}
            className={
              "rounded-full px-4 py-2 text-m font-extrabold " +
              (props.inCart
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "border border-slate-200 bg-white text-mlate-800 hover:bg-slate-50")
            }
            type="button"
          >
            {props.inCart ? "Quitar" : "Agregar"}
          </button>
        </div>

        <div className="mt-3">
          <Link
            to={href}
            className="block w-full rounded-2xl bg-emerald-600 px-4 py-2.5 text-center text-m font-extrabold text-white hover:bg-emerald-700"
          >
            Ver detalle →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Skel() {
  return <div className="h-44 rounded-3xl bg-slate-100" />;
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s-7-4.35-9.5-8.28C.6 9.8 2.1 6.6 5.5 6.1c1.9-.3 3.4.6 4.3 1.8.9-1.2 2.4-2.1 4.3-1.8 3.4.5 4.9 3.7 3 6.62C19 16.65 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function productHref(p) {
  var id;
  id = p && typeof p.id_product !== "undefined" ? String(p.id_product) : "";
  if (!id) return "";
  return "/producto/" + id;
}

/* ✅ /categoria/<Nombre> con encode (espacios => %20) */
function categoryHref(name) {
  var n;
  n = String(name || "").trim();
  if (!n) return "/categoria";
  return "/categoria/" + encodeURIComponent(n);
}

/* ---------- icons ---------- */

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
