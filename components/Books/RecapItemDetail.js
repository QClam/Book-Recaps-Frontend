import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Dimensions, Animated, Modal} from 'react-native';
import api from '../../utils/AxiosInterceptors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import CreatePlaylistModal from './CreatePlaylistModal';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import CircularButtonWithArrow from './CircularButtonWithArrow';
import defaultImage from '../../assets/empty-image.png';
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
    const [textSize, setTextSize] = useState(16); // Default text size
    //const [selectedFont, setSelectedFont] = useState('Helvetica'); // Default font
    const [theme, setTheme] = useState('white'); // Default theme
    const [modalVisible, setModalVisible] = useState(false); // Toggle for popup visibility

    const startTime = useRef(new Date().getTime()); // Track the start time
    const currentViewTrackingId = useRef(null); // Store the current view tracking ID

    const togglePopup = () => {
        setModalVisible(!modalVisible); // Toggle the popup
    };

    const handleThemeSelect = (color) => {
        setTheme(color);
    };

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
    //    useEffect(() => {
    //     const trackViewEvent = async () => {
    //         try {
    //             const deviceType = Platform.OS === 'ios' || Platform.OS === 'android' ? 0 : 1;
    //             const recapIdFromStorage = await AsyncStorage.getItem('recapId');
    //             const recapData = recapIdFromStorage || recapId;
    //             const userId = await AsyncStorage.getItem('userId');

    //             // API call with query params in URL
    //             const response = await api.post(`/api/viewtracking/createviewtracking?recapid=${recapData}&deviceType=${deviceType}`, {
    //                 userId: userId // Add additional body if necessary
    //             });

    //             console.log('View tracking event sent successfully:', response.data);
    //         } catch (error) {
    //             console.error('Error sending view tracking event:', error);
    //         }
    //     };

    //     if (userId) {
    //         trackViewEvent();
    //     }
    // }, [recapId, userId]);

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
      //console.error('Error handling like action:', error);
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
                // Pause và gửi yêu cầu cập nhật thời gian
                await sound.pauseAsync();
                await updateViewTrackingDuration(); // Cập nhật thời gian khi dừng phát
            } else {
                // Play và gửi yêu cầu tạo view tracking (nếu chưa tạo)
                if (!currentViewTrackingId.current) {
                    await trackViewEvent(); // Gọi hàm tạo view tracking khi bắt đầu phát
                }
                if (currentPosition >= duration) {
                    await sound.setPositionAsync(0);
                }
                await sound.playAsync();
                startTime.current = new Date().getTime();
            }
            setIsPlaying(!isPlaying);
    
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    };

    // Hàm tạo view tracking
const trackViewEvent = async () => {
    try {
        const deviceType = Platform.OS === 'ios' || Platform.OS === 'android' ? 0 : 1;
        const recapIdFromStorage = await AsyncStorage.getItem('recapId');
        const recapData = recapIdFromStorage || recapId;
        const userId = await AsyncStorage.getItem('userId');

        // API call với query params
        const response = await api.post(`/api/viewtracking/createviewtracking?recapid=${recapData}&deviceType=${deviceType}`, {
            userId: userId // Thêm body nếu cần
        });

        console.log('View tracking event sent successfully:', response.data);
        currentViewTrackingId.current = response.data.id; // Lưu ID của view tracking
    } catch (error) {
        console.error('Error sending view tracking event:', error);
    }
};

// Hàm cập nhật thời gian view tracking
const updateViewTrackingDuration = async () => {
    try {
        if (!currentViewTrackingId.current || !startTime.current) return; 

        const endTime = new Date().getTime();
        const duration = Math.round((endTime - startTime.current) / 1000); // Tính thời gian sử dụng (giây)

        await api.put(`/api/viewtracking/updateduration/${currentViewTrackingId.current}`, {}, {
            params: { duration },
        });

        console.log('View tracking duration updated successfully:', duration);
    } catch (error) {
        console.error('Error updating view tracking duration:', error);
    }
};

// useEffect để theo dõi thời gian sử dụng
useEffect(() => {
    if (isPlaying && !startTime.current) {
        startTime.current = new Date().getTime(); // Cập nhật thời gian bắt đầu khi bắt đầu phát
    }

    return () => {
        if (isPlaying) {
            updateViewTrackingDuration(); // Cập nhật thời gian khi component bị unmount hoặc dừng phát
        }
    };
}, [isPlaying]);


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
        <ScrollView
        style={[
            styles.container,
            { backgroundColor: theme === 'white' ? '#fff' : theme },
        ]}
    >

