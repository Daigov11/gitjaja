import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../components/AdminLayout";

import Home from "../pages/Home";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";

import Dashboard from "../pages/admin/Dashboard";
import Categories from "../pages/admin/Categories";
import Products from "../pages/admin/Products";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />

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
