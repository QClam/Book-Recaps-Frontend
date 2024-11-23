import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './CreatePlaylistModal.scss'; // Import styles

const CreatePlaylistModal = ({ isOpen, onClose, recapId, userId }) => {
  const [playlistName, setPlaylistName] = useState('');
  const [existingPlaylists, setExistingPlaylists] = useState([]); // To store existing playlists
  const [selectedPlaylists, setSelectedPlaylists] = useState([]); // To store selected playlists
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');

  // Fetch existing playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get('https://bookrecaps.cloud/api/playlists/my-playlists', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setExistingPlaylists(response.data.data.$values); // Update with playlists from API
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen, accessToken]);

  // Helper function to refresh the access token
  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('https://bookrecaps.cloud/api/auth/refresh', {
        refreshToken,
      });
      const newAccessToken = response.data.accessToken;
      localStorage.setItem('authToken', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      alert('Session expired, please login again.');
      return null;
    }
  };

  // Function to handle creating a new playlist
  const handleCreatePlaylist = async () => {
    if (!playlistName) {
      alert('Please enter a playlist name');
      return;
    }

    try {
      setIsLoading(true);
      let currentAccessToken = accessToken;

      const createPlaylistResponse = await axios.post(
        'https://bookrecaps.cloud/api/playlists/createPlaylist',
        {
          userId,
          playListName: playlistName,
        },
        {
          headers: {
            Authorization: `Bearer ${currentAccessToken}`,
          },
        }
      );

      const { id: playlistId } = createPlaylistResponse.data.data;

      await axios.post(
        `https://bookrecaps.cloud/api/playlists/${playlistId}/add-recap/${recapId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentAccessToken}`,
          },
        }
      );

      alert('Playlist created and recap added!');
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
        alert('Error creating playlist');
        setIsLoading(false);
      }
    }
  };

  // Handle existing playlist selection and adding recap
// Handle existing playlist selection and adding recap
const handleSaveInSelectedPlaylists = async () => {
  try {
    setIsLoading(true); // Show loading indicator
    // Loop through all selected playlists
    for (const playlistId of selectedPlaylists) {
      // API call to add recap to each playlist
      await axios.post(
        `https://bookrecaps.cloud/api/playlists/${playlistId}/add-recap/${recapId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }
    alert('Recap added to selected playlists!'); // Success message
    setIsLoading(false);
    onClose(); // Close the modal after saving
  } catch (error) {
    console.error('Error adding recap to playlists:', error);
    setIsLoading(false);
  }
};


  // Handle checkbox selection
  const handleCheckboxChange = (playlistId) => {
    if (selectedPlaylists.includes(playlistId)) {
      setSelectedPlaylists(selectedPlaylists.filter(id => id !== playlistId));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlistId]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Save in My Library</h2>
        
        {/* Display existing playlists with checkboxes */}
        <div>
          <h3>Select Existing Playlists</h3>
          {existingPlaylists.length > 0 ? (
            existingPlaylists.map((playlist) => (
              <div key={playlist.id}>
                <input
                  type="checkbox"
                  value={playlist.id}
                  onChange={() => handleCheckboxChange(playlist.id)}
                />
                <label>{playlist.playListName}</label>
              </div>
            ))
          ) : (
            <p>No playlists available.</p>
          )}
        </div>

        {/* Form to create a new playlist */}
        <div className="create-playlist">
          <h3>Or Create a New Playlist</h3>
          <input
            type="text"
            placeholder="Playlist name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            className="playlistnameform"
          />
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSaveInSelectedPlaylists} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save in Selected Playlists'}
          </button>
          <button onClick={handleCreatePlaylist} disabled={isLoading || !playlistName}>
            {isLoading ? 'Creating...' : 'Create New Playlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
