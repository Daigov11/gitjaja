import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listCategories } from "../../services/categoriesService";
import { listProducts } from "../../services/productsService";
import { getUser } from "../../state/auth";
import { BD_NAME } from "../../services/appConfig";
import { queryKeys, ENTITY_STALE_TIME } from "../../services/queryKeys";
import { countActive, countWithoutPrice } from "./dashboardMetrics";

export default function Dashboard() {
  var categoriesQuery, productsQuery, categories, products, user, name, loading, error;

  categoriesQuery = useQuery({
    queryKey: queryKeys.categories(BD_NAME),
    queryFn: listCategories,
    staleTime: ENTITY_STALE_TIME,
  });
  productsQuery = useQuery({
    queryKey: queryKeys.products(BD_NAME),
    queryFn: listProducts,
    staleTime: ENTITY_STALE_TIME,
  });
  categories = responseItems(categoriesQuery.data);
  products = responseItems(productsQuery.data);
  user = getUser();
  name = (user && (user.usuario || user.user || user.email)) || "Usuario";
  loading = categoriesQuery.isLoading || productsQuery.isLoading;
  error = categoriesQuery.isError || productsQuery.isError;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl bg-slate-950 px-5 py-6 text-white shadow-sm md:px-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-medium text-white/60">Panel de administración</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Hola, {name}</h1><p className="mt-2 text-sm text-white/70">Consulta el estado del catálogo y gestiona su contenido.</p></div>
          <div className="flex gap-3"><Link to="/admin/categorias" className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100">Gestionar categorías</Link><Link to="/admin/productos" className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-bold hover:bg-white/10">Gestionar productos</Link></div>
        </div>
      </section>

      {error ? <Notice text="No se pudieron cargar todas las métricas. Puedes reintentar desde las secciones correspondientes." /> : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Categorías" value={loading ? "…" : categories.length} hint="registradas" />
        <Metric label="Productos" value={loading ? "…" : products.length} hint="en catálogo" />
        <Metric label="Activos" value={loading ? "…" : countActive(products)} hint="productos visibles" tone="success" />
        <Metric label="Sin precio" value={loading ? "…" : countWithoutPrice(products)} hint="requieren consulta" tone="warning" />
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between"><div><h2 className="font-extrabold text-slate-900">Estado del catálogo</h2><p className="mt-1 text-sm text-slate-600">Distribución actual de productos.</p></div><button type="button" onClick={function () { categoriesQuery.refetch(); productsQuery.refetch(); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Actualizar</button></div>
          <div className="mt-6 space-y-5"><Progress label="Productos activos" value={countActive(products)} total={products.length} color="bg-emerald-500" /><Progress label="Productos inactivos" value={products.length - countActive(products)} total={products.length} color="bg-slate-400" /><Progress label="Con precio publicado" value={products.length - countWithoutPrice(products)} total={products.length} color="bg-indigo-500" /></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"><h2 className="font-extrabold text-slate-900">Acciones rápidas</h2><p className="mt-1 text-sm text-slate-600">Accede a las tareas más frecuentes.</p><div className="mt-5 grid gap-3"><QuickLink to="/admin/productos" title="Administrar productos" text="Crear, editar o retirar productos." /><QuickLink to="/admin/categorias" title="Administrar categorías" text="Organizar y actualizar el catálogo." /><Link to="/" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Ver sitio público →</Link></div></div>
      </section>
    </div>
  );
}

function responseItems(response) { if (!response || !(response.codResponse === "1" || response.codResponse === 1) || !Array.isArray(response.data)) return []; return response.data; }
function Metric(props) { var color; color = props.tone === "success" ? "text-emerald-700" : props.tone === "warning" ? "text-amber-700" : "text-slate-900"; return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm font-semibold text-slate-500">{props.label}</p><p className={"mt-2 text-3xl font-extrabold " + color}>{props.value}</p><p className="mt-1 text-xs font-medium text-slate-500">{props.hint}</p></div>; }
function Progress(props) { var percent; percent = props.total ? Math.round((props.value / props.total) * 100) : 0; return <div><div className="mb-2 flex justify-between text-sm font-semibold text-slate-700"><span>{props.label}</span><span>{props.value} ({percent}%)</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={"h-full rounded-full " + props.color} style={{ width: percent + "%" }} /></div></div>; }
function QuickLink(props) { return <Link to={props.to} className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"><p className="font-bold text-slate-900">{props.title} →</p><p className="mt-1 text-sm text-slate-600">{props.text}</p></Link>; }
function Notice(props) { return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{props.text}</div>; }
