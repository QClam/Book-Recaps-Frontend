import { useEffect, useState } from "react";
import { generatePath, useNavigate } from 'react-router-dom';
import ReactPaginate from "react-paginate";
import "./BookApi.scss";
import { axiosInstance } from "../../../utils/axios";
// import { resolveRefs } from "../../../utils/resolveRefs";
import { routes } from "../../../routes";
import Show from "../../Show"; // Import CSS cho styling

const BookApi = () => {
  const [ books, setBooks ] = useState([]);
  const [ filteredBooks, setFilteredBooks ] = useState([]);
  const [ currentPage, setCurrentPage ] = useState(0);
  const [ error, setError ] = useState(null); // For error handling
  const booksPerPage = 16; // Số lượng sách mỗi trang
  const navigate = useNavigate();
  // Trạng thái cho Search
  const [ searchTitle, setSearchTitle ] = useState("");
  const [ searchAuthor, setSearchAuthor ] = useState("");

  // Trạng thái cho Filter
  const [ categories, setCategories ] = useState([]);
  const [ selectedCategories, setSelectedCategories ] = useState([]);
  const [ ageLimits, setAgeLimits ] = useState([]);
  const [ selectedAgeLimit, setSelectedAgeLimit ] = useState("");
  const [ publicationYears, setPublicationYears ] = useState([]);
  const [ selectedPublicationYear, setSelectedPublicationYear ] = useState("");

  // State for publisher filter
  const [ publishers, setPublishers ] = useState([]);
  const [ selectedPublisher, setSelectedPublisher ] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch books data from the API
        const response = await axiosInstance.get("/api/book/getallbooks");

        // const data = resolveRefs(response.data);
        const data = response.data;
        // console.log("Fetched Books Data:", data); // Kiểm tra dữ liệu

        if (data && data.data && Array.isArray(data.data.$values)) {
          setBooks(data.data.$values); // Giả sử dữ liệu sách nằm trong `data.$values`
          setFilteredBooks(data.data.$values);
          extractFilters(data.data.$values);
        } else {
          setBooks([]);
          setFilteredBooks([]);
        }
      } catch (error) {
        // Nếu token hết hạn, thử làm mới nó
        setError(error.message);
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  // Hàm để trích xuất các giá trị lọc từ dữ liệu sách
  const extractFilters = (booksData) => {
    const categorySet = new Set();
    const ageLimitSet = new Set();
    const publicationYearSet = new Set();
    const publisherSet = new Set();

    booksData.forEach((book) => {
      // Categories
      if (book.categories && book.categories.$values) {
        book.categories.$values.forEach((cat) => categorySet.add(cat.name));
      }

      // Age Limits
      ageLimitSet.add(book.ageLimit);

      // Publication Years
      publicationYearSet.add(book.publicationYear);

      if (book.publisher && book.publisher.publisherName) {
        publisherSet.add(book.publisher.publisherName);
      }

    });

    setCategories([ ...categorySet ]);
    setAgeLimits([ ...ageLimitSet ].sort((a, b) => a - b));
    setPublicationYears([ ...publicationYearSet ].sort((a, b) => b - a));
    setPublishers([ ...publisherSet ]);

  };

  // Hàm xử lý khi thay đổi Search hoặc Filter
  useEffect(() => {
    let tempBooks = [ ...books ];

    // Apply Search by title
    if (searchTitle) {
      tempBooks = tempBooks.filter((book) =>
        book.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    // Apply Search by author
    if (searchAuthor) {
      const lowerSearchAuthor = searchAuthor.toLowerCase();
      tempBooks = tempBooks.filter((book) =>
        book.authors &&
        book.authors.$values &&
        book.authors.$values.some(
          (author) =>
            author.name &&
            author.name.toLowerCase().includes(lowerSearchAuthor)
        )
      );
    }

    // Apply Filter (Categories, Age Limit, Publication Year)
    if (selectedCategories.length > 0) {
      tempBooks = tempBooks.filter((book) =>
        book.categories &&
        book.categories.$values &&
        book.categories.$values.some((cat) =>
          selectedCategories.includes(cat.name)
        )
      );
    }

    if (selectedAgeLimit !== "") {
      tempBooks = tempBooks.filter(
        (book) => book.ageLimit === Number(selectedAgeLimit)
      );
    }

    if (selectedPublicationYear !== "") {
      tempBooks = tempBooks.filter(
        (book) => book.publicationYear === Number(selectedPublicationYear)
      );
    }

    // Apply publisher filter
    if (selectedPublisher) {
      tempBooks = tempBooks.filter((book) =>
        book.publisher?.publisherName === selectedPublisher
      );
    }

    setFilteredBooks(tempBooks);
    setCurrentPage(0); // Reset về trang đầu khi có thay đổi
  }, [
    books,
    searchTitle,
    searchAuthor,
    selectedCategories,
    selectedAgeLimit,
    selectedPublicationYear,
    selectedPublisher,

  ]);

  // Tính toán phân trang
  const pageCount =
    filteredBooks.length > 0 ? Math.ceil(filteredBooks.length / booksPerPage) : 1;
  const offset = currentPage * booksPerPage;
  const currentBooks = filteredBooks.slice(offset, offset + booksPerPage);

  // Xử lý khi thay đổi trang
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Xử lý thay đổi các bộ lọc
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedCategories([ ...selectedCategories, value ]);
    } else {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== value));
    }
  };

  const handleAgeLimitChange = (e) => {
    setSelectedAgeLimit(e.target.value);
  };

  const handlePublicationYearChange = (e) => {
    setSelectedPublicationYear(e.target.value);
  };

  const handlePublisherChange = (e) => {
    setSelectedPublisher(e.target.value);
  };

  // const handleBookClick = (id) => {
  //   navigate(`/bookdetailbook/${id}`); // Use the book's id for navigation
  // };
  const handleBookClick = (id) => {
    navigate(generatePath(routes.bookDetail, { id })); // Navigate to UserRecapDetail with the book ID
  };

  return (
    <div className="book-api-container container mx-auto max-w-screen-xl mb-4 pt-6 md:pt-12 md:px-12">
      {/* <h1 className="title">Danh Sách Sách</h1> */}

      {error && <p className="error">Lỗi: {error}</p>}

      {/* Phần Search và Filter */}
      <div className="filters-container">
        <div className="search-section">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tác giả..."
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="flex gap-5">
        <div className="hidden lg:block max-w-fit">
          <h3 className="mb-3 text-lg font-semibold">
            Thể loại
          </h3>
          <div className="flex flex-col gap-1">
            {categories.map((category, i) => (
              <label key={category + i} className="filter-label">
                <input
                  type="checkbox"
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={handleCategoryChange}
                />
                {category}
              </label>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex gap-5 justify-between w-full flex-wrap">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Nhà xuất bản</h3>
              <select
                value={selectedPublisher}
                onChange={handlePublisherChange}
                className="w-full rounded border border-gray-300 p-2"
              >
                <option value="">Tất cả</option>
                {publishers.map((publisher) => (
                  <option key={publisher} value={publisher}>{publisher}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold">Giới hạn tuổi</h3>
              <select
                value={selectedAgeLimit}
                onChange={handleAgeLimitChange}
                className="w-full rounded border border-gray-300 p-2"
              >
                <option value="">Tất cả</option>
                {ageLimits.map((age) => (
                  <option key={age} value={age}>
                    {age === 0 ? "Không giới hạn" : age}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold">Năm xuất bản</h3>
              <select
                value={selectedPublicationYear}
                onChange={handlePublicationYearChange}
                className="w-full rounded border border-gray-300 p-2"
              >
                <option value="">Tất cả</option>
                {publicationYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Danh sách sách */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <Show when={currentBooks.length > 0} fallback={<p className="text-center">Không tìm thấy sách nào.</p>}>
              {currentBooks.map((book) => (
                <div
                  className="bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg"
                  key={book.id}
                  onClick={() => handleBookClick(book.id)}
                >
                  <div className="block bg-gray-200">
                    <img
                      src={book.coverImage || "/empty-image.jpg"}
                      alt={book.title}
                      className="block overflow-hidden shadow-md aspect-[3/4] object-cover w-full bg-gray-50"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col items-start">
                    <h2 className="text-lg mb-2 text-gray-800 font-bold line-clamp-2" title={book.title}>
                      {book.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-1 mb-2" title={book.originalTitle}>
                      Tên gốc: <strong>{book.originalTitle}</strong>
                    </p>
                    {book.authors && book.authors.$values.length > 0 && (
                      <p className="text-sm text-gray-600 mb-2"
                         title={book.authors.$values.map((author) => author.name).join(", ")}>
                        Tác giả: <strong>{book.authors.$values.map((author) => author.name).join(", ")}</strong>
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-2">
                      Năm xuất bản: <strong>{book.publicationYear}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </Show>
          </div>

          {/* Phân trang */}
          {filteredBooks.length > 0 && (
            <ReactPaginate
              previousLabel={"Trước"}
              nextLabel={"Sau"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={1}
              pageRangeDisplayed={1}
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              activeClassName={"active"}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookApi;
