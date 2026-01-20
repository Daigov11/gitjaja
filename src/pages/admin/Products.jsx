import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../../services/productsService";
import ProductModal from "../../components/ProductModal";

export default function Products() {
  var q, ok, items;

  var qSearch, setQSearch;
  var cat, setCat;
  var page, setPage;
  var pageSize;

  var cats, filtered, total, pages, start, end, pageItems;

  /* ===== Modal state ===== */
  var modalOpen, setModalOpen;
  var modalMode, setModalMode;
  var editItem, setEditItem;

  qSearch = useState("");
  setQSearch = qSearch[1];
  qSearch = qSearch[0];

  cat = useState("ALL");
  setCat = cat[1];
  cat = cat[0];

  page = useState(1);
  setPage = page[1];
  page = page[0];

  pageSize = 6;

  /* modal hooks */
  modalOpen = useState(false);
  setModalOpen = modalOpen[1];
  modalOpen = modalOpen[0];

  modalMode = useState("create");
  setModalMode = modalMode[1];
  modalMode = modalMode[0];

  editItem = useState(null);
  setEditItem = editItem[1];
  editItem = editItem[0];

  q = useQuery({
    queryKey: ["products", "don_pepito_web"],
    queryFn: listProducts,
  });

  ok = q.data && (q.data.codResponse === "1" || q.data.codResponse === 1);
  items = ok && q.data.data ? q.data.data : [];

  cats = buildCategories(items);
  filtered = applyFilters(items, qSearch, cat);

  total = filtered.length;
  pages = Math.max(1, Math.ceil(total / pageSize));

  if (page > pages) page = pages;

  start = (page - 1) * pageSize;
  end = start + pageSize;
  pageItems = filtered.slice(start, end);

  function onNew() {
    setModalMode("create");
    setEditItem(null);
    setModalOpen(true);
  }

  function onEdit(p) {
    setModalMode("edit");
    setEditItem(p);
    setModalOpen(true);
  }

  function onDelete(p) {
    alert("Eliminar ID " + p.id_product + " (cuando llegue DELETE).");
  }

  function closeModal() {
    setModalOpen(false);
    setEditItem(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Administración</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Productos
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Listado desde API MicroSaas/products
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={onNew}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-slate-800"
            >
              <span className="text-lg leading-none">＋</span>
              <span>Nuevo Producto</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  value={qSearch}
                  onChange={function (e) {
                    setQSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Buscar"
                  className="w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                />
              </div>

              <div>
                <select
                  value={cat}
                  onChange={function (e) {
                    setCat(e.target.value);
                    setPage(1);
                  }}
                  className="w-[210px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300"
                >
                  <option value="ALL">Filtrar por Categoría</option>
                  {cats.map(function (c) {
                    return (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* States */}
      {q.isLoading ? (
        <Card>
          <div className="text-sm text-slate-600">Cargando productos...</div>
          <SkeletonTable />
        </Card>
      ) : null}

      {q.isError ? (
        <Card>
          <div className="text-sm font-semibold text-red-700">
            Error: {String(q.error && q.error.message ? q.error.message : q.error)}
          </div>
        </Card>
      ) : null}

      {!q.isLoading && ok === false ? (
        <Card>
          <div className="text-sm font-semibold text-amber-800">
            {q.data && q.data.message ? q.data.message : "No se pudo obtener datos"}
          </div>
        </Card>
      ) : null}

      {/* Table */}
      {!q.isLoading && ok ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">Total: {total}</div>
            <button
              onClick={function () {
                q.refetch();
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Recargar
            </button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {pageItems.map(function (p) {
                  return (
                    <tr key={p.id_product} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-bold text-slate-900">{p.id_product}</td>

                      <td className="px-4 py-4 text-slate-700">{p.category_name || "—"}</td>

                      <td className="px-4 py-4">
                        <div className="font-extrabold text-slate-900">{p.product_name}</div>
                        <div className="mt-1 max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-600">
                          {p.product_desc || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-700">
                          {p.product_desc || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {p.has_price ? (
                          <div className="font-extrabold text-slate-900">
                            S/ {Number(p.price || 0).toFixed(2)}
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800">
                            ¡CONSÚLTALO!
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {p.product_status ? (
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
                        {p.product_created ? new Date(p.product_created).toLocaleString() : "—"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-3">
                          <IconBtn
                            title="Editar"
                            onClick={function () {
                              onEdit(p);
                            }}
                          >
                            <PencilIcon />
                            <span>Editar</span>
                          </IconBtn>

                          <IconBtn
                            danger={true}
                            title="Eliminar"
                            onClick={function () {
                              onDelete(p);
                            }}
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
            <PageBtn disabled={page <= 1} onClick={function () { setPage(1); }}>
              {"|<"}
            </PageBtn>
            <PageBtn disabled={page <= 1} onClick={function () { setPage(page - 1); }}>
              {"<"}
            </PageBtn>

            {renderPages(page, pages, setPage)}

            <PageBtn disabled={page >= pages} onClick={function () { setPage(page + 1); }}>
              {">"}
            </PageBtn>
            <PageBtn disabled={page >= pages} onClick={function () { setPage(pages); }}>
              {">|"}
            </PageBtn>
          </div>
        </div>
      ) : null}

      {/* ===== Modal render ===== */}
      <ProductModal
        open={modalOpen}
        mode={modalMode}
        initialProduct={editItem}
        categoryOptions={cats}
        defaultCategoryName={cat !== "ALL" ? cat : ""}
        onClose={closeModal}
        onSubmit={function (payload, mode) {
          console.log("SUBMIT MODAL:", mode, payload);
          closeModal();
        }}
      />
    </div>
  );
}

function Card(props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {props.children}
    </div>
  );
}

function IconBtn(props) {
  var base;
  base =
    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold shadow-sm hover:bg-slate-50";

  if (props.danger) {
    return (
      <button
        title={props.title}
        onClick={props.onClick}
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
        (props.disabled
          ? "border-slate-200 bg-white text-slate-300"
          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
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
          (i === page
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
        }
      >
        {i}
      </button>
    );
  }

  return out;
}

function buildCategories(items) {
  var map, i, c, out, keys;
  map = {};
  for (i = 0; i < items.length; i = i + 1) {
    c = items[i] && items[i].category_name ? String(items[i].category_name) : "";
    if (c) map[c] = true;
  }
  keys = Object.keys(map);
  keys.sort();
  out = keys;
  return out;
}

function applyFilters(items, qSearch, cat) {
  var q, out, i, p, text, inCat;

  q = (qSearch || "").toLowerCase().trim();
  out = [];

  for (i = 0; i < items.length; i = i + 1) {
    p = items[i];

    inCat = cat === "ALL" || String(p.category_name || "") === String(cat);

    text =
      String(p.product_name || "") +
      " " +
      String(p.product_desc || "") +
      " " +
      String(p.category_name || "");

    if (inCat && (!q || text.toLowerCase().indexOf(q) !== -1)) {
      out.push(p);
    }
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

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4h8v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 6l1 16h10l1-16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
