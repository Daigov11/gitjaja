import { Link } from "react-router-dom";
import { getUser } from "../../state/auth";

export default function Dashboard() {
  var user;
  user = getUser();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2>Dashboard</h2>
        <p>
          Bienvenido: <b>{(user && (user.user || user.email || user.nombre)) || "Usuario"}</b>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
          <h4>Categorías</h4>
          <p>Gestiona tus categorías.</p>
          <Link to="/admin/categorias">Ir</Link>
        </div>

        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
          <h4>Productos</h4>
          <p>Crea, edita, elimina productos.</p>
          <Link to="/admin/productos">Ir</Link>
        </div>

        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10, opacity: 0.6 }}>
          <h4>Gráficos</h4>
          <p>Desactivado por el momento.</p>
          <span>Próximamente</span>
        </div>
      </div>
    </div>
  );
}
