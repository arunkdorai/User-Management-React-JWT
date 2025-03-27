import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Modal } from "react-bootstrap";
import "./Admin.css";
import { useDispatch, useSelector } from "react-redux";
import { addallusers, searchUser } from "../../Store/Adminaction";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

// Validation Regex
const VALIDATION = {
  username: /^[A-Za-z ]{3,30}$/,
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#$%^&*]{8,}$/,
};

function Admhome() {
  // Local state to manage users directly
  const [localUsers, setLocalUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentEditUser, setCurrentedit] = useState("");
  const [showadduser, setaddmodal] = useState(false);
  const [password, setPassword] = useState("");
  const [newimage, setNewimage] = useState(null);

  const dispatch = useDispatch();

  // Get users from Redux for initial load and search functionality
  const reduxUsers = useSelector((store) => store.adminside.usermanage);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/admin/getusers",
          {
            withCredentials: true,
          }
        );
        const userdetails = response.data.allusers;

        // Set both Redux state and local state
        dispatch(addallusers(userdetails));
        setLocalUsers(userdetails);
        setFilteredUsers(userdetails);
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch users", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    };

    fetchUserData();
  }, [dispatch]);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.length !== 0) {
      // Handle search in local state
      const filtered = localUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);

      // Also dispatch to Redux for consistency
      dispatch(searchUser(searchTerm));
    } else {
      setFilteredUsers(localUsers);
      dispatch(searchUser(""));
    }
  }, [searchTerm, localUsers, dispatch]);

  const Addnewimageuser = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewimage(e.target.files[0]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(e.target.files[0]);
    }
  };

  const handleCloseModal = () => {
    setUsername("");
    setEmail("");
    setShowModal(false);
  };

  const handleEditClick = (userdata) => {
    setShowModal(true);
    setEmail(userdata.email);
    setImage(userdata.image);
    setUsername(userdata.username);
    setCurrentImage(userdata.image);
    setCurrentedit(userdata._id);
  };

  const uploadimage = async (imageFile) => {
    if (!imageFile) {
      console.error("No image provided");
      return null;
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "usermanagement");
    formData.append("cloud_name", "dehzhdpab");

    try {
      console.log("Uploading image to Cloudinary...");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dehzhdpab/image/upload",
        formData
      );

      if (response.status === 200) {
        const imageUrl = response.data.secure_url;
        console.log("Image uploaded successfully:", imageUrl);
        return imageUrl;
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }

    return null;
  };

  const handleUserEdit = async (e) => {
    e.preventDefault();
    console.log("Edit initiated for User ID:", currentEditUser);
  
    if (!username.trim()) {
      console.log("Username validation failed: empty username.");
      toast.error("Username cannot be empty", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
  
    try {
      let imageUrl = currentImage;
      console.log("Current Image:", currentImage);
  
      if (image instanceof File) {
        console.log("Uploading new image...");
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "usermanagement");
        formData.append("cloud_name", "dehzhdpab");
  
        const cloudinaryResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/dehzhdpab/image/upload",
          formData
        );
  
        imageUrl = cloudinaryResponse.data.secure_url;
        console.log("New Image URL:", imageUrl);
      }
  
      const editUserData = {
        username,
        image: imageUrl,
      };
  
      console.log("Sending edit request with data:", editUserData);
  
      const response = await axios.patch(
        `http://localhost:4000/admin/edituser/${currentEditUser}`,
        editUserData,
        { withCredentials: true }
      );
  
      console.log("Edit response:", response);
  
      if (response.status === 200 || response.status === 201) { // Fix: Accept both 200 and 201
        console.log("User updated successfully on the server.");
  
        setLocalUsers((prevUsers) => {
          const updatedUsers = prevUsers.map((user) =>
            user._id === currentEditUser ? { ...user, username, image: imageUrl } : user
          );
          console.log("Updated users after edit:", updatedUsers);
          return updatedUsers;
        });
  
        setFilteredUsers((prevUsers) => {
          const updatedUsers = prevUsers.map((user) =>
            user._id === currentEditUser ? { ...user, username, image: imageUrl } : user
          );
          return updatedUsers;
        });
  
        toast.success("User updated successfully", {
          position: "top-center",
          autoClose: 2000,
        });
  
        setShowModal(false);
        console.log("Modal closed.");
      } else {
        console.log("Unexpected edit response status:", response.status);
      }
    } catch (error) {
      console.error("Edit Error:", error);
      toast.error(error.response?.data?.message || "Failed to update user", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };
  
  

  const handleDelete = async (userid) => {
    console.log("Delete initiated for User ID:", userid);
  
    try {
      const isConfirmed = window.confirm("Are you sure you want to delete this user?");
      if (!isConfirmed) {
        console.log("User deletion cancelled.");
        return;
      }
  
      const response = await axios.delete(
        `http://localhost:4000/admin/deleteuser/${userid}`,
        { withCredentials: true }
      );
  
      console.log("Delete response:", response);
  
      if (response.status === 200 || response.status === 201) { // Fix: Accept both 200 and 201
        console.log("User deleted successfully on the server.");
  
        setLocalUsers((prevUsers) => {
          const updatedUsers = prevUsers.filter((user) => user._id !== userid);
          console.log("Updated user list after deletion:", updatedUsers);
          return updatedUsers;
        });
  
        setFilteredUsers((prevUsers) => {
          const updatedUsers = prevUsers.filter((user) => user._id !== userid);
          return updatedUsers;
        });
  
        toast.success("User deleted successfully", {
          position: "top-center",
          autoClose: 2000,
        });
      } else {
        console.log("Unexpected delete response status:", response.status);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete user", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };
  
  

  const closeadduser = () => {
    setaddmodal(false);
    setUsername("");
    setEmail("");
    setPassword("");
    setNewimage(null);
    setImage(null);
  };

  const handleAdduser = async (e) => {
    e.preventDefault();

    // Comprehensive validation
    if (!username || !email || !password || !newimage) {
      toast.error("Please fill all the fields", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    // Validate using regex
    if (!VALIDATION.username.test(username)) {
      toast.error("Username must be 3-30 letters only", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    if (!VALIDATION.email.test(email)) {
      toast.error("Invalid email format", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    if (!VALIDATION.password.test(password)) {
      toast.error("Password must be 8+ chars, include letters and numbers", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      // Upload the image
      const imageUrl = await uploadimage(newimage);

      if (!imageUrl) {
        toast.error("Failed to upload image", {
          position: "top-center",
          autoClose: 2000,
        });
        return;
      }

      // Create new user data
      const userData = {
        username,
        email,
        password,
        image: imageUrl,
      };

      // Send request to create user
      const response = await axios.post(
        "http://localhost:4000/admin/adduser",
        userData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        const newUser = response.data.user;

        // Update local state directly
        setLocalUsers((prev) => [...prev, newUser]);
        setFilteredUsers((prev) => [...prev, newUser]);

        toast.success("User added successfully", {
          position: "top-center",
          autoClose: 2000,
        });

        // Close modal and reset form
        closeadduser();
      }
    } catch (error) {
      console.error("Error details:", error);

      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "An error occurred", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.error(
          "Failed to add user: " + (error.message || "Unknown error"),
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
      }
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:4000/admin/logout", {
        withCredentials: true,
      });

      if (response.status === 200) {
        toast.success("Logged out successfully", {
          position: "top-center",
          autoClose: 1500,
        });

        // Redirect to login page
        window.location.href = "/admin/";
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  // Determine which user array to display
  const displayUsers = filteredUsers;

  return (
    <>
      <div className="logout-container">
        <Button variant="danger" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <input
        type="text"
        placeholder="search"
        className="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button
        variant="success"
        size="sm"
        className="add-user-button"
        onClick={() => setaddmodal(true)}
      >
        Add New User
      </Button>

      {/* Cards in a Row */}
      <Row className="card-row">
        {displayUsers && displayUsers.length > 0 ? (
          displayUsers.map((user) => (
            <Col md={3} className="card-column" key={user._id}>
              <Card className="user-card">
                <Card.Img
                  variant="top"
                  src={user.image}
                  className="card-image"
                />
                <Card.Body>
                  <Card.Title className="card-title">
                    {user.username}
                  </Card.Title>
                  <Card.Text className="card-text">{user.email}</Card.Text>
                  <div className="button-group">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(user._id)}
                      size="sm"
                      className="ml-2 custom-margin-right"
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <div className="text-center py-3">
              <p>No users found</p>
            </div>
          </Col>
        )}
      </Row>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-input-group">
            <div className="input-field">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                readOnly
                disabled
                className="disabled-input"
              />
              <small className="text-muted">Email cannot be changed</small>
            </div>
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <label htmlFor="image-upload">
              {image ? (
                <img
                  src={
                    typeof image === "string"
                      ? image // Existing image URL
                      : URL.createObjectURL(image) // Newly uploaded image
                  }
                  alt="Uploaded"
                  className="uploaded-image"
                />
              ) : (
                <div className="image-placeholder">
                  <span>Upload Image</span>
                </div>
              )}
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUserEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add User Modal */}
      <Modal show={showadduser} onHide={closeadduser}>
        <Modal.Header closeButton>
          <Modal.Title>ADD NEW USER</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="formUsername">Username</label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              id="formUsername"
              className="form-control"
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="formEmail">Email address</label>
            <input
              type="email"
              id="formEmail"
              className="form-control"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="formPassword">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="formPassword"
              className="form-control"
              placeholder="Enter password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="formImage">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              id="image-upload-new"
              onChange={Addnewimageuser}
              style={{ display: "none" }}
            />
            <label htmlFor="image-upload-new">
              {newimage ? (
                <img
                  src={URL.createObjectURL(newimage)}
                  alt="Uploaded"
                  className="uploaded-image"
                />
              ) : (
                <div className="image-placeholder">
                  <span>Upload Image</span>
                </div>
              )}
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeadduser}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAdduser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </>
  );
}

export default Admhome;
