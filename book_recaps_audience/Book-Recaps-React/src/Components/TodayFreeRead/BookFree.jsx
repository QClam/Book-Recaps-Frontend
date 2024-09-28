
import React from 'react';
import FreeBook from './FreeBook/FreeBook';
import Title from './TitleBook/Title';
import PopularBook from '../Explore/PopularBook/PopularBook';

const BookFree = () => {
    return (
        <div>
            <FreeBook />
            <PopularBook />
           
           <Title/>
        </div>
    );
};

export default BookFree;
