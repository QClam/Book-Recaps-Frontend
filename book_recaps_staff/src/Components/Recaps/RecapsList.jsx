import React, { useState, useEffect } from "react";
import axios from "axios";
// import { sampleData } from './ContentItems';
import { Link, useNavigate } from "react-router-dom";
import { Hourglass } from "react-loader-spinner";

import { fetchProfile } from "../Auth/Profile";
import "./Content.scss";
import "../Loading.scss";

// function truncateText(text, maxLength) {
//   if (text.length > maxLength) {
//     return text.substring(0, maxLength) + '...';
//   }
//   return text;
// }

function RecapsList() {
  const [contentItems, setContentItems] = useState([]);
  // const [recapsDetail, setRecapsDetail] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading as true
  const [profile, setProfile] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    staffId: "",
    recapVersionId: "",
    comments: "",
  });

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

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

      // Call fetchRecapVersion and fetchContributor for each recap to get its current version status
      const updatedRecaps = await Promise.all(
        recaps.map(async (recap) => {
          let updatedRecap = { ...recap };

          // Fetch version status
          if (recap.currentVersionId) {
            const versionData = await fetchRecapVersion(recap.currentVersionId);
            updatedRecap.currentVersionStatus =
              versionData.data?.status || "Unknown";
          } else {
            updatedRecap.currentVersionStatus = "No Version";
          }

          // Fetch contributor data
          if (recap.userId) {
            const contributorData = await fetchContributor(recap.userId);
            updatedRecap.contributor = contributorData.data;
          } else {
            updatedRecap.contributor = { fullName: "Unknown" };
          }

          return updatedRecap;
        })
      );

      setContentItems(updatedRecaps); // Set the updated recaps with version status
    } catch (error) {
      console.log("Error fetching data, using sample data as fallback:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecaps();
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
      console.log("Contributor: ", response.data);
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
        comments: "Hiện chưa có comment",
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
        navigate(`/review/content_version/${reviewId}`, 
        );
      } else {
        console.error("Review created but ID not found.");
      }
    } catch (error) {
      console.error("Error creating review:", error);
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

  return (
    <div className="content-container">
      <div>
        <h2>Nội dung của Contributor</h2>
      </div>
      <div className="content-list">
        <table className="content-table">
          <thead>
            <tr>
              <th>Chủ đề</th>
              <th>Mô tả cuốn sách</th>
              <th>Tên Contributor</th>
              <th>Ngày</th>
              <th>Duyệt nội dung</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {contentItems.map((val) => (
              <tr key={val.id}>
                <td>{val.book?.title}</td>
                <td>{val.book?.description}</td>
                <td>{val.contributor?.fullName}</td>
                <td>{new Date(val.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="button"
                    style={{ backgroundColor: "green", color: "#fff" }}
                    onClick={() => createReview(val.currentVersionId, val.currentVersionStatus, val.book?.title, val.book?.description)}
                  >
                    Duyệt
                  </button>
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
    </div>
  );
}

export default RecapsList;
