import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../components/AdminLayout";
import PublicLayout from "../components/PublicLayout";

import Home from "../pages/Home";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";

import CategoryIndex from "../pages/catalog/CategoryIndex";
import CategoryProducts from "../pages/catalog/CategoryProducts";

import Dashboard from "../pages/admin/Dashboard";
import Categories from "../pages/admin/Categories";
import Products from "../pages/admin/Products";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público con Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/producto/:id" element={<ProductDetail />} />

          {/* ✅ categorías */}
          <Route path="/categoria" element={<CategoryIndex />} />
          <Route path="/categoria/:cat" element={<CategoryProducts />} />

          <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin protegido */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="categorias" element={<Categories />} />
            <Route path="productos" element={<Products />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
