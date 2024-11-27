import React, { useState, useEffect } from "react";
import axios from "axios";
import "../SubcriptionHistory/SubcriptionHistory.scss"; // Thêm file CSS để đảm bảo giao diện giống ảnh thiết kế

const SubscriptionHistory = () => {
  const [userId, setUserId] = useState("");
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const accessToken = localStorage.getItem("authToken");

  const fetchUserId = async () => {
    try {
      const response = await axios.get("https://160.25.80.100:7124/api/personal/profile", {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userId = response.data.id;
      setUserId(userId);
      return userId;
    } catch (err) {
      console.error("Error fetching user ID:", err);
      setError("Failed to fetch user ID");
      setLoading(false);
    }
  };

  const fetchSubscriptionHistory = async (id) => {
    try {
      const response = await axios.get(
        `https://160.25.80.100:7124/api/subscription/gethistorysubscription/${id}`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSubscriptionData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching subscription data:", err);
      setError("No subcription history available");
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const id = await fetchUserId();
      if (id) {
        await fetchSubscriptionHistory(id);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error"> {error}</div>;

  return (
    <div className="subscription-history">
      <h1 className="title">Subscription History</h1>

      {/* Hiển thị gói hiện tại */}
      {subscriptionData?.currentSubscription && (
        <div className="current-subscription">
          <h2>Current Subscription</h2>
          <div className="subscription-details">
            <div>
              <p><strong>Package Name:</strong> {subscriptionData.currentSubscription.packageName}</p>
              <p><strong>Start Date:</strong> {subscriptionData.currentSubscription.startDate}</p>
              <p><strong>End Date:</strong> {subscriptionData.currentSubscription.endDate}</p>
            </div>
            <div>
              <p><strong>Price:</strong> {subscriptionData.currentSubscription.price} VND</p>
              <p><strong>Expected Views:</strong> {subscriptionData.currentSubscription.expectedViewsCount}</p>
              <p><strong>Actual Views:</strong> {subscriptionData.currentSubscription.actualViewsCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị lịch sử subscription */}
      <h2 className="history-title">History Subscriptions</h2>
      {subscriptionData?.historySubscriptions?.$values.length > 0 ? (
        <table className="history-table">
          <thead>
            <tr>
              <th>Package Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Price (VND)</th>
              <th>Expected Views</th>
              <th>Actual Views</th>
            </tr>
          </thead>
          <tbody>
            {subscriptionData.historySubscriptions.$values.map((history, index) => (
              <tr key={index}>
                <td>{history.packageName}</td>
                <td>{history.startDate}</td>
                <td>{history.endDate}</td>
                <td>{history.price}</td>
                <td>{history.expectedViewsCount}</td>
                <td>{history.actualViewsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No history subscriptions available.</p>
      )}
    </div>
  );
};

export default SubscriptionHistory;
