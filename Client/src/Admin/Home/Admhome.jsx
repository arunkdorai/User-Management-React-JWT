import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Modal } from "react-bootstrap";
import "./Admin.css";
import { useDispatch, useSelector } from "react-redux";
import { addallusers, searchUser } from "../../Store/Adminaction";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

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

    const nameregex = /^[A-Za-z ]+$/;

    if (!nameregex.test(username)) {
      toast.info("Please enter a valid username", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      let imageUrl = currentImage; // Default to current image

      // Only upload if the image has changed (is a File object)
      if (image instanceof File) {
        imageUrl = await uploadimage(image);
        if (!imageUrl) {
          toast.error("Failed to upload image", {
            position: "top-center",
            autoClose: 2000,
          });
          return;
        }
      }

      const editUserdata = {
        username,
        email, // Use the email from state (which should be readonly)
        image: imageUrl,
      };

      const response = await axios.patch(
        `http://localhost:4000/admin/edituser/${currentEditUser}`,
        editUserdata,
        {
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        const updatedUser = response.data.edituser;

        // Update local state directly
        setLocalUsers((prev) =>
          prev.map((user) =>
            user._id === updatedUser._id ? updatedUser : user
          )
        );

        toast.success("Successfully updated user", {
          position: "top-center",
          autoClose: 1500,
        });

        setShowModal(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "An error occurred", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const handleDelete = async (userid) => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/admin/deleteuser/${userid}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        // Update local state directly
        setLocalUsers((prev) => prev.filter((user) => user._id !== userid));

        toast.success(response.data.message || "User deleted successfully", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "An error occurred", {
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

    if (!username || !email || !password || !newimage) {
      toast.error("Please fill all the fields", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    const nameregex = /^[A-Za-z ]+$/;
    const emailregex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordregex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#$%^&*]{8,}$/;

    if (
      !nameregex.test(username) ||
      !emailregex.test(email) ||
      !passwordregex.test(password)
    ) {
      toast.error("Validation failed. Please enter valid details.", {
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
