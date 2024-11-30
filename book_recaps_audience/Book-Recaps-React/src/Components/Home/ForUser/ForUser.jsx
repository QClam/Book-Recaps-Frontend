import { generatePath, Link } from 'react-router-dom';
import { routes } from "../../../routes";
import Show from "../../Show";
import SuspenseAwait from "../../SuspenseAwait";

const ForUser = ({ promisedRecaps, title, description, emptyMessageIdx }) => {
  const emptyMessage = [
    {
      title: "Lịch sử xem của bạn đang trống",
      content: "Hãy bắt đầu đọc sách để nhận được các bài viết đề xuất dành riêng cho bạn!"
    },
    {
      title: "Chưa có bài viết nào",
      content: "Hãy quay lại sau để xem các bài viết mới nhé."
    }
  ]

  return (
    <div className="flex flex-col w-full pt-6 md:pt-12 mx-auto md:px-12">
      <div className="flex flex-col mb-6">
        <h3 className="font-semibold text-2xl">{title}</h3>
        <p>{description}</p>
      </div>
      <SuspenseAwait
        fallback={<div>Loading...</div>} resolve={promisedRecaps}
        errorElement={<div>Error fetching recommendations</div>}
      >
        {(recaps) => (
          <Show
            when={recaps.length > 0}
            fallback={
              <div className="rounded-md border border-gray-300 p-5 bg-white/50">
                <h4 className="font-semibold text-gray-900">
                  {emptyMessage[emptyMessageIdx].title}
                </h4>
                <p>
                  {emptyMessage[emptyMessageIdx].content}
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
                    <div className="border-t border-gray-300 mb-2">
                    </div>
                    <p className="text-gray-700 text-xs mb-1 italic line-clamp-2"
                       title={recap.name || recap.book.title}>
                      Bài viết: <strong>{recap.name || `"${recap.book.title}"`}</strong>
                    </p>

                    {/*<div className="flex gap-2 items-center text-xs text-gray-500 mb-2">*/}
                    {/*  <p className="flex items-center gap-2">*/}
                    {/*    <span className="bg-green-100 p-1 rounded"><RiEyeLine size={14}/></span>*/}
                    {/*    <span>{recap.viewsCount || 0}</span>*/}
                    {/*  </p>*/}
                    {/*  <p>·</p>*/}
                    {/*  <p className="flex items-center gap-2">*/}
                    {/*    <span className="bg-green-100 p-1 rounded"><RiThumbUpLine size={14}/></span>*/}
                    {/*    <span>{recap.likesCount || 0}</span>*/}
                    {/*  </p>*/}
                    {/*</div>*/}

                    <div
                      // to={generatePath(routes.becomeContributor)}
                      // onClick={(e) => e.stopPropagation()}
                      className="flex gap-2 items-center text-xs">
                      <div className="w-6 h-6">
                        <img
                          src={recap.user.imageUrl?.replace("Files/Image/jpg/ad.jpg", "") || '/avatar-placeholder.png'}
                          alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
                      </div>
                      <p className="font-semibold line-clamp-2">{recap.user.fullName}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Show>
        )}
      </SuspenseAwait>
    </div>
  );
};

export default ForUser;
