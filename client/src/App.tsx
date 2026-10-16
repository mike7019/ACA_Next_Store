import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import Productos from './pages/Productos.tsx';
import ProductoDetalle from './pages/ProductoDetalle.tsx';
import Carrito from './pages/Carrito.tsx';
import Checkout from './pages/Checkout.tsx';
import CheckoutConfirmacion from './pages/CheckoutConfirmacion.tsx';
import AdminLogin from './pages/admin/AdminLogin.tsx';
import AdminLayout from './components/admin/AdminLayout.tsx';
import RequireAdmin from './components/admin/RequireAdmin.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AdminProductos from './pages/admin/AdminProductos.tsx';
import AdminProductoForm from './pages/admin/AdminProductoForm.tsx';
import AdminCategorias from './pages/admin/AdminCategorias.tsx';
import AdminPedidos from './pages/admin/AdminPedidos.tsx';
import AdminPedidoDetalle from './pages/admin/AdminPedidoDetalle.tsx';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="productos" element={<Productos />} />
              <Route path="productos/:slug" element={<ProductoDetalle />} />
              <Route path="carrito" element={<Carrito />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="checkout/confirmacion/:id" element={<CheckoutConfirmacion />} />
            </Route>

            <Route path="admin/login" element={<AdminLogin />} />

            <Route element={<RequireAdmin />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="productos" element={<AdminProductos />} />
                <Route path="productos/nuevo" element={<AdminProductoForm />} />
                <Route path="productos/:id/editar" element={<AdminProductoForm />} />
                <Route path="categorias" element={<AdminCategorias />} />
                <Route path="pedidos" element={<AdminPedidos />} />
                <Route path="pedidos/:id" element={<AdminPedidoDetalle />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
