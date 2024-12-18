import { useEffect, useState } from "react";
import { generatePath, Link, useLoaderData} from 'react-router-dom';
import ReactPaginate from "react-paginate";
import "./BookApi.scss";
// import { resolveRefs } from "../../../utils/resolveRefs";
import { routes } from "../../../routes";
import Show from "../../Show"; // Import CSS cho styling

const BookApi = () => {
  const { books } = useLoaderData();
  const [ filteredBooks, setFilteredBooks ] = useState([]);
  const [ currentPage, setCurrentPage ] = useState(0);
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
    const extractFilters = (booksData) => {
      const categorySet = new Set();
      const ageLimitSet = new Set();
      const publicationYearSet = new Set();
      const publisherSet = new Set();

      booksData.forEach((book) => {
        if (book.categoryNames?.$values) book.categoryNames.$values.forEach((n) => categorySet.add(n));
        if (book.publicationYear) publicationYearSet.add(book.publicationYear);
        if (book.publisherName) publisherSet.add(book.publisherName);
        ageLimitSet.add(book.ageLimit);
      });

      setCategories([ ...categorySet ]);
      setAgeLimits([ ...ageLimitSet ].sort((a, b) => a - b));
      setPublicationYears([ ...publicationYearSet ].sort((a, b) => b - a));
      setPublishers([ ...publisherSet ]);
    };

    extractFilters(books);
  }, []);

  // Hàm xử lý khi thay đổi Search hoặc Filter
  useEffect(() => {
    let tempBooks = [ ...books ];

    // Apply Search by title
    if (searchTitle) {
      tempBooks = tempBooks.filter((book) =>
        book.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
        (book.originalTitle && book.originalTitle.toLowerCase().includes(searchTitle.toLowerCase()))
      );
    }

    // Apply Search by author
    if (searchAuthor) {
      const lowerSearchAuthor = searchAuthor.toLowerCase();
      tempBooks = tempBooks.filter((book) =>
        book.authorNames?.$values &&
        book.authorNames.$values.some((name) => name.toLowerCase().includes(lowerSearchAuthor))
      );
    }

    // Apply Filter (Categories, Age Limit, Publication Year)
    if (selectedCategories.length > 0) {
      tempBooks = tempBooks.filter((book) =>
        book.categoryNames?.$values &&
        book.categoryNames.$values.some((name) => selectedCategories.includes(name))
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
        book.publisherName === selectedPublisher
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
    selectedPublisher
  ]);

  // Tính toán phân trang
  const booksPerPage = 16; // Số lượng sách mỗi trang
  const pageCount = filteredBooks.length > 0 ? Math.ceil(filteredBooks.length / booksPerPage) : 1;
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

  return (
    <div className="book-api-container container mx-auto max-w-screen-xl mb-4 pt-6 md:pt-12 md:px-12">
      {/* <h1 className="title">Danh Sách Sách</h1> */}


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
                <Link
                  key={book.id}
                  to={generatePath(routes.bookDetail, { id: book.id })}
                  className="bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="block p-2">
                    <img
                      src={book.coverImage || "/empty-image.jpg"}
                      alt={book.title}
                      className="block overflow-hidden shadow-md aspect-[3/4] object-cover w-full bg-gray-200"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col items-start">
                    <h2 className="text-lg mb-2 text-gray-800 font-bold line-clamp-2" title={book.title}>
                      {book.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-1 mb-2" title={book.originalTitle}>
                      Tên gốc: <strong>{book.originalTitle}</strong>
                    </p>
                    {book.authorNames?.$values?.length > 0 && (
                      <p className="text-sm text-gray-600 mb-2" title={book.authorNames.$values.join(", ")}>
                        Tác giả: <strong>{book.authorNames.$values.join(", ")}</strong>
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-2">
                      Năm xuất bản: <strong>{book.publicationYear}</strong>
                    </p>
                  </div>
                </Link>
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
