import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  var loc;
  loc = useLocation();

  useEffect(
    function () {
      var id, el;

      // Si hay hash (#catalogo), intenta ir a ese elemento
      if (loc.hash) {
        id = String(loc.hash || "").replace("#", "");
        el = id ? document.getElementById(id) : null;
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "auto", block: "start" });
          return;
        }
      }

      // Caso normal: ir arriba al cambiar de ruta
      window.scrollTo(0, 0);
    },
    [loc.pathname, loc.hash]
  );

  return null;
}
