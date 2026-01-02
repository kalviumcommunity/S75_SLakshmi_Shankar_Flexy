// ============================================
// IMPROVED EXPERT LOGIN COMPONENT
// ============================================

import React, { useState } from 'react';
import '../styles/Expert-signup.css';
import { useNavigate, Link } from 'react-router-dom';
import { tokenManager } from '../utils/auth';
import { AlertCircle } from 'lucide-react';

const ExpertLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be a valid 10-digit number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://flexy-backend.onrender.com/api/expert-login', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          contact: formData.phone,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login Successful:", data);

        // Store token
        if (data.token) {
          tokenManager.setToken(data.token);
        }

        // Clear form
        setFormData({
          phone: '',
          password: ''
        });

        // Navigate after short delay
        setTimeout(() => {
          navigate('/expert-home');
        }, 500);

      } else {
        console.warn("Login Error:", data.message);
        setErrors({ 
          general: data.message || 'Login failed. Please check your credentials.' 
        });
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Network Error:", err);
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="expert-login-container">
      <div className="expert-login-card">
        <div className="expert-login-left">
          <h2>Welcome Back</h2>

          {errors.general && (
            <div className="error-message">
              <label>
                <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                {errors.general}
              </label>
            </div>
          )}

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            required
            onChange={handleChange}
            maxLength="10"
            disabled={isLoading}
          />
          {errors.phone && (
            <span style={{ color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>
              {errors.phone}
            </span>
          )}

          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              placeholder="Password"
              required
              onChange={handleChange}
              disabled={isLoading}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
          {errors.password && (
            <span style={{ color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>
              {errors.password}
            </span>
          )}
        </div>

        <div className="expert-login-right">
          <button 
            className="login-btn" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
          
          <div className="or">or</div>
          
          <p>
            Don't have an account? <Link to="/expert-sign-up">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpertLogin;