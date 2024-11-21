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
          </div>

          {/* Book Information */}
          <div className="w-2/3">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            {book.originalTitle && (
              <h2 className="text-lg text-gray-600 mb-4 italic">
                Original Title: {book.originalTitle}
              </h2>
            )}
            <p className="text-gray-800 mb-4">{book.description}</p>
            <div className="text-gray-700 mb-4">
              <strong>Publication Year:</strong> {book.publicationYear}
            </div>

            {/* Authors Section */}
            {book.authors?.$values && book.authors.$values.length > 0 && (
              <div className="mb-4">
                <strong>Authors:</strong>
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
              <div className="mb-4">
                <strong>Categories:</strong>
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
              <div className="mb-4">
                <strong>Publisher:</strong> <span className="text-gray-700">{book.publisher.publisherName}</span>
              </div>
            )}

            <div className="flex justify-start">
              <button
                className="bg-indigo-600 text-white rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700"
                onClick={() => setDialogVisible(true)}
              >
                Tạo bài viết tóm tắt
              </button>
            </div>
          </div>
        </div>
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