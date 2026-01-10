import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X, AlertCircle } from "lucide-react";
import { tokenManager } from "../utils/auth";

const ClientLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState("Login");
  const [isLoading, setIsLoading] = useState(false);

  // INPUT HANDLER
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // VALIDATION
  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginState("Logging In...");
    setErrors({});

    const newErrors = {};

    if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoginState("Login");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://flexy-backend.onrender.com/api/client-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // REQUIRED for HttpOnly cookie
          body: JSON.stringify({
            phone: formData.phone,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log("Login Successful:", data);
        
        // Store user info
        localStorage.setItem("clientPhone", data.clientPhone || formData.phone);

        // Store token if provided
        if (data.token) {
          tokenManager.setToken(data.token);
        }

        setLoginState("Success!");

        setTimeout(() => {
          navigate("/client-home");
        }, 700);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({
        general: err.message || "Network error. Please try again.",
      });
      setLoginState("Login");
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">
        Welcome Back
        <Link to="/">
          <X size={24} />
        </Link>
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-left">
          {errors.general && (
            <div className="general-error">
              <AlertCircle size={16} />
              {errors.general}
            </div>
          )}

          <input
            type="tel"
            className="input-field"
            placeholder="Phone Number (10 digits)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
            disabled={isLoading}
            required
          />
          {errors.phone && (
            <span className="error-label">{errors.phone}</span>
          )}

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="input-field"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((p) => !p)}
              disabled={isLoading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <span className="error-label">{errors.password}</span>
          )}
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
            Don&apos;t have an account?{" "}
            <Link to="/client-sign-up">Sign Up</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ClientLogin;
