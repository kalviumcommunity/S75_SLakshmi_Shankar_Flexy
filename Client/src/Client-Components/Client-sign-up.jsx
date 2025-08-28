import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X } from 'lucide-react';
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
    const [siginState, setSign] = useState("Sign Up");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error on input change
        setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSign("Loading...")
    
        const newErrors = {};
    
        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
            setSign("Sign Up");
        }
    
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
            setSign("Sign Up");
        }
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        navigate('/client-home')
    
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
                // Optionally reset form
                setFormData({
                    name: '',
                    phone: '',
                    password: '',
                    confirmPassword: ''
                });
            } else {
                console.error('Error:', data.mess);
                // Optionally show error to user
                setErrors({ general: data.mess });
            }
        } catch (err) {
            console.error('Error:', err);
            setErrors({ general: 'Something went wrong. Please try again.' });
        }
    };
    

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    return (
        <div className="signup-container">
            <h2 className="signup-title">Sign Up<Link to={'/'}><X style={{ color: "#FF7A00"}}/></Link></h2>
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
                    <div className="password-wrapper">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="input-field"
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="password-toggle"
                        >
                            {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                        {errors.confirmPassword && <span className="error-label">{errors.confirmPassword}</span>}
                    </div>
                </div>

                <div className="input-divider"></div>

                <div className="form-right">
                    <button type="submit" className="signup-button">Sign Up</button>
                    <div className="divide">or</div>
                    <p className="existing-account">
                        Already have an account? <a href="/client-login">Login</a>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SignUp;
