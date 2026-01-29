import { Link } from "react-router-dom";
import { getUser } from "../../state/auth";

export default function Dashboard() {
  var user;
  var name;

  user = getUser();
  name = (user && (user.usuario || user.user || user.email)) || "Usuario";

  return (
    <div className="min-h-[calc(100vh-32px)] bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500" hrfe>Panel de administración</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Bienvenido: <span className="font-semibold text-slate-900">{name}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/admin/categorias"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              + Nueva categoría
            </Link>
            <Link
              to="/admin/productos"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              + Nuevo producto
            </Link>
          </div>
        </div>

        {/* KPI cards (mock por ahora) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Categorías" value="—" hint="Pendiente endpoint" />
          <KpiCard title="Productos" value="—" hint="Pendiente endpoint" />
          <KpiCard title="Activos" value="—" hint="Pendiente endpoint" />
          <KpiCard title="Sin precio" value="—" hint="Mostrar: ¡CONSÚLTALO!" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left: quick actions + placeholder chart */}
          <div className="space-y-4 lg:col-span-2">
            {/* Placeholder chart card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Resumen</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Gráficos desactivados por ahora, pero la sección ya está lista.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Próximamente
                </span>
              </div>

              {/* Fake chart skeleton */}
              <div className="mt-5">
                <div className="h-44 w-full rounded-xl bg-slate-50 p-4">
                  <div className="h-full w-full rounded-lg border border-dashed border-slate-200" />
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="h-2 w-16 rounded-full bg-slate-200" />
                  <span className="h-2 w-10 rounded-full bg-slate-200" />
                  <span className="h-2 w-24 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Accesos rápidos</h2>
                <span className="text-xs font-medium text-slate-500">Admin</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <QuickAction
                  to="/admin/categorias"
                  title="Gestionar categorías"
                  desc="Crea, edita y elimina categorías."
                />
                <QuickAction
                  to="/admin/productos"
                  title="Gestionar productos"
                  desc="Crea productos, sube imagen y asigna categoría."
                  primary={true}
                />
                <QuickAction
                  to="/admin"
                  title="Gráficos"
                  desc="Desactivado por el momento."
                  disabled={true}
                />
                <QuickAction
                  to="/"
                  title="Ver Home público"
                  desc="Revisar cómo se ve el catálogo."
                />
              </div>
            </div>
          </div>


        </div>


      </div>
    </div>
  );
}

function KpiCard(props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{props.title}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900">
          {props.value}
        </p>
        <span className="text-xs font-medium text-slate-500">{props.hint}</span>
      </div>
    </div>
  );
}

function QuickAction(props) {
  var base;
  base =
    "rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow";

  if (props.disabled) {
    return (
      <div className={base + " border-slate-200 bg-slate-50 opacity-60"}>
        <p className="text-sm font-bold text-slate-900">{props.title}</p>
        <p className="mt-1 text-xs text-slate-600">{props.desc}</p>
        <p className="mt-3 text-xs font-semibold text-slate-500">Próximamente</p>
      </div>
    );
  }

  if (props.primary) {
    return (
      <Link
        to={props.to}
        className={base + " border-slate-900 bg-slate-900 text-white"}
      >
        <p className="text-sm font-extrabold">{props.title}</p>
        <p className="mt-1 text-xs text-white/80">{props.desc}</p>
        <p className="mt-3 text-xs font-semibold text-white/80">Abrir →</p>
      </Link>
    );
  }

  return (
    <Link to={props.to} className={base + " border-slate-200 bg-white"}>
      <p className="text-sm font-bold text-slate-900">{props.title}</p>
      <p className="mt-1 text-xs text-slate-600">{props.desc}</p>
      <p className="mt-3 text-xs font-semibold text-slate-700">Abrir →</p>
    </Link>
  );
}

function StatusRow(props) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{props.label}</p>
        <p className="text-xs text-slate-600">{props.note}</p>
      </div>
      <span
        className={
          "h-2.5 w-2.5 rounded-full " + (props.ok ? "bg-emerald-500" : "bg-amber-500")
        }
      />
    </div>
  );
}
