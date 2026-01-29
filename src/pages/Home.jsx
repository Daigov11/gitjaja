import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../services/productsService";
import { listCategories } from "../services/categoriesService";
import { BD_NAME } from "../services/appConfig";

/* ====== TOP-LEVEL VARS ====== */

var SLIDES;
var HOME_CAT_IDS;
var PROMO_BLOCKS;

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
    title: "Todos los productos de Perú",
    subtitle: "Arma tu lista y pide precios consulta los precios",
  },
];

HOME_CAT_IDS = ["3", "4", "6", "10", "16"];

/* Bloques como la imagen: banner + 4 productos */
PROMO_BLOCKS = [
  {
    catId: "3",
    title: "Productos más vendidos",
    img: "https://api-centralizador.apiworking.pe/images/c304fb50-9270-489c-91d0-50b0add2ce00.png",
    cta: "Tienda Online",
    side: "left",
    max: 4,
  },
  {
    catId: "4",
    title: "Productos más visitados",
    img: "https://api-centralizador.apiworking.pe/images/8e4a0c06-4350-4815-b8ff-361be5504837.png",
    cta: "Tienda Online",
    side: "right",
    max: 4,
  },
];

export default function Home() {
  var ctx;

  var q, qCats;
  var ok, items, activeItems;
  var okCats, catItemsApi;

  var slide, setSlide;
  var cat, setCat;

  var qSearch, cart, toggleInCart, setCartOpen;

  var catsHome, filtered, showGrid;
  var promoData, catsAfterPromos;

  ctx = useOutletContext();
  if (!ctx) ctx = {};

  qSearch = typeof ctx.qSearch !== "undefined" ? ctx.qSearch : "";
  cart = Array.isArray(ctx.cart) ? ctx.cart : [];
  toggleInCart = typeof ctx.toggleInCart === "function" ? ctx.toggleInCart : function () {};
  setCartOpen = typeof ctx.setCartOpen === "function" ? ctx.setCartOpen : function () {};

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

  okCats = qCats.data && (qCats.data.codResponse === "1" || qCats.data.codResponse === 1);
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

  function openCartUi() {
    setCartOpen(true);
  }

  function openCategoryByName(name) {
    if (!name) return;
    setCat(String(name).trim());
    window.location.hash = "catalogo";
  }

  return (
    <div className="w-full bg-slate-50">
      {/* Hero carousel */}
      <section className="w-full bg-slate-900">
        <div className="relative w-full overflow-hidden">
          <div className="relative h-[320px] w-full md:h-[560px]">
            <img
              src={SLIDES[slide].img}
              alt={SLIDES[slide].title}
              className="absolute inset-0 h-full w-full object-cover"
              draggable="false"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/10" />
            <div className="absolute inset-0 bg-black/10" />

            <div className="absolute inset-0">
              <div className="mx-auto flex h-full w-full max-w-7xl items-end px-4 pb-8 md:pb-12">
                <div className="max-w-xl rounded-3xl bg-black/35 p-5 backdrop-blur-sm ring-1 ring-white/15 md:p-7">
                  <div className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                    {SLIDES[slide].title}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white/90 md:text-base">
                    {SLIDES[slide].subtitle}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href="#catalogo"
                      className="rounded-full bg-white px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-100"
                    >
                      Ver catálogo ↓
                    </a>

                    <button
                      onClick={openCartUi}
                      className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-600"
                    >
                      Consultar por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-3 text-slate-900 shadow hover:bg-white"
              aria-label="Anterior"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-3 text-slate-900 shadow hover:bg-white"
              aria-label="Siguiente"
            >
              <ChevronRight />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {SLIDES.map(function (_, i) {
                return (
                  <button
                    key={"dot" + i}
                    onClick={function () {
                      setSlide(i);
                    }}
                    className={
                      "h-2.5 w-2.5 rounded-full ring-1 ring-white/30 " +
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
            <div>
              <div className="text-xs font-extrabold text-emerald-700">Catálogo</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">Explora por categorías</div>
            </div>
          </div>

          {/* Tabs (solo las 5 categorías por IDs) */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Tab
              active={cat === "ALL"}
              onClick={function () {
                setCat("ALL");
              }}
              label="Todas"
            />

            {catsHome.map(function (c) {
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
          {q.isLoading || qCats.isLoading ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-600">Cargando catálogo…</div>
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

          {/* Contenido */}
          {!q.isLoading && ok ? (
            <div className="mt-6">
              {showGrid ? (
                /* Cuando se busca o se elige una categoría */
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
              ) : (
                /* Vista HOME ordenada (como la imagen) */
                <div className="space-y-10">
                  {/* Bloques promo (3 y 4) */}
                  {(promoData || []).map(function (b, i) {
                    return (
                      <PromoBlock
                        key={"promo_" + i}
                        b={b}
                        onSeeAll={function () {
                          openCategoryByName(b.catName);
                        }}
                      />
                    );
                  })}

                  {/* Otras categorías (6,10,16) como filas */}
                  {catsAfterPromos.map(function (c) {
                    var rowItems;
                    rowItems = takeProductsByCategory(activeItems, c, 12);
                    if (!rowItems.length) return null;

                    return (
                      <CategoryRow
                        key={"row_" + c}
                        title={c}
                        items={rowItems}
                        onSeeAll={function () {
                          openCategoryByName(c);
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
      cta: String(b.cta || "Tienda Online"),
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

function PromoBlock(props) {
  var b, bannerCls, productsCls;
  b = props.b || {};

  bannerCls = "lg:col-span-5 " + (b.side === "right" ? "lg:order-2" : "lg:order-1");
  productsCls = "lg:col-span-7 " + (b.side === "right" ? "lg:order-1" : "lg:order-2");

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Banner */}
      <div className={bannerCls}>
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <img src={b.img} alt={b.title} className="h-full w-full object-cover" />

          <div className="p-4">
            <button
              onClick={props.onSeeAll}
              className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300"
            >
              {b.cta}
            </button>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className={productsCls}>
        <div className="flex items-end justify-between gap-3">
          <div className="text-2xl font-extrabold text-slate-900">{b.title}</div>

          <button
            onClick={props.onSeeAll}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
          >
            Ver todo →
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(b.items || []).map(function (p) {
            return <ProductCardMini key={"mini_" + p.id_product} p={p} />;
          })}
        </div>

        <div className="mt-5">
          <button
            onClick={props.onSeeAll}
            className="w-full rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-800"
          >
            Tienda Online
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
          <div className="text-sm font-extrabold text-slate-900">{props.title}</div>
          <div className="text-xs font-semibold text-slate-500">Destacados de la categoría</div>
        </div>

        <button
          onClick={props.onSeeAll}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
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
  var p, hasImg, priceText;

  p = props.p;
  hasImg = !!(p && p.product_image_url);
  priceText = p && p.has_price ? "S/ " + Number(p.price || 0).toFixed(2) : "";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <button
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-700 hover:bg-white"
        aria-label="Favorito"
        type="button"
      >
        <HeartIcon />
      </button>

      <div className="h-28 w-full">
        {hasImg ? (
          <img
            src={p.product_image_url}
            alt={p.product_name}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-extrabold text-slate-300">
            Sin imagen
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="min-h-[40px] text-sm font-extrabold text-slate-900">{p.product_name}</div>

        <div className="mt-2 flex items-center justify-between">
          {p.has_price ? (
            <div className="text-lg font-extrabold text-slate-900">{priceText}</div>
          ) : (
            <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800">
              ¡CONSÚLTALO!
            </div>
          )}

          <div className="text-sm font-extrabold text-slate-900">
            5 <span className="text-amber-500">★</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Card normal */
function ProductCardV2(props) {
  var p, hasImg, priceText;

  p = props.p;
  hasImg = !!(p && p.product_image_url);
  priceText = p && p.has_price ? "S/ " + Number(p.price || 0).toFixed(2) : "";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-44 w-full bg-white">
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
            <div className="text-lg font-extrabold text-red-600">{priceText}</div>
          ) : (
            <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800">
              ¡CONSÚLTALO!
            </div>
          )}

          <button
            onClick={props.onToggle}
            className={
              "rounded-full px-4 py-2 text-xs font-extrabold " +
              (props.inCart
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
            }
          >
            {props.inCart ? "Quitar" : "Agregar"}
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
