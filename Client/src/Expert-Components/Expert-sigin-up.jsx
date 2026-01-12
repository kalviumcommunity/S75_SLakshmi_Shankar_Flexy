import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Expert-signup.css';
import { X, AlertCircle } from 'lucide-react';
import { tokenManager } from '../utils/auth';

const ExpertSignUp = () => {
  const [step, setStep] = useState(1); // 1 or 2
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    profession: '',
    experience: '',
    location: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = 'Contact must be a valid 10-digit number';
    }
    
    if (!formData.profession.trim()) {
      newErrors.profession = 'Profession is required';
    }
    
    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    } else if (isNaN(formData.experience) || formData.experience < 0) {
      newErrors.experience = 'Experience must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    try {
      if (step === 1) {
        // Step 1 validation
        if (validateStep1()) {
          setStep(2);
        }
      } else {
        // Step 2 validation + submit
        if (validateStep2()) {
          setIsSubmitting(true);
          
          const payload = {
            name: formData.name,
            contact: formData.contact,
            profession: formData.profession,
            exp: formData.experience,
            location: formData.location,
            password: formData.password,
          };

          const result = await fetch(
            'https://flexy-backend.onrender.com/api/expert-sign-up',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(payload),
            }
          );

              if (result.success) {
                tokenManager.setToken(result.token);
                navigate("/expert-home");
              }


          if (result.success) {
            console.log('Sign up successful:', result);
            localStorage.setItem('expertId', result.expertId);
            localStorage.setItem('expertContact', result.expertContact);
            
            // Store token if provided
            if (result.token) {
              tokenManager.setToken(result.token);
            }
            
            // Show success briefly before navigating
            setTimeout(() => {
              navigate('/expert-home');
            }, 500);
          } else {
            console.error('Sign up error:', result);
            setErrors({ 
              general: result.message || 'Sign up failed. Please try again.' 
            });
            setIsSubmitting(false);
          }
        }
      }
    } catch (err) {
      console.error('Network error:', err);
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  return (
    <div className="expert-signup__container">
      <div className="expert-signup__card">
        <div className="expert-signup__form-section">
          <h2 className="signup-title">
            Expert Sign Up
            <Link to={'/'}>
              <X size={24} />
            </Link>
          </h2>

          {errors.general && (
            <div style={{
              background: '#fee2e2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} color="#dc2626" />
              <span style={{ color: '#991b1b', fontSize: '14px', fontWeight: '600' }}>
                {errors.general}
              </span>
            </div>
          )}

          <form className="expert-signup__form" onSubmit={(e) => e.preventDefault()}>
            {step === 1 ? (
              <>
                <div className="expert-signup__form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="expert-signup__input"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="expert-signup__error">{errors.name}</p>}
                </div>

                <div className="expert-signup__form-group">
                  <input
                    type="tel"
                    name="contact"
                    placeholder="Contact Number (10 digits)"
                    className="expert-signup__input"
                    value={formData.contact}
                    onChange={handleChange}
                    maxLength="10"
                    disabled={isSubmitting}
                  />
                  {errors.contact && <p className="expert-signup__error">{errors.contact}</p>}
                </div>

                <div className="expert-signup__form-row">
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      name="profession"
                      placeholder="Profession (e.g., Plumber)"
                      className="expert-signup__input"
                      value={formData.profession}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    {errors.profession && <p className="expert-signup__error">{errors.profession}</p>}
                  </div>
                  <div style={{ flex: '0 0 140px' }}>
                    <input
                      type="number"
                      name="experience"
                      placeholder="Years"
                      className="expert-signup__input small"
                      value={formData.experience}
                      onChange={handleChange}
                      min="0"
                      disabled={isSubmitting}
                    />
                    {errors.experience && <p className="expert-signup__error">{errors.experience}</p>}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="expert-signup__form-group">
                  <input
                    type="text"
                    name="location"
                    placeholder="Location (City, State)"
                    className="expert-signup__input"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.location && <p className="expert-signup__error">{errors.location}</p>}
                </div>

                <div className="expert-signup__form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password (min. 6 characters)"
                    className="expert-signup__input"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.password && <p className="expert-signup__error">{errors.password}</p>}
                </div>

                <div className="expert-signup__form-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="expert-signup__input"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.confirmPassword && (
                    <p className="expert-signup__error">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        <div className="expert-signup__divider-section">
          {/* Progress Indicator */}
          <div className="progress-indicator">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}></div>
          </div>

          {step === 2 && (
            <button 
              className="expert-signup__button" 
              onClick={handleBack}
              disabled={isSubmitting}
              style={{ marginBottom: '16px', background: '#475569' }}
            >
              Back
            </button>
          )}

          <button 
            className="expert-signup__button expert-signup__side-button" 
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : (step === 1 ? 'Next' : 'Sign Up')}
          </button>

          <div className="expert-signup__or-divider">or</div>

          <Link className="expert-signup__text-muted" to="/expert-login">
            Already have an account? <span className='link'>Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExpertSignUp;
