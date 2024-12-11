import { useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import { axiosInstance3 } from "../../../utils/axios";

const getAuthors = async (query, categories, page, controller) => {
  try {
    const response = await axiosInstance3.get('/onboarding/authors', {
      params: {
        categories: categories.map(c => c.id).join(','),
        q: query,
        page
      },
      signal: controller.signal
    })
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error get authors:", error);
    return {
      items: [],
      last_page: 1
    };
  }
};

const AuthorSelection = ({ onNext, onAuthorSelect, selectedCategories }) => {
  const [ selectedAuthors, setSelectedAuthors ] = useState([]);
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ authors, setAuthors ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ page, setPage ] = useState(1);
  const [ lastPage, setLastPage ] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    fetchAuthors(controller);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedAuthors.length === 3) {
      onAuthorSelect(selectedAuthors);
      onNext();
    }
  }, [ selectedAuthors ]);

  useEffect(() => {
    if (page > 1) {
      const controller = new AbortController();
      fetchAuthors(controller, searchTerm, page);
      return () => controller.abort();
    }
  }, [ page ]);

  useEffect(() => {
    const controller = new AbortController();

    if (searchTerm === '') {
      fetchAuthors(controller, '', 1);
    } else {
      fetchAuthors(controller, searchTerm, 1);
    }

    return () => controller.abort();
  }, [ searchTerm ]);

  const fetchAuthors = async (controller, query = '', page = 1) => {
    setLoading(true);
    const data = await getAuthors(query, selectedCategories, page, controller);
    // console.log(data);

    setAuthors(prevAuthors => page === 1 ? data.items : [ ...prevAuthors, ...data.items ]);
    setLastPage(data.last_page);
    setPage(page);
    setLoading(false);
  };

  const handleAuthorChange = (author) => {
    setSelectedAuthors(prev => {
      if (prev.some(a => a.id === author.id)) {
        return prev.filter(auth => auth.id !== author.id);
      } else if (prev.length < 3) {
        return [ ...prev, author ];
      }
      return prev;
    });
  };

  const handleLoadMore = () => {
    if (page >= lastPage) return;

    const nextPage = page + 1;
    setPage(nextPage);
  };

  return (
    <div className="step-content">
      <h2>Chọn 3 tác giả mà bạn yêu thích hoặc từng nghe tới</h2>
      <TextField
        label="Search Authors"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        margin="normal"
      />
      <div className="author-selection">
        {loading && <div className="loading-indicator">Loading...</div>}
        {authors.map(author => (
          <div
            key={author.id}
            className={`author-item ${selectedAuthors.some(a => a.id === author.id) ? 'selected' : ''}`}
            onClick={() => !loading && handleAuthorChange(author)}
          >
            {author.name}
          </div>
        ))}
      </div>
      <br/>
      {lastPage > 1 && page < lastPage &&
        <Button variant="contained" color="primary" onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Xem thêm'}
        </Button>
      }
    </div>
  );
};

export default AuthorSelection;
