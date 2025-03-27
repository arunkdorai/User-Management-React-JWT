import React, { useState, useEffect } from 'react';
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
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
        "http://localhost:4000/admin/login",
        {
          email: formData.email,
          password: formData.password
        },
        {
          withCredentials: true,
        }
      );
      
      if (response.data.success) {
        toast.success("Login successful! Redirecting to dashboard...", {
          position: "top-center",
          autoClose: 2000,
        });
        
        setTimeout(() => {
          navigate("/home");
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
      
      // Toast notifications for different error scenarios
      if (error.response) {
        switch (error.response.status) {
          case 403:
            toast.error("You are not an Admin", {
              position: "top-center",
              autoClose: 3000,
            });
            break;
          case 401:
            toast.error(errorMessage, {
              position: "top-center",
              autoClose: 3000,
            });
            break;
          default:
            toast.error(errorMessage, {
              position: "top-center",
              autoClose: 3000,
            });
        }
      } else {
        toast.error('Connection error. Please try again later.', {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-App">
      <h2>Admin Login</h2>
      
      {/* Server error message */}
      {errors.server && (
        <div className="server-error-message">{errors.server}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="input-field">
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
                backgroundColor: 'rgb(255, 255, 255)',
                padding: '5px',
                borderRadius: '4px'
              }}
            >
              {errors.email}
            </div>
          )}
        </div>
        
        <div className="input-field">
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
                backgroundColor: 'rgb(255, 255, 255)',
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
          className="button-login"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      
      <ToastContainer/>
    </div>
  );
}

export default Login;