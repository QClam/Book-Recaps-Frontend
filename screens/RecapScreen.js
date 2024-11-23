import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/AxiosInterceptors';


// Function to resolve $refs in the data
const resolveRefs = (data) => {
  const refMap = new Map();
  const createRefMap = (obj) => {
    if (typeof obj !== "object" || obj === null) return;
    if (obj.$id) {
      refMap.set(obj.$id, obj);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        createRefMap(obj[key]);
      }
    }
  };
  const resolveRef = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    if (obj.$ref) {
      return refMap.get(obj.$ref);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = resolveRef(obj[key]);
      }
    }
    return obj;
  };
  createRefMap(data);
  return resolveRef(data);
};

const RecapScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      // Fetching books using the configured api instance
      const response = await api.get('/api/book/getallbooks');
      const data = resolveRefs(response.data);

      if (data && data.succeeded && Array.isArray(data.data.$values)) {
        setBooks(data.data.$values);
      } else {
        console.error('Data is not an array:', data);
        setBooks([]);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('Unauthorized. Trying to refresh token...');
        await handleTokenRefresh();
      } else {
        setError(error.message);
        console.error('Error fetching books:', error);
      }
    }
  };

  const handleTokenRefresh = async () => {
    try {
      // Use the refresh token functionality from api.js
      const newAccessToken = await api.post("/refresh-token");
      if (newAccessToken) {
        // Token refreshed, try fetching books again
        fetchBooks();
      } else {
        setError("Session expired. Please log in again.");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Session expired. Please log in again.");
    }
  };

  const handleBookClick = (book) => {
    navigation.navigate('RecapDetail', { bookId: book.id });
};


  const displayedBooks = showAll ? books : books.slice(0, 12);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Book</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.bookGrid}>
        {Array.isArray(displayedBooks) && displayedBooks.length > 0 ? (
          displayedBooks.map((book) => (
            <TouchableOpacity key={book.id} style={styles.bookCard} onPress={() => handleBookClick(book)}>
              <Image source={{ uri: book.coverImage }} style={styles.bookCover} />
              <Text style={styles.bookTitle}>
                {book.title.length > 26 ? `${book.title.slice(0, 26)}\n${book.title.slice(26)}` : book.title}
              </Text>
              {book.authors && book.authors.$values.length > 0 && (
                <Text style={styles.bookAuthor}>
                  {book.authors.$values[0].name}
                </Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noBooks}>No books available</Text>
        )}
      </View>
      {books.length > 8 && !showAll && (
        <Button title="See more" onPress={() => setShowAll(true)} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookCard: {
    width: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookCover: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
  },
  noBooks: {
    fontSize: 16,
    color: '#999',
  },
});

export default RecapScreen;
