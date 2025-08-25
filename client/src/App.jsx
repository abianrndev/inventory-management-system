import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// import Borrowings from './pages/Borrowings';
// import Receivings from './pages/Receivings';
// import Items from './pages/Items';
// import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Temporarily comment out these routes until we create the components */}
          {/* 
          <Route path="/borrowings" element={
            <ProtectedRoute>
              <Layout>
                <Borrowings />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/receivings" element={
            <ProtectedRoute>
              <Layout>
                <Receivings />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/items" element={
            <ProtectedRoute roles={['super_admin', 'admin']}>
              <Layout>
                <Items />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute roles={['super_admin']}>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          } />
          */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;