import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import api from '../../utils/AxiosInterceptors';
import defaultImage from '../../assets/empty-image.png';

const RecapDetail = ({ route, navigation }) => {
  const { bookId } = route.params;
  const [book, setBook] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookDetail();
  }, [bookId]);

  const fetchBookDetail = async () => {
    try {
      const response = await api.get(`/api/book/getbookbyid/${bookId}`);
      if (response.data && response.data.succeeded) {
        const bookData = response.data.data;
        setBook(bookData);

        if (bookData.recaps && bookData.recaps.$values.length > 0) {
          const contributorsData = await Promise.all(
            bookData.recaps.$values.map(async (recap) => {
              if (recap.userId) {
                const userResponse = await api.get(`/api/users/get-user-account-byID?userId=${recap.userId}`);
                return {
                  recapId: recap.id,
                  contributor: userResponse.data.data,
                };
              }
              return null;
            })
          );
          setContributors(contributorsData.filter((data) => data !== null));
        }
      } else {
        setError('Không tìm thấy chi tiết sách');
      }
    } catch (error) {
      setError('Lỗi khi tải chi tiết sách');
    }
  };

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!book) {
    return <Text style={styles.loading}>Đang tải...</Text>;
  }

  const handleRecapClick = (recapId) => {
    navigation.navigate('RecapItemDetail', { recapId });
  };

  const categoriesString = book.categories.$values.map((category) => category.name).join(', ');

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={book.coverImage ? { uri: book.coverImage } : defaultImage} 
        style={styles.coverImage} 
      />

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.subtitle}>{book.originalTitle}</Text>
        <Text style={styles.author}>Tác giả: {book.authors.$values[0].name}</Text>
      </View>

      <Text style={styles.description}>{book.description}</Text>
      <Text style={styles.detail}>Năm xuất bản: {book.publicationYear}</Text>
      <Text style={styles.detail}>Nhà xuất bản: {book.publisher.publisherName}</Text>
      <Text style={styles.detail}>Thể loại: {categoriesString || 'Chưa có thể loại cho sách này'}</Text>

      <View style={styles.recapsContainer}>
        <Text style={styles.recapsTitle}>Recaps</Text>
        {book.recaps && book.recaps.$values.length > 0 ? (
          book.recaps.$values
            .filter((recap) => recap.isPublished)
            .map((recap) => {
              const contributorData = contributors.find(
                (data) => data.recapId === recap.id
              );
              return (
                <TouchableOpacity
                  key={recap.id}
                  style={styles.recapItem}
                  onPress={() => handleRecapClick(recap.id)}
                >
                  <Text style={styles.recapName}>{recap.name}</Text>
                  {recap.isPremium && <Text style={styles.premiumTag}>Premium</Text>}

                  {contributorData && contributorData.contributor && (
                    <View style={styles.contributor}>
                      <Image
                        source={{ uri: `https://160.25.80.100:7124/${contributorData.contributor.imageUrl}` }}
                        style={styles.contributorImage}
                      />
                      <View>
                        <Text style={styles.contributorName}>
                          Người đóng góp: {contributorData.contributor.fullName}
                        </Text>
                        <Text style={styles.contributorGender}>
                          Giới tính: {contributorData.contributor.gender === 0 ? 'Nam' : 'Nữ'}
                        </Text>
                        <Text style={styles.contributorBirthDate}>
                          Ngày sinh: {contributorData.contributor.birthDate}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
        ) : (
          <Text style={styles.noRecaps}>Không có recap cho cuốn sách này.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  coverImage: {
    width: '50%',
    height: 250,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 16,
    marginLeft: 80
  },
  infoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginVertical: 12,
    lineHeight: 22,
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  recapsContainer: {
    marginTop: 24,
  },
  recapsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recapItem: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recapName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  premiumTag: {
    fontSize: 14,
    color: '#FF8C20',
    marginTop: 4,
    fontWeight: 'bold'
  },
  contributor: {
    flexDirection: 'row',
    marginTop: 12,
  },
  contributorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  contributorName: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  contributorGender: {
    fontSize: 14,
    color: '#555',
  },
  contributorBirthDate: {
    fontSize: 14,
    color: '#555',
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  loading: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  noRecaps: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default RecapDetail;