<View style={styles.header}>
                <Text style={[styles.title, { fontSize: textSize }]}>
                    {recapDetail.name}
                </Text>
                <TouchableOpacity onPress={togglePopup}>
                    <Icon name="cog" size={24} color="#000" />
                </TouchableOpacity>
            </View>
            {/* <Text style={styles.status}>
        Published: {recapDetail.isPublished ? 'Yes' : 'No'} | Premium: {recapDetail.isPremium ? 'Yes' : 'No'}
      </Text> */}
            {/* <Text style={styles.views}>Views: {recapDetail.viewsCount}</Text> */}

            <View style={styles.bookInfo}>
            <Text
                    style={[
                        styles.bookTitle,
                        { fontSize: textSize },
                    ]}
                >
                    {recapDetail.book.title}
                </Text>

                <Image source={ book.coverImage ? { uri: book.coverImage } : defaultImage}
                                  style={styles.bookImage}
                              />

                <Text style={styles.views}>{recapDetail.viewsCount} Views</Text>
                <View style={styles.likeContainer}>
                    <TouchableOpacity onPress={handleLikeClick} style={styles.likeButton}>
                        <Icon name="heart" size={24} color={liked ? '#ff6347' : '#ccc'} />
                    </TouchableOpacity>
                    <Text style={styles.likeCount}>{likeCount} Likes</Text>

                    <TouchableOpacity onPress={handleSaveClick} style={styles.saveButton}>
                    <Icon name="bookmark" size={20} color="#f39c12" style={styles.icon} />
                    <Text style={styles.saveText}>Lưu</Text>
                        
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

            {/* <View style={styles.audioPlayerContainer}>
                   
                    <View style={styles.controlsRow}>
                       
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
                       
                        <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
                            <Text style={styles.buttonIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
                        </TouchableOpacity>

                    
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
                </View> */}
            {/* Create Playlist Modal */}
            <CreatePlaylistModal
                isOpen={isModalOpen}
                onClose={closeModal}
                recapId={recapId} // Use dynamic recap ID
                userId={userId}   // Use dynamic user ID
            />
           {/* Popup for Customize Text Display */}
           <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={togglePopup}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.settingsMenu}>
                        <Text style={styles.menuTitle}>Tùy chỉnh hiển thị văn bản</Text>

                        {/* Text Size Adjustment */}
                        <Text style={styles.subMenuTitle}>Kích thước</Text>
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>Aa</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={12}
                                maximumValue={24}
                                step={1}
                                value={textSize}
                                onValueChange={(value) => setTextSize(value)}
                            />
                            <Text style={styles.sliderLabel}>Aa</Text>
                        </View>

                        {/* Theme Selection */}
                        <Text style={styles.subMenuTitle}>Màu</Text>
                        <View style={styles.themeOptions}>
                            {[ '#E4E5E7', '#F7A8B8', '#B8E6D1', '#f3ecd8'].map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.themeCircle,
                                        { backgroundColor: color },
                                        theme === color && styles.selectedTheme,
                                    ]}
                                    onPress={() => handleThemeSelect(color)}
                                />
                            ))}
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={togglePopup}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
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
        marginTop: -20
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
        marginBottom: 50,
        marginTop: 20,
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
        height: 110,
        marginBottom: 20,
        marginTop: -40

    },
    controlsRow: {
        flexDirection: 'row', // Các nút nằm ngang hàng
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 1, // Tạo khoảng cách với thanh tiến trình
    },
    controlButton: {
        marginHorizontal: 20, // Khoảng cách giữa các nút
        backgroundColor: '#6A5B52',
        padding: 10,
        borderRadius: 50,
    },
    playPauseButton: {
        marginHorizontal: 20,
        //backgroundColor: '#FFD700',
        //fontSize: 20,
        padding: 15,
        borderRadius: 50,
    },
    buttonIcon: {
        //color: '#FFFFFF',
        //color: '#FFD700',
        fontSize: 30,
        textAlign: 'center',
        borderRadius: 10
    },
    progressBar: {
        width: '90%',
        marginBottom: 15
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsMenu: {
        width: screenWidth * 0.9,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        elevation: 5,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subMenuTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    slider: {
        flex: 1,
        marginHorizontal: 8,
    },
    sliderLabel: {
        fontSize: 14,
    },
    
    themeOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    themeCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    selectedTheme: {
        borderColor: 'orange',
    },
    closeButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: 'orange',
        borderRadius: 4,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20
      },
      icon: {
        marginRight: 8,
      },
      saveText: {
        fontSize: 16,
        color: '#2c3e50',
      },
});

export default RecapItemDetail;