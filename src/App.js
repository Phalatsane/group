import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Updated import path
import AuthForm from './components/AuthForm';
import AdminDashboard from './pages/AdminDashboard';
import InstituteDashboard from './pages/InstituteDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import './styles/AdminDashboard.css';

//import './App.css';

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
    return <AuthForm />;
  }

  return (
    <div className="app-layout">
      {/* Enhanced Navigation Header */}
      <nav className="app-header">
        <div className="navbar">
          <div className="navbar-brand">
            <span className="navbar-brand-icon">🎓</span>
            <span>Educational Platform - {user.role?.toUpperCase()} Dashboard</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
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

      {/* User Info Footer */}
      <footer className="user-footer">
        <div className="user-info">
          <span className="user-welcome">Welcome back, {user.email}</span>
          <span className="user-name">{user.name || user.email}</span>
          <span className="user-role">({user.role})</span>
        </div>
        <button 
          onClick={logout}
          className="btn-logout"
        >
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </footer>
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