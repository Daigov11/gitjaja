import { useEffect, useState } from "react";

var DEFAULT_FALLBACK = "/placeholder-product.svg";

function cleanSrc(src) {
  var s = src == null ? "" : String(src).trim();
  if (!s || s === "null" || s === "undefined") return "";
  return s;
}

// <img> resistente a URLs externas caídas: si la imagen principal falla,
// cambia UNA sola vez a un fallback local y nunca deja el ícono roto del
// navegador. Si tampoco hay fallback disponible, muestra una alternativa
// semántica y accesible (mismo alt, sin <img>).
var OWN_PROPS = ["src", "alt", "className", "fallback", "loading"];

function restProps(props) {
  var out = {};
  var key;
  for (key in props) {
    if (Object.prototype.hasOwnProperty.call(props, key) && OWN_PROPS.indexOf(key) === -1) {
      out[key] = props[key];
    }
  }
  return out;
}

export default function AppImage(props) {
  var src, alt, className, fallback, loading, rest;
  var failed, setFailed;
  var fallbackFailed, setFallbackFailed;
  var current;

  src = cleanSrc(props.src);
  alt = props.alt || "";
  className = props.className || "";
  fallback = props.fallback === undefined ? DEFAULT_FALLBACK : cleanSrc(props.fallback);
  loading = props.loading || "lazy";
  rest = restProps(props);

  failed = useState(false);
  setFailed = failed[1];
  failed = failed[0];

  fallbackFailed = useState(false);
  setFallbackFailed = fallbackFailed[1];
  fallbackFailed = fallbackFailed[0];

  useEffect(
    function () {
      setFailed(false);
      setFallbackFailed(false);
    },
    [src, setFailed, setFallbackFailed]
  );

  current = fallbackFailed ? "" : failed || !src ? fallback : src;

  if (!current) {
    return (
      <div
        role="img"
        aria-label={alt || "Imagen no disponible"}
        className={className + " flex items-center justify-center bg-slate-100 text-slate-400"}
      >
        <span className="text-[11px] font-bold">{alt || "Sin imagen"}</span>
      </div>
    );
  }

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      className={className}
      loading={loading}
      onError={function () {
        if (!failed) {
          setFailed(true);
        } else if (!fallbackFailed) {
          setFallbackFailed(true);
        }
      }}
    />
  );
}
