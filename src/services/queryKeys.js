import { BD_NAME } from "./appConfig";

// Fuente única de query keys para productos y categorías: tanto el panel admin
// como el sitio público leen las mismas entidades, así que comparten cache.
export var queryKeys = {
  products: function (bd) {
    return ["products", bd || BD_NAME];
  },
  categories: function (bd) {
    return ["categories", bd || BD_NAME];
  },
  carousel: function (bd) {
    return ["carousel", bd || BD_NAME];
  },
};

// Ambas entidades cambian poco entre acciones de admin; con esto evitamos
// refetchs duplicados cuando layout, home, detalle y categorías montan casi
// al mismo tiempo y comparten la misma query key.
export var ENTITY_STALE_TIME = 60000;
