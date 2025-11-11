// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import AdminDashboard from './pages/AdminDashboard';
import InstituteDashboard from './pages/InstituteDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import './App.css';

// Simple Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      padding: '20px',
      textAlign: 'center',
      color: '#64748b',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          © {currentYear} CareerConnect. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AuthForm />
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ 
        backgroundColor: '#333', 
        padding: '10px 20px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          <span style={{ fontSize: '0.9rem' }}>
            Welcome, {user.name || user.email} ({user.role})
          </span>
        </div>
        <button 
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </nav>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route 
            path="/admin" 
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/institute" 
            element={
              <PrivateRoute requiredRole="institute">
                <InstituteDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/company" 
            element={
              <PrivateRoute requiredRole="company">
                <CompanyDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student" 
            element={
              <PrivateRoute requiredRole="student">
                <StudentDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="*" 
            element={
              user && user.role ? (
                <Navigate to={`/${user.role}`} replace />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;