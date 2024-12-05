import { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { axiosInstance2 } from "../../../utils/axios";
import { LuThumbsDown, LuThumbsUp } from "react-icons/lu";
import { Image } from "primereact/image";

const getBooks = async (categories, authors, controller) => {
  try {
    const response = await axiosInstance2.get("/ml/onboarding/books", {
      params: {
        categories: categories.map(c => c.id).join(','),
        authors: authors.map(a => a.id).join(',')
      },
      signal: controller.signal
    });
    return response.data;
  } catch (error) {
    console.error("Error get books:", error);
    return [];
  }
};

const BookSelection = ({ onNext, onBookSelect, selectedAuthors, selectedCategories }) => {
  const [ books, setBooks ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ currentBookIndex, setCurrentBookIndex ] = useState(0);
  const [ likesCount, setLikesCount ] = useState(0);
  const [ dislikesCount, setDislikesCount ] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBooks = async () => {
      setLoading(true);
      const data = await getBooks(selectedCategories, selectedAuthors, controller);

      setBooks(data);
      setLoading(false);
    }

    fetchBooks();

    return () => {
      controller.abort();
    }
  }, []);

  const handleBookReaction = (liked) => {
    if (liked) {
      setLikesCount(prev => {
        onBookSelect(books[currentBookIndex]);
        if (prev + 1 >= 3 || likesCount + dislikesCount + 1 >= books.length) {
          onNext();
        }
        return prev + 1;
      });
    } else {
      setDislikesCount(prev => {
        if (likesCount + dislikesCount + 1 >= books.length) {
          onNext();
        }
        return prev + 1;
      });
    }

    if (currentBookIndex < books.length - 1) {
      setCurrentBookIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return <div className="loading-indicator">Loading...</div>;
  }

  if (books.length === 0) {
    return <div className="step-content"></div>;
  }

  return (
    <div className="step-content">
      <h2>Chọn cuốn sách mà bạn cảm thấy hứng thú</h2>
      <div className="book-selection">
        <div
          className="flex w-48 flex-col justify-center items-center border rounded-lg shadow p-3 relative bg-white hover:shadow-lg mx-auto gap-3 mb-3">
          <div className="relative bg-gray-200">
            <Image
              src={books[currentBookIndex].coverImage || "/empty-image.jpg"}
              alt={books[currentBookIndex].title}
              className="!block overflow-hidden rounded-md shadow-md w-full"
              imageClassName="aspect-[3/4.5] object-cover w-full bg-white"
              preview
            />
          </div>
          <div
            className="text-lg font-bold mb-2 line-clamp-2"
            title={`${books[currentBookIndex].title} (${books[currentBookIndex].publicationYear})`}
          >
            {books[currentBookIndex].title} ({books[currentBookIndex].publicationYear})
          </div>
        </div>
        <div className="book-buttons">
          <Button variant="contained" color="error" onClick={() => handleBookReaction(false)} disabled={loading}>
            <LuThumbsDown size={25}/>
          </Button>
          <Button variant="contained" color="primary" onClick={() => handleBookReaction(true)} disabled={loading}>
            <LuThumbsUp size={25}/>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookSelection;
