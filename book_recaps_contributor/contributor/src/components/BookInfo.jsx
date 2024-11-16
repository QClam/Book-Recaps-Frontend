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
            className="overflow-hidden aspect-[3/4] object-cover w-full rounded-md shadow-md bg-white"
            preview
          />
        </div>
        <div className="">
          <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
          {book.originalTitle && (
            <h2 className="text-lg text-gray-600 mb-4 italic">
              Original Title: {book.originalTitle}
            </h2>
          )}
          <div className="text-gray-700">
            <strong>Publication Year:</strong> {book.publicationYear}
          </div>

          {/* Authors Section */}
          {book.authors && book.authors.length > 0 && (
            <div className="flex items-center gap-5">
              <strong>Authors:</strong>
              <div className="text-gray-700">
                {book.authors.map((author) => author.name).join(", ")}
              </div>
            </div>
          )}

          {/* Categories Section */}
          {book.categories && book.categories.length > 0 && (
            <div className="flex items-center gap-5">
              <strong>Categories:</strong>
              <div className="text-gray-700">
                {book.categories.map((cate) => cate.name).join(", ")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookInfo;