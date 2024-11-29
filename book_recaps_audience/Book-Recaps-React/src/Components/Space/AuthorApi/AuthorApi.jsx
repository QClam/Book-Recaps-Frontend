import { useEffect, useState } from 'react';
import './AuthorApi.scss';
import { generatePath, useNavigate } from 'react-router-dom';
import { routes } from "../../../routes";
import { axiosInstance } from "../../../utils/axios";

const AuthorApi = () => {
  const [ authors, setAuthors ] = useState([]);
  const [ sortedAuthors, setSortedAuthors ] = useState([]); // Tạo trạng thái riêng cho danh sách sắp xếp
  const [ error, setError ] = useState(null);
  const [ sortOrder, setSortOrder ] = useState("asc"); // Thêm trạng thái để lưu trữ thứ tự sắp xếp
  const navigate = useNavigate(); // For navigating to author-specific pages

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axiosInstance.get("/api/authors/getallauthors");

        const data = response.data;
        if (data && data.data && Array.isArray(data.data.$values)) {
          setAuthors(data.data.$values);
        } else {
          setAuthors([]);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAuthors();
  }, []);

  const handleAuthorClick = (author) => {
    navigate(generatePath(routes.authorBooks, { id: author.id }), { state: { author } }); // Pass author data via state
  };

  // Sắp xếp các tác giả dựa trên thứ tự hiện tại
  const sortAuthors = () => {
    const sorted = [ ...authors ].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setSortedAuthors(sorted);
  };

  // Gọi hàm sắp xếp mỗi khi `sortOrder` thay đổi
  useEffect(() => {
    sortAuthors();
  }, [ sortOrder, authors ]); // Chỉ theo dõi `sortOrder` và `authors`

  // Hàm để chuyển đổi thứ tự sắp xếp
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="author-page">
      <h2>Authors</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Nút để chuyển đổi thứ tự sắp xếp */}

      <button onClick={toggleSortOrder}>
        Sort by Name: {sortOrder === "asc" ? "A → Z" : "Z → A"}
      </button>

      <div className="author-grid">
        {sortedAuthors.map((author) => (
          <div className="author-card" key={author.id} onClick={() => handleAuthorClick(author)}>
            <img src={author.image || 'https://via.placeholder.com/150'} alt={author.name}/>
            <h3>{author.name}</h3>
            <p>{author.books?.$values?.[0]?.categories?.$values?.[0]?.name || 'Unknown Category'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthorApi;
