import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X } from 'lucide-react';
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
    
        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
    
            // Clear error on input change
            setErrors({ ...errors, [name]: '' });
        };
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoginState("Loading...");
        
            const newErrors = {};
        
            if (formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters.';
                setLoginState("Login");
            }
        
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
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
                console.log(data)
        
                if (response.ok) {
                    console.log('Success:', data.message);

                    // Store user name and token if provided
                    localStorage.setItem('userName', formData.name);
                    
                    // Extract token from response if provided
                    if (data.token) {
                        tokenManager.setToken(data.token);
                    }
                    
                    setFormData({
                        name: '',
                        phone: '',
                        password: ''
                    });

                    // Navigate only after successful login
                    navigate('/client-home');

                } else {
                    console.error('Error:', data.message);
                    setErrors({ general: data.message || 'Login failed' });
                }
            } catch (err) {
                console.error('Error:', err);
                setErrors({ general: 'Something went wrong. Please try again.' });
            }
        };
        
    
        const togglePasswordVisibility = (field) => {
            if (field === 'password') {
                setShowPassword(!showPassword);
            }
        };
    return (
        <div className="signup-container">
        <h2 className="signup-title">Sign Up<Link to={'/'}><X style={{ color: "white"}}/></Link></h2>
        <form onSubmit={handleSubmit}>
            <div className="form-left">
                <input
                    type="text"
                    className="input-field"
                    placeholder="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="tel"
                    className="input-field"
                    placeholder="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
                <div className="password-wrapper">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-field"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility('password')}
                        className="password-toggle"
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                    {errors.password && <span className="error-label">{errors.password}</span>}
                </div>
            </div>

            <div className="input-divider"></div>

            <div className="form-right">
                <button type="submit" className="signup-button">{loginState}</button>
                <div className="divide">or</div>
                <p className="existing-account">
                    Create an account? <a href="/client-sign-up">Sign Up</a>
                </p>
            </div>
        </form>
    </div>
    );
}

export default ClientLogin;
