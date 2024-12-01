import { useEffect, useState } from 'react';
import "../PlaylistBook/PlaylistBook.scss";
import { generatePath, useNavigate } from 'react-router-dom';
import { axiosInstance } from "../../../utils/axios";
import { routes } from "../../../routes";

const PlaylistBook = () => {
  const [ playlists, setPlaylists ] = useState([]);
  const [ books, setBooks ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ error, setError ] = useState(null);
  const navigate = useNavigate();
  const [ showOptions, setShowOptions ] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axiosInstance.get('/api/playlists/my-playlists');

        const data = response.data.data.$values;
        if (Array.isArray(data)) {
          // Sort playlists by createdAt, most recent first
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setPlaylists(data);
          await fetchBooks(data);
        } else {
          setError('Invalid data format received from API.');
        }
      } catch (error) {
        console.log(error);
        setError('Failed to fetch playlists.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axiosInstance.get('/api/book/getallbooks');
      const bookData = response.data.data.$values;
      setBooks(bookData);
    } catch (error) {
      console.log(error);
      setError('Failed to fetch books.');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await axiosInstance.delete(`/api/playlists/deleteplaylist/${playlistId}`);
      // Update playlists after deletion
      setPlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
    } catch (error) {
      console.log(error);
      setError('Failed to delete playlist.');
    }
  };

  const handleDelete = async (playlistItemId) => {
    try {
      await axiosInstance.delete(`/api/playlists/deleteplaylistitem/${playlistItemId}`);
      // Sau khi xóa, gọi lại hàm fetchPlaylists để cập nhật danh sách
      const updatedPlaylists = playlists.map((playlist) => ({
        ...playlist,
        playListItems: {
          $values: playlist.playListItems.$values.filter((item) => item.id !== playlistItemId),
        },
      }));
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.log(error);
      setError('Failed to delete item.');
    }
  };

  const toggleOptions = (itemId, event) => {
    event.preventDefault(); // Ngăn không cho menu mặc định của trình duyệt xuất hiện
    setShowOptions(showOptions === itemId ? null : itemId);
  };

  // const handleBookClick = (book) => {
  //   // Chỉ điều hướng nếu nhấp chuột trái

  //     navigate(`/user-recap-detail/${book.id}`);

  // };

  const handleBookClick = (book) => {
    navigate(generatePath(routes.bookDetail, { id: book.id }));
  };

  if (isLoading) {
    return <div>Loading playlists...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="playlist-container-container">
      <h2>My Playlists</h2>
      {playlists.length === 0 ? (
        <p>No playlists found.</p>
      ) : (
        playlists.map((playlist) => (
          <div key={playlist.id} className="playlist">
            <div className="playlist-header">
              <h3>Playlist Name: {playlist.playListName}</h3>
              <div className="options-menu">
                <span onClick={(event) => toggleOptions(playlist.id, event)}>⋮</span>
                {showOptions === playlist.id && (
                  <div className="dropdown-options">
                    <button onClick={() => handleDeletePlaylist(playlist.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
            {/* <h4>Books in this playlist:</h4> */}
            {playlist.playListItems.$values.length === 0 ? (
              <p>No books in this playlist.</p>
            ) : (
              <div className="book-list-list">
                {playlist.playListItems.$values.map((item) => {
                  const book = books.find(book =>
                    book.recaps.$values.some(recap => recap.id === item.recapId)
                  );
                  return (
                    <div
                      key={item.id}
                      className="book-item-item"
                      onClick={() => handleBookClick(book)} // Add onClick event
                      style={{ cursor: 'pointer' }} // Optional: Style to indicate clickable
                    >
                      {book ? (
                        <>
                          <img src={book.coverImage} alt={book.title}/>
                          <div className="book-info">
                            <p>{book.title}</p>
                            <p className="author">{book.authors.$values.map(author => author.name).join(', ')}</p>
                          </div>
                          {/* Three-dots menu for delete */}
                          {/* Dấu ba chấm */}
                          <div className="options-menu">
                            <span onClick={(event) => {
                              event.stopPropagation();
                              toggleOptions(item.id, event)
                            }}>⋮</span>
                            {showOptions === item.id && (
                              <div className="dropdown-options">
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id)
                                }}>Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <p>No book information available.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default PlaylistBook;
