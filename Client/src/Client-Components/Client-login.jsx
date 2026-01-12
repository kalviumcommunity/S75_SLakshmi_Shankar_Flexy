import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import '../styles/Client-signup.css';

const ClientLogin = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('https://flexy-backend.onrender.com/api/client-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ phone, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('clientPhone', data.clientPhone || phone);
                localStorage.setItem('clientId', data.clientId);
                localStorage.setItem('token', data.token);
                
                navigate('/client-home');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-title">
                Client Login
                <a onClick={() => navigate('/')} style={{ cursor: 'pointer', textDecoration: 'none' }}>
                    <X size={20} />
                </a>
            </div>

            <form onSubmit={handleLogin}>
                <div className="form-left">
                    {error && (
                        <div className="general-error">
                            {error}
                        </div>
                    )}

                    <input
                        type="tel"
                        className="input-field"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        required
                    />

                    <div className="password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                <div className="form-right">
                    <button 
                        type="submit"
                        className="signup-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging In' : 'Login'}
                    </button>

                    <div className="divide">OR</div>

                    <p className="existing-account">
                        Don't have an account? <a href="/client-sign-up">Sign Up</a>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ClientLogin;