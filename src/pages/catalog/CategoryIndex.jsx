import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../../services/productsService";
import { listCategories } from "../../services/categoriesService";
import { BD_NAME } from "../../services/appConfig";

/* ====== TOP-LEVEL VARS ====== */
var MAX_CATS;
MAX_CATS = 200;

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
      list = buildCategoryList(catsApi, activeProducts);
      return list.slice(0, MAX_CATS);
    },
    [catsApi, activeProducts]
  );

  catsShown = useMemo(
    function () {
      var qx, out, i, c, count;
      qx = String(qCat || "").toLowerCase().trim();
      out = [];

      for (i = 0; i < catsAll.length; i = i + 1) {
        c = catsAll[i];
        if (!c) continue;

        if (qx && String(c).toLowerCase().indexOf(qx) === -1) continue;

        count = countByCategory(activeProducts, c);

        out.push({
          name: c,
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
    <div className="w-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold text-emerald-700">Catálogo</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">Categorías</div>
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

          <div className="md:col-span-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard label="Categorías" value={String(catsAll.length)} />
              <StatCard label="Productos activos" value={String(activeProducts.length)} />
            </div>
          </div>
        </div>

        {/* Loading / error */}
        {qCats.isLoading || qProd.isLoading ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-600">Cargando categorías…</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Skel />
              <Skel />
              <Skel />
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catsShown.map(function (c) {
                  return (
                    <CategoryCard
                      key={"cat_" + c.name}
                      name={c.name}
                      count={c.count}
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

function CategoryCard(props) {
  var href;
  href = "/categoria/" + encodeURIComponent(String(props.name || ""));

  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold text-emerald-700">Categoría</div>
            <div className="mt-1 text-lg font-extrabold text-slate-900 group-hover:underline">
              {props.name}
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-800">
            {props.count} prod.
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-800">
          Ver productos <ArrowRight />
        </div>
      </div>

      <div className="h-1 w-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-amber-300" />
    </Link>
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

function Skel() {
  return <div className="h-24 rounded-3xl bg-slate-100" />;
}

/* ---------- helpers ---------- */

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

  if (!out.length) {
    for (i = 0; i < products.length; i = i + 1) {
      name = products[i] && products[i].category_name ? String(products[i].category_name) : "";
      name = name.trim();
      if (name && !map[name]) {
        map[name] = true;
        out.push(name);
      }
    }
  }

  out.sort();
  return out;
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

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
