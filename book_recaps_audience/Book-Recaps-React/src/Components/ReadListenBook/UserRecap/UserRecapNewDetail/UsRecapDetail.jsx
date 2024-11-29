import { Await, defer, generatePath, json, Link, useLoaderData } from 'react-router-dom';
import "./UsRecapDetail.scss";
import { axiosInstance } from "../../../../utils/axios";
import { resolveRefs } from "../../../../utils/resolveRefs";
import { routes } from "../../../../routes";
import { Image } from "primereact/image";
import { handleFetchError } from "../../../../utils/handleFetchError";
import { Suspense } from "react";
import { Divider } from "primereact/divider";
import { RiEyeLine, RiHeadphoneLine, RiThumbUpLine } from "react-icons/ri";

const getBookDetail = async (bookId, request) => {
  try {
    const response = await axiosInstance.get(`/api/book/getbookbyid/${bookId}`, {
      signal: request.signal
    });
    return resolveRefs(response.data.data);
  } catch (e) {
    const err = handleFetchError(e);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const bookDetailLoader = async ({ params, request }) => {
  return defer({
    book: getBookDetail(params.id, request),
  })
}

const UserRecapDetail = () => {
  const { book: promisedBook } = useLoaderData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={promisedBook} errorElement={<div>Error fetching book details</div>}>
        {(book) => (
          <div className="mt-10 mx-5 p-6 max-w-4xl md:mx-auto bg-white shadow-md rounded-lg">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Book Cover Image */}
              <div className="w-full md:w-1/3 mb-0">
                <Image
                  src={book.coverImage || "/empty-image.jpg"}
                  alt={book.title + " (" + book.publicationYear + ")"}
                  className="block overflow-hidden rounded-md shadow-md w-full"
                  imageClassName="aspect-[3/4] object-cover w-full bg-white"
                  preview
                />
              </div>

              {/* Book Information */}
              <div className="w-full md:w-2/3">
                <h1 className="text-3xl font-bold mb-2">{book.title} ({book.publicationYear})</h1>
                {book.originalTitle && (
                  <h2 className="text-gray-700 mb-3 italic">
                    Tên gốc: <strong>{book.originalTitle}</strong>
                  </h2>
                )}
                <p className="text-gray-800 mb-4">{book.description}</p>

                {/* Authors Section */}
                {book.authors?.$values && book.authors.$values.length > 0 && (
                  <div className="mb-3">
                    <strong>Tác giả:</strong>
                    <ul className="list-disc ml-5">
                      {book.authors.$values.map((author) => (
                        <li key={author.id} className="text-gray-700">
                          {author.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Categories Section */}
                {book.categories?.$values && book.categories.$values.length > 0 && (
                  <div className="mb-3">
                    <strong>Thể loại:</strong>
                    <ul className="list-disc ml-5">
                      {book.categories.$values.map((category) => (
                        <li key={category.id} className="text-gray-700">
                          {category.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Publisher Section */}
                {book.publisher && (
                  <div className="mb-3">
                    <strong>Nhà xuất bản:</strong>
                    <ul className="list-disc ml-5">
                      <li className="text-gray-700">
                        {book.publisher.publisherName}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Divider/>

            <h2 className="font-semibold mb-3 italic text-gray-700">
              Các bài viết hiện có:
            </h2>
            {book.recaps && book.recaps.$values.length > 0 ? (
              book.recaps.$values
                .filter((recap) => recap.isPublished)
                .map((recap) => {
                  return (
                    <Link
                      key={recap.id}
                      to={generatePath(routes.recapPlayer, { recapId: recap.id })}
                      className="relative block border border-gray-300 p-4 pr-20 my-4 rounded-md cursor-pointer hover:bg-green-50/50"
                    >
                      {recap.contributor && (
                        <div className="flex gap-2 items-center text-xs">
                          <div className="w-6 h-6">
                            <img
                              src={recap.contributor.imageUrl?.replace("Files/Image/jpg/ad.jpg", "") || '/avatar-placeholder.png'}
                              alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
                          </div>
                          <p className="font-semibold line-clamp-2">{recap.contributor.fullName}</p>
                        </div>
                      )}

                      <p className="text-gray-700 mb-2 italic line-clamp-2" title={recap.name || book.title}>
                        Bài viết: <strong>{recap.name || `"${recap.book.title}"`}</strong>
                      </p>

                      {/* Views, Likes, Audio length*/}
                      <div className="flex gap-2 items-center text-sm text-gray-500">
                        <p className="flex items-center gap-2">
                          <span className="bg-green-100 p-1 rounded"><RiEyeLine size={17}/></span>
                          <span>{recap.viewsCount || 0} Lượt xem</span>
                        </p>
                        <p>·</p>
                        <p className="flex items-center gap-2">
                          <span className="bg-green-100 p-1 rounded"><RiThumbUpLine size={17}/></span>
                          <span>{recap.likesCount || 0} Lượt thích</span>
                        </p>
                        <p>·</p>
                        <p className="flex items-center gap-2">
                          <span className="bg-green-100 p-1 rounded"><RiHeadphoneLine size={17}/></span>
                          <span>{Number((recap.currentVersion?.audioLength || 0) / 60).toFixed(0)} phút</span>
                        </p>
                      </div>

                      {recap.isPremium && (
                        <span className="absolute top-2 right-2 bg-yellow-400 text-sm rounded px-2 py-1">Premium</span>
                      )}
                    </Link>
                  );
                })
            ) : (
              <p className="text-gray-400 text-center italic">
                Sách chưa có bài Recap nào. Hãy đợi vài ngày nữa nhé!
              </p>
            )}
          </div>
        )}
      </Await>
    </Suspense>
  );
};

export default UserRecapDetail;
