import { Suspense } from 'react';
import { Await, generatePath, Link, useLoaderData } from 'react-router-dom';
import { routes } from "../../../routes";
import Show from "../../Show";

const ForUser = () => {
  const { recapsForYou } = useLoaderData();

  return (
    <div className="flex flex-col w-full pt-6 md:pt-16 mx-auto md:px-12">
      <div className="flex flex-col mb-8">
        <h3 className="font-semibold text-2xl">
          Đề xuất cho bạn
        </h3>
        <p>
          Các bài viết được đề xuất dựa trên lịch sử xem của bạn
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={recapsForYou} errorElement={<div>Error fetching recommendations</div>}>
          {(recaps) => (
            <Show
              when={recaps.length > 0}
              fallback={
                <div className="rounded-md border border-gray-300 p-5 bg-white/50">
                  <h4 className="font-semibold text-gray-900">
                    Lịch sử xem của bạn đang trống
                  </h4>
                  <p>
                    Hãy bắt đầu đọc sách để nhận được các bài viết đề xuất dành riêng cho bạn!
                  </p>
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {recaps.map((recap) => (
                  <Link
                    to={generatePath(routes.recapPlayer, { recapId: recap.id })}
                    key={recap.id}
                    className="block border rounded-lg shadow p-3 relative bg-white hover:shadow-lg"
                  >
                    {recap.isPremium && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-xs rounded px-2 py-1">Premium</span>
                    )}
                    <div className="block bg-gray-200 mb-4">
                      <img
                        src={recap.book.coverImage || "/empty-image.jpg"}
                        alt={recap.book.title}
                        className="block overflow-hidden rounded-md shadow-md aspect-[3/4] object-cover w-full bg-gray-50"
                      />
                    </div>
                    <div className="relative text-sm">
                      <h2 className="font-bold mb-2 line-clamp-2"
                          title={recap.book.title + " (" + recap.book.publicationYear + ")"}>
                        {recap.book.title} ({recap.book.publicationYear})
                      </h2>
                      <p className="text-xs text-gray-600 line-clamp-1 mb-2"
                         title={recap.book.authors.map((author) => author.name).join(", ")}>
                        Tác giả: <strong>{recap.book.authors.map((author) => author.name).join(", ")}</strong>
                      </p>
                      {/*<p className="text-xs text-gray-700 line-clamp-1 mb-2">*/}
                      {/*  Năm xuất bản: <strong>{recap.book.publicationYear}</strong>*/}
                      {/*</p>*/}
                      <div className="border-t border-gray-300 mb-2">
                      </div>
                      <p className="text-gray-700 text-xs mb-1 italic line-clamp-2"
                         title={recap.name || recap.book.title}>
                        Bài viết: <strong>{recap.name || `"${recap.book.title}"`}</strong>
                      </p>
                      <div
                        // to={generatePath(routes.becomeContributor)}
                        // onClick={(e) => e.stopPropagation()}
                        className="flex gap-2 items-center text-xs">
                        <div className="w-6 h-6">
                          <img
                            src={recap.user.imageUrl?.replace("Files/Image/jpg/ad.jpg", "") || '/avatar-placeholder.png'}
                            alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
                        </div>
                        <p className="font-semibold">{recap.user.fullName}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Show>
          )}
        </Await>
      </Suspense>
    </div>
  );
};

export default ForUser;
