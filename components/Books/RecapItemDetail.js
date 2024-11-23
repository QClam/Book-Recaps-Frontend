import React, { useEffect, useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import api from '../../utils/AxiosInterceptors';
//import AudioPlayer from './AudioPlayer';

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
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { audioURL } = route.params;

  useEffect(() => {
    fetchRecapDetail();
  }, [recapId]);

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
      </View>

      <View style={styles.versionInfo}>
        {/* <AudioPlayer audioURL={currentVersion.audioURL} /> */}
        {renderTranscript()}
      </View>

      {recapVersions.$values && recapVersions.$values.length > 0 && (
        <View style={styles.versionList}>
          {recapVersions.$values.map((version, index) => (
            <View key={index} style={styles.versionItem}>
              {/* <AudioPlayer audioURL={version.audioURL} /> */}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    
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
});

export default RecapItemDetail;
