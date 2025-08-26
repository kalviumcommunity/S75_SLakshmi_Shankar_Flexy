import React, { useState } from 'react';
import '../styles/Expert-signup.css';
import { useNavigate } from 'react-router-dom';
import { tokenManager } from '../utils/auth';

const ExpertLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

        // Extract token from response if provided
        if (data.token) {
          tokenManager.setToken(data.token);
        }

        setFormData({
          phone: '',
          password: ''
        });

        navigate('/expert-home');

      } else {
        console.warn("Login Error:", data.message);
        const errorMessage = data.message || 'Login failed';
        
        if (errorMessage === 'All fields are required'){
            setShowError(false)
        } else {
            setShowError(true)
            setError(errorMessage)
        }
      }
    } catch (err) {
      console.error("Error:", err.message);
      setShowError(true);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="expert-login-container">
      <div className="expert-login-card">
        <div className="expert-login-left">
          <h2>Login</h2>
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            required
            onChange={handleChange}
          />
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              placeholder="Password"
              required
              onChange={handleChange}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
            {showError && (
                <div className="error-message">
                    <label>{error}</label>
                </div>
            )}
        </div>


        <div className="expert-login-divider" />

        <div className="expert-login-right">
          <button className="login-btn" onClick={handleSubmit}>Login</button>
          <div className="or">or</div>
          <p>
            Create an account? <a href="/expert-sign-up">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpertLogin;
