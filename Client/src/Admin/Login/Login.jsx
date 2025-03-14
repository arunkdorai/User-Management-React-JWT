import React, { useState } from 'react';
import "./Login.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    server: ''
  });
  
  const navigate = useNavigate();
  
  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      server: ''
    };

    // Validate email
    const emailregex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailregex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear server error
    setErrors(prev => ({ ...prev, server: '' }));
    
    if (!validateInputs()) {
      return;
    }
    
    setLoading(true);

    const userData = {
      email,
      password,
    };
    
    try {
      const response = await axios.post(
        "http://localhost:4000/admin/login",
        userData,
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
        // Handle successful response but with error message
        setErrors(prev => ({ ...prev, server: response.data.message }));
        toast.error(response.data.message || "Login failed. Please try again.", {
          position: "top-center",
          autoClose: 3000,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || "Login failed. Please try again.";
        
        // Set server error message
        setErrors(prev => ({ ...prev, server: errorMessage }));
        
        // Handle specific error cases
        if (status === 403) {
          toast.error("You are not an Admin", {
            position: "top-center",
            autoClose: 3000,
          });
        } else if (status === 401) {
          toast.error(errorMessage, {
            position: "top-center",
            autoClose: 3000,
          });
        } else {
          toast.error(errorMessage, {
            position: "top-center",
            autoClose: 3000,
          });
        }
      } else {
        // Generic error message
        setErrors(prev => ({ ...prev, server: 'Connection error. Please try again later.' }));
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
      
      <div className="input-field">
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          id="email" 
          onChange={(e) => {
            setEmail(e.target.value);
            if (e.target.value) setErrors(prev => ({ ...prev, email: '' }));
          }} 
          placeholder="Enter your email" 
          className={errors.email ? "input-error" : ""}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>
      
      <div className="input-field">
        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          id="password" 
          onChange={(e) => {
            setPassword(e.target.value);
            if (e.target.value) setErrors(prev => ({ ...prev, password: '' }));
          }} 
          placeholder="Enter your password" 
          className={errors.password ? "input-error" : ""}
        />
        {errors.password && <div className="error-message">{errors.password}</div>}
      </div>
      
      <button 
        type="submit" 
        onClick={handleSubmit} 
        className="button-login"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      
      <ToastContainer/>
    </div>
  );
}

export default Login;