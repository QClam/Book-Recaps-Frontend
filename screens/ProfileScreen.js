import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/AxiosInterceptors';

const ProfileScreen = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscriptionPackageName, setSubscriptionPackageName] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {


                const response = await api.get('/api/personal/profile'); // Sử dụng API
                const data = response.data;
                setProfile(data);
                setLoading(false);

                if (data.subscriptions?.$values?.length > 0) {
                    const subscriptionPackageId = data.subscriptions.$values[0].subscriptionPackageId;
                    fetchSubscriptionPackage(subscriptionPackageId);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setLoading(false);
            }
        };

        const fetchSubscriptionPackage = async (subscriptionPackageId) => {
            try {
                const response = await api.get(
                    `/api/subscriptionpackages/getpackagebyid/${subscriptionPackageId}`
                );
                const packageData = response.data;
                if (packageData?.data) {
                    setSubscriptionPackageName(packageData.data.name);
                }
            } catch (error) {
                console.error('Error fetching subscription package:', error);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{profile.userName || 'N/A'}</Text>
            {profile ? (
                <View style={styles.infoGroup}>
                    {profile.imageUrl && profile.imageUrl.trim() !== '' ? (
                        <Image
                            source={{ uri: profile.imageUrl }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <Image
                            source={require('../assets/icon.png')} // Hình ảnh mặc định
                            style={styles.profileImage}
                        />
                    )}
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Họ & Tên: </Text>
                        <Text style={styles.value}>{profile.fullName || 'Chưa thiết lập'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{profile.email || 'Chưa thiết lập'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Địa chỉ:</Text>
                        <Text style={styles.value}>{profile.address || 'Chưa thiết lập'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Số điện thoại:</Text>
                        <Text style={styles.value}>{profile.phoneNumber || 'Chưa thiết lập'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Giới tính:</Text>
                        <Text style={styles.value}>
                            {profile.gender === 0
                                ? 'Female'
                                : profile.gender === 1
                                    ? 'Male'
                                    : 'Other'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Ngày sinh:</Text>
                        <Text style={styles.value}>
                            {profile.birthDate
                                ? new Date(profile.birthDate).toLocaleDateString()
                                : 'Chưa thiết lập'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Gói đăng ký:</Text>
                        <Text style={styles.value}>
                            {subscriptionPackageName || 'No subscription'}
                        </Text>
                    </View>
                </View>
            ) : (
                <Text>Unable to load profile data.</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoGroup: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center', // Đảm bảo căn chỉnh theo chiều dọc
        justifyContent: 'space-between', // Đưa label và giá trị cách nhau
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#555',
        flex: 1, // Đảm bảo label chiếm 1 phần cân đối
        textAlign: 'left',
    },
    value: {
        fontSize: 16,
        color: '#333',
        flex: 2, // Giá trị sẽ chiếm nhiều không gian hơn
        textAlign: 'right',
    },
});



export default ProfileScreen;
