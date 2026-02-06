import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../../services/productsService";
import { listCategories } from "../../services/categoriesService";
import { BD_NAME } from "../../services/appConfig";

/* ====== TOP-LEVEL VARS ====== */
var MAX_CATS;
var FALLBACK_BG;

MAX_CATS = 200;
FALLBACK_BG = "bg-slate-100";

/* ====== PAGE ====== */
export default function CategoryIndex() {
  var ctx;

  var qCats, qProd;
  var okCats, okProd, catsApi, prodsApi;

  var qCat, setQCat;

  var activeProducts;
  var catsAll;
  var catsShown;

  ctx = useOutletContext ? useOutletContext() : null;
  if (!ctx) ctx = {};

  qCat = useState("");
  setQCat = qCat[1];
  qCat = qCat[0];

  qCats = useQuery({
    queryKey: ["public_categories", BD_NAME],
    queryFn: listCategories,
  });

  qProd = useQuery({
    queryKey: ["public_products", BD_NAME],
    queryFn: listProducts,
  });

  okCats = qCats.data && (qCats.data.codResponse === "1" || qCats.data.codResponse === 1);
  catsApi = okCats && qCats.data.data ? qCats.data.data : [];

  okProd = qProd.data && (qProd.data.codResponse === "1" || qProd.data.codResponse === 1);
  prodsApi = okProd && qProd.data.data ? qProd.data.data : [];

  activeProducts = useMemo(
    function () {
      return (prodsApi || []).filter(function (p) {
        return !!p && !!p.product_status;
      });
    },
    [prodsApi]
  );

  catsAll = useMemo(
    function () {
      var list;
      list = buildCategoryItems(catsApi, activeProducts);
      return list.slice(0, MAX_CATS);
    },
    [catsApi, activeProducts]
  );

  catsShown = useMemo(
    function () {
      var qx, out, i, c, count, nm;
      qx = String(qCat || "").toLowerCase().trim();
      out = [];

      for (i = 0; i < catsAll.length; i = i + 1) {
        c = catsAll[i];
        if (!c) continue;

        nm = String(c.name || "").toLowerCase();
        if (qx && nm.indexOf(qx) === -1) continue;

        count = countByCategory(activeProducts, c.name);

        out.push({
          id: c.id,
          name: c.name,
          imageUrl: c.imageUrl,
          count: count,
        });
      }

      out.sort(function (a, b) {
        return (b.count || 0) - (a.count || 0);
      });

      return out;
    },
    [catsAll, activeProducts, qCat]
  );

  return (
    <div className="w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold text-emerald-700">Catálogo</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              BUSCA POR CATEGORIA
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-600">
              Elige una categoría para ver sus productos.
            </div>
          </div>

          <Link
            to="/"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
          >
            ← Volver al inicio
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="relative">
              <input
                value={qCat}
                onChange={function (e) {
                  setQCat(e.target.value);
                }}
                placeholder="Buscar categoría… (ej: harinas, azúcar, lácteos)"
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
              />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </div>
            </div>
          </div>


        </div>

        {/* Loading / error */}
        {qCats.isLoading || qProd.isLoading ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-600">Cargando categorías…</div>
            <div className="mt-5 grid gap-6 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              <SkelTile />
              <SkelTile />
              <SkelTile />
              <SkelTile />
              <SkelTile />
              <SkelTile />
              <SkelTile />
              <SkelTile />
            </div>
          </div>
        ) : null}

        {!qCats.isLoading && !qProd.isLoading && (okProd === false || (okCats === false && !catsApi.length)) ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-extrabold text-amber-800">
              No se pudieron cargar las categorías o productos.
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-600">
              Revisa tu API o la BD configurada en <span className="font-extrabold">BD_NAME</span>.
            </div>
          </div>
        ) : null}

        {/* Content */}
        {!qCats.isLoading && !qProd.isLoading ? (
          <div className="mt-6">
            {catsShown.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="text-sm font-extrabold text-slate-900">Sin resultados</div>
                <div className="mt-1 text-sm font-semibold text-slate-600">
                  Prueba con otra búsqueda.
                </div>
              </div>
            ) : (
<div className="grid gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {catsShown.map(function (c) {
                  return (
                    <CategoryTile
                      key={"cat_" + String(c.id || c.name)}
                      name={c.name}
                      count={c.count}
                      imageUrl={c.imageUrl}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- UI ---------- */

function CategoryTile(props) {
  var href;
  href = "/categoria/" + encodeURIComponent(String(props.name || ""));

  return (
    <Link to={href} className="group flex flex-col items-center text-center">
      <div className="relative">
<div className="h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm group-hover:shadow-md">
  <CategoryImage name={props.name} imageUrl={props.imageUrl} />
</div>


        {/* Badge count (opcional, discreto) */}
<div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-2.5 py-1 text-[12px] font-extrabold text-slate-700 shadow-sm ring-1 ring-slate-200">
          {String(props.count || 0)}
        </div>
      </div>

      <div className="mt-4 text-sm font-semibold text-slate-700 leading-snug">
        {props.name}
      </div>
    </Link>
  );
}

function CategoryImage(props) {
  var url;
  var initial;

  url = normalizeUrl(props.imageUrl);
  initial = String(props.name || "?").trim();
  initial = initial ? initial.charAt(0).toUpperCase() : "?";

  if (!url) {
    return (
      <div className={"h-full w-full " + FALLBACK_BG + " flex items-center justify-center"}>
        <div className="flex flex-col items-center justify-center">
          <div className="text-slate-400">
            <PhotoIcon />
          </div>
          <div className="mt-1 text-xs font-extrabold text-slate-500">{initial}</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={String(props.name || "")}
      className="h-full w-full object-cover"
      loading="lazy"
      onError={function (e) {
        // si falla, lo reemplazamos por "placeholder visual" sin dejar ícono roto
        if (e && e.currentTarget) {
          e.currentTarget.onerror = null;
          e.currentTarget.removeAttribute("src");
          // convertimos ese img en un fondo simple (truco rápido)
          e.currentTarget.style.display = "none";
        }
      }}
    />
  );
}

function StatCard(props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-extrabold text-slate-500">{props.label}</div>
      <div className="mt-1 text-2xl font-extrabold text-slate-900">{props.value}</div>
    </div>
  );
}

function SkelTile() {
  return (
    <div className="flex flex-col items-center">
      <div className="h-24 w-24 rounded-full bg-slate-100" />
      <div className="mt-4 h-3 w-16 rounded bg-slate-100" />
    </div>
  );
}

/* ---------- helpers ---------- */

function buildCategoryItems(catItemsApi, products) {
  var out, map, i, item, name, id, img, status, fromProds, p;

  out = [];
  map = {};

  // 1) Preferimos categorías de API (traen imagen)
  if (catItemsApi && catItemsApi.length) {
    for (i = 0; i < catItemsApi.length; i = i + 1) {
      item = catItemsApi[i];
      if (!item) continue;

      status = item.category_status;
      if (status === false) continue;

      name = item.category_name ? String(item.category_name).trim() : "";
      if (!name) continue;

      id = item.id_category != null ? item.id_category : "";
      img = item.category_image_url ? String(item.category_image_url).trim() : "";

      if (!map[name]) {
        map[name] = true;
        out.push({
          id: id,
          name: name,
          imageUrl: img,
        });
      } else {
        // si ya existe y el anterior no tenía imagen, preferimos el que sí tenga
        if (img) {
          replaceImageIfEmpty(out, name, img, id);
        }
      }
    }
  }

  // 2) Fallback: si no vinieron categorías, las sacamos desde productos (sin imagen)
  if (!out.length) {
    fromProds = {};
    for (i = 0; i < products.length; i = i + 1) {
      p = products[i];
      if (!p) continue;

      name = p.category_name ? String(p.category_name).trim() : "";
      if (!name) continue;

      if (!fromProds[name]) {
        fromProds[name] = true;
        out.push({
          id: "",
          name: name,
          imageUrl: "",
        });
      }
    }
  }

  out.sort(function (a, b) {
    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  return out;
}

function replaceImageIfEmpty(list, name, newImg, newId) {
  var i, it;
  for (i = 0; i < list.length; i = i + 1) {
    it = list[i];
    if (!it) continue;
    if (String(it.name || "") !== String(name || "")) continue;

    if (!normalizeUrl(it.imageUrl)) {
      it.imageUrl = newImg;
      if (!it.id && newId) it.id = newId;
    }
    return;
  }
}

function countByCategory(products, catName) {
  var i, p, c, n;
  n = 0;

  for (i = 0; i < products.length; i = i + 1) {
    p = products[i];
    c = p && p.category_name ? String(p.category_name).trim() : "";
    if (c === String(catName).trim()) n = n + 1;
  }
  return n;
}

function normalizeUrl(v) {
  var s;
  s = v == null ? "" : String(v);
  s = s.trim();
  if (!s) return "";
  if (s === "null" || s === "undefined") return "";
  return s;
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
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 16l5-5 4 4 3-3 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
