import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../services/productsService";

var LOGO_URL;
var CART_KEY;

LOGO_URL =
  "https://images.jumpseller.com/store/don-pepito/store/logo/WhatsApp_20Image_202026-01-14_20at_2009.51.33.jpeg?1768402713";

CART_KEY = "dp_cart_interest_v1";

export default function ProductDetail() {
  var params, id;
  var q, ok, items, product;

  var cart, setCart;

  params = useParams();
  id = params && params.id ? params.id : "";

  cart = useState(readCart());
  setCart = cart[1];
  cart = cart[0];

  q = useQuery({
    queryKey: ["public_products", "don_pepito_web"],
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

  function toggle(p) {
    var exists, i, next;

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

  if (q.isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50">
        <div className="mx-auto w-full max-w-5xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-600">Cargando…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!ok || !product) {
    return (
      <div className="min-h-screen w-full bg-slate-50">
        <div className="mx-auto w-full max-w-5xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-extrabold text-slate-900">Producto no encontrado</div>
            <Link className="mt-3 inline-block text-sm font-extrabold text-emerald-700 hover:underline" to="/home">
              ← Volver al Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="Don Pepito"
            className="h-10 w-10 rounded-full border border-slate-200 object-cover"
          />
          <Link to="/home" className="text-sm font-extrabold text-emerald-700 hover:underline">
            ← Volver al catálogo
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="bg-slate-100">
              {product.product_image_url ? (
                <img
                  src={product.product_image_url}
                  alt={product.product_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-72 items-center justify-center text-sm font-extrabold text-slate-400 md:h-full">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="text-xs font-extrabold text-emerald-700">
                {product.category_name || "—"}
              </div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">
                {product.product_name}
              </div>

              <div className="mt-3 text-sm font-semibold text-slate-700">
                {product.product_desc || "—"}
              </div>

              <div className="mt-6">
                {product.has_price ? (
                  <div className="text-xl font-extrabold text-slate-900">
                    S/ {Number(product.price || 0).toFixed(2)}
                  </div>
                ) : (
                  <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-extrabold text-amber-800">
                    ¡CONSÚLTALO!
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={function () {
                    toggle(product);
                  }}
                  className={
                    "rounded-2xl px-4 py-3 text-sm font-extrabold " +
                    (isInCart(cart, product.id_product)
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-emerald-600 text-white hover:bg-emerald-700")
                  }
                >
                  {isInCart(cart, product.id_product) ? "Quitar de mi consulta" : "Agregar a mi consulta"}
                </button>

                <Link
                  to="/home"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                >
                  Seguir viendo productos
                </Link>
              </div>

              {product.product_url ? (
                <div className="mt-6 text-sm font-semibold">
                  <a className="text-emerald-700 hover:underline" href={product.product_url} target="_blank" rel="noreferrer">
                    Ver enlace del producto
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs font-semibold text-slate-500">
          Tip: agrega varios productos y luego abre WhatsApp desde el Home para pedir precios.
        </div>
      </div>
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

function isInCart(cart, id) {
  var i;
  for (i = 0; i < cart.length; i = i + 1) {
    if (String(cart[i].id_product) === String(id)) return true;
  }
  return false;
}
