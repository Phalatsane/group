// src/components/AuthForm.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './authcss.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear messages when user starts typing
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        console.log('Logging in with:', formData.email);
        await login(formData.email, formData.password);
        // Login successful - user will be redirected automatically via AuthContext
      } else {
        console.log('Registering with role:', formData.role);
        // Prepare user data for registration
        const userData = {
          role: formData.role,
          name: formData.name,
          ...(formData.role === 'company' && { companyName: formData.companyName })
        };
        
        console.log('Sending user data to register:', userData);
        const result = await register(formData.email, formData.password, userData);
        
        if (result.success) {
          setSuccessMessage(result.message);
          // Switch to login form and clear password
          setIsLogin(true);
          setFormData(prev => ({
            ...prev,
            password: '' // Clear password after successful registration
          }));
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'student',
      companyName: ''
    });
    setError('');
    setSuccessMessage('');
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Join Our Platform'}</h2>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
          </p>
        </div>

        {/* Status Messages */}
        <div className="auth-messages">
          {error && (
            <div className="alert alert-danger">
              <div className="alert-icon"></div>
              <div className="alert-content">
                <strong>Authentication Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              <div className="alert-icon"></div>
              <div className="alert-content">
                <strong>Registration Successful!</strong>
                <p>{successMessage}</p>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Registration Fields */}
          {!isLogin && (
            <div className="registration-fields">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">I am a:</label>
                <div className="role-selector">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="student"> Student</option>
                    <option value="company"> Company</option>
                    <option value="institute"> Institute</option>
                    <option value="admin"> Admin</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Fields Based on Role */}
              {formData.role === 'company' && (
                <div className="form-group">
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              )}

              {formData.role === 'institute' && (
                <div className="form-group">
                  <input
                    type="text"
                    name="instituteName"
                    placeholder="Institute Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Common Fields */}
          <div className="common-fields">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-control"
                minLength="6"
              />
              {!isLogin && (
                <div className="password-hint">
                   Password must be at least 6 characters
                </div>
              )}
            </div>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`btn btn-primary btn-auth ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
        
        {/* Auth Footer */}
        <div className="auth-footer">
          <div className="divider">
            <span>or</span>
          </div>
          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={handleToggleMode}
              className="btn-link"
            >
              {isLogin ? ' Create one now' : ' Sign in here'}
            </button>
          </p>
        </div>

        {/* Quick Info */}
        <div className="quick-info">
          <div className="info-item">
            <span className="info-icon"></span>
            <span>Students - Apply for courses & jobs</span>
          </div>
          <div className="info-item">
            <span className="info-icon"></span>
            <span>Companies - Find qualified candidates</span>
          </div>
          <div className="info-item">
            <span className="info-icon"></span>
            <span>Institutes - Manage courses & admissions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;