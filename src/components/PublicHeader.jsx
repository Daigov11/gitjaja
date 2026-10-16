import { Link, useLocation } from "react-router-dom";

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

function isActive(it, pathname) {
  if (it.type !== "route") return false;
  if (it.href === "/") return pathname === "/";
  if (it.label === "Promociones") return pathname.indexOf("/categoria/") === 0 && pathname.toUpperCase().indexOf("PROMOCIONES") !== -1;
  if (it.href === "/categoria") return pathname === "/categoria" || (pathname.indexOf("/categoria/") === 0 && pathname.toUpperCase().indexOf("PROMOCIONES") === -1);
  return pathname === it.href;
}

export default function PublicHeader(props) {
  var pathname = useLocation().pathname;

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top bar */}
      <div className="relative w-full overflow-hidden bg-brand-yellow">
        <img src="/brand/espiga-izq.png" alt="" aria-hidden="true" className="pointer-events-none absolute -left-6 top-0 hidden h-full w-auto opacity-40 md:block" />
        <img src="/brand/espiga-izq.png" alt="" aria-hidden="true" className="pointer-events-none absolute -right-6 top-0 hidden h-full w-auto -scale-x-100 opacity-40 md:block" />
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3">
          {/* Hamburguesa (mobile) */}
          <button
            onClick={function () {
              props.setNavOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-xl bg-brand-brown p-2 text-brand-yellow hover:bg-brand-brown-dark md:hidden"
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>

          {/* Logo + marca */}
          <Link to="/" className="flex items-center gap-3" aria-label={props.brand}>
            <img
              src="/brand/logo-circular.png"
              alt={props.brand}
              className="h-11 w-11 object-contain md:hidden"
            />
            <div className="font-brand text-xl leading-tight text-brand-brown md:hidden">{props.brand}</div>
            <img
              src="/brand/logo-header.png"
              alt={props.brand + " - Tu aliado en cada receta"}
              className="hidden h-20 w-auto object-contain md:block"
            />
          </Link>

          {/* Search (desktop) */}
          <div className="ml-auto hidden w-full max-w-xl items-center gap-2 md:flex">
            <div className="relative w-full">
              <input
                value={props.qSearch}
                onChange={function (e) {
                  props.setQSearch(e.target.value);
                }}
                placeholder="Buscar productos..."
                className="w-full rounded-full border border-brand-brown/20 bg-brand-cream px-5 py-2.5 text-m font-semibold text-brand-brown outline-none placeholder:text-brand-brown/50 focus:border-brand-brown"
              />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-brown">
                <SearchIcon />
              </div>
            </div>

            <button
              onClick={props.onOpenCart}
              className="relative inline-flex items-center gap-2 rounded-full bg-brand-brown px-4 py-2.5 text-m font-extrabold text-brand-yellow shadow hover:bg-brand-brown-dark"
              title="Armar lista y consultar"
            >
              Carrito
              <span className="rounded-full bg-brand-yellow/20 px-2 py-0.5 text-m">
                {props.cartCount}
              </span>
            </button>
          </div>

          {/* Right actions (mobile) */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button
              onClick={props.onOpenCart}
              className="relative inline-flex items-center gap-2 rounded-full bg-brand-brown px-3 py-2 text-m font-extrabold text-brand-yellow shadow hover:bg-brand-brown-dark"
              aria-label="Abrir WhatsApp"
            >
              CA
              <span className="rounded-full bg-brand-yellow/20 px-2 py-0.5 text-m">{props.cartCount}</span>
            </button>
          </div>
        </div>

        {/* Search (mobile) */}
        <div className="mx-auto w-full max-w-7xl px-4 pb-3 md:hidden">
          <div className="relative w-full">
            <input
              value={props.qSearch}
              onChange={function (e) {
                props.setQSearch(e.target.value);
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

      {/* Menu bar (desktop) */}
      <div className="hidden w-full bg-brand-brown md:block">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-2">
          <Link to="/" aria-label="Inicio" className="shrink-0">
            <img src="/brand/nav/home.png" alt="" className="h-10 w-10" />
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            {props.navItems.map(function (it, i) {
              var img = navImageFor(it);
              var active = isActive(it, pathname);
              var content = img ? (
                <img src={img} alt={it.label} className="h-8 w-auto" />
              ) : (
                <span className="text-m font-bold text-brand-cream">{it.label}</span>
              );
              var cls =
                "relative rounded-xl px-3 py-1.5 hover:bg-white/10" +
                (active && it.href !== "/" ? " after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-yellow" : "");

              if (it.type === "route") {
                return (
                  <Link key={"nav" + i} to={it.href} className={cls} aria-current={active ? "page" : undefined}>
                    {content}
                  </Link>
                );
              }

              return (
                <a
                  key={"nav" + i}
                  href={it.href}
                  target={it.type === "ext" ? "_blank" : undefined}
                  rel={it.type === "ext" ? "noreferrer" : undefined}
                  className={cls}
                >
                  {content}
                </a>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a
              href={props.igUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-brand-brown p-2 text-brand-yellow hover:bg-brand-brown-dark"
              title="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href={props.fbUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-brand-brown p-2 text-brand-yellow hover:bg-brand-brown-dark"
              title="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href={props.ttUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-brand-brown p-2 text-brand-yellow hover:bg-brand-brown-dark"
              title="TikTok"
            >
              <TikTokIcon />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {props.navOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={function () {
              props.setNavOpen(false);
            }}
          />

          <div className="absolute left-0 top-0 h-full w-[86%] max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <Link
                to="/"
                className="flex items-center gap-3"
                onClick={function () {
                  props.setNavOpen(false);
                }}
              >
                <img
                  src={props.logoUrl}
                  alt={props.brand}
                  className="h-10 w-10 rounded-2xl object-cover ring-1 ring-slate-200"
                />
                <div className="leading-tight">
                  <div className="text-m font-extrabold text-slate-900">{props.brand}</div>
                  <div className="text-[11px] font-semibold text-slate-600">Menú</div>
                </div>
              </Link>

              <button
                onClick={function () {
                  props.setNavOpen(false);
                }}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                aria-label="Cerrar menú"
              >
                <XIcon />
              </button>
            </div>

            <div className="p-4">
              <div className="space-y-2">
                {props.navItems.map(function (it, i) {
                  if (it.type === "route") {
                    return (
                      <Link
                        key={"m" + i}
                        to={it.href}
                        onClick={function () {
                          props.setNavOpen(false);
                        }}
                        className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-m font-extrabold text-slate-800 hover:bg-slate-50"
                      >
                        {it.label}
                      </Link>
                    );
                  }

                  return (
                    <a
                      key={"m" + i}
                      href={it.href}
                      target={it.type === "ext" ? "_blank" : undefined}
                      rel={it.type === "ext" ? "noreferrer" : undefined}
                      onClick={function () {
                        props.setNavOpen(false);
                      }}
                      className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-m font-extrabold text-slate-800 hover:bg-slate-50"
                    >
                      {it.label}
                    </a>
                  );
                })}

                <button
                  onClick={function () {
                    props.setNavOpen(false);
                    props.onOpenCart();
                  }}
                  className="mt-2 w-full rounded-2xl bg-brand-brown px-4 py-3 text-m font-extrabold text-brand-yellow hover:bg-brand-brown-dark"
                >
                  Consultar por WhatsApp
                </button>

                <a
                  href={"tel:+51" + props.phone}
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-m font-extrabold text-slate-800 hover:bg-slate-50"
                >
                  Llamar: +51 {props.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/* icons */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" />
      <path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 8h3V5h-3c-2.2 0-4 1.8-4 4v3H7v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z" fill="currentColor" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 3v10.2a3.8 3.8 0 1 1-3-3.7V6.3a7 7 0 1 0 6 6.9V9.6c.9.8 2 1.3 3.2 1.4V8a4.6 4.6 0 0 1-3.2-1.4A5 5 0 0 1 14 3Z" fill="currentColor" />
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
