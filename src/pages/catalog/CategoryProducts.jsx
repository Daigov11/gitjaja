import { useMemo, useState } from "react";
import { Link, useOutletContext, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../../services/productsService";
import { BD_NAME } from "../../services/appConfig";


/* ====== TOP-LEVEL VARS ====== */
var PAGE_STEP;
PAGE_STEP = 24;

export default function CategoryProducts() {
  var ctx;

  var params, catParam, catName;

  var q;
  var ok, items, activeItems;

  var sort, setSort;
  var limit, setLimit;

  var filtered, shown;

  ctx = useOutletContext ? useOutletContext() : null;
  if (!ctx) ctx = {};

  params = useParams();
  catParam = params && params.cat ? params.cat : "";
  catName = safeDecode(catParam);

  sort = useState("featured");
  setSort = sort[1];
  sort = sort[0];

  limit = useState(PAGE_STEP);
  setLimit = limit[1];
  limit = limit[0];

  q = useQuery({
    queryKey: ["public_products", BD_NAME],
    queryFn: listProducts,
  });

  ok = q.data && (q.data.codResponse === "1" || q.data.codResponse === 1);
  items = ok && q.data.data ? q.data.data : [];

  activeItems = useMemo(
    function () {
      return (items || []).filter(function (p) {
        return !!p && !!p.product_status;
      });
    },
    [items]
  );

  filtered = useMemo(
    function () {
      var out, i, p, c;
      out = [];

      for (i = 0; i < activeItems.length; i = i + 1) {
        p = activeItems[i];
        c = p && p.category_name ? String(p.category_name).trim() : "";
        if (c === String(catName).trim()) out.push(p);
      }

      out = applySort(out, sort);
      return out;
    },
    [activeItems, catName, sort]
  );

  shown = useMemo(
    function () {
      return (filtered || []).slice(0, limit);
    },
    [filtered, limit]
  );

  if (q.isLoading) {
    return (
      <div className="w-full bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="text-m font-semibold text-mlate-600">Cargando productos…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!ok) {
    return (
      <div className="w-full bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="text-m font-extrabold text-amber-800">
              {q.data && q.data.message ? q.data.message : "No se pudo obtener productos"}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/categoria"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-m font-extrabold text-mlate-800 hover:bg-slate-50"
              >
                ← Volver a categorías
              </Link>

              <Link
                to="/"
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-m font-extrabold text-white hover:bg-emerald-700"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* Breadcrumb + header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-m font-extrabold text-mlate-500">
              <Link to="/" className="hover:underline">
                Inicio
              </Link>{" "}
              <span className="mx-1">/</span>{" "}
              <Link to="/categoria" className="hover:underline">
                Categorías
              </Link>{" "}
              <span className="mx-1">/</span>{" "}
              <span className="text-mlate-900">{catName || "—"}</span>
            </div>

            <div className="mt-2 text-2xl font-extrabold text-mlate-900">
              {catName || "Categoría"}
            </div>

            <div className="mt-1 text-m font-semibold text-mlate-600">
              {filtered.length} producto(s) en esta categoría
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/categoria"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-m font-extrabold text-mlate-800 hover:bg-slate-50"
            >
              ← Ver categorías
            </Link>

            <button
              onClick={function () {
                if (typeof ctx.setCartOpen === "function") ctx.setCartOpen(true);
              }}
              className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-m font-extrabold text-white hover:bg-emerald-700"
              title="Abrir WhatsApp (lista)"
            >
              Abrir WhatsApp {Array.isArray(ctx.cart) ? "(" + ctx.cart.length + ")" : ""}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-5 grid gap-3 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="text-m font-extrabold text-mlate-500">Tip</div>
              <div className="mt-1 text-m font-semibold text-mlate-700">
                Agrega varios productos a tu lista y luego abre WhatsApp para pedir precios.
              </div>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="text-m font-extrabold text-mlate-500">Ordenar</div>
              <select
                value={sort}
                onChange={function (e) {
                  setSort(e.target.value);
                  setLimit(PAGE_STEP);
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-m font-extrabold text-mlate-900 outline-none focus:border-emerald-400"
              >
                <option value="featured">Destacados</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="pmin">Precio: menor</option>
                <option value="pmax">Precio: mayor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty */}
        {filtered.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
            <div className="text-m font-extrabold text-mlate-900">
              No hay productos en esta categoría
            </div>
            <div className="mt-2 text-m font-semibold text-mlate-600">
              Prueba con otra categoría.
            </div>
            <div className="mt-4">
              <Link
                to="/categoria"
                className="inline-flex rounded-2xl bg-emerald-600 px-4 py-3 text-m font-extrabold text-white hover:bg-emerald-700"
              >
                Volver a categorías
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {shown.map(function (p) {
                return (
                  <ProductCard
                    key={"p_" + p.id_product}
                    p={p}
                    cart={Array.isArray(ctx.cart) ? ctx.cart : []}
                    onToggle={
                      typeof ctx.toggleInCart === "function"
                        ? function () {
                            ctx.toggleInCart(p);
                          }
                        : function () {}
                    }
                  />
                );
              })}
            </div>

            {/* Mostrar más */}
            {shown.length < filtered.length ? (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={function () {
                    setLimit(function (n) {
                      return Number(n || 0) + PAGE_STEP;
                    });
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-m font-extrabold text-mlate-900 hover:bg-slate-50"
                >
                  Mostrar más
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- UI ---------- */

function ProductCard(props) {
  var p, hasImg, priceText, inCart;
  var nav;

  p = props.p;
  nav = useNavigate();

  hasImg = !!(p && p.product_image_url);
  inCart = isInCart(props.cart, p.id_product);
  priceText = p && p.has_price ? "S/ " + Number(p.price || 0).toFixed(2) : "";

  function goDetail() {
    if (!p || !p.id_product) return;
    nav("/producto/" + p.id_product);
  }

  function onKeyGo(e) {
    if (!e) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goDetail();
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* ✅ Imagen clickeable -> Detalle */}
      <div
        className="h-44 w-full bg-white cursor-pointer"
        onClick={goDetail}
        onKeyDown={onKeyGo}
        role="button"
        tabIndex={0}
        title="Ver detalle"
      >
        {hasImg ? (
          <img
            src={p.product_image_url}
            alt={p.product_name}
            className="h-full w-full object-contain p-3"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-m font-extrabold text-mlate-300">
            Sin imagen
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="text-[11px] font-bold text-mlate-500">{p.category_name || "—"}</div>

        <div className="mt-1 min-h-[44px] text-m font-extrabold text-mlate-900">
          {p.product_name}
        </div>

        <div className="mt-3 flex items-center justify-between">
          {p.has_price ? (
            <div className="text-lg font-extrabold text-red-600">{priceText}</div>
          ) : (
            <div className="rounded-full bg-amber-50 px-3 py-1 text-m font-extrabold text-amber-800">
               
            </div>
          )}

          <button
            onClick={props.onToggle}
            className={
              "rounded-full px-4 py-2 text-m font-extrabold " +
              (inCart
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "border border-slate-200 bg-white text-mlate-800 hover:bg-slate-50")
            }
          >
            {inCart ? "Quitar" : "Agregar"}
          </button>
        </div>

        <div className="mt-3">
          <Link
            to={"/producto/" + p.id_product}
            className="block w-full rounded-2xl bg-emerald-600 px-4 py-2.5 text-center text-m font-extrabold text-white hover:bg-emerald-700"
          >
            Ver detalle →
          </Link>
        </div>
      </div>
    </div>
  );
}


/* ---------- helpers ---------- */

function safeDecode(x) {
  try {
    return decodeURIComponent(String(x || "")).trim();
  } catch (e) {
    return String(x || "").trim();
  }
}

function applySort(items, sortKey) {
  var out;
  out = (items || []).slice(0);

  if (sortKey === "az") {
    out.sort(function (a, b) {
      return String(a.product_name || "").localeCompare(String(b.product_name || ""));
    });
  } else if (sortKey === "za") {
    out.sort(function (a, b) {
      return String(b.product_name || "").localeCompare(String(a.product_name || ""));
    });
  } else if (sortKey === "pmin") {
    out.sort(function (a, b) {
      return safePrice(a) - safePrice(b);
    });
  } else if (sortKey === "pmax") {
    out.sort(function (a, b) {
      return safePrice(b) - safePrice(a);
    });
  } else {
    /* featured: deja orden API */
  }

  return out;
}

function safePrice(p) {
  if (!p || !p.has_price) return 9999999;
  return Number(p.price || 0);
}

function isInCart(cart, id) {
  var i;
  if (!Array.isArray(cart)) return false;

  for (i = 0; i < cart.length; i = i + 1) {
    if (String(cart[i].id_product) === String(id)) return true;
  }
  return false;
}
