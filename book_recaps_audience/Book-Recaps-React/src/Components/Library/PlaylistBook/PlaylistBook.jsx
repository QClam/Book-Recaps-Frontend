import { useRef, useState } from 'react';
import "../PlaylistBook/PlaylistBook.scss";
import { generatePath, Link } from 'react-router-dom';
import { axiosInstance } from "../../../utils/axios";
import { routes } from "../../../routes";
import { useClickAway } from "react-use";
import { Image } from "primereact/image";
import { toast } from "react-toastify";

const PlaylistBook = ({ playlistsData }) => {
  const [ playlists, setPlaylists ] = useState(playlistsData);
  const [ showOptions, setShowOptions ] = useState(null);
  const deletePlaylistRef = useRef(null);
  const deletePlaylistItemRef = useRef(null);

  useClickAway(deletePlaylistRef, () => {
    if (showOptions) setShowOptions(null);
  });

  useClickAway(deletePlaylistItemRef, () => {
    if (showOptions) setShowOptions(null);
  });

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await axiosInstance.delete(`/api/playlists/deleteplaylist/${playlistId}`);
      // Update playlists after deletion
      setPlaylists(playlists.filter((playlist) => playlist.playListId !== playlistId));
      toast.success('Playlist deleted successfully.');
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete playlist.');
    }
  };

  const handleDeleteItem = async (playlistItemId) => {
    try {
      await axiosInstance.delete(`/api/playlists/deleteplaylistitem/${playlistItemId}`);
      // Sau khi xóa, gọi lại hàm fetchPlaylists để cập nhật danh sách
      const updatedPlaylists = playlists.map((playlist) => ({
        ...playlist,
        playListItems: {
          $values: playlist.playListItems.$values.filter((item) => item.playlistItemId !== playlistItemId),
        },
      }));
      setPlaylists(updatedPlaylists);
      toast.success('Item deleted successfully.');
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete item from playlist.');
    }
  };

  const toggleOptions = (itemId) => {
    setShowOptions(showOptions === itemId ? null : itemId);
  };

  return (
    <div className="playlist-container-container">
      <h2>My Playlists</h2>
      {playlists.length === 0 ? (<p>No playlists found.</p>) : (
        playlists.map((playlist) => (
          <div key={playlist.playListId} className="playlist">
            <div className="playlist-header">
              <h3 className="text-lg">Playlist Name: <strong>{playlist.playListName}</strong></h3>
              <div className="options-menu">
                <span onClick={() => toggleOptions(playlist.playListId)}>⋮</span>
                {showOptions === playlist.playListId && (
                  <div className="dropdown-options" ref={deletePlaylistRef}>
                    <button onClick={() => handleDeletePlaylist(playlist.playListId)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
            {playlist.playListItems.$values.length === 0 ? (<p>Empty playlist.</p>) : (
              <div className="book-list-list">
                {playlist.playListItems.$values.map((item) => {
                  return (
                    <Link
                      key={item.playlistItemId}
                      to={generatePath(routes.recapPlayer, { recapId: item.recapId })}
                      className="book-item-item"
                    >
                      <div className="w-20 mr-2.5">
                        <Image
                          src={item.bookImage || "/empty-image.jpg"}
                          alt={item.bookName}
                          className="block overflow-hidden rounded-md shadow-md w-full"
                          imageClassName="aspect-[3/4] object-cover w-full bg-white"
                        />
                      </div>

                      <div className="relative text-sm">
                        <p className="text-base font-bold mb-2 line-clamp-2" title={item.bookName}>
                          {item.bookName}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-1 mb-2"
                           title={item.authors.$values.map(author => author.authorName).join(', ')}>
                          Tác giả: <strong>{item.authors.$values.map(author => author.authorName).join(', ')}</strong>
                        </p>
                        <div className="border-t border-gray-300 mb-2"></div>
                        <p className="text-xs mb-1 italic line-clamp-2" title={item.recapName}>
                          Bài viết: <strong>{item.recapName}</strong>
                        </p>

                        <div className="flex gap-2 items-center text-xs">
                          <div className="w-6 h-6">
                            <img
                              src={item.contributorImage?.replace("Files/Image/jpg/ad.jpg", "") || '/avatar-placeholder.png'}
                              alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
                          </div>
                          <p className="font-semibold line-clamp-2">{item.contributorName}</p>
                        </div>
                      </div>

                      {/*<div className="book-info">*/}
                      {/*  <p>Sách: {item.bookName}</p>*/}
                      {/*  <p className="author">{item.authors.$values.map(author => author.authorName).join(', ')}</p>*/}
                      {/*</div>*/}

                      {/* Three-dots menu for delete */}
                      {/* Dấu ba chấm */}
                      <div className="options-menu">
                        <span onClick={(event) => {
                          event.preventDefault();
                          toggleOptions(item.playlistItemId)
                        }}>⋮</span>
                        {showOptions === item.playlistItemId && (
                          <div className="dropdown-options" ref={deletePlaylistItemRef}>
                            <button onClick={(e) => {
                              e.preventDefault();
                              handleDeleteItem(item.playlistItemId)
                            }}>Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </Link>
                  )
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
