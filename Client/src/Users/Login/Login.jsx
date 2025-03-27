import React, { useState } from "react";
import "./Login.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    email: null,
    password: null,
    server: null
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Comprehensive validation function
  const validateForm = () => {
    const newErrors = {
      email: null,
      password: null,
      server: null
    };

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Clear specific error when user starts typing
    if (value.trim()) {
      setErrors(prev => ({
        ...prev,
        [id]: null
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    
    // Set errors
    setErrors(prevErrors => ({
      ...prevErrors,
      ...formErrors
    }));
    
    // Check if there are any errors
    const hasErrors = Object.values(formErrors).some(error => error !== null);
    
    // If form is not valid, stop submission
    if (hasErrors) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:4000/login",
        {
          email: formData.email,
          password: formData.password
        },
        {
          withCredentials: true,
        }
      );
      
      if (response.data.success) {
        toast.success("Login successful! Redirecting to home...", {
          position: "top-center",
          autoClose: 2000,
        });
        
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        // Handle unsuccessful login
        const serverError = response.data.message || "Login failed. Please try again.";
        
        setErrors(prev => ({ 
          ...prev, 
          server: serverError 
        }));
        
        toast.error(serverError, {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Connection error. Please try again later.';
      
      setErrors(prev => ({ 
        ...prev, 
        server: errorMessage 
      }));
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        
        {/* Server error message */}
        {errors.server && (
          <div 
            className="server-error-message"
            style={{
              color: 'red', 
              fontSize: '0.8rem', 
              marginBottom: '15px', 
              display: 'block',
              backgroundColor: 'rgba(255,0,0,0.1)',
              padding: '10px',
              borderRadius: '4px',
              textAlign: 'center'
            }}
          >
            {errors.server}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && (
            <div 
              className="error-message"
              style={{
                color: 'red', 
                fontSize: '0.8rem', 
                marginTop: '5px', 
                display: 'block',
                backgroundColor: 'rgba(255,0,0,0.1)',
                padding: '5px',
                borderRadius: '4px'
              }}
            >
              {errors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && (
            <div 
              className="error-message"
              style={{
                color: 'red', 
                fontSize: '0.8rem', 
                marginTop: '5px', 
                display: 'block',
                backgroundColor: 'rgba(255,0,0,0.1)',
                padding: '5px',
                borderRadius: '4px'
              }}
            >
              {errors.password}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        
        <div className="signup-link">
          Don't have an account? <a href="http://localhost:5173/signup">Sign up</a>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}

export default Login;