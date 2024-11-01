import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Hourglass } from "react-loader-spinner";
import Pagination from "@mui/material/Pagination";

import { fetchProfile } from "../Auth/Profile";
import "./Content.scss";
import "../Loading.scss";

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

function RecapsList() {
  const [contentItems, setContentItems] = useState([]);
  // const [recapsDetail, setRecapsDetail] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading as true
  const [profile, setProfile] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // MUI Pagination uses 1-based indexing
  const [review, setReview] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    staffId: "",
    recapVersionId: "",
    comments: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const recapsPerPage = 5;
  const maxLength = 150;

  const fetchRecaps = async () => {
    try {
      const response = await axios.get(
        "https://160.25.80.100:7124/api/recap/Getallrecap",
        {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const recaps = response.data.data.$values;
      console.log("Recaps: ", recaps);

      // Process each recap to get version status and contributor
      const updatedRecaps = await Promise.all(
        recaps.map(async (recap) => {
          let updatedRecap = { ...recap };

          // Initial check for status from recapVersions array
          if (
            recap.recapVersions?.$values &&
            recap.recapVersions.$values.length > 0
          ) {
            updatedRecap.currentVersionStatus =
              recap.recapVersions.$values[0].status;
            updatedRecap.recapVersionId = recap.recapVersions.$values[0].id;
            // console.log("recapVersionId: ", updatedRecap.recapVersionId);
          } else {
            updatedRecap.currentVersionStatus = "No Version";
            updatedRecap.recapVersionId = "No ID";
          }

          // Fetch version status from currentVersionId if available
          if (recap.currentVersionId) {
            try {
              const versionData = await fetchRecapVersion(
                recap.currentVersionId
              );
              if (versionData.data?.status) {
                updatedRecap.currentVersionStatus = versionData.data.status; // Overwrite with current version status if available
              }
              // console.log("Recap Version Data for ID", recap.currentVersionId, versionData);
            } catch (versionError) {
              console.log("Error fetching recap version:", versionError);
            }
          }

          // Fetch contributor
          if (recap.userId) {
            try {
              const contributorData = await fetchContributor(recap.userId);
              updatedRecap.contributor = contributorData.data;
            } catch (contributorError) {
              console.log("Error fetching contributor:", contributorError);
              updatedRecap.contributor = { fullName: "Unknown" };
            }
          } else {
            updatedRecap.contributor = { fullName: "Unknown" };
          }

          return updatedRecap;
        })
      );

      setContentItems(updatedRecaps);
    } catch (error) {
      console.log("Error fetching data, using sample data as fallback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecaps();
    fetchReview();
  }, []);

  useEffect(() => {
    fetchProfile(token, (profileData) => {
      setProfile(profileData);
      setReviewForm((prevForm) => ({
        ...prevForm,
        staffId: profileData.id, // Cập nhật staffId vào form review
      }));
    });
  }, [token]);

  // Fetch version details
  const fetchRecapVersion = async (currentVersionId) => {
    try {
      const response = await axios.get(
        `https://160.25.80.100:7124/version/${currentVersionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("Recap Version: ", response.data);

      return response.data;
    } catch (error) {
      console.log("Error Fetching currentVersionId: ", error);
    }
  };

  const fetchContributor = async (userId) => {
    try {
      const response = await axios.get(
        `https://160.25.80.100:7124/api/users/get-user-account-byID?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("Contributor: ", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user account: ", error);
      return null; // Handle the error accordingly
    }
  };

  const createReview = async (recapVersionId) => {
    try {
      const newReview = {
        staffId: reviewForm.staffId,
        recapVersionId: recapVersionId,
        comments: "Chưa Đạt",
      };

      const response = await axios.post(
        "https://160.25.80.100:7124/api/review/createreview",
        newReview,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const reviewId = response.data.data?.id;
      if (reviewId) {
        console.log("Review created successfully:", response.data);
        navigate(`/review/content_version/${reviewId}`);
      } else {
        console.error("Review created but ID not found.");
      }
    } catch (error) {
      console.error("Error creating review:", error);
    }
  };

  const fetchReview = async () => {
    try {
      const response = await axios.get(
        `https://160.25.80.100:7124/api/review/getallreview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const reviews = response.data.data.$values;
      console.log("Reviews: ", reviews);
      setReview(reviews);
    } catch (error) {
      console.error("Error fetching review:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <Hourglass
          visible={true}
          height="80"
          width="80"
          ariaLabel="hourglass-loading"
          wrapperStyle={{}}
          wrapperClass=""
          colors={["#306cce", "#72a1ed"]}
        />
      </div>
    );
  }

  //Filter
  const filteredRecaps = contentItems.filter((item) => {
    const search = item.book?.title
      .toLowerCase()
      .includes(searchQuery.toLocaleLowerCase());
    const status = selectedStatus
      ? item.currentVersionStatus === parseInt(selectedStatus)
      : true;
    return search && status;
  });

  const displayRecaps = filteredRecaps.slice(
    (currentPage - 1) * recapsPerPage,
    currentPage * recapsPerPage
  );
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="content-container">
      <div>
        <h2>Nội dung của Contributor</h2>
      </div>
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Tìm theo cuốn sách..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="">Tất cả</option>
          <option value="1">Pending</option>
          <option value="2">Approved</option>
          <option value="3">Reject</option>
        </select>
      </div>
      <div className="content-list">
        <table className="content-table">
          <thead>
            <tr>
              <th>Tên bản Recap</th>
              <th>Tên cuốn sách</th>
              <th>Mô tả cuốn sách</th>
              <th>Tên Contributor</th>
              <th>Ngày</th>
              <th>Duyệt nội dung</th>
              <th>Chi tiết bản duyệt</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {displayRecaps.map((val) => (
              <tr key={val.id}>
                <td>{val.name}</td>
                <td>{val.book?.title}</td>
                <td>{truncateText(val.book?.description, maxLength)}</td>
                <td>{val.contributor?.fullName}</td>
                <td>{new Date(val.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="button"
                    style={{ backgroundColor: "green", color: "#fff" }}
                    onClick={() => createReview(val.recapVersionId)}
                  >
                    Tạo Review
                  </button>
                </td>
                <td>
                  {review
                    .filter((rev) => rev.recapVersionId === val.recapVersionId)
                    .map((rev) => (
                      <button
                        key={rev.id}
                        className="button"
                        style={{
                          backgroundColor: "#007bff",
                          color: "#fff",
                          marginLeft: 5,
                        }}
                        onClick={() =>
                          navigate(`/review/content_version/${rev.id}`)
                        }
                      >
                        Xem Review
                      </button>
                    ))}
                </td>
                <td>
                  {val.currentVersionStatus === 1 ? (
                    <button
                      className="role-container"
                      style={{ backgroundColor: "#007bff" }}
                    >
                      Pending
                    </button>
                  ) : val.currentVersionStatus === 2 ? (
                    <button
                      className="role-container"
                      style={{ backgroundColor: "green" }}
                    >
                      Approved
                    </button>
                  ) : val.currentVersionStatus === 3 ? (
                    <button
                      className="role-container"
                      style={{ backgroundColor: "red" }}
                    >
                      Reject
                    </button>
                  ) : (
                    <button
                      className="role-container"
                      style={{ backgroundColor: "#5e6061" }}
                    >
                      Unknow
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        className="center"
        count={Math.ceil(contentItems.length / recapsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        showFirstButton
        showLastButton
        sx={{
          "& .MuiPaginationItem-root": {
            color: isDarkMode ? "#fff" : "#000", // Change text color based on theme
            backgroundColor: isDarkMode ? "#555" : "#f0f0f0", // Button background color based on theme
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: isDarkMode ? "#306cce" : "#72a1ed", // Change color of selected page button
            color: "#fff", // Ensure selected text is white for contrast
          },
          "& .MuiPaginationItem-root.Mui-selected:hover": {
            backgroundColor: isDarkMode ? "#2057a4" : "#5698d3", // Color on hover for selected button
          },
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: isDarkMode ? "#666" : "#e0e0e0", // Color on hover for non-selected buttons
          },
        }}
      />
    </div>
  );
}

export default RecapsList;
