import React, { useEffect, useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import api from '../../utils/AxiosInterceptors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import CreatePlaylistModal from './CreatePlaylistModal';



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

const RecapItemDetail = ({ route }) => {
  const { recapId } = route.params;
  const [recapDetail, setRecapDetail] = useState(null);
  const [error, setError] = useState(null);
  const [transcriptData, setTranscriptData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

   // States for Like functionality
   const [liked, setLiked] = useState(false);
   const [likeCount, setLikeCount] = useState(0);
 
   // State for User ID
   const [userId, setUserId] = useState(null);
   const [errorMessage, setErrorMessage] = useState(null);
 
   useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/personal/profile');  // Use your custom API call here
        
        if (response.data) {
          // Get user ID from the API response directly
          setUserId(response.data.id); // Ensure to set the ID correctly
        } else {
          setErrorMessage('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setErrorMessage('Failed to fetch user profile'); // Update error message
      }
    };
    fetchUserProfile();
  }, []);

  const handleLikeClick = async () => {
    if (!userId) {
      setErrorMessage('User not authenticated');
      return;
    }
    try {
      let response;
      if (liked) {
        // If already liked, remove the like
        response = await api.delete(`/api/likes/remove/${recapId}`);  // Replace with your custom API
        if (response.status === 200) {
          setLiked(false);
          AsyncStorage.setItem(`liked_${userId}_${recapId}`, JSON.stringify(false));
          setLikeCount(likeCount - 1);
        }
      } else {
        // If not liked, add the like
        response = await api.post(`/api/likes/createlike/${recapId}`, { recapId, userId });  // Replace with your custom API
        if (response.status === 200) {
          setLiked(true);
          AsyncStorage.setItem(`liked_${userId}_${recapId}`, JSON.stringify(true));
          setLikeCount(likeCount + 1);
        }
      }
    } catch (error) {
      console.error('Error handling like action:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      const fetchLikeCount = async () => {
        try {
          const response = await api.get(`/api/likes/count/${recapId}`);  // Replace with your custom API
          if (response.status === 200) {
            setLikeCount(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching like count:', error);
        }
      };
      fetchLikeCount();
    }
  }, [recapId, userId]);




  // useEffect(() => {
  //   fetchRecapDetail();
  // }, [recapId]);

  useEffect(() => {
    if (userId) {
      fetchRecapDetail();
    }
  }, [recapId, userId]);


  const fetchRecapDetail = async () => {
    try {
      const response = await api.get(`/getrecapbyId/${recapId}`);
      if (response.data && response.data.succeeded) {
        const recapRef = resolveRefs(response.data.data);
        setRecapDetail(recapRef);
        fetchTranscriptData(response.data.data.recapVersions.$values);
      } else {
        setError('Không tìm thấy chi tiết recap');
      }
    } catch (error) {
      setError('Lỗi khi tải chi tiết recap');
    }
  };

  const fetchTranscriptData = async (recapVersions) => {
    try {
      const transcriptUrl = recapVersions.find(version => version.transcriptUrl)?.transcriptUrl;
      if (transcriptUrl) {
        const transcriptResponse = await api.get(transcriptUrl);
        setTranscriptData(transcriptResponse.data);
      }
    } catch (error) {
      setError('Lỗi khi tải transcript');
    }
  };
  const handleSaveClick = () => {
    setIsModalOpen(true); // Open the Create Playlist Modal when clicked
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal when the user cancels or saves
  };


  if (error) {
    return <Text>{error}</Text>;
  }

  if (!recapDetail) {
    return <Text>Đang tải...</Text>;
  }

  const renderTranscript = () => {
    if (!transcriptData || !transcriptData.transcriptSections) return null;
    return transcriptData.transcriptSections.map((section, index) => (
      <View key={index} style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.transcriptSentences.map((sentence, idx) => (
          <Text key={idx} style={styles.sentence}>
            {sentence.value.html}
          </Text>
        ))}
      </View>
    ));
  };

  const { book, currentVersion, recapVersions } = recapDetail;


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{recapDetail.name}</Text>
      {/* <Text style={styles.status}>
        Published: {recapDetail.isPublished ? 'Yes' : 'No'} | Premium: {recapDetail.isPremium ? 'Yes' : 'No'}
      </Text> */}
      {/* <Text style={styles.views}>Views: {recapDetail.viewsCount}</Text> */}

      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{book.title}</Text>
        <Image source={{ uri: book.coverImage }} style={styles.bookImage} />
        <Text style={styles.views}>Views: {recapDetail.viewsCount}</Text>
        <View style={styles.likeContainer}>
        <TouchableOpacity onPress={handleLikeClick} style={styles.likeButton}>
          <Icon name="heart" size={24} color={liked ? '#ff6347' : '#ccc'} />
        </TouchableOpacity>
        <Text style={styles.likeCount}>{likeCount} Likes</Text>

        <TouchableOpacity onPress={handleSaveClick} style={styles.saveButton}>
          <Text style={styles.saveText}>🔖 Save in My Playlist</Text>
        </TouchableOpacity>
       
      </View>
      </View>
      <View style={styles.versionInfo}>
        <Text style={styles.audioURL}>Audio URL: {currentVersion.audioURL}</Text>
      </View>
       
        {/* <View style={styles.versionInfo}>
        <Text style={styles.audioURL}>Audio URL: {recapDetail.currentVersion?.audioURL}</Text>
        {renderAudioPlayer()}
      </View> */}

      <View style={styles.versionInfo}>    
        {renderTranscript()}
      </View>
      {/* Like Button */}
     {/* Like Button with Heart Icon */}
     {/* <View style={styles.likeContainer}>
        <TouchableOpacity onPress={handleLikeClick} style={styles.likeButton}>
          <Icon name="heart" size={24} color={liked ? '#ff6347' : '#ccc'} />
        </TouchableOpacity>
        <Text style={styles.likeCount}>{likeCount} Likes</Text>

        <TouchableOpacity onPress={handleSaveClick} style={styles.saveButton}>
          <Text style={styles.saveText}>🔖 Save in My Playlist</Text>
        </TouchableOpacity>
       
      </View> */}
         {/* Create Playlist Modal */}
         <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={closeModal}
        recapId={recapId} // Use dynamic recap ID
        userId={userId}   // Use dynamic user ID
      />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    marginTop: 10
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: -12,
    marginTop: 20
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  views: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  bookInfo: {
    marginVertical: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
  },
  bookImage: {
    width: 160,
    height: 240,
    resizeMode: 'cover',
    borderRadius: 8,
    marginTop: 12,
  },
  versionInfo: {
    marginVertical: 20,
  },
  versionList: {
    marginVertical: 20,
  },
  versionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#ddd',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
  },
  sentence: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 30
  },
  likeButton: {
    marginRight: 8,
    padding: 8,
  },
  likeCount: {
    fontSize: 18,
    color: '#333',
  },
});

export default RecapItemDetail;
