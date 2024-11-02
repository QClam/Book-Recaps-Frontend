
import React from 'react';

import ReadRecapNew from '../ReadListenBook/RecapLR/ReadRecapNew';
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
