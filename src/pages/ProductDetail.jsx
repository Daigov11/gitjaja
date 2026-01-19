import { useParams } from "react-router-dom";

export default function ProductDetail() {
  var params;
  params = useParams();

  return (
    <div style={{ padding: 16 }}>
      <h2>Detalle Producto</h2>
      <p>ID: {params.id}</p>
      <p>Aquí irá: imagen, nombre, descripción, precio o ¡CONSÚLTALO!, url, categoría.</p>
    </div>
  );
}
