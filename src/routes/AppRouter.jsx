import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicLayout from "../components/PublicLayout";
import Home from "../pages/Home";

var AdminLayout = lazy(function () {
  return import("../components/AdminLayout");
});

var ProductDetail = lazy(function () {
  return import("../pages/ProductDetail");
});
var Login = lazy(function () {
  return import("../pages/Login");
});

var CategoryIndex = lazy(function () {
  return import("../pages/catalog/CategoryIndex");
});
var CategoryProducts = lazy(function () {
  return import("../pages/catalog/CategoryProducts");
});

var Dashboard = lazy(function () {
  return import("../pages/admin/Dashboard");
});
var Categories = lazy(function () {
  return import("../pages/admin/Categories");
});
var Products = lazy(function () {
  return import("../pages/admin/Products");
});
var Carousel = lazy(function () {
  return import("../pages/admin/Carousel");
});
var AboutUs = lazy(function () {
  return import("../pages/AboutUs");
});
var WorkWithUs = lazy(function () {
  return import("../pages/WorkWithUs");
});

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-m font-semibold text-slate-500">
      Cargando…
    </div>
  );
}

function withSuspense(element) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público con Layout */}
<Route element={<PublicLayout />}>
  <Route path="/" element={<Home />} />
  <Route path="/producto/:id" element={withSuspense(<ProductDetail />)} />

  {/* ✅ categorías */}
  <Route path="/categoria" element={withSuspense(<CategoryIndex />)} />
  <Route path="/categoria/:cat" element={withSuspense(<CategoryProducts />)} />

  {/* ✅ nuevas vistas públicas */}
  <Route path="/aboutus" element={withSuspense(<AboutUs />)} />
  <Route path="/trabaja-con-nosotros" element={withSuspense(<WorkWithUs />)} />

  <Route path="/login" element={withSuspense(<Login />)} />
</Route>


        {/* Admin protegido */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={withSuspense(<AdminLayout />)}>
            <Route index element={withSuspense(<Dashboard />)} />
            <Route path="categorias" element={withSuspense(<Categories />)} />
            <Route path="productos" element={withSuspense(<Products />)} />
            <Route path="carrusel" element={withSuspense(<Carousel />)} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
