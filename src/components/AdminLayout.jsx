import { Link, Outlet } from "react-router-dom";
import { clearAuth } from "../state/auth";

export default function AdminLayout() {
  function logout() {
    clearAuth();
    window.location.href = "/login";
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 240, padding: 16, borderRight: "1px solid #ddd" }}>
        <h3>ERP Admin</h3>
        <nav style={{ display: "grid", gap: 8 }}>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/categorias">Categorías</Link>
          <Link to="/admin/productos">Productos</Link>
        </nav>
        <div style={{ marginTop: 16 }}>
          <button onClick={logout}>Salir</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
