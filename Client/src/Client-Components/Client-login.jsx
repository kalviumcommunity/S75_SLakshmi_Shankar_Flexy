// ============================================
// IMPROVED LOGIN COMPONENT
// ============================================

import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, AlertCircle } from 'lucide-react';
import { tokenManager } from '../utils/auth';

const ClientLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loginState, setLoginState] = useState("Login");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error on input change
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Validate phone number
    const validatePhone = (phone) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginState("Logging In...");
    
        const newErrors = {};

        // Validate name
        if (formData.name.trim().length < 2) {
            newErrors.name = 'Please enter your name.';
        }

        // Validate phone
        if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number.';
        }
    
        // Validate password
        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoginState("Login");
            setIsLoading(false);
            return;
        }
    
        try {
            const response = await fetch('https://flexy-backend.onrender.com/api/client-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    password: formData.password
                }),
            });
    
            const data = await response.json();
            console.log(data);
    
            if (response.ok) {
                console.log('Success:', data.message);
                setLoginState("Success!");

                // Store user name and token
                localStorage.setItem('userName', formData.name);
                
                if (data.token) {
                    tokenManager.setToken(data.token);
                }
                
                setFormData({
                    name: '',
                    phone: '',
                    password: ''
                });

                // Navigate after short delay
                setTimeout(() => {
                    navigate('/client-home');
                }, 800);

            } else {
                console.error('Error:', data.message);
                setErrors({ general: data.message || 'Login failed. Please check your credentials.' });
                setLoginState("Login");
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Error:', err);
            setErrors({ general: 'Network error. Please check your connection and try again.' });
            setLoginState("Login");
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="signup-container">
            <h2 className="signup-title">
                Welcome Back
                <Link to={'/'}>
                    <X size={24} />
                </Link>
            </h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-left">
                    {errors.general && (
                        <div className="general-error">
                            <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
                            {errors.general}
                        </div>
                    )}

                    <input
                        type="text"
                        className="input-field"
                        placeholder="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                    {errors.name && <span className="error-label">{errors.name}</span>}

                    <input
                        type="tel"
                        className="input-field"
                        placeholder="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength="10"
                        required
                        disabled={isLoading}
                    />
                    {errors.phone && <span className="error-label">{errors.phone}</span>}

                    <div className="password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="input-field"
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="password-toggle"
                            disabled={isLoading}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                        {errors.password && <span className="error-label">{errors.password}</span>}
                    </div>
                </div>

                <div className="form-right">
                    <button 
                        type="submit" 
                        className="signup-button"
                        disabled={isLoading}
                    >
                        {loginState}
                    </button>
                    <div className="divide">or</div>
                    <p className="existing-account">
                        Don't have an account? <Link to="/client-sign-up">Sign Up</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default ClientLogin;