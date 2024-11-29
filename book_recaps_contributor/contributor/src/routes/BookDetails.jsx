import {
  Await,
  defer,
  Form,
  generatePath,
  json,
  Navigate,
  useActionData,
  useAsyncValue,
  useLoaderData
} from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Image } from 'primereact/image';
import { Suspense, useEffect, useState } from "react";

import { axiosInstance } from "../utils/axios";
import { handleFetchError } from "../utils/handleFetchError";
import CustomBreadCrumb from "../components/CustomBreadCrumb";
import { routes } from "../routes";
import Modal from "../components/modal";
import { useAuth } from "../contexts/Auth";
import TextInput from "../components/form/TextInput";
import { cn } from "../utils/cn";
import { useToast } from "../contexts/Toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from "primereact/divider";
import { RiEyeLine, RiHeadphoneLine, RiThumbUpLine } from "react-icons/ri";

const getBook = async (bookId, request) => {
  try {
    const response = await axiosInstance.get('/api/book/getbookbyid/' + bookId, {
      signal: request.signal
    });
    return response.data.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const bookDetailsLoader = async ({ request, params }) => {
  const book = getBook(params.bookId, request);
  return defer({ book });
}

const BookDetails = () => {
  const { book } = useLoaderData();
  const actionData = useActionData();
  const { showToast } = useToast();
  const [ dialogVisible, setDialogVisible ] = useState(false);

  useEffect(() => {
    if (actionData?.error) {
      if (actionData.status === 400 && actionData.data?.id) {
        showToast({
          severity: 'warn',
          summary: 'Warning',
          detail: actionData.error,
        });
      } else {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: actionData.error,
        });
        setDialogVisible(false);
      }
    }
  }, [ actionData ]);

  if (actionData?.error && actionData.status === 400 && actionData.data?.id) {
    return <Navigate to={generatePath(routes.recapDetails, { recapId: actionData.data.id })}/>;
  }

  return (
    <>
      <CustomBreadCrumb items={[ { label: "Books", path: routes.books }, { label: "Book details" } ]}/>

      <Suspense
        fallback={
          <div className="h-32 flex gap-2 justify-center items-center">
            <div>
              <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                               fill="var(--surface-ground)" animationDuration=".5s"/>
            </div>
            <p>Loading book information...</p>
          </div>
        }>
        <Await resolve={book} errorElement={
          <div className="h-14 flex gap-2 justify-center items-center italic font-semibold text-gray-400">
            Error loading book info!
          </div>
        }>
          <BookDetailsImpl dialogVisible={dialogVisible} setDialogVisible={setDialogVisible}/>
        </Await>
      </Suspense>

    </>
  );
}

export default BookDetails;

const BookDetailsImpl = ({ dialogVisible, setDialogVisible }) => {
  const book = useAsyncValue();
  const { user } = useAuth();

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
        <div className="flex flex-col lg:flex-row">
          {/* Book Cover Image */}
          <div className="w-1/3 mb-0 pr-6">
            <Image
              src={book.coverImage || "/empty-image.jpg"}
              alt={book.title}
              className="block overflow-hidden rounded-md shadow-md"
              imageClassName="aspect-[3/4] object-cover w-full bg-white"
              preview
            />

            <div className="flex justify-center mx-auto mt-4">
              <button
                className="bg-indigo-600 text-white rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700"
                onClick={() => setDialogVisible(true)}
              >
                Tạo bài viết tóm tắt
              </button>
            </div>
          </div>

          {/* Book Information */}
          <div className="w-2/3">
            <h1 className="text-3xl font-bold mb-2">{book.title} ({book.publicationYear})</h1>
            {book.originalTitle && (
              <h2 className="text-gray-700 mb-3 italic">
                Tên gốc: {book.originalTitle}
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
          book.recaps.$values.map((recap) => {
            return (
              <a
                key={recap.id}
                href={import.meta.env.VITE_AUDIENCE_ENDPOINT + '/recap/' + recap.id}
                rel="noopener noreferrer"
                target="_blank"
                className="relative block border border-gray-300 p-4 pr-20 my-4 rounded-md cursor-pointer hover:bg-gray-50"
              >
                {recap.contributor && (
                  <div className="flex gap-2 items-center text-sm mb-2">
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
              </a>
            );
          })
        ) : (
          <p className="text-gray-400 text-center italic">
            Sách chưa có Recap nào.
          </p>
        )}
      </div>

      <Dialog
        visible={dialogVisible}
        onHide={() => {
          if (!dialogVisible) return;
          setDialogVisible(false);
        }}
        content={({ hide }) => (
          <Modal.Wrapper>
            <Modal.Header title="Tạo bài viết tóm tắt" onClose={(e) => hide(e)}/>
            <Modal.Body className="pb-0">
              <Form className="flex flex-col gap-1" method="post">
                <input type="hidden" name="bookId" value={book.id}/>
                <input type="hidden" name="userId" value={user.id}/>
                <TextInput
                  id="name"
                  label="Tên bài viết:"
                  name="name"
                  placeholder="Tên bài viết tóm tắt"
                  required
                />
                <Modal.Footer className="-mx-5 mt-5 justify-end gap-3 text-sm">
                  <button
                    className={cn({
                      "bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300": true,
                      "opacity-50 cursor-not-allowed": navigation.state === "loading"
                    })}
                    type="button"
                    onClick={hide}
                    disabled={navigation.state === "loading"}
                  >
                    Hủy
                  </button>

                  <button
                    className={cn({
                      "text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700": true,
                      "opacity-50 cursor-not-allowed": navigation.state === "loading"
                    })}
                    type="submit"
                    disabled={navigation.state === "loading"}
                  >
                    {navigation.state === "loading" ? "Loading..." : "Tạo"}
                  </button>
                </Modal.Footer>
              </Form>
            </Modal.Body>
          </Modal.Wrapper>
        )}
      />
    </>
  );
}