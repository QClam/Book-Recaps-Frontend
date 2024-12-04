import React, { useState, useEffect } from 'react';
import api from '../../utils/AxiosInterceptors';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

const CreatePlaylistModal = ({ isOpen, onClose, recapId, userId }) => {
  const [playlistName, setPlaylistName] = useState('');
  const [existingPlaylists, setExistingPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve accessToken and refreshToken from AsyncStorage
  const getTokens = async () => {
    const accessToken = await AsyncStorage.getItem('authToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const { accessToken } = await getTokens();
        const response = await api.get('/api/playlists/my-playlists', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setExistingPlaylists(response.data.data.$values);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const refreshAccessToken = async () => {
    try {
      const { refreshToken } = await getTokens();
      const response = await api.post('/api/auth/refresh', {
        refreshToken,
      });
      const newAccessToken = response.data.accessToken;
      await AsyncStorage.setItem('authToken', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      Alert.alert('Session expired, please login again.');
      return null;
    }
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName) {
      Alert.alert('Please enter a playlist name');
      return;
    }

    try {
      setIsLoading(true);
      let { accessToken } = await getTokens();

      const createPlaylistResponse = await api.post(
        '/api/playlists/createPlaylist',
        { userId, playListName: playlistName },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const { id: playlistId } = createPlaylistResponse.data.data;

      await api.post(
        `/api/playlists/${playlistId}/add-recap/${recapId}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      Alert.alert('Playlist đã được tạo và recap đã được thêm vào!');
      setIsLoading(false);
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return handleCreatePlaylist();
        }
      } else {
        console.error('Error creating playlist:', error);
        Alert.alert('Error creating playlist');
        setIsLoading(false);
      }
    }
  };

  const handleSaveInSelectedPlaylists = async () => {
    try {
      setIsLoading(true);
      const { accessToken } = await getTokens();
      for (const playlistId of selectedPlaylists) {
        await api.post(
          `/api/playlists/${playlistId}/add-recap/${recapId}`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
      Alert.alert('Recap đã được thêm vào playlist đã chọn!');
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Error adding recap to playlists:', error);
      setIsLoading(false);
    }
  };

  const handleSelectPlaylist = (playlistId) => {
    if (selectedPlaylists.includes(playlistId)) {
      setSelectedPlaylists(selectedPlaylists.filter(id => id !== playlistId));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlistId]);
    }
  };

  if (!isOpen) return null;

  return (
    <View
    style={{
      position: 'absolute', // Đặt vị trí tuyệt đối
      top: '50%', // Điều chỉnh vị trí từ trên
      left: '50%', // Điều chỉnh vị trí từ trái
      transform: [{ translateX: -150 }, { translateY: -150 }], // Căn giữa
      width: 300, // Đặt chiều rộng cố định
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      elevation: 5, // Tạo hiệu ứng đổ bóng cho Android
      shadowColor: '#000', // Tạo hiệu ứng đổ bóng cho iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      zIndex: 10, // Đảm bảo phần này đè lên các phần tử khác
    }}
  >
  
      <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Thêm vào Playlist</Text>
        <Text style={{ marginTop: 20 }}>Chọn Playlist hiện có</Text>
        {existingPlaylists.length > 0 ? (
          existingPlaylists.map((playlist) => (
            <TouchableOpacity
              key={playlist.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 5,
                padding: 10,
                backgroundColor: selectedPlaylists.includes(playlist.id) ? '#e0e0e0' : 'transparent',
                borderRadius: 5,
              }}
              onPress={() => handleSelectPlaylist(playlist.id)}
            >
              <Text>{playlist.playListName}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>Không có Playlist nào.</Text>
        )}

        <View style={{ marginTop: 20 }}>
          <Text>Hoặc Tạo một Playlist Mới</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              marginTop: 10,
              padding: 8,
              borderRadius: 5,
            }}
            placeholder="Tên Playlist"
            value={playlistName}
            onChangeText={setPlaylistName}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          <TouchableOpacity onPress={onClose} style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5 }}>
            <Text>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveInSelectedPlaylists}
            disabled={isLoading}
            style={{ padding: 10, backgroundColor: '#007bff', borderRadius: 5 }}
          >
            {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff' }}>Lưu </Text>}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCreatePlaylist}
            disabled={isLoading || !playlistName}
            style={{ padding: 10, backgroundColor: '#28a745', borderRadius: 5 }}
          >
            {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff' }}>Tạo mới</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CreatePlaylistModal;
