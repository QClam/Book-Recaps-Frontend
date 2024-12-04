import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView } from "react-native";
import api from "../../utils/AxiosInterceptors";

const SubscriptionHistory = () => {
  const [userId, setUserId] = useState("");
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserId = async () => {
    try {
      const response = await api.get("/api/personal/profile");
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
      const response = await api.get(`/api/subscription/gethistorysubscription/${id}`);
      setSubscriptionData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching subscription data:", err);
      setError("No subscription history available");
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

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lịch sử gói đăng ký</Text>

      {/* Current Subscription */}
      {subscriptionData?.currentSubscription && ( 
  <View style={styles.currentSubscription}>
    <Text style={styles.subtitle}>Gói đăng ký hiện tại</Text>
    <View style={styles.subscriptionDetails}>
      <Text>
        <Text style={styles.bold}>Tên gói:</Text> {subscriptionData.currentSubscription.packageName}
      </Text>
      <Text>
        <Text style={styles.bold}>Ngày bắt đầu:</Text> {subscriptionData.currentSubscription.startDate}
      </Text>
      <Text>
        <Text style={styles.bold}>Ngày kết thúc:</Text> {subscriptionData.currentSubscription.endDate}
      </Text>
      <Text>
      <Text style={styles.bold}>Giá:</Text> {parseInt(subscriptionData.currentSubscription.price).toLocaleString('vi-VN')} VND
      </Text>
      <Text>
        <Text style={styles.bold}>Số lượt xem dự kiến:</Text> {subscriptionData.currentSubscription.expectedViewsCount}
      </Text>
      <Text>
        <Text style={styles.bold}>Số lượt xem thực tế:</Text> {subscriptionData.currentSubscription.actualViewsCount}
      </Text>
    </View>
  </View>
)}

{/* Lịch sử gói đăng ký */}
<Text style={styles.subtitle}>Lịch sử gói đăng ký</Text>
{subscriptionData?.historySubscriptions?.$values.length > 0 ? (
  <FlatList
    data={subscriptionData.historySubscriptions.$values}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) => (
      <View style={styles.historyItem}>
        <Text>
          <Text style={styles.bold}>Tên gói:</Text> {item.packageName}
        </Text>
        <Text>
          <Text style={styles.bold}>Ngày bắt đầu:</Text> {item.startDate}
        </Text>
        <Text>
          <Text style={styles.bold}>Ngày kết thúc:</Text> {item.endDate}
        </Text>
        <Text>
        <Text style={styles.bold}>Giá:</Text> {parseInt(item.price).toLocaleString('vi-VN')} VND
        </Text>
        <Text>
          <Text style={styles.bold}>Số lượt xem dự kiến:</Text> {item.expectedViewsCount}
        </Text>
        <Text>
          <Text style={styles.bold}>Số lượt xem thực tế:</Text> {item.actualViewsCount}
        </Text>
      </View>
    )}
  />
) : (
  <Text>Không có lịch sử gói đăng ký nào.</Text>
)}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  bold: {
    fontWeight: "bold",
  },
  currentSubscription: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
  },
  subscriptionDetails: {
    marginTop: 8,
  },
  historyItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default SubscriptionHistory;
