import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Layout/Header';
import Home from './pages/Home';
// import Products from './pages/Products';
// import ProductDetail from './pages/ProductDetail';
// import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
// import Profile from './pages/Profile';
// import Orders from './pages/Orders';
// import OrderDetail from './pages/OrderDetail';
// import Checkout from './pages/Checkout';
// import AdminDashboard from './pages/Admin/Dashboard';
// import AdminOrders from './pages/Admin/Orders';
// import AdminUsers from './pages/Admin/Users';
// import ProtectedRoute from './components/ProtectedRoute';
// import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App" style={{ fontFamily: 'Epilogue, "Noto Sans", sans-serif' }}>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} /> */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* <Route path="/checkout" element={<Checkout />} /> */}
              
              {/* Protected Routes
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/orders/:id" element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              {/* <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute adminOnly>
                  <AdminOrders />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute superAdminOnly>
                  <AdminUsers />
                </ProtectedRoute>
              } /> */}
              
              {/* <Route path="/error" element={<ErrorPage />} />
              <Route path="*" element={<ErrorPage />} />  */}
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;