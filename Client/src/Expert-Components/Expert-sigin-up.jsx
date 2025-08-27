import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Expert-signup.css';
import { X } from 'lucide-react';

const ExpertSignUp = () => {
  const [step, setStep] = useState(true); // true = Step 1, false = Step 2
  const navigate = useNavigate();
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
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact is required';
    if (!formData.profession.trim()) newErrors.profession = 'Profession is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleNext = async () => {
  try {
    if (step) {
      // Step 1 validation
      if (validateStep1()) {
        setStep(false);
      }
    } else {
      // Step 2 validation + submit
      if (validateStep2()) {
        const payload = {
          name: formData.name,
          contact: formData.contact,
          profession: formData.profession,
          exp: formData.experience,
          location: formData.location,
          password: formData.password,
        };

        const response = await fetch(
          'https://flexy-backend.onrender.com/api/expert-sign-up',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();

        if (response.ok) {
          console.log(result);
          localStorage.setItem('expertId', result.expertId);
          navigate('/Expert-home');
        } else {
          console.error('Error:', result);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="expert-signup__container">
      <div className="expert-signup__card">
        <div className="expert-signup__form-section">
          <h2 className="signup-title">
            Sign Up
            <Link to={'/'}>
              <X style={{ color: '#FF7A00' }} />
            </Link>
          </h2>
          <form className="expert-signup__form" onSubmit={(e) => e.preventDefault()}>
            {step ? (
              <>
                <div className="expert-signup__form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    className="expert-signup__input"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="expert-signup__error">{errors.name}</p>}
                </div>

                <div className="expert-signup__form-group">
                  <input
                    type="text"
                    name="contact"
                    placeholder="Contact"
                    className="expert-signup__input"
                    value={formData.contact}
                    onChange={handleChange}
                  />
                  {errors.contact && <p className="expert-signup__error">{errors.contact}</p>}
                </div>

                <div className="expert-signup__form-row">
                  <input
                    type="text"
                    name="profession"
                    placeholder="Profession"
                    className="expert-signup__input"
                    value={formData.profession}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="experience"
                    placeholder="Experience"
                    className="expert-signup__input small"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>
                {(errors.profession || errors.experience) && (
                  <div className="expert-signup__error">
                    {errors.profession || errors.experience}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="expert-signup__form-group">
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    className="expert-signup__input"
                    value={formData.location}
                    onChange={handleChange}
                  />
                  {errors.location && <p className="expert-signup__error">{errors.location}</p>}
                </div>

                <div className="expert-signup__form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="expert-signup__input"
                    value={formData.password}
                    onChange={handleChange}
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
          <button className="expert-signup__button expert-signup__side-button" onClick={handleNext}>
            {step ? 'Next' : 'Sign Up'}
          </button>
          <div className="expert-signup__or-divider">or</div>
          <a className="expert-signup__text-muted" href="/expert-login">
            Already have an<br />
            <p className='link'>account?</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ExpertSignUp;
