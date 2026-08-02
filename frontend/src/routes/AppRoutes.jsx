import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PageTransition from "../components/common/PageTransition.jsx";
import MainLayout from "../components/layout/MainLayout.jsx";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const Landing = lazy(() => import("../pages/Landing/Landing.jsx"));
const Login = lazy(() => import("../pages/Auth/Login.jsx"));
const Register = lazy(() => import("../pages/Auth/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword.jsx"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard.jsx"));
const Products = lazy(() => import("../pages/Dashboard/Products.jsx"));
const ProductDetails = lazy(() => import("../pages/Dashboard/ProductDetails.jsx"));
const Categories = lazy(() => import("../pages/Dashboard/Categories.jsx"));
const Suppliers = lazy(() => import("../pages/Dashboard/Suppliers.jsx"));
const Inventory = lazy(() => import("../pages/Dashboard/Inventory.jsx"));
const StockIn = lazy(() => import("../pages/Dashboard/StockIn.jsx"));
const StockOut = lazy(() => import("../pages/Dashboard/StockOut.jsx"));
const Reports = lazy(() => import("../pages/Dashboard/Reports.jsx"));
const Settings = lazy(() => import("../pages/Dashboard/Settings.jsx"));
const Profile = lazy(() => import("../pages/Dashboard/Profile.jsx"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound.jsx"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PageTransition><Landing /></PageTransition>} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/products" element={<Products />} />
          <Route path="/dashboard/products/:id" element={<ProductDetails />} />
          <Route path="/dashboard/categories" element={<Categories />} />
          <Route path="/dashboard/suppliers" element={<Suppliers />} />
          <Route path="/dashboard/inventory" element={<Inventory />} />
          <Route path="/dashboard/stock-in" element={<StockIn />} />
          <Route path="/dashboard/stock-out" element={<StockOut />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
    </Routes>
  );
}
