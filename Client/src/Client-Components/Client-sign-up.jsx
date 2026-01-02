import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import '../styles/Client-signup.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signupState, setSignupState] = useState("Sign Up");
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Real-time password strength checker
    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return Math.min(strength, 3);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Check password strength in real-time
        if (name === 'password') {
            setPasswordStrength(checkPasswordStrength(value));
        }

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
        setSignupState("Creating Account...");
    
        const newErrors = {};
    
        // Validate name
        if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters.';
        }

        // Validate phone
        if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number.';
        }

        // Validate password
        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }
    
        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSignupState("Sign Up");
            setIsLoading(false);
            return;
        }
    
        try {
            const response = await fetch('https://flexy-backend.onrender.com/api/client-signup', {
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
    
            if (response.ok) {
                console.log('Success:', data.mess);
                setSignupState("Success!");
                
                // Reset form
                setFormData({
                    name: '',
                    phone: '',
                    password: '',
                    confirmPassword: ''
                });

                // Navigate after short delay
                setTimeout(() => {
                    navigate('/client-login');
                }, 1000);
            } else {
                console.error('Error:', data.mess);
                setErrors({ general: data.mess || 'Sign up failed. Please try again.' });
                setSignupState("Sign Up");
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Error:', err);
            setErrors({ general: 'Network error. Please check your connection and try again.' });
            setSignupState("Sign Up");
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    const getPasswordStrengthClass = () => {
        if (passwordStrength === 1) return 'password-strength-weak';
        if (passwordStrength === 2) return 'password-strength-medium';
        if (passwordStrength === 3) return 'password-strength-strong';
        return '';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength === 1) return 'Weak';
        if (passwordStrength === 2) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="signup-container">
            <h2 className="signup-title">
                Create Account
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
                        placeholder="Phone Number (10 digits)"
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
                            placeholder="Password (min. 6 characters)"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('password')}
                            className="password-toggle"
                            disabled={isLoading}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                        {formData.password && (
                            <div className="password-strength">
                                <div className={`password-strength-bar ${getPasswordStrengthClass()}`}></div>
                            </div>
                        )}
                        {formData.password && (
                            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                                Strength: {getPasswordStrengthText()}
                            </span>
                        )}
                        {errors.password && <span className="error-label">{errors.password}</span>}
                    </div>

                    <div className="password-wrapper">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="input-field"
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="password-toggle"
                            disabled={isLoading}
                        >
                            {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                        {errors.confirmPassword && <span className="error-label">{errors.confirmPassword}</span>}
                    </div>
                </div>

                <div className="form-right">
                    <button 
                        type="submit" 
                        className="signup-button"
                        disabled={isLoading}
                    >
                        {signupState}
                    </button>
                    <div className="divide">or</div>
                    <p className="existing-account">
                        Already have an account? <Link to="/client-login">Login</Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SignUp;