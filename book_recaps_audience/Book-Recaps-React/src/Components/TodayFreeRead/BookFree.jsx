
import React from 'react';
import FreeBook from './FreeBook/FreeBook';
import Title from './TitleBook/Title';
import PopularBook from '../Explore/PopularBook/PopularBook';
import ReadRecap from '../ReadListenBook/ReadRecap';

const BookFree = () => {
    return (
        <div>
            <ReadRecap />
            <FreeBook />
            <PopularBook />
            
           <Title/>
        </div>
    );
};

export default BookFree;
