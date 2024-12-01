import { useEffect, useState } from 'react';
import './CreatePlaylistModal.scss';
import { axiosInstance } from "../../../../utils/axios";

const CreatePlaylistModal = ({ isOpen, onClose, recapId, userId, savedPlayListIds, setSavedPlayListIds }) => {
  const [ playlistName, setPlaylistName ] = useState('');
  const [ existingPlaylists, setExistingPlaylists ] = useState([]);
  const [ selectedPlaylistIds, setSelectedPlaylistIds ] = useState(savedPlayListIds);
  const [ isLoading, setIsLoading ] = useState(false);

  // Fetch existing playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axiosInstance.get('/api/playlists/my-playlists');
        setExistingPlaylists(response.data.data.$values);
        setSelectedPlaylistIds(savedPlayListIds);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    if (isOpen) {
      fetchPlaylists();
    }
  }, [ isOpen ]);

  // Function to handle creating a new playlist
  const handleCreatePlaylist = async () => {
    if (!playlistName) {
      alert('Please enter a playlist name');
      return;
    }

    try {
      setIsLoading(true);

      const createPlaylistResponse = await axiosInstance.post('/api/playlists/createPlaylist', {
        userId,
        playListName: playlistName,
      });

      const { id: playlistId } = createPlaylistResponse.data.data;

      await axiosInstance.post(`/api/playlists/${playlistId}/add-recap/${recapId}`);
      setSavedPlayListIds([ ...savedPlayListIds, playlistId ]);

      alert('Playlist created and recap added!');
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Error creating playlist');
      setIsLoading(false);
    }
  };

  // Handle existing playlist selection and adding recap
// Handle existing playlist selection and adding recap
  const handleSaveInSelectedPlaylists = async () => {
    try {
      setIsLoading(true);
      const newSelectedPlaylistIds = selectedPlaylistIds.filter(id => !savedPlayListIds.includes(id));

      // Loop through each selected playlist and add recap
      for (const playlistId of newSelectedPlaylistIds) {
        // API call to add recap to each playlist
        await axiosInstance.post(`/api/playlists/${playlistId}/add-recap/${recapId}`);
      }
      setSavedPlayListIds([ ...savedPlayListIds, ...newSelectedPlaylistIds ]); // Update saved playlist IDs
      setIsLoading(false);
      alert('Playlists updated!'); // Success message
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error('Error adding recap to playlists:', error);
      setIsLoading(false);
    }
  };

  // Handle checkbox selection
  const handleCheckboxChange = (playlistId) => {
    if (selectedPlaylistIds.includes(playlistId)) {
      setSelectedPlaylistIds(selectedPlaylistIds.filter(id => id !== playlistId));
    } else {
      setSelectedPlaylistIds([ ...selectedPlaylistIds, playlistId ]);
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
                  checked={selectedPlaylistIds.includes(playlist.id)}
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
