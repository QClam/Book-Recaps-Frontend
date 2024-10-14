import { useState, useEffect } from "react";
import BookList from "./BookList";

const SearchBook = () => {
    const [books, setBooks] = useState([]);
    const [input, setInput] = useState('');
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (input) {  
            getBooks();
        } else {
            setBooks([]);  
        }
    }, [input]);

    const getBooks = async () => {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${input}&key=AIzaSyB2so12nLWU0PHbITbm65e2HXPKs52ua_c`);
        const data = await res.json();
        if (data.items) {
            setBooks(data.items);
        }
    }

    const containerStyle = {
        position: 'relative',  // Bố cục của container chính là tương đối
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',  // Đặt nội dung nằm ở bên phải
    };

    const inputContainerStyle = {
        marginBottom: '15px',
        width: '300px',  // Cung cấp chiều rộng cho thanh tìm kiếm
    };

    const searchBarStyle = {
        width: '100%',
        padding: '9px',
        borderRadius: '4px',
        marginLeft: '-30px',
        // border: '1px solid #ddd'
    };

    const bookListStyle = {
        position: 'absolute',  // Làm cho danh sách sách nổi lên trên các mục khác
        top: '100%',  // Đặt ngay dưới thanh tìm kiếm
        left: '0',
        width: '900px',  // Đảm bảo danh sách sách có cùng chiều rộng với thanh tìm kiếm
        maxHeight: '700px',  // Giới hạn chiều cao của danh sách sách, thêm thanh cuộn nếu cần
        overflowY: 'scroll', // Sử dụng 'scroll' để có thể cuộn được khi cần
        backgroundColor: '#fff',
        // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 2,  // Đảm bảo danh sách sách nằm trên tất cả các phần tử khác
        scrollbarWidth: 'none',  // Ẩn thanh cuộn trên các trình duyệt hỗ trợ
        msOverflowStyle: 'none', // Ẩn thanh cuộn trên Internet Explorer và Edge
        marginLeft: '-200px',
        marginTop: '-50px'
    };

    const bookListContainerStyle = {
        position: 'relative',  // Đảm bảo khung chứa danh sách sách không bị ảnh hưởng
        width: '400px',  // Đảm bảo khung chứa có cùng chiều rộng với thanh tìm kiếm
        height: 'auto',
    };

    const buttonStyle = {
        marginTop: '15px',
        padding: '8px 12px',
        // backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    };

    const buttonHoverStyle = {
        // backgroundColor: '#0056b3'
    };

    return (
        <div style={containerStyle}>
            <div style={inputContainerStyle}>
                <input 
                    style={searchBarStyle}
                    type="text" 
                    value={input} 
                    onChange={(e) => { setInput(e.target.value) }} 
                    placeholder="Search..." 
                    autoFocus 
                />
            </div>
            {input && (
                <div style={bookListContainerStyle}>
                    <div style={bookListStyle}>
                        <BookList books={showAll ? books : books.slice(0, 5)} />
                    </div>
                    {books.length > 5 && !showAll && (
                        <button 
                            onClick={() => setShowAll(true)} 
                            style={buttonStyle}
                        >
                            Show All Search Results
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBook;
