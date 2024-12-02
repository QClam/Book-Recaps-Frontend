import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // useParams để lấy playlistId từ URL

const PlaylistBookList = () => {
  const { playlistId } = useParams(); // Lấy playlistId từ URL params
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const accessToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchPlaylistBooks = async () => {
      try {
        const response = await axios.get(`https://bookrecaps.cloud/api/playlists/${playlistId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const playlist = response.data.data; // Dữ liệu playlist
        if (playlist && playlist.playListItems && playlist.playListItems.$values) {
          const bookRecaps = playlist.playListItems.$values;
          await fetchBooks(bookRecaps);
        } else {
          setError('No books found in this playlist.');
        }
      } catch (error) {
        setError('Failed to fetch playlist books.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBooks = async (bookRecaps) => {
      try {
        const response = await axios.get('https://bookrecaps.cloud/api/book/getallbooks', {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Add token for book fetching
          },
        });

        const allBooks = response.data.data.$values;
        const filteredBooks = allBooks.filter(book => 
          book.recaps.$values.some(recap => bookRecaps.some(item => item.recapId === recap.id))
        );

        setBooks(filteredBooks);
      } catch (error) {
        setError('Failed to fetch books.');
      }
    };

    fetchPlaylistBooks();
  }, [playlistId, accessToken]);

  if (isLoading) {
    return <div>Loading books...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Books in this Playlist</h2>
      {books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        books.map((book) => (
          <div key={book.id} style={{ marginBottom: '20px' }}>
            <h3>Title: {book.title}</h3>
            <p>Author: {book.authors.$values.map(author => author.name).join(', ')}</p>
            <img src={book.coverImage} alt={book.title} style={{ width: '100px' }} />
          </div>
        ))
      )}
    </div>
  );
};

export default PlaylistBookList;
