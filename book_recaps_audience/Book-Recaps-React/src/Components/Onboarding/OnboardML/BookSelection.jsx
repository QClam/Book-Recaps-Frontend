import { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { axiosInstance } from "../../../utils/axios";

const getBooks = async (categories, authors, controller) => {
  try {
    const response = await axiosInstance.get("/ml/onboarding/books", {
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
      <h2>Select the books that catch your interest</h2>
      <div className="book-selection">
        <div className="book-img-wrapper">
          <img
            src={books[currentBookIndex].coverImage || "/empty-image.jpg"}
            alt={books[currentBookIndex].title}
            className="book-image"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = "/empty-image.jpg";
            }}
          />
        </div>
        <div className="book-item">{books[currentBookIndex].title}</div>
        <div className="book-buttons">
          <Button variant="contained" color="primary" onClick={() => handleBookReaction(true)} disabled={loading}>
            Thumb Up
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleBookReaction(false)} disabled={loading}>
            Thumb Down
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookSelection;
