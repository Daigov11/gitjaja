var BRAND;
var LOGO_URL;
var PHONE;
var IG_URL;
var FB_URL;
var TT_URL;
var CART_KEY;
var NAV_ITEMS;

BRAND = "Harinas Don Pepito";
LOGO_URL =
  "https://api-centralizador.apiworking.pe/images/79070813-72aa-4907-a24c-3531c22c69f7.png";

PHONE = "913701849";
IG_URL = "https://www.instagram.com/harinasdonpepito/";
FB_URL = "https://www.facebook.com/harinasdonpepito";
TT_URL = "https://www.tiktok.com/@harinasdonpepito";

CART_KEY = "dp_cart_interest_v1";

NAV_ITEMS = [
  { label: "Inicio", href: "/home", type: "route" },
  { label: "Catálogo", href: "/categoria", type: "hash" },
  { label: "Ubicación", href: "https://maps.app.goo.gl/zD8DvAwfFnhtJKJd9", type: "ext" },
  { label: "Libro de reclamaciones", href: "https://consumidor.gob.pe/libro-de-reclamaciones/", type: "ext" },
];

export { BRAND, LOGO_URL, PHONE, IG_URL, FB_URL, TT_URL, CART_KEY, NAV_ITEMS };
