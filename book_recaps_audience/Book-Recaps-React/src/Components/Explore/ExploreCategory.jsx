
import React from 'react';
import ListCategory from './ListCategory/ListCategory';
import CustomCategory from './NewCategory/Category';
import BookApiCategory from './BookApiCategory/BookApiCategory';
import CategoryByBookApi from './CategoryByBookApi/CategoryByBookApi';

const ExploreCategory = () => {
    return (
        <div>
            <BookApiCategory />
            <CategoryByBookApi />
           
            {/* <ListCategory /> */}
            {/* <CustomCategory /> */}
        </div>
    );
};

export default ExploreCategory;
