import ReadRecapNew from '../ReadListenBook/RecapLR/ReadRecapNew';
import UserRecap from '../ReadListenBook/UserRecap/UserRecap';
import UserRecapV2 from '../ReadListenBook/UserRecap/NewRecapBook/UserRecapV2';

const BookFree = () => {
    return (
        <div>
            <UserRecapV2 />
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
