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
          console.error('Error fetching playlists:', err);
          setError('Failed to fetch playlists.');
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
      await api.delete(`/api/playlists/deleteplaylistitem/${playlistItemId}`);
      const updatedPlaylists = playlists.map((playlist) => ({
        ...playlist,
        playListItems: {
          $values: playlist.playListItems.$values.filter(
            (item) => item.id !== playlistItemId
          ),
        },
      }));
      setPlaylists(updatedPlaylists);
    } catch (err) {
      console.error('Error deleting item:', err);
      Alert.alert('Error', 'Failed to delete item.');
    }
  };

  const handleBookClick = (recapId) => {
    navigation.navigate('RecapDetail', { recapId });
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
      <Text style={styles.title}>My Playlists</Text>
      {playlists.length === 0 ? (
        <Text>No playlists found.</Text>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: playlist }) => (
            <View style={styles.playlist}>
              <View style={styles.playlistHeader}>
                <Text style={styles.playlistName}>
                  Playlist Name: {playlist.playListName}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeletePlaylist(playlist.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
              {playlist.playListItems.$values.length === 0 ? (
                <Text>No books in this playlist.</Text>
              ) : (
                <FlatList
                  data={playlist.playListItems.$values}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    const book = books.find((book) =>
                      book.recaps.$values.some(
                        (recap) => recap.id === item.recapId
                      )
                    );

                    return (
                      <View style={styles.bookItem}>
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => handleBookClick(item.recapId)}
                        >
                          {book ? (
                            <>
                              <Image 
                                  source={
                                      book.coverImage 
                                      ? { uri: book.coverImage } 
                                      : defaultImage
                                  }
                                  style={styles.bookImage}
                              />

                              <View style={styles.bookInfo}>
                                <Text style={styles.bookTitle}>
                                  {book.title}
                                </Text>
                                <Text style={styles.bookAuthor}>
                                  {book.authors.$values
                                    .map((author) => author.name)
                                    .join(', ')}
                                </Text>
                              </View>
                            </>
                          ) : (
                            <Text>No book information available.</Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(item.id)}
                        >
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
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
  bookImage: {
    width: 50,
    height: 75,
    marginRight: 8,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 12,
    color: '#666',
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
