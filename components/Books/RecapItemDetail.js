import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Dimensions, ActivityIndicator } from 'react-native';
import api from '../../utils/AxiosInterceptors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import CreatePlaylistModal from './CreatePlaylistModal';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import CircularButtonWithArrow from './CircularButtonWithArrow';
const screenWidth = Dimensions.get('window').width; // Chiều rộng màn hình thiết bị

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


    // States for Like functionality
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // State for User ID
    const [userId, setUserId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackStatus, setPlaybackStatus] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [duration, setDuration] = useState(0);

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

    // Track view event inside useEffect to avoid hook errors
    useEffect(() => {
        const trackViewEvent = async () => {
            try {
                const deviceType = Platform.OS === 'ios' || Platform.OS === 'android' ? 0 : 1;
                const recapIdFromStorage = await AsyncStorage.getItem('recapId');
                const recapData = recapIdFromStorage || recapId;
                const userId = await AsyncStorage.getItem('userId');

                // API call with query params in URL
                const response = await api.post(`/api/viewtracking/createviewtracking?recapid=${recapData}&deviceType=${deviceType}`, {
                    userId: userId // Add additional body if necessary
                });

                console.log('View tracking event sent successfully:', response.data);
            } catch (error) {
                console.error('Error sending view tracking event:', error);
            }
        };

        if (userId) {
            trackViewEvent();
        }
    }, [recapId, userId]);

    // Kiểm tra trạng thái liked từ AsyncStorage khi component render lại
    useEffect(() => {
        const fetchLikeStatus = async () => {
            try {
                // Lấy trạng thái liked đã lưu trong AsyncStorage
                const storedLikedStatus = await AsyncStorage.getItem(`liked_${userId}_${recapId}`);
                if (storedLikedStatus !== null) {
                    setLiked(JSON.parse(storedLikedStatus));  // Thiết lập lại trạng thái liked từ AsyncStorage
                }
            } catch (error) {
                console.error('Error fetching like status:', error);
            }
        };

        if (userId) {
            fetchLikeStatus();  // Lấy trạng thái liked khi component được render lại
        }
    }, [userId, recapId]);

    // Xử lý khi người dùng nhấn vào nút like
    const handleLikeClick = async () => {
        if (!userId) {
            setErrorMessage('User not authenticated');
            return;
        }

        try {
            let response;

            if (liked) {
                // Nếu đã like, gọi API để bỏ like
                response = await api.delete(`/api/likes/remove/${recapId}`);
                if (response.status === 200) {
                    setLiked(false);  // Cập nhật trạng thái liked thành false
                    AsyncStorage.setItem(`liked_${userId}_${recapId}`, JSON.stringify(false)); // Lưu trạng thái bỏ like vào AsyncStorage
                    setLikeCount(likeCount - 1);  // Giảm số lượng like đi
                }
            } else {
                // Nếu chưa like, gọi API để thêm like
                response = await api.post(`/api/likes/createlike/${recapId}`, { recapId, userId });
                if (response.status === 200) {
                    setLiked(true);  // Cập nhật trạng thái liked thành true
                    AsyncStorage.setItem(`liked_${userId}_${recapId}`, JSON.stringify(true)); // Lưu trạng thái like vào AsyncStorage
                    setLikeCount(likeCount + 1);  // Tăng số lượng like lên
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


    const fetchRecapDetail = async () => {
        try {
            const response = await api.get(`/getrecapbyId/${recapId}`);
            if (response.data && response.data.succeeded) {
                const recapRef = resolveRefs(response.data.data);
                setRecapDetail(recapRef);
                fetchTranscriptData(response.data.data.recapVersions.$values);

                // Gọi loadSound nếu audioURL tồn tại
                const currentVersion = recapRef.currentVersion;
                if (currentVersion?.audioURL) {
                    loadSound(currentVersion.audioURL);
                }
            } else {
                setError('Không tìm thấy chi tiết recap');
            }
        } catch (error) {
            setError('Lỗi khi tải chi tiết recap');
            console.error('Error fetching recap detail:', error);
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

    useEffect(() => {
        if (userId) {
            fetchRecapDetail();
        }
    }, [recapId, userId]);

    // Load âm thanh khi component được render
    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync(); // Giải phóng tài nguyên khi unmount
            }
        };
    }, [sound]);

    const loadSound = async (audioURL) => {
        if (!audioURL) {
            console.error('No audio URL found');
            return;
        }

        try {
            console.log('Loading audio from URL:', audioURL);
            const { sound: newSound, status } = await Audio.Sound.createAsync(
                { uri: audioURL },
                { shouldPlay: false } // Không tự động phát khi load
            );
            console.log('Audio loaded successfully', status);
            setSound(newSound);
            setPlaybackStatus(status);
        } catch (error) {
            console.error('Error loading sound:', error);
        }
    };

    // Bắt sự kiện phát / tạm dừng
    const togglePlayPause = async () => {
        if (!sound) return;

        try {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                if (currentPosition >= duration) {
                    await sound.setPositionAsync(0);
                }
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    };

    useEffect(() => {
        if (currentVersion?.audioURL) {
            loadSound(currentVersion.audioURL);
        }
    }, [currentVersion?.audioURL]);

    useEffect(() => {
        const updatePosition = setInterval(async () => {
            if (sound) {
                const status = await sound.getStatusAsync();
                setCurrentPosition(status.positionMillis || 0);
                setDuration(status.durationMillis || 0);

                if (status.didJustFinish) {
                    setIsPlaying(false);
                    setCurrentPosition(0);
                    await sound.setPositionAsync(0);
                }
            }
        }, 1000);

        return () => clearInterval(updatePosition);
    }, [sound]);


    // Xử lý seek
    const handleSeek = async (value) => {
        if (sound) {
            await sound.setPositionAsync(value);
            setCurrentPosition(value);
        }
    };

    if (error) {
        return <Text>{error}</Text>;
    }

    if (!recapDetail) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
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
                <Image source={{ uri: book.coverImage }} style={styles.bookImage} />
                <Text style={styles.views}>{recapDetail.viewsCount} Views</Text>
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

            <View style={styles.audioPlayerContainer}>
                {/* Các nút điều khiển */}
                <View style={styles.controlsRow}>
                    {/* Nút Quay lại 15s */}
                    <CircularButtonWithArrow
                        direction="backward"
                        onPress={async () => {
                            if (sound) {
                                const newPosition = Math.max(currentPosition - 15000, 0);
                                await sound.setPositionAsync(newPosition);
                                setCurrentPosition(newPosition);
                            }
                        }}
                    />
                    {/* Nút Play/Pause */}
                    <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
                        <Text style={styles.buttonIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
                    </TouchableOpacity>

                    {/* Nút Tua tới 15s */}
                    <CircularButtonWithArrow
                        direction="forward"
                        onPress={async () => {
                            if (sound) {
                                const newPosition = Math.min(currentPosition + 15000, duration);
                                await sound.setPositionAsync(newPosition);
                                setCurrentPosition(newPosition);
                            }
                        }}
                    />
                </View>
                {/* Thanh tiến trình */}
                <Slider
                    style={styles.progressBar}
                    minimumValue={0}
                    maximumValue={duration}
                    value={currentPosition}
                    onSlidingComplete={handleSeek}
                    minimumTrackTintColor="#FFD700"
                    maximumTrackTintColor="#D3D3D3"
                    thumbTintColor="#FFD700"
                />
            </View>

            <View style={styles.versionInfo}>
                {renderTranscript()}
            </View>

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
        marginTop: -29
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
        borderRadius: 8,
        // padding: 16,
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
        // marginBottom: -18,
        // marginTop: -50,
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
        marginBottom: 20,
        marginTop: -10
    },
    likeButton: {
        marginRight: 8,
        padding: 8,
    },
    likeCount: {
        fontSize: 18,
        color: '#333',
    },
    audioPlayerContainer: {
        alignItems: 'center',
        backgroundColor: '#4A3F35',
        paddingVertical: 15,
        borderRadius: 17,
        height: 145,

    },
    controlsRow: {
        flexDirection: 'row', // Các nút nằm ngang hàng
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20, // Tạo khoảng cách với thanh tiến trình
    },
    controlButton: {
        marginHorizontal: 20, // Khoảng cách giữa các nút
        backgroundColor: '#6A5B52',
        padding: 10,
        borderRadius: 50,
    },
    playPauseButton: {
        marginHorizontal: 20,
        backgroundColor: '#FFD700',
        padding: 15,
        borderRadius: 50,
    },
    buttonIcon: {
        color: '#FFFFFF',
        fontSize: 18,
        textAlign: 'center',
    },
    progressBar: {
        width: '90%',
        marginBottom: 15
    },
 loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RecapItemDetail;
