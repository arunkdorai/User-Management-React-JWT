import React, { useState, useEffect } from "react";
import "./Home.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { addusers, clearuser } from "../../Store/Useraction";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
function Home() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState(null);
  const data = useSelector((store) => store.userdata.costomer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      navigate("/login", { replace: true });
    } else {
      // Push a new state to prevent going back
      window.history.pushState(null, null, window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, null, window.location.href);
      };

      // Add event listener to prevent back navigation
      window.addEventListener("popstate", handlePopState);

      // Cleanup the event listener on component unmount
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [navigate]);

  const storedata = useSelector((store) => store.userdata.costomer);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!storedata || storedata.length === 0) {
          const response = await axios.get("http://localhost:4000/userdata", {
            withCredentials: true,
          });
          const userdetails = response.data.userData;
          if (userdetails) {
            dispatch(addusers(userdetails));
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchUserData();
  }, [dispatch, storedata]);

  useEffect(() => {
    if (storedata && storedata[0]) {
      setUsername(storedata[0].username || "");
      setEmail(storedata[0].email || "");
      setImage(storedata[0].image || null);
    }
  }, [storedata]);

  const [showModal, setShowModal] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(e.target.files[0]);
    }
  };
  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (storedata && storedata[0]) {
      setUsername(storedata[0].username || "");
      setEmail(storedata[0].email || "");
      setImage(storedata[0].image || null);
    }
    setShowModal(false);
  };

  const uploadimage = async () => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "usermanagement");
    formData.append("cloud_name", "dehzhdpab");
    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dehzhdpab/image/upload",
        formData
      );
      if (response.status == 200) {
        const imageUrl = response.data.secure_url; // Get secure URL of the uploaded image
        return imageUrl;
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleSave = async () => {
    const nameregex = /^[A-Za-z ]+$/;

    if (!nameregex.test(username)) {
      toast.info("Please enter a valid username", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    // Using the email from the store data to ensure it doesn't change
    const userEmail = storedata[0] ? storedata[0].email : "";

    const newimageurl = await uploadimage();

    const editeduser = {
      username,
      email: userEmail, // Always use the original email from the store
      image: newimageurl,
    };

    try {
      const response = await axios.patch(
        "http://localhost:4000/edituser",
        editeduser,
        {
          withCredentials: true,
        }
      );

      const editerData = response.data.user;

      dispatch(clearuser());
      dispatch(addusers(editerData));

      toast.success("You have edited the details", {
        position: "top-center",
        autoClose: 2000,
      });

      setShowModal(false);
    } catch (error) {
      console.log(error);
      toast.error(error.message || "An error occurred", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const handleLogoutClick = () => {
    Cookies.remove("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="home-container">
      <h1>User Details</h1>
      <div className="user-details">
        <img
          src={data[0] ? data[0].image : null}
          alt="User"
          className="user-image"
        />
        <p>
          <strong>Username: </strong>
          {storedata[0] ? storedata[0].username : null}
        </p>
        <p>
          <strong>Email: </strong>
          {storedata[0] ? storedata[0].email : null}
        </p>
        <button onClick={handleEditClick} className="edit-btn">
          Edit
        </button>
        <button onClick={handleLogoutClick} className="logout-btn">
          Logout
        </button>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit User Details</h2>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={email}
              disabled={true}
              className="disabled-input"
            />
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <label htmlFor="image-upload" style={{ cursor: "pointer" }}>
              {image ? (
                // Show uploaded image or existing image
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
                // Placeholder for image upload
                <div className="image-placeholder">
                  <span>Upload Image</span>
                </div>
              )}
            </label>
            <button onClick={handleSave} className="save-btn">
              Save
            </button>
            <button onClick={handleCloseModal} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default Home;
