import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Expert-signup.css';

const ExpertSignUp = () => {
  const [step, setStep] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    license: null,
    profession: '',
    experience: '',
    location: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact is required';
    if (!formData.license) newErrors.license = 'Work license is required';
    if (!formData.profession.trim()) newErrors.profession = 'Profession is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async() => {
    try {
      if (step === true && validateStep1()) {
        setStep(false);
      } else if (step === false && validateStep2()) {
        const data = new FormData();
  
        data.append('name', formData.name);
        data.append('contact', formData.contact);
        data.append('license', formData.license);
        data.append('profession', formData.profession);
        data.append('exp', formData.experience);
        data.append('location', formData.location);
        data.append('password', formData.password);
  
        console.log(data);
  
        const response = await fetch('https://flexy-backend.onrender.com/api/expert-sign-up', {
          method: "POST",
          body: data,
        });
  
        // Use only response.json() to parse the body
        const result = await response.json();
        console.log(result);
  
        // Check for response status to ensure successful response
        if (response.ok) {
          navigate('/Expert-home');
        } else {
          console.error('Error:', result);
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="expert-signup__container">
      <div className="expert-signup__card">
        <div className="expert-signup__form-section">
          <h2 className="expert-signup__heading">Sign Up</h2>
          <form className="expert-signup__form" onSubmit={(e) => e.preventDefault()}>
            {step === true ? (
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

                <div className="expert-signup__form-group">
                  <input
                    type="file"
                    name="license"
                    className="expert-signup__input-file"
                    onChange={handleChange}
                  />
                  {errors.license && <p className="expert-signup__error">{errors.license}</p>}
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
            {step === true ? 'Next' : 'Sign Up'}
          </button>
          <div className="expert-signup__or-divider">or</div>
          <a className="expert-signup__text-muted" href='/expert-login'>
            Already have an<br />account?
          </a>
        </div>
      </div>
    </div>
  );
};

export default ExpertSignUp;
