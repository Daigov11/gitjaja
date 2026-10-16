import { WHATSAPP_PHONE } from "./env";

// Capa única de configuración del sitio público: marca, contacto, links
// sociales y navegación. Los componentes deben importar de aquí en vez de
// declarar sus propias copias hardcodeadas.
var BRAND, LOGO_URL, LOGO_FALLBACK, PHONE, IG_URL, FB_URL, TT_URL, CART_KEY;
var HELP_FLOAT_IMG_URL, HELP_FLOAT_FALLBACK, HELP_FLOAT_TEXT, QR_IMG_URL, QR_FALLBACK;
var NAV_ITEMS;

BRAND = "Harinas Don Pepito";

// URL externa actual del logo (mantenida mientras exista); si cae, AppImage
// cambia automáticamente al archivo local en /public.
LOGO_URL = "/brand/logo-circular.png";
LOGO_FALLBACK = "/logo_don_pepito.png";

PHONE = WHATSAPP_PHONE;

HELP_FLOAT_IMG_URL = "/brand/chef-ayuda.png";
HELP_FLOAT_FALLBACK = "/do_u_need_help.png";
HELP_FLOAT_TEXT = "Hola, necesito ayuda con mi pedido.";

QR_IMG_URL = "https://api-centralizador.apiworking.pe/images/9bc41d4a-4088-49c3-826b-5d0d8d59efde.png";
QR_FALLBACK = "/placeholder-qr.svg";

IG_URL = "https://www.instagram.com/harinasdonpepito/";
FB_URL = "https://www.facebook.com/harinasdonpepito";
TT_URL = "https://www.tiktok.com/@harinasdonpepito";

CART_KEY = "dp_cart_interest_v1";

/* IMPORTANTE: catálogo debe ser "/categoria" para funcionar desde /producto/:id */
NAV_ITEMS = [
  { label: "Inicio", href: "/", type: "route" },
  { label: "Catálogo", href: "/categoria", type: "route" },
  { label: "Promociones", href: "/categoria/" + encodeURIComponent("PROMOCIONES"), type: "route" },
  { label: "Ubicación", href: "https://maps.app.goo.gl/zD8DvAwfFnhtJKJd9", type: "ext" },
  { label: "Trabaja con nosotros", href: "/trabaja-con-nosotros", type: "route" },
];

export {
  BRAND,
  LOGO_URL,
  LOGO_FALLBACK,
  PHONE,
  IG_URL,
  FB_URL,
  TT_URL,
  CART_KEY,
  HELP_FLOAT_IMG_URL,
  HELP_FLOAT_FALLBACK,
  HELP_FLOAT_TEXT,
  QR_IMG_URL,
  QR_FALLBACK,
  NAV_ITEMS,
};
