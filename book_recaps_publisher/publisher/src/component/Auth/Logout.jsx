// Logout.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Logout() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Make the logout request to the API
      const response = await axios.post("https://160.25.80.100:7124/api/logout", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Include the auth token if necessary
        },
      });

      // Clear tokens from local storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");

      console.log("Logout Successful:", response.data);
      navigate("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Đăng xuất thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="logout-container">
      <h2>Đăng xuất</h2>
      <button onClick={handleLogout}>Đăng xuất</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Logout;
