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
  const { login, register, resetPassword } = useAuth(); // Assumes resetPassword is implemented in your context

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        await login(formData.email, formData.password);
      } else {
        const userData = {
          role: formData.role,
          name: formData.name,
          ...(formData.role === 'company' && { companyName: formData.companyName })
        };
        const result = await register(formData.email, formData.password, userData);
        if (result.success) {
          setSuccessMessage(result.message);
          setIsLogin(true);
          setFormData(prev => ({ ...prev, password: '' }));
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

  const handleForgotPassword = async () => {
    if (!formData.email) {
      const emailInput = prompt('Please enter your email to reset password:');
      if (emailInput) {
        setFormData(prev => ({ ...prev, email: emailInput }));
      } else {
        return; // User cancelled
      }
    }
    try {
      await resetPassword(formData.email);
      alert('Password reset email sent! Please check your email.');
    } catch (err) {
      console.error('Reset password error:', err);
      alert('Error sending reset email: ' + err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to your account' : 'Join our educational platform'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <strong>Success!</strong> {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
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
                <label className="form-label">Select Role:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="student">Student</option>
                  <option value="company">Company</option>
                  <option value="institute">Institute</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

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
            </>
          )}
          
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
              <small className="form-text">
                Password must be at least 6 characters long
              </small>
            )}
          </div>

          {/* Forgot Password Button */}
          {isLogin && (
            <div className="form-group">
              <button 
                type="button" 
                className="btn btn-link forgot-password-btn"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>
          )}

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
        
        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={handleToggleMode}
              className="btn-link"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;