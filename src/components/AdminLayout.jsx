import { NavLink, Outlet, useLocation } from "react-router-dom";
import { clearAuth } from "../state/auth";
import { Link } from "react-router-dom";
export default function AdminLayout() {
  var loc;
  loc = useLocation();

  function logout() {
    clearAuth();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-slate-100">
<div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="hidden w-[260px] flex-col bg-slate-950 text-white md:flex">
          <div className="px-6 pt-6">
            <div className="text-lg font-extrabold tracking-tight">ERP Admin</div>
            <div className="mt-1 text-xs text-white/60">Panel de administración</div>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-2 px-3">
            <SideItem to="/admin" label="Dashboard" />
            <SideItem to="/admin/categorias" label="Categorías" />
            <SideItem to="/admin/productos" label="Productos" />
          </nav>

          <div className="px-3 pb-6">
            <button
              onClick={logout}
              className="flex w-full items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
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
  <Link
    to="/"
    title="Ver página pública"
    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
  >
    👤
  </Link>

</div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
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
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition";
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
  return "Administración";
}
