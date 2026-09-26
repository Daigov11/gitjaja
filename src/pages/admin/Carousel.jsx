import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppImage from "../../components/AppImage";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useNotify } from "../../components/notificationsContext";
import { listAdminCarousel, createCarouselSlide, updateCarouselSlide, deleteCarouselSlide } from "../../services/carouselService";
import { uploadImage } from "../../services/imagesService";
import { queryKeys, ENTITY_STALE_TIME } from "../../services/queryKeys";
import { BD_NAME } from "../../services/appConfig";
import { extractErrorMessage } from "../../utils/errors";

export default function Carousel() {
  var qc, notify, q, items, modal, setModal, editing, setEditing, deleting, setDeleting;
  var createMutation, updateMutation, deleteMutation;

  qc = useQueryClient();
  notify = useNotify();
  modal = useState(false); setModal = modal[1]; modal = modal[0];
  editing = useState(null); setEditing = editing[1]; editing = editing[0];
  deleting = useState(null); setDeleting = deleting[1]; deleting = deleting[0];

  q = useQuery({ queryKey: queryKeys.carousel(BD_NAME), queryFn: listAdminCarousel, staleTime: ENTITY_STALE_TIME });
  items = q.data && (q.data.codResponse === 1 || q.data.codResponse === "1") && Array.isArray(q.data.data) ? q.data.data : [];

  function refreshed() {
    qc.invalidateQueries({ queryKey: queryKeys.carousel(BD_NAME) });
  }

  createMutation = useMutation({ mutationFn: createCarouselSlide, onSuccess: function () { refreshed(); setModal(false); setEditing(null); notify({ type: "ok", text: "Slide creado" }); } });
  updateMutation = useMutation({ mutationFn: function (data) { return updateCarouselSlide(data.id, data.payload); }, onSuccess: function () { refreshed(); setModal(false); setEditing(null); notify({ type: "ok", text: "Slide actualizado" }); } });
  deleteMutation = useMutation({ mutationFn: deleteCarouselSlide, onSuccess: function () { refreshed(); setDeleting(null); notify({ type: "ok", text: "Slide eliminado" }); } });

  function openCreate() { setEditing(null); setModal(true); }
  function openEdit(item) { setEditing(item); setModal(true); }
  function submit(payload) {
    if (editing) updateMutation.mutate({ id: editing.id_slide, payload: payload });
    else createMutation.mutate(payload);
  }
  function failure(err) { notify({ type: "err", text: extractErrorMessage(err) }); }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-slate-500">Contenido del sitio</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Carrusel principal</h1><p className="mt-2 text-sm text-slate-600">Sube, ordena y publica los banners de la página de inicio.</p></div>
        <button type="button" onClick={openCreate} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">+ Añadir banner</button>
      </section>

      {q.isLoading ? <Panel text="Cargando banners…" /> : null}
      {q.isError ? <Panel text={extractErrorMessage(q.error)} error={true} /> : null}
      {!q.isLoading && !q.isError && !items.length ? <Panel text="Aún no hay banners creados. Mientras tanto, la página principal usará los banners anteriores como respaldo." /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map(function (item) {
          return <article key={item.id_slide} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <AppImage src={item.slide_image_url} alt={item.slide_title || "Banner"} fallback="/placeholder-banner.svg" className="h-48 w-full object-cover" />
            <div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-extrabold text-slate-900">{item.slide_title || "Sin título"}</h2><p className="mt-1 text-sm text-slate-600">{item.slide_subtitle || "Sin subtítulo"}</p></div><Status active={item.slide_status} /></div><div className="mt-4 flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-500">Posición: {item.slide_position}</span><div className="flex gap-2"><button type="button" onClick={function () { openEdit(item); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Editar</button><button type="button" onClick={function () { setDeleting(item); }} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">Eliminar</button></div></div></div>
          </article>;
        })}
      </div>

      {modal ? <SlideForm item={editing} busy={createMutation.isPending || updateMutation.isPending} onClose={function () { setModal(false); setEditing(null); }} onSubmit={submit} onError={failure} /> : null}
      <ConfirmDialog open={!!deleting} title="Eliminar banner" message={deleting ? "¿Eliminar el banner “" + (deleting.slide_title || "sin título") + "”? Esta acción no borra el archivo de imagen." : ""} confirmText="Sí, eliminar" busy={deleteMutation.isPending} onCancel={function () { setDeleting(null); }} onConfirm={function () { deleteMutation.mutate(deleting.id_slide, { onError: failure }); }} />
    </div>
  );
}

