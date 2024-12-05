import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../../utils/AxiosInterceptors';
import { useNavigation } from '@react-navigation/native'; // Navigation for React Native
import defaultImage from '../../assets/empty-image.png';

const History = () => {
  const [userId, setUserId] = useState('');
  const [recapData, setRecapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigation = useNavigation(); // Initialize navigation
  
  // Fetch User ID using the new API instance
  const fetchUserId = async () => {
    try {
      const response = await api.get('/api/personal/profile');
      const id = response.data.id;
      setUserId(id);
      return id;
    } catch (err) {
      console.error('Error fetching user ID:', err);
      setError('Unable to fetch user ID');
      setLoading(false);
    }
  };

  // Fetch recap data using the new API instance
  const fetchRecapData = async (id) => {
    try {
      const response = await api.get(`/api/viewtracking/getviewtrackingbyuserid/${id}?pageNumber=1&pageSize=10`);
      const recaps = response.data.data.data.$values;
      const uniqueRecaps = Array.from(
        recaps
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt descending
          .reduce((map, recap) => map.set(recap.recapName, recap), new Map())
          .values()
      );

      setRecapData(uniqueRecaps);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recap data:', err);
      setError('Unable to fetch recap data');
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      const id = await fetchUserId();
      if (id) {
        await fetchRecapData(id);
      }
    };
    getUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderRecapItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate('RecapDetail', { bookId: item.book.bookId })}>
      <Image 
                                  source={
                                      item.book.coverImage
                                      ? { uri: item.book.coverImage } 
                                      : defaultImage
                                  }
                                  style={styles.thumbnail}
                              />

      </TouchableOpacity>
      <View style={styles.details}>
        <Text style={styles.title}>{item.recapName}</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Tiêu đề: </Text>{item.book.title}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Tên gốc: </Text>{item.book.originalTitle}
        </Text>
        
        <Text style={styles.text}>
          <Text style={styles.bold}>Tác giả: </Text>{item.book.authors.$values.join(', ')}
        </Text>
        
       
        <View style={styles.meta}>
          <Text style={styles.text}>
            <Text style={styles.bold}>Thích: </Text>{item.likesCount}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Lượt xem: </Text>{item.viewsCount}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lịch sử người dùng</Text>
      <FlatList
        data={recapData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderRecapItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 100,
    height: 150,
  },
  details: {
    flex: 1,
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default History;
