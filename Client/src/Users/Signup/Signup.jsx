import React, { useState } from 'react';
import './SignUp.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for validation errors
  const [errors, setErrors] = useState({
    username: null,
    email: null,
    password: null,
    image: null,
    server: null
  });
  
  const navigate = useNavigate();
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setErrors(prev => ({ ...prev, image: null }));
    }
  };

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

  const uploadimage = async () => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "usermanagement");
    formData.append('cloud_name', 'dehzhdpab');
    
    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dehzhdpab/image/upload",
        formData
      );
      
      if (response.status === 200) {
        const imageUrl = response.data.secure_url;
        return imageUrl;
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, server: 'Image upload failed. Please try again.' }));
      toast.error("Image upload failed. Please try again.");
      return null;
    }
  };

  const validateForm = () => {
    const newErrors = {
      username: null,
      email: null,
      password: null,
      image: null,
      server: null
    };

    // Validate username
    const nameregex = /^[A-Za-z ]+$/;
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!nameregex.test(formData.username)) {
      newErrors.username = 'Username should contain only letters and spaces';
    }

    // Validate email
    const emailregex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailregex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    const passwordregex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#$%^&*]{8,}$/;
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!passwordregex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with at least one letter and one number';
    }

    // Validate image
    if (!image) {
      newErrors.image = 'Profile image is required';
    }

    return newErrors;
  };

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
      const imageUrl = await uploadimage();
      
      if (!imageUrl) {
        setLoading(false);
        return;
      }
      
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        image: imageUrl
      };
      
      const response = await axios.post('http://localhost:4000/signup', userData, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        toast.success('Signup successful! Redirecting to login...', {
          position: "top-center",
          autoClose: 2000,
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Handle unsuccessful signup
        const serverError = response.data.message || 'Signup failed. Please try again.';
        
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
    <div className="signup-container">
      <div className="signup-form">
        <h2>Create an Account</h2>
        
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
        
        <div className="image-upload-container">
          <input
            type="file"
            accept="image/*"
            id="image-upload"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="image-upload">
            {image ? (
              <img src={URL.createObjectURL(image)} alt="Uploaded" className="uploaded-image" />
            ) : (
              <div className="image-placeholder">
                <span>Upload Image</span>
              </div>
            )}
          </label>
          {errors.image && (
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
              {errors.image}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && (
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
              {errors.username}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
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
            placeholder="Enter password"
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
          {formData.password && !errors.password && (
            <div className="password-hint">
              Password must be at least 8 characters with at least one letter and one number
            </div>
          )}
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          className="upload-btn"
          disabled={loading}
        >
          {loading ? "Processing..." : "Sign Up"}
        </button>
        
        <div className="signup-link">
          Already have an account? <a href="http://localhost:5173/login">Login here</a>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default SignUp;