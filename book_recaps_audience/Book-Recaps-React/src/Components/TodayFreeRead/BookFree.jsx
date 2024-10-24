
import React from 'react';
import FreeBook from './FreeBook/FreeBook';
import Title from './TitleBook/Title';
import PopularBook from '../Explore/PopularBook/PopularBook';
import ReadRecap from '../ReadListenBook/ReadRecap';
import BookApiDetail from '../Explore/BookApi/BookApiDetail';
import ReadRecapNew from '../ReadListenBook/RecapLR/ReadRecapNew';
import ReadRecapTrending from '../ReadListenBook/RecapTrending/ReadRecapTrending';
import UserRecap from '../ReadListenBook/UserRecap/UserRecap';

const BookFree = () => {
    return (
        <div>
            <UserRecap />
            <ReadRecapNew />
            {/* <ReadRecapTrending /> */}
            {/* <ReadRecap /> */}
            {/* <FreeBook /> */}
            {/* <PopularBook /> */}            
           {/* <Title/> */}
           {/* <BookApiDetail /> */}
        </div>
    );
};

export default BookFree;
