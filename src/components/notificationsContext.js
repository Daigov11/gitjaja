import { createContext, useContext } from "react";

export var NotificationsContext = createContext(null);

export function useNotify() {
  var ctx = useContext(NotificationsContext);
  if (!ctx) {
    return function (input) {
      var text = typeof input === "string" ? input : input && input.text;
      // Fallback de desarrollo si el provider no está montado.
      console.warn("NotificationsProvider no está montado:", text);
    };
  }
  return ctx.notify;
}
