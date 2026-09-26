import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../state/auth";
import { Link } from "react-router-dom";
export default function AdminLayout() {
  var loc, navigate, user, userName;
  loc = useLocation();
  navigate = useNavigate();
  user = getUser();
  userName = (user && (user.usuario || user.user || user.email)) || "Administrador";

  function logout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100">
<div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="hidden w-[260px] flex-col bg-slate-950 text-white md:flex">
          <div className="px-6 pt-6">
            <div className="text-lg font-extrabold tracking-tight">ERP Admin</div>
            <div className="mt-1 text-m text-white/60">Panel de administración</div>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-2 px-3">
            <SideItem to="/admin" label="Dashboard" />
            <SideItem to="/admin/categorias" label="Categorías" />
            <SideItem to="/admin/productos" label="Productos" />
            <SideItem to="/admin/carrusel" label="Carrusel" />
          </nav>

          <div className="px-3 pb-6">
            <button
              onClick={logout}
              className="flex w-full items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-m font-semibold text-white hover:bg-white/10"
            >
              <span>Salir</span>
              <span className="text-white/60">↩</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <div className="md:hidden">
                  <span className="text-sm font-bold text-slate-900">ERP Admin</span>
                </div>
                <div className="hidden text-sm font-semibold text-slate-700 md:block">
                  {titleFromPath(loc.pathname)}
                </div>
              </div>

<div className="flex items-center gap-3">
  <span className="hidden text-sm font-semibold text-slate-600 sm:block">{userName}</span>
  <Link
    to="/"
    title="Ver página pública"
    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
  >
    Ver sitio
  </Link>

</div>
            </div>
          </header>

          <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 md:hidden">
            <MobileItem to="/admin" label="Resumen" />
            <MobileItem to="/admin/categorias" label="Categorías" />
            <MobileItem to="/admin/productos" label="Productos" />
            <MobileItem to="/admin/carrusel" label="Carrusel" />
          </nav>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function MobileItem(props) {
  return (
    <NavLink
      to={props.to}
      end={props.to === "/admin"}
      className={function (obj) {
        return "shrink-0 rounded-lg px-3 py-2 text-sm font-bold " +
          (obj.isActive ? "bg-slate-900 text-white" : "text-slate-600");
      }}
    >
      {props.label}
    </NavLink>
  );
}

function SideItem(props) {
  return (
    <NavLink
      to={props.to}
      end={props.to === "/admin"}
      className={function (obj) {
        var base;
        base =
          "flex items-center gap-3 rounded-xl px-4 py-3 text-m font-semibold transition";
        if (obj.isActive) return base + " bg-white/10 text-white";
        return base + " text-white/70 hover:bg-white/5 hover:text-white";
      }}
    >
      <span className="h-2 w-2 rounded-full bg-white/20" />
      <span>{props.label}</span>
    </NavLink>
  );
}

function titleFromPath(path) {
  if (path === "/admin") return "Dashboard";
  if (path.indexOf("/admin/categorias") === 0) return "Categorías";
  if (path.indexOf("/admin/productos") === 0) return "Productos";
  if (path.indexOf("/admin/carrusel") === 0) return "Carrusel";
  return "Administración";
}
