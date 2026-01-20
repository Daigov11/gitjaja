import api from "./apiClient";

var BD_FIXED;
BD_FIXED = "don_pepito_web";

export async function listProducts() {
  var res;

  res = await api.get(
    "https://api-centralizador.apiworking.pe/api/MicroSaas/products",
    {
      params: { bd: BD_FIXED },
      headers: { accept: "*/*" },
    }
  );

  // respuesta: { codResponse, message, data: [...] }
  return res && res.data ? res.data : null;
}
