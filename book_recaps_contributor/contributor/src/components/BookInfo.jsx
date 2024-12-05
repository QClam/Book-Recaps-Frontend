import { Image } from "primereact/image";
import { cn } from "../utils/cn";
import Show from "./Show";

const BookInfo = ({ book, compact }) => {

  const authors = book.authors?.$values ? book.authors.$values : book.authors;
  const categories = book.categories?.$values ? book.categories.$values : book.categories

  return (
    <div className="mt-3 border-b pb-4 border-gray-300">
      <div className="flex flex-row">
        {/* Book Cover Image */}
        <div className={cn("w-36 mb-0 pr-6", { "w-28": compact })}>
          <Image
            src={book.coverImage || "/empty-image.jpg"}
            alt={book.title}
            className="block overflow-hidden rounded-md shadow-md"
            imageClassName="aspect-[3/4] object-cover w-full bg-white"
            preview
          />
        </div>
        <div className="">
          <h1 className={cn("text-2xl font-bold mb-2 line-clamp-1", { "text-xl": compact })} title={book.title}>
            {book.title}
          </h1>
          {book.originalTitle && (
            <h2
              className={cn("text-lg text-gray-500 mb-4 italic line-clamp-1", { "text-base mb-2": compact })}
              title={book.originalTitle}
            >
              Tên gốc: <strong>{book.originalTitle}</strong>
            </h2>
          )}

          <Show when={!compact}>
            <div>
              <strong>Năm xuất bản:</strong> {book.publicationYear}
            </div>
          </Show>

          {/* Authors Section */}
          {authors.length > 0 && (
            <div className="flex items-center gap-5">
              <strong>Tác giả:</strong>
              <p className="text-gray-700 line-clamp-1">
                {authors.map((author) => author.name).join(", ")}
              </p>
            </div>
          )}

          {/* Categories Section */}
          {categories.length > 0 && (
            <div className="flex items-center gap-5">
              <strong>Danh mục:</strong>
              <p className="text-gray-700 line-clamp-1">
                {categories.map((cate) => cate.name).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookInfo;