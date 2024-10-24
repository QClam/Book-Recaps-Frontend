
import React from 'react';
import BookTrending from './BookTrending/BookTrending';
import Categories from './Categories/Categories';
import Collection from './Collection/Collection';
import LatestBook from './LatestBook/LatestBook';
import ListCategory from './ListCategory/ListCategory';
import CustomCategory from './NewCategory/Category';
import BookApi from './BookApi/BookApi';
import BookApiCategory from './BookApiCategory/BookApiCategory';
import BookTrendingApi from './BookTrendingApi/BookTrendingApi';
//import BookCarousel from '../ForYou/BookCarousel';

const Explore = () => {
    return (
        <div>
            {/* <SearchBook /> */}
            <BookApi />
            {/* <BookTrendingApi /> */}
            {/* <BookApiCategory /> */}
            {/* <BookTrending /> */}
            {/* <Categories /> */}
            {/* <LatestBook /> */}
            {/* <Collection /> */}
            {/* <ListCategory />
            <CustomCategory /> */}
            {/* <BookCarousel /> */}
        </div>
    );
};

export default Explore;
