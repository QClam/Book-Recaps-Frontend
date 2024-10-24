
import React from 'react';
import Library from './Library';
import BookCarousel from '../ForYou/BookCarousel';
import BookTrendingApi from '../Explore/BookTrendingApi/BookTrendingApi';
import PlaylistBook from './PlaylistBook/PlaylistBook';

const LibraryBook = () => {
    return (
        <div>
          <PlaylistBook />
          {/* <BookTrendingApi /> */}
          {/* <BookCarousel /> */}
          {/* <Library />   */}

        </div>
    );
};

export default LibraryBook;
