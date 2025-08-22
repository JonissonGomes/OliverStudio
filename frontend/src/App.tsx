import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterSuccess from "@/pages/RegisterSuccess";
import Dashboard from "@/pages/Dashboard";
import Eventos from "@/pages/Eventos";
import Clientes from "@/pages/Clientes";
import Leads from "@/pages/Leads";
import Fotografos from "@/pages/Fotografos";
import Analytics from "@/pages/Analytics";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import ResetPassword from "@/pages/ResetPassword";
import SiteHome from "@/pages/site/Index";
import SiteAbout from "@/pages/site/About";
import SiteServices from "@/pages/site/Services";
import SiteContact from "@/pages/site/Contact";
import SitePhotoAccess from "@/pages/site/PhotoAccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Sonner />
          <Routes>
            {/* Redireciona raiz para /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            {/* Rotas públicas do site */}
            <Route path="/home" element={<SiteHome />} />
            <Route path="/sobre" element={<SiteAbout />} />
            <Route path="/servicos" element={<SiteServices />} />
            <Route path="/contato" element={<SiteContact />} />
            <Route path="/fotos" element={<SitePhotoAccess />} />
            {/* Auth sob /app */}
            <Route path="/app/login" element={<Login />} />
            <Route path="/app/register" element={<Register />} />
            <Route path="/app/register-success" element={<RegisterSuccess />} />
            <Route path="/app/reset-password" element={<ResetPassword />} />
            {/* Área autenticada */}
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/app/dashboard" element={<Dashboard />} />
              <Route path="/app/eventos" element={<Eventos />} />
              <Route path="/app/leads" element={<Leads />} />
              <Route path="/app/clientes" element={<Clientes />} />
              <Route path="/app/fotografos" element={<Fotografos />} />
              <Route path="/app/analytics" element={<Analytics />} />
              <Route path="/app/profile" element={<Profile />} />
              <Route path="/app/admin" element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } />
            </Route>
            {/* 404 redireciona para /home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AuthProvider>
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
