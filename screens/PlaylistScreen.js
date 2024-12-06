import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/AxiosInterceptors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import defaultImage from '../assets/empty-image.png';

const PlaylistScreen = () => {
  const [playlists, setPlaylists] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Fetch playlists và dữ liệu liên quan mỗi khi vào trang
      const fetchPlaylists = async () => {
        setIsLoading(true); // Hiển thị loading
        try {
          const response = await api.get('/api/playlists/my-playlists');
          const data = response.data.data.$values;
  
          if (Array.isArray(data)) {
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPlaylists(data);
            await fetchBooks();
          } else {
            setError('Invalid data format received from API.');
          }
        } catch (err) {
          //console.error('Không có Playlist');
          //setError('Không có Playlist');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchPlaylists(); // Gọi hàm fetch data
    });
  
    return unsubscribe; // Cleanup listener khi unmount
  }, [navigation]);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/api/book/getallbooks');
      const bookData = response.data.data.$values;
      setBooks(bookData);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to fetch books.');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await api.delete(`/api/playlists/deleteplaylist/${playlistId}`);
      setPlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
    } catch (err) {
      console.error('Error deleting playlist:', err);
      Alert.alert('Error', 'Failed to delete playlist.');
    }
  };

const handleDelete = async (playlistItemId) => {
  try {
    // Log dữ liệu trước khi xóa
    console.log('Before deletion - Playlists:', playlists);

    // Gọi API để xóa playlist item
    await api.delete(`/api/playlists/deleteplaylistitem/${playlistItemId}`);
    
    // Cập nhật lại playlists sau khi xóa item
    const updatedPlaylists = playlists.map((playlist) => {
      // Kiểm tra nếu playlist có playListItems.$values
      if (playlist.playListItems && playlist.playListItems.$values) {
        const updatedItems = playlist.playListItems.$values.filter(
          (item) => item.playlistItemId !== playlistItemId // Loại bỏ item có playlistItemId khớp
        );

        return {
          ...playlist,
          playListItems: {
            ...playlist.playListItems,
            $values: updatedItems // Cập nhật lại playListItems.$values
          }
        };
      }

      return playlist; // Trả về playlist nếu không có playListItems
    });

    // Log dữ liệu sau khi xóa
    console.log('After deletion - Updated Playlists:', updatedPlaylists);

    // Cập nhật lại state với danh sách playlists đã được cập nhật
    setPlaylists(updatedPlaylists);

  } catch (err) {
    console.error('Error deleting item:', err);
    Alert.alert('Error', 'Failed to delete item.');
  }
};

  

  const handleBookClick = (recapId) => {
    navigation.navigate("RecapItemDetail", { recapId });
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.error}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách phát của tôi</Text>
      {playlists.length === 0 ? (
        <Text>No playlists found.</Text>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}

          renderItem={({ item: playlist }) => (
            <View style={styles.playlist}>
              <View style={styles.playlistHeader}>
                <Text style={styles.playlistName}>
                Tên playlist: {playlist?.playListName || 'Unknown Playlist'}

                </Text>
                {/* <TouchableOpacity onPress={() => handleDeletePlaylist(playlist?.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                  <Icon
                  name="delete"
                  size={24}
                  color="#FF0000"
                  style={styles.deleteIcon}
                />

                </TouchableOpacity> */}
              </View>
              {playlist?.playListItems?.$values?.length === 0 ? (

                <Text>No books in this playlist.</Text>
              ) : (
                <FlatList
                data={playlist.playListItems.$values || []}

                  keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}

                  renderItem={({ item }) => {
                    const book = books.find((book) =>
                      book.recaps?.$values?.some((recap) => recap.id === item?.recapId)
                    );
                  return (
                      <View style={styles.bookItem}>
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => handleBookClick(item?.recapId)}

                        >
                          {book ? (
                            <>
                            <View style={styles.con}>
                              <Image 
                                  source={
                                      book.coverImage 
                                      ? { uri: book.coverImage } 
                                      : defaultImage
                                  }
                                  style={styles.bookImage}
                              />

                              <View style={styles.bookInfo}>
                              <Text style={styles.bookTitle}>{book.title || 'Unknown Title'}</Text>
                              <Text style={styles.bookAuthor}>
                                {book.authors?.$values
                                  ?.map((author) => author.name)
                                  ?.join(', ') || 'Unknown Authors'}
                              </Text>
                              </View>
                            </View>
                            </>
                          ) : (
                            <Text>No book information available.</Text>
                          )}
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => handleDelete(item?.id)}>
                        <Text style={styles.deleteText}>Delete</Text>
                        <Icon
                            name="delete"
                            size={20}
                            color="#FF0000"
                            style={styles.deleteIcon}
                          />

                      </TouchableOpacity> */}

                      </View>
                    );
                  }}
                />
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  playlist: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 8,
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteText: {
    color: 'red',
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  con: {
    flexDirection: 'row', // Sắp xếp các phần tử theo hàng ngang
    alignItems: 'center', // Căn giữa theo trục dọc
    padding: 10, // Khoảng cách bên trong
    backgroundColor: '#fff', // Màu nền (tùy chỉnh theo ý muốn)
    borderRadius: 8, // Bo góc (tùy chỉnh)
    marginBottom: 10, // Khoảng cách giữa các mục
  },
  bookImage: {
    width: 80, // Chiều rộng của hình ảnh
    height: 120, // Chiều cao của hình ảnh
    borderRadius: 5, // Bo góc hình ảnh
    marginRight: 15, // Khoảng cách giữa hình ảnh và thông tin
  },
  bookInfo: {
    flex: 1, // Cho phép phần thông tin chiếm phần còn lại của không gian
  },
  bookTitle: {
    fontSize: 16, // Kích thước chữ cho tiêu đề
    fontWeight: 'bold', // Chữ đậm cho tiêu đề
    color: '#333', // Màu chữ (tùy chỉnh)
    marginBottom: 5, // Khoảng cách bên dưới tiêu đề
  },
  bookAuthor: {
    fontSize: 14, // Kích thước chữ cho tác giả
    color: '#555', // Màu chữ (tùy chỉnh)
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlaylistScreen;
