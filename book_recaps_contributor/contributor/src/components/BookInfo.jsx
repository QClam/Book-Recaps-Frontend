import { Image } from "primereact/image";

const BookInfo = ({ book }) => {
  return (
    <div className="mt-3 border-b pb-4 border-gray-300">
      <div className="flex flex-row">
        {/* Book Cover Image */}
        <div className="w-36 mb-0 pr-6">
          <Image
            src={book.coverImage || "/empty-image.jpg"}
            alt={book.title}
            className="block overflow-hidden rounded-md shadow-md"
            imageClassName="aspect-[3/4] object-cover w-full bg-white"
            preview
          />
        </div>
        <div className="">
          <h1 className="text-2xl font-bold mb-2 line-clamp-1" title={book.title}>{book.title}</h1>
          {book.originalTitle && (
            <h2 className="text-lg text-gray-500 mb-4 italic line-clamp-1" title={book.originalTitle}>
              Original Title: <strong>{book.originalTitle}</strong>
            </h2>
          )}
          <div>
            <strong>Publication Year:</strong> {book.publicationYear}
          </div>

          {/* Authors Section */}
          {book.authors && book.authors.length > 0 && (
            <div className="flex items-center gap-5">
              <strong>Authors:</strong>
              <p className="text-gray-700 line-clamp-1">
                {book.authors.map((author) => author.name).join(", ")}
              </p>
            </div>
          )}

          {/* Categories Section */}
          {book.categories && book.categories.length > 0 && (
            <div className="flex items-center gap-5">
              <strong>Categories:</strong>
              <p className="text-gray-700 line-clamp-1">
                {book.categories.map((cate) => cate.name).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookInfo;