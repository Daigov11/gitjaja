import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  BRAND,
  LOGO_URL,
  PHONE,
  IG_URL,
  FB_URL,
  TT_URL,
  CART_KEY,
  NAV_ITEMS,
} from "../config/publicSiteConfig";
import PublicHeader from "../components/PublicHeader";

export default function PublicLayout() {
  var qSearch, setQSearch;
  var navOpen, setNavOpen;

  var cartOpen, setCartOpen;
  var cart, setCart;

  qSearch = useState("");
  setQSearch = qSearch[1];
  qSearch = qSearch[0];

  navOpen = useState(false);
  setNavOpen = navOpen[1];
  navOpen = navOpen[0];

  cartOpen = useState(false);
  setCartOpen = cartOpen[1];
  cartOpen = cartOpen[0];

  cart = useState(readCart());
  setCart = cart[1];
  cart = cart[0];

  function cartQty(id) {
    var i;
    for (i = 0; i < cart.length; i = i + 1) {
      if (String(cart[i].id_product) === String(id)) return Number(cart[i].qty || 0);
    }
    return 0;
  }

  function cartAddOne(p) {
    var next, i, found;

    if (!p || !p.id_product) return;

    next = [];
    found = false;

    for (i = 0; i < cart.length; i = i + 1) {
      if (String(cart[i].id_product) === String(p.id_product)) {
        found = true;
        next.push({
          id_product: cart[i].id_product,
          product_name: cart[i].product_name,
          category_name: cart[i].category_name,
          has_price: !!cart[i].has_price,
          price: cart[i].price,
          qty: Number(cart[i].qty || 0) + 1,
        });
      } else {
        next.push(cart[i]);
      }
    }

    if (!found) {
      next.push({
        id_product: p.id_product,
        product_name: p.product_name,
        category_name: p.category_name,
        has_price: !!p.has_price,
        price: p.price,
        qty: 1,
      });
    }

    writeCart(next);
    setCart(next);
  }

  function cartRemoveOne(p) {
    var next, i, q;

    if (!p || !p.id_product) return;

    next = [];
    for (i = 0; i < cart.length; i = i + 1) {
      if (String(cart[i].id_product) === String(p.id_product)) {
        q = Number(cart[i].qty || 0) - 1;
        if (q > 0) {
          next.push({
            id_product: cart[i].id_product,
            product_name: cart[i].product_name,
            category_name: cart[i].category_name,
            has_price: !!cart[i].has_price,
            price: cart[i].price,
            qty: q,
          });
        }
      } else {
        next.push(cart[i]);
      }
    }

    writeCart(next);
    setCart(next);
  }

  function cartRemoveItem(idProduct) {
    var next;
    next = cart.filter(function (x) {
      return String(x.id_product) !== String(idProduct);
    });
    writeCart(next);
    setCart(next);
  }

  function cartClear() {
    writeCart([]);
    setCart([]);
  }

  function openCart() {
    setCartOpen(true);
  }

  function closeCart() {
    setCartOpen(false);
  }

  function openWalinkFromCart() {
    var url;
    url = buildWalink(cart);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  var outletCtx;
  outletCtx = useMemo(
    function () {
      return {
        qSearch: qSearch,
        setQSearch: setQSearch,

        cart: cart,
        cartQty: cartQty,
        cartAddOne: cartAddOne,
        cartRemoveOne: cartRemoveOne,
        cartRemoveItem: cartRemoveItem,
        cartClear: cartClear,

        openCart: openCart,
      };
    },
    [qSearch, setQSearch, cart]
  );

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <PublicHeader
        brand={BRAND}
        logoUrl={LOGO_URL}
        phone={PHONE}
        igUrl={IG_URL}
        fbUrl={FB_URL}
        ttUrl={TT_URL}
        navItems={NAV_ITEMS}
        qSearch={qSearch}
        setQSearch={setQSearch}
        cartCount={sumQty(cart)}
        onOpenCart={openCart}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
      />

      <Outlet context={outletCtx} />

      {/* Modal carrito (compartido) */}
      {cartOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40" onClick={closeCart} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Tu consulta</div>
                <div className="text-xs font-semibold text-slate-600">Lista de productos de interés</div>
              </div>
              <button
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                onClick={closeCart}
              >
                Cerrar
              </button>
            </div>

            <div className="p-4">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  Aún no agregaste productos.
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(function (x) {
                    return (
                      <div key={"c" + x.id_product} className="rounded-2xl border border-slate-200 p-3">
                        <div className="text-sm font-extrabold text-slate-900">{x.product_name}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-600">
                          {x.category_name || "—"} · Cant: {Number(x.qty || 0)}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs font-extrabold text-slate-700">
                            {x.has_price ? "S/ " + Number(x.price || 0).toFixed(2) : "¡CONSÚLTALO!"}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={function () {
                                cartRemoveOne({ id_product: x.id_product });
                              }}
                              className="h-9 w-9 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                            >
                              -
                            </button>
                            <button
                              onClick={function () {
                                cartAddOne({ id_product: x.id_product });
                              }}
                              className="h-9 w-9 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                            >
                              +
                            </button>
                            <button
                              onClick={function () {
                                cartRemoveItem(x.id_product);
                              }}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                            >
                              Quitar
                            </button>
                          </div>
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
                  onClick={cartClear}
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

  /* helpers layout */
  function sumQty(arr) {
    var i, s;
    s = 0;
    for (i = 0; i < arr.length; i = i + 1) s = s + Number(arr[i].qty || 0);
    return s;
  }

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

  function buildWalink(cart2) {
    var base, i, lines, item, msg, text, qty;
    base = "https://wa.me/51" + PHONE;

    lines = [];
    lines.push("Hola, te escribo desde la página donpepito.pe y estoy interesado en estos productos:");
    lines.push("");

    for (i = 0; i < cart2.length; i = i + 1) {
      item = cart2[i];
      qty = Number(item.qty || 0);
      text = "- " + String(item.product_name || "Producto");
      if (qty > 1) text = text + " x" + qty;
      if (item.category_name) text = text + " (" + item.category_name + ")";
      lines.push(text);
    }

    lines.push("");
    lines.push("Por favor ser amable de compartir los precios.");

    msg = encodeURIComponent(lines.join("\n"));
    return base + "?text=" + msg;
  }
}
