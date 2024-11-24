import React, { useEffect, useState } from 'react';
import './AuthorApi.scss';
import axios from "axios";
import { generatePath, useNavigate } from 'react-router-dom';
import { routes } from "../../../routes";

const AuthorApi = () => {
  const [ authors, setAuthors ] = useState([]);
  const [ sortedAuthors, setSortedAuthors ] = useState([]); // Tạo trạng thái riêng cho danh sách sắp xếp
  const [ error, setError ] = useState(null);
  const [ sortOrder, setSortOrder ] = useState("asc"); // Thêm trạng thái để lưu trữ thứ tự sắp xếp
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const navigate = useNavigate(); // For navigating to author-specific pages

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get(
          "https://bookrecaps.cloud/api/authors/getallauthors",
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
          }
        );

        const data = response.data;
        if (data && data.data && Array.isArray(data.data.$values)) {
          setAuthors(data.data.$values);
        } else {
          setAuthors([]);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchAuthors();
        } else {
          setError(error.message);
        }
      }
    };

    fetchAuthors();
  }, [ accessToken ]);

  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://bookrecaps.cloud/api/tokens/refresh", {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;

      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
    } catch (error) {
      setError("Session expired. Please log in again.");
    }
  };

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
