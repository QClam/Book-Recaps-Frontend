import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import api from '../../utils/AxiosInterceptors'; // Import the axios utility for making API calls

const RecapDetail = ({ route, navigation }) => {
  const { bookId } = route.params; // Get bookId from the navigation params
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
    return <Text>{error}</Text>;
  }

  if (!book) {
    return <Text>Đang tải...</Text>;
  }

  const handleRecapClick = (recapId) => {
    navigation.navigate('RecapItemDetail', { recapId }); // Navigate to the Recap Item detail page
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>Tác giả: {book.authors.$values[0].name}</Text>
      <Text style={styles.description}>{book.description}</Text>
      <Text style={styles.publicationYear}>Năm xuất bản: {book.publicationYear}</Text>
      <Text style={styles.publisher}>Nhà xuất bản: {book.publisher.publisherName}</Text>

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
                  {recap.isPremium && (
                    <Text style={styles.recapPremium}>Premium</Text>
                  )}

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

                  {recap.recapVersions && recap.recapVersions.$values.length > 0 && (
                    <View style={styles.recapVersions}>
                      {recap.recapVersions.$values.map((version) => (
                        <Text key={version.id}> {version.versionName}</Text>
                      ))}
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
    padding: 16,
  },
  coverImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  author: {
    fontSize: 18,
    color: '#666',
  },
  description: {
    fontSize: 16,
    marginVertical: 16,
    lineHeight: 24,
  },
  publicationYear: {
    fontSize: 16,
  },
  publisher: {
    fontSize: 16,
    marginVertical: 8,
  },
  recapsContainer: {
    marginTop: 20,
  },
  recapsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recapItem: {
    marginBottom: 20,
  },
  recapName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recapPremium: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 17,
  },
  contributor: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  contributorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  contributorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contributorGender: {
    fontSize: 14,
    color: '#888',
  },
  contributorBirthDate: {
    fontSize: 14,
    color: '#888',
  },
  recapVersions: {
    marginTop: 10,
  },
  noRecaps: {
    fontSize: 16,
    color: '#888',
  },
});

export default RecapDetail;
