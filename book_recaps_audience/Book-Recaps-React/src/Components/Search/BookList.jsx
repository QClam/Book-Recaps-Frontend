const BookList = ({ books }) => {
    const booksStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        alignItems: 'center', 
        width: '100%',
    };

    const bookContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        width: '100%',
        maxWidth: '33.33%', 
    };

    const bookThumbnailStyle = {
        width: '40px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '4px'
    };

    const bookInfoStyle = {
        flex: '1'
    };

    const bookTitleStyle = {
        fontSize: '14px',
        fontWeight: 'bold',
        margin: '0'
    };

    const bookAuthorStyle = {
        fontSize: '12px',
        margin: '4px 0 0 0',
        color: '#555'
    };

    return (
        <div style={booksStyle}>
            {books.map((book) => (
                <div style={bookContainerStyle} key={book.id}>
                    {book.volumeInfo.imageLinks && 
                        <img 
                            style={bookThumbnailStyle} 
                            src={book.volumeInfo.imageLinks.smallThumbnail} 
                            alt={book.volumeInfo.title} 
                        />
                    }
                    <div style={bookInfoStyle}>
                        <h3 style={bookTitleStyle}>{book.volumeInfo.title}</h3>
                        <p style={bookAuthorStyle}>By: {book.volumeInfo.authors ? book.volumeInfo.authors.join(", ") : 'Anonymous'}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default BookList;
