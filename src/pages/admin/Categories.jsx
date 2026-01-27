import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProducts } from "../../services/productsService";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../../services/categoriesService";
import CategoryModal from "../../components/CategoryModal";

export default function Categories() {
  var BD;

  var qCats, qProd;
  var okCats, catsItems;
  var okProd, prodItems;

  var qSearch, setQSearch;
  var status, setStatus;
  var page, setPage;
  var pageSize;

  var countMap;
  var viewCats;

  var filtered, total, pages, curPage, start, end, pageItems;

  /* modal */
  var modalOpen, setModalOpen;
  var modalMode, setModalMode;
  var editItem, setEditItem;

  /* confirm delete */
  var confirmOpen, setConfirmOpen;
  var confirmItem, setConfirmItem;

  /* UX msg */
  var opMsg, setOpMsg;

  /* react-query */
  var qc;
  var mutCreate, mutUpdate, mutDelete;
  var busy;

  BD = "don_pepito_web";
  qc = useQueryClient();

  qSearch = useState("");
  setQSearch = qSearch[1];
  qSearch = qSearch[0];

  status = useState("ALL");
  setStatus = status[1];
  status = status[0];

  page = useState(1);
  setPage = page[1];
  page = page[0];

  pageSize = 8;

  modalOpen = useState(false);
  setModalOpen = modalOpen[1];
  modalOpen = modalOpen[0];

  modalMode = useState("create");
  setModalMode = modalMode[1];
  modalMode = modalMode[0];

  editItem = useState(null);
  setEditItem = editItem[1];
  editItem = editItem[0];

  confirmOpen = useState(false);
  setConfirmOpen = confirmOpen[1];
  confirmOpen = confirmOpen[0];

  confirmItem = useState(null);
  setConfirmItem = confirmItem[1];
  confirmItem = confirmItem[0];

  opMsg = useState(null);
  setOpMsg = opMsg[1];
  opMsg = opMsg[0];

  /* 1) Fuente principal: categorías */
  qCats = useQuery({
    queryKey: ["categories", BD],
    queryFn: listCategories,
  });

  okCats = qCats.data && (qCats.data.codResponse === "1" || qCats.data.codResponse === 1);
  catsItems = okCats && qCats.data.data ? qCats.data.data : [];

  /* 2) Conteo: productos */
  qProd = useQuery({
    queryKey: ["products", BD],
    queryFn: listProducts,
  });

  okProd = qProd.data && (qProd.data.codResponse === "1" || qProd.data.codResponse === 1);
  prodItems = okProd && qProd.data.data ? qProd.data.data : [];

  /* Mutations */
  mutCreate = useMutation({
    mutationFn: function (payload) {
      return createCategory(payload);
    },
    onSuccess: function () {
      qc.invalidateQueries({ queryKey: ["categories", BD] });
    },
  });

  mutUpdate = useMutation({
    mutationFn: function (vars) {
      return updateCategory(vars.id_category, vars.payload);
    },
    onSuccess: function () {
      qc.invalidateQueries({ queryKey: ["categories", BD] });
    },
  });

  mutDelete = useMutation({
    mutationFn: function (id_category) {
      return deleteCategory(id_category);
    },
    onSuccess: function () {
      qc.invalidateQueries({ queryKey: ["categories", BD] });
    },
  });

  busy = !!(mutCreate.isPending || mutUpdate.isPending || mutDelete.isPending);

  /* Mapa: category_name -> count */
  countMap = buildProductCountMap(prodItems);

  /* Vista final: categorías reales del server + product_count (+ image url) */
  viewCats = attachCounts(catsItems, countMap);

  filtered = applyFilters(viewCats, qSearch, status);

  total = filtered.length;
  pages = Math.max(1, Math.ceil(total / pageSize));

  curPage = page;
  if (curPage > pages) curPage = pages;
  if (curPage < 1) curPage = 1;

  start = (curPage - 1) * pageSize;
  end = start + pageSize;
  pageItems = filtered.slice(start, end);

  function onNew() {
    setOpMsg(null);
    setModalMode("create");
    setEditItem(null);
    setModalOpen(true);
  }

  function onEdit(c) {
    setOpMsg(null);
    setModalMode("edit");
    setEditItem(c);
    setModalOpen(true);
  }

  function closeModal() {
    if (busy) return;
    setModalOpen(false);
    setEditItem(null);
  }

  async function onModalSubmit(payload, mode) {
    var res, ok;

    setOpMsg(null);

    try {
      if (mode === "edit" && editItem) {
        res = await mutUpdate.mutateAsync({ id_category: editItem.id_category, payload: payload });
      } else {
        res = await mutCreate.mutateAsync(payload);
      }

      ok = res && (res.codResponse === "1" || res.codResponse === 1);
      if (!ok) {
        throw new Error(res && res.message ? res.message : "La API devolvió error");
      }

      setModalOpen(false);
      setEditItem(null);

      qCats.refetch();
      qProd.refetch();

      setOpMsg({ type: "ok", text: res && res.message ? res.message : "Operación OK" });
    } catch (e) {
      setOpMsg({ type: "err", text: String(e && e.message ? e.message : e) });
    }
  }

  function askDelete(c) {
    setOpMsg(null);
    setConfirmItem(c);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (busy) return;
    setConfirmOpen(false);
    setConfirmItem(null);
  }

  async function confirmDelete() {
    var res, ok;

    if (!confirmItem) return;

    setOpMsg(null);

    try {
      res = await mutDelete.mutateAsync(confirmItem.id_category);

      ok = res && (res.codResponse === "1" || res.codResponse === 1);
      if (!ok) {
        throw new Error(res && res.message ? res.message : "La API devolvió error");
      }

      setConfirmOpen(false);
      setConfirmItem(null);

      qCats.refetch();
      qProd.refetch();

      setOpMsg({ type: "ok", text: res && res.message ? res.message : "Eliminado" });
    } catch (e) {
      setOpMsg({ type: "err", text: String(e && e.message ? e.message : e) });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Administración</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Categorías</div>
            <div className="mt-1 text-sm text-slate-600">Listado de categorias</div>

            {opMsg ? (
              <div
                className={
                  "mt-3 rounded-xl border px-3 py-2 text-xs font-bold " +
                  (opMsg.type === "ok"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800")
                }
              >
                {opMsg.text}
              </div>
            ) : null}

            {!qProd.isLoading && okProd === false ? (
              <div className="mt-2 text-xs font-semibold text-amber-800">
                Aviso: no se pudo cargar productos, el conteo puede mostrarse en 0.
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={onNew}
              disabled={busy}
              className={
                "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow " +
                (busy ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-800")
              }
            >
              <span className="text-lg leading-none">＋</span>
              <span>Nueva Categoría</span>
            </button>

            <div className="flex items-center gap-2">
              <input
                value={qSearch}
                onChange={function (e) {
                  setQSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar"
                className="w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
              />

              <select
                value={status}
                onChange={function (e) {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-[190px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
              >
                <option value="ALL">Estado: Todos</option>
                <option value="ACTIVE">Activos</option>
                <option value="INACTIVE">Inactivos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* estados */}
      {qCats.isLoading ? (
        <Card>
          <div className="text-sm text-slate-600">Cargando categorías...</div>
          <SkeletonTable />
        </Card>
      ) : null}

      {qCats.isError ? (
        <Card>
          <div className="text-sm font-semibold text-red-700">
            Error: {String(qCats.error && qCats.error.message ? qCats.error.message : qCats.error)}
          </div>
        </Card>
      ) : null}

      {!qCats.isLoading && okCats === false ? (
        <Card>
          <div className="text-sm font-semibold text-amber-800">
            {qCats.data && qCats.data.message ? qCats.data.message : "No se pudo obtener categorías"}
          </div>
        </Card>
      ) : null}

      {/* table */}
      {!qCats.isLoading && okCats ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">Total: {total}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={function () {
                  qCats.refetch();
                  qProd.refetch();
                }}
                disabled={busy}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                Recargar
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Imagen</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Productos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {pageItems.map(function (c) {
                  return (
                    <tr key={c.id_category} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-bold text-slate-900">{c.id_category}</td>

                      <td className="px-4 py-4">
                        {c.category_image_url ? (
                          <img
                            src={c.category_image_url}
                            alt={c.category_name}
                            className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-extrabold text-slate-500">
                            —
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-extrabold text-slate-900">{c.category_name}</div>
                        {c.category_desc ? (
                          <div className="mt-1 max-w-[420px] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-600">
                            {c.category_desc}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                          {String(c.product_count || 0)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {c.category_status ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {c.category_created ? new Date(c.category_created).toLocaleString() : "—"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-3">
                          <IconBtn
                            title="Editar"
                            onClick={function () {
                              onEdit(c);
                            }}
                            disabled={busy}
                          >
                            <PencilIcon />
                            <span>Editar</span>
                          </IconBtn>

                          <IconBtn
                            danger={true}
                            title="Eliminar"
                            onClick={function () {
                              askDelete(c);
                            }}
                            disabled={busy}
                          >
                            <TrashIcon />
                            <span>Eliminar</span>
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 border-t border-slate-200 px-4 py-4">
            <PageBtn
              disabled={curPage <= 1}
              onClick={function () {
                setPage(1);
              }}
            >
              {"|<"}
            </PageBtn>

            <PageBtn
              disabled={curPage <= 1}
              onClick={function () {
                setPage(curPage - 1);
              }}
            >
              {"<"}
            </PageBtn>

            {renderPages(curPage, pages, setPage)}

            <PageBtn
              disabled={curPage >= pages}
              onClick={function () {
                setPage(curPage + 1);
              }}
            >
              {">"}
            </PageBtn>

            <PageBtn
              disabled={curPage >= pages}
              onClick={function () {
                setPage(pages);
              }}
            >
              {">|"}
            </PageBtn>
          </div>
        </div>
      ) : null}

      {/* Modal */}
      <CategoryModal
        open={modalOpen}
        mode={modalMode}
        initialCategory={editItem}
        onClose={closeModal}
        onSubmit={onModalSubmit}
        busy={busy}
        bd={BD}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar categoría"
        message={confirmItem ? '¿Seguro que deseas eliminar "' + confirmItem.category_name + '"?' : ""}
        confirmText={busy ? "Eliminando..." : "Sí, eliminar"}
        cancelText="Cancelar"
        onCancel={closeConfirm}
        onConfirm={confirmDelete}
        busy={busy}
      />
    </div>
  );
}

/* helpers y UI */
function buildProductCountMap(items) {
  var map, i, name;
  map = {};
  for (i = 0; i < items.length; i = i + 1) {
    name = items[i] && items[i].category_name ? String(items[i].category_name) : "";
    if (!name) continue;
    map[name] = (map[name] || 0) + 1;
  }
  return map;
}

function attachCounts(categories, map) {
  var out, i, c, key, img;
  out = [];
  for (i = 0; i < categories.length; i = i + 1) {
    c = categories[i];
    key = c && c.category_name ? String(c.category_name) : "";

    img = "";
    if (c && c.category_image_url) img = String(c.category_image_url);
    if (!img && c && c.categoryImageUrl) img = String(c.categoryImageUrl);

    out.push({
      id_category: c.id_category,
      category_name: c.category_name,
      category_desc: c.category_desc || "",
      category_status: !!c.category_status,
      category_created: c.category_created || null,
      category_actu: c.category_actu || null,
      category_image_url: img,
      product_count: key && map[key] ? map[key] : 0,
    });
  }
  return out;
}

function Card(props) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{props.children}</div>;
}

function IconBtn(props) {
  var base;
  base =
    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold shadow-sm hover:bg-slate-50 disabled:opacity-50";

  if (props.danger) {
    return (
      <button
        title={props.title}
        onClick={props.onClick}
        disabled={props.disabled}
        className={base + " border-red-200 text-red-700"}
      >
        {props.children}
      </button>
    );
  }

  return (
    <button
      title={props.title}
      onClick={props.onClick}
      disabled={props.disabled}
      className={base + " border-slate-200 text-slate-800"}
    >
      {props.children}
    </button>
  );
}

function PageBtn(props) {
  return (
    <button
      disabled={props.disabled}
      onClick={props.onClick}
      className={
        "rounded-xl border px-3 py-2 text-sm font-bold " +
        (props.disabled ? "border-slate-200 bg-white text-slate-300" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
      }
    >
      {props.children}
    </button>
  );
}

function renderPages(page, pages, setPage) {
  var out, i, start, end;
  out = [];
  start = Math.max(1, page - 1);
  end = Math.min(pages, page + 1);
  if (page === 1) end = Math.min(pages, 2);
  if (page === pages) start = Math.max(1, pages - 1);

  for (i = start; i <= end; i = i + 1) {
    out.push(
      <button
        key={"p" + i}
        onClick={function () {
          setPage(i);
        }}
        className={
          "h-10 w-10 rounded-xl border text-sm font-extrabold " +
          (i === page ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
        }
      >
        {i}
      </button>
    );
  }
  return out;
}

function applyFilters(items, qSearch, status) {
  var q, out, i, c, match, st;
  q = (qSearch || "").toLowerCase().trim();
  out = [];
  for (i = 0; i < items.length; i = i + 1) {
    c = items[i];
    match = !q || String(c.category_name || "").toLowerCase().indexOf(q) !== -1;
    st = status === "ALL";
    if (status === "ACTIVE") st = !!c.category_status;
    if (status === "INACTIVE") st = !c.category_status;
    if (match && st) out.push(c);
  }
  return out;
}

function SkeletonTable() {
  return (
    <div className="mt-4 space-y-3">
      <div className="h-10 w-full rounded-xl bg-slate-100" />
      <div className="h-10 w-full rounded-xl bg-slate-100" />
      <div className="h-10 w-full rounded-xl bg-slate-100" />
    </div>
  );
}

function ConfirmDialog(props) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={props.onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="text-lg font-extrabold text-slate-900">{props.title}</div>
            <div className="mt-1 text-sm text-slate-600">{props.message}</div>
          </div>

          <div className="flex items-center justify-end gap-3 px-5 py-4">
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              onClick={props.onCancel}
              type="button"
              disabled={props.busy}
            >
              {props.cancelText || "Cancelar"}
            </button>
            <button
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-50"
              onClick={props.onConfirm}
              type="button"
              disabled={props.busy}
            >
              {props.confirmText || "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 6l1 16h10l1-16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
