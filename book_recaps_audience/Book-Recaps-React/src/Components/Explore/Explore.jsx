//import BookTrending from './BookTrending/BookTrending';
//import Categories from './Categories/Categories';
//import Collection from './Collection/Collection';
//import LatestBook from './LatestBook/LatestBook';
//import ListCategory from './ListCategory/ListCategory';
//import CustomCategory from './NewCategory/Category';
import BookApi from './BookApi/BookApi';
import { axiosInstance } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";
import { defer, json } from "react-router-dom";
//import BookApiCategory from './BookApiCategory/BookApiCategory';
//import BookTrendingApi from './BookTrendingApi/BookTrendingApi';
//import BookCarousel from '../ForYou/BookCarousel';

const getBooks = async (request) => {
  try {
    const response = await axiosInstance.get('/api/book/getallbookswithcontract', {
      signal: request.signal
    })

    return response.data.data?.$values || [];
  } catch (e) {
    const err = handleFetchError(e);
    if (err.status === 400) {
      return [];
    }
    throw json({ error: err.error }, { status: err.status });
  }
}

export const bookLoader = async ({ request }) => {
  const books = await getBooks(request);
  return defer({
    books
  });
}

const Explore = () => {
  return (
    <div>
      {/* <SearchBook /> */}
      <BookApi/>
      {/* <BookTrendingApi /> */}
      {/* <BookApiCategory /> */}
      {/* <BookTrending /> */}
      {/* <Categories /> */}
      {/* <LatestBook /> */}
      {/* <Collection /> */}
      {/*<ListCategory/>*/}
      {/*<CustomCategory/>*/}
      {/* <BookCarousel /> */}
    </div>
  );
};

export default Explore;
