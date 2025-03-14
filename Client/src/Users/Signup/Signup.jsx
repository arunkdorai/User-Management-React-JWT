import React, { useState } from 'react';
import './SignUp.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for validation errors
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    image: '',
    server: ''
  });
  
  const navigate = useNavigate();
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setErrors(prev => ({ ...prev, image: '' }));
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

  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      image: '',
      server: ''
    };

    // Validate username
    const nameregex = /^[A-Za-z ]+$/;
    if (!username) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (!nameregex.test(username)) {
      newErrors.username = 'Username should contain only letters and spaces';
      isValid = false;
    }

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
    const passwordregex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#$%^&*]{8,}$/;
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!passwordregex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters with at least one letter and one number';
      isValid = false;
    }

    // Validate image
    if (!image) {
      newErrors.image = 'Profile image is required';
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
    
    try {
      const imageUrl = await uploadimage();
      
      if (!imageUrl) {
        setLoading(false);
        return;
      }
      
      const userData = {
        username,
        email,
        password,
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
        // Handle successful response but with error message
        setErrors(prev => ({ ...prev, server: response.data.message }));
        toast.error(response.data.message || 'Signup failed. Please try again.', {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      // Handle error response
      console.error('Signup failed:', error);
      
      if (error.response && error.response.data) {
        // Set server error message
        setErrors(prev => ({ ...prev, server: error.response.data.message }));
        
        // Display specific error from the server
        toast.error(error.response.data.message || 'Signup failed. Please try again.', {
          position: "top-center",
          autoClose: 3000,
        });
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
    <div className="signup-container">
      <div className="signup-form">
        <h2>Create an Account</h2>
        
        {/* Server error message */}
        {errors.server && (
          <div className="server-error-message">{errors.server}</div>
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
          {errors.image && <div className="error-message">{errors.image}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (e.target.value) setErrors(prev => ({ ...prev, username: '' }));
            }}
            placeholder="Enter username"
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && <div className="error-message">{errors.username}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value) setErrors(prev => ({ ...prev, email: '' }));
            }}
            placeholder="Enter email"
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value) setErrors(prev => ({ ...prev, password: '' }));
            }}
            placeholder="Enter password"
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
          {password && !errors.password && (
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