function SlideForm(props) {
  var title, setTitle, subtitle, setSubtitle, link, setLink, imageUrl, setImageUrl, position, setPosition, status, setStatus, file, setFile, uploading, setUploading;
  title = useState(props.item ? props.item.slide_title || "" : ""); setTitle = title[1]; title = title[0];
  subtitle = useState(props.item ? props.item.slide_subtitle || "" : ""); setSubtitle = subtitle[1]; subtitle = subtitle[0];
  link = useState(props.item ? props.item.slide_link_url || "" : ""); setLink = link[1]; link = link[0];
  imageUrl = useState(props.item ? props.item.slide_image_url || "" : ""); setImageUrl = imageUrl[1]; imageUrl = imageUrl[0];
  position = useState(props.item ? String(props.item.slide_position || 0) : "0"); setPosition = position[1]; position = position[0];
  status = useState(props.item ? Number(props.item.slide_status) === 1 : true); setStatus = status[1]; status = status[0];
  file = useState(null); setFile = file[1]; file = file[0];
  uploading = useState(false); setUploading = uploading[1]; uploading = uploading[0];

  async function submit(event) {
    var url;
    event.preventDefault();
    url = imageUrl.trim();
    try {
      if (file) { setUploading(true); url = (await uploadImage(file)).url; }
      if (!url) throw new Error("Sube una imagen o indica una URL.");
      props.onSubmit({ slide_title: title.trim(), slide_subtitle: subtitle.trim(), slide_link_url: link.trim() || null, slide_image_url: url, slide_position: Number(position || 0), slide_status: status ? 1 : 0 });
    } catch (err) { props.onError(err); } finally { setUploading(false); }
  }

  return <div className="fixed inset-0 z-50 overflow-y-auto p-4"><div className="fixed inset-0 bg-slate-900/50" onClick={props.onClose} /><form onSubmit={submit} className="relative mx-auto my-8 w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-slate-500">Página principal</p><h2 className="text-xl font-extrabold text-slate-900">{props.item ? "Editar banner" : "Añadir banner"}</h2></div><button type="button" onClick={props.onClose} disabled={props.busy || uploading} className="rounded-lg px-2 text-xl text-slate-500 hover:bg-slate-100">×</button></div><div className="mt-5 grid gap-4"><Field label="Título"><input value={title} onChange={function (e) { setTitle(e.target.value); }} className="Input" placeholder="Ej.: Insumos para tu negocio" /></Field><Field label="Subtítulo"><input value={subtitle} onChange={function (e) { setSubtitle(e.target.value); }} className="Input" placeholder="Texto opcional" /></Field><Field label="Enlace al hacer clic"><input type="url" value={link} onChange={function (e) { setLink(e.target.value); }} className="Input" placeholder="https://… (opcional)" /></Field><Field label="Imagen"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={function (e) { setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null); }} className="block w-full text-sm" /><input type="url" value={imageUrl} onChange={function (e) { setImageUrl(e.target.value); }} className="Input mt-2" placeholder="o pega una URL de imagen" /></Field>{imageUrl ? <AppImage src={imageUrl} alt="Vista previa del banner" fallback="/placeholder-banner.svg" className="h-40 w-full rounded-xl object-cover" /> : null}<div className="grid grid-cols-2 gap-4"><Field label="Posición"><input type="number" min="0" value={position} onChange={function (e) { setPosition(e.target.value); }} className="Input" /></Field><label className="flex items-end gap-2 pb-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={status} onChange={function (e) { setStatus(e.target.checked); }} /> Visible en inicio</label></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={props.onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">Cancelar</button><button disabled={props.busy || uploading} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{uploading ? "Subiendo…" : props.busy ? "Guardando…" : "Guardar banner"}</button></div></form></div>;
}

function Field(props) { return <label className="grid gap-1.5 text-sm font-bold text-slate-700"><span>{props.label}</span>{props.children}</label>; }
function Status(props) { return <span className={"rounded-full px-2.5 py-1 text-xs font-bold " + (Number(props.active) === 1 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>{Number(props.active) === 1 ? "Visible" : "Oculto"}</span>; }
function Panel(props) { return <div className={"rounded-2xl border bg-white p-5 text-sm font-semibold shadow-sm " + (props.error ? "border-red-200 text-red-700" : "border-slate-200 text-slate-600")}>{props.text}</div>; }
