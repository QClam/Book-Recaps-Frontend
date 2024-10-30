import {
  Await,
  defer,
  Form,
  json,
  Link,
  redirect,
  useActionData,
  useAsyncValue,
  useLoaderData,
  useNavigation,
  useSearchParams
} from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { axiosInstance, axiosInstance2 } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";
import TextInput from "../../components/form/TextInput";
import { TbSearch } from "react-icons/tb";
import Select from "../../components/form/Select";
import Show from "../../components/Show";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/Auth";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { routes } from "../../routes";
import { useToast } from "../../contexts/Toast";

const getBooks = async (q, category, page, request) => {
  try {
    const response = await axiosInstance2.get('/books/search', {
      params: {
        q,
        category,
        page
      },
      signal: request.signal
    });
    return response.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

const getCategories = async (request) => {
  try {
    const response = await axiosInstance.get('/api/category/getallcategory', {
      signal: request.signal
    });
    return (response.data.data.$values.map((category) => ({
      value: category.id,
      label: category.name
    })));
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export async function booksLoader({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const category = url.searchParams.get("category");
  const page = url.searchParams.get("page");

  const booksPromise = getBooks(q, category, page, request);
  const categories = await getCategories(request);

  return defer({
    booksPagination: booksPromise,
    categories,
    params: {
      q,
      category,
      page
    }
  });
}

export async function createRecapAction({ request }) {
  const formData = await request.formData();
  const bookId = formData.get('bookId');
  const contributorId = formData.get('userId');
  const name = formData.get('name');

  if (!bookId || !contributorId || !name) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  try {
    const response = await axiosInstance.post('/api/recap', {
      bookId, contributorId, name
    });

    return redirect(`/recaps/${response.data.data.id}/version/${response.data.data.currentVersionId}`);
  } catch (error) {
    const err = handleFetchError(error);
    console.log("err", err);

    if (err.status === 400 && err.data?.id) {
      return redirect(`/recaps/${err.data.id}?error=${encodeURIComponent(err.error)}`);
    }

    if (err.status === 401) {
      return redirect(routes.logout);
    }
    return err;
  }
}

const CreateRecap = () => {
  const { booksPagination, categories, params: { q, category } } = useLoaderData();
  const actionData = useActionData();
  let [ , setSearchParams ] = useSearchParams();
  const navigation = useNavigation()
  const { user } = useAuth();
  const { showToast } = useToast();
  const [ dialogVisible, setDialogVisible ] = useState(false);
  const [ chosenBookId, setChosenBookId ] = useState("");

  useEffect(() => {
    document.getElementById("q").value = decodeURIComponent(q ?? "");
    document.getElementById("category").value = category ?? "";
  }, [ q, category ]);

  useEffect(() => {
    if (actionData?.error) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: actionData.error,
      });
      setChosenBookId("");
      setDialogVisible(false);
    }
  }, [ actionData ]);

  const resetFilter = () => {
    setSearchParams({});
  }

  const handleClickCreate = (bookId) => {
    if (!user) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Bạn cần đăng nhập để tạo bài viết tóm tắt',
      });
      return;
    }
    setChosenBookId(bookId);
    setDialogVisible(true);
  }

  return (
    <>
      <Dialog
        visible={dialogVisible}
        modal
        onHide={() => {
          if (!dialogVisible) return;
          setDialogVisible(false);
        }}
        content={({ hide }) => (
          <Form className="flex flex-col py-4 px-5 gap-1 bg-white rounded" method="post">
            <input type="hidden" name="bookId" value={chosenBookId}/>
            <input type="hidden" name="userId" value={user.id}/>
            <TextInput
              id="name"
              label="Recap name:"
              name="name"
              placeholder="Tên bài viết tóm tắt"
              required
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                className={cn({
                  "text-white bg-indigo-600 rounded py-2 px-4 border font-medium hover:bg-indigo-700": true,
                  "opacity-50 cursor-not-allowed": navigation.state === "loading"
                })}
                type="submit"
                disabled={navigation.state === "loading"}
              >
                {navigation.state === "loading" ? "Loading..." : "Tạo"}
              </button>

              <button
                className={cn({
                  "text-white bg-gray-200 rounded py-2 px-4 border font-medium hover:bg-gray-300": true,
                  "opacity-50 cursor-not-allowed": navigation.state === "loading"
                })}
                type="button"
                onClick={(e) => {
                  setChosenBookId("");
                  hide(e);
                }}
                disabled={navigation.state === "loading"}
              >
                Hủy
              </button>
            </div>
          </Form>
        )}
      />
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <h1 className="font-semibold text-lg">Tạo bài viết tóm tắt mới</h1>
        <p>
          Chọn một quyển sách từ danh sách dưới đây để tạo bài viết tóm tắt mới.
        </p>
      </div>
      <Form id="search-form" role="search" className="grid grid-cols-6 gap-1 my-3">
        <div className="relative col-span-2">
          <TextInput
            id="q"
            aria-label="Search books"
            placeholder="Tìm kiếm sách"
            type="text"
            name="q"
            defaultValue={q}
            inputClassName="pl-12"
          />
          <button
            className="absolute inset-y-0 left-0 flex items-center pl-4 text-lg hover:text-indigo-600"
            type="submit"
            title="Search"
            disabled={navigation.state === "loading"}
          >
            <TbSearch/>
          </button>
        </div>
        <div className="col-span-1">
          <Select
            id="category"
            placeholder="Thể loại"
            name="category"
            options={categories ?? []}
            defaultValue={category}
          />
        </div>
        <div className="col-start-4 col-end-7 flex gap-2.5">
          <button
            className={cn({
              "text-white bg-indigo-600 rounded py-2 px-4 border font-medium hover:bg-indigo-700": true,
              "opacity-50 cursor-not-allowed": navigation.state === "loading"
            })}
            type="submit"
            disabled={navigation.state === "loading"}
          >
            {navigation.state === "loading" ? "Loading..." : "Tìm kiếm"}
          </button>

          <button
            className="w-fit text-indigo-500 rounded px-2 mx-4 font-medium hover:text-indigo-700 hover:underline"
            type="button"
            onClick={resetFilter}
          >
            Xóa tìm kiếm
          </button>
        </div>
      </Form>

      <div className="flex flex-col border border-gray-200 rounded overflow-x-auto shadow-sm">
        <table className="min-w-full table-fixed">
          <thead className="bg-[#f8fafc] text-left">
          <tr>
            <th scope="col"
                className="pl-[18px] px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]">
              Hình ảnh
            </th>
            <th scope="col"
                className="px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                style={{ borderLeft: "1px dashed #d5dce6" }}>
              Tiêu đề
            </th>
            <th scope="col"
                className="px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                style={{ borderLeft: "1px dashed #d5dce6" }}>
              Tác giả
            </th>
            <th scope="col"
                className="px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                style={{ borderLeft: "1px dashed #d5dce6" }}>
              Thể loại
            </th>
            <th scope="col"
                className="px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                style={{ borderLeft: "1px dashed #d5dce6" }}>
              Năm xuất bản
            </th>
            <th scope="col"
                className="px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                style={{ borderLeft: "1px dashed #d5dce6" }}>
              Hành động
            </th>
          </tr>
          </thead>
          <Suspense
            fallback={
              <tbody>
              <tr>
                <td className="h-32 text-center" colSpan="100">
                  <div className="flex gap-2 justify-center items-center">
                    <div>
                      <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                                       fill="var(--surface-ground)" animationDuration=".5s"/>
                    </div>
                    <p>Loading books...</p>
                  </div>
                </td>
              </tr>
              </tbody>
            }
          >
            <Await
              resolve={booksPagination}
              errorElement={
                <tbody>
                <tr>
                  <td className="h-32 text-center" colSpan="100">Error loading books!</td>
                </tr>
                </tbody>
              }
            >
              <BooksTable handleClickCreate={handleClickCreate}/>
            </Await>
          </Suspense>
        </table>
      </div>

      <Suspense>
        <Await resolve={booksPagination}>
          <Pagination/>
        </Await>
      </Suspense>
    </>
  );
}

export default CreateRecap;

function BooksTable({ handleClickCreate }) {
  const paginationData = useAsyncValue();
  const navigation = useNavigation();

  return (
    <tbody>
    <Show
      when={navigation.state !== "loading"}
      fallback={
        <tr>
          <td className="h-32 text-center" colSpan="100">
            <div className="flex gap-2 justify-center items-center">
              <div>
                <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                                 fill="var(--surface-ground)" animationDuration=".5s"/>
              </div>
              <p>Loading books...</p>
            </div>
          </td>
        </tr>
      }>
      <>
        {paginationData.items.map((book) => (
          <tr key={book.id} className="hover:bg-gray-100 odd:bg-white even:bg-gray-50 text-[#333c48]">
            <td className="px-2.5 py-1 pl-[18px] font-semibold border-[#e2e7ee] border-b">
              <div className="w-20">
                <Show when={book.coverImage} fallback={
                  <img
                    src="/empty-image.jpg"
                    alt="Empty image"
                    className="block aspect-[3/4] object-cover w-full rounded-md"
                  />
                }>
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="block aspect-[3/4] object-cover w-full rounded-md"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src = "/empty-image.jpg";
                    }}
                  />
                </Show>
              </div>
            </td>
            <td className="px-2.5 py-3 border-[#e2e7ee] border-b" style={{ borderLeft: "1px dashed #d5dce6" }}>
              <div className="min-w-60">
                <Link
                  to={`/books/${book.id}`}
                  className="min-w-full line-clamp-2 break-words hover:underline text-indigo-500"
                >
                  {book.title}
                </Link>
              </div>
            </td>
            <td className="px-2.5 py-3 border-[#e2e7ee] border-b" style={{ borderLeft: "1px dashed #d5dce6" }}>
              <div className="min-w-28">
                <p className="min-w-full line-clamp-2 break-words">
                  {book.authors.map((author) => author.name).join(", ")}
                </p>
              </div>
            </td>
            <td className="px-2.5 py-3 border-[#e2e7ee] border-b" style={{ borderLeft: "1px dashed #d5dce6" }}>
              <div className="min-w-28">
                <p className="min-w-full line-clamp-2 break-words">
                  {book.categories.map((category) => category.name).join(", ")}
                </p>
              </div>
            </td>
            <td className="px-2.5 py-3 border-[#e2e7ee] border-b" style={{ borderLeft: "1px dashed #d5dce6" }}>
              {book.publicationYear}
            </td>
            <td className="px-2.5 py-3 border-[#e2e7ee] border-b" style={{ borderLeft: "1px dashed #d5dce6" }}>
              <button
                onClick={() => handleClickCreate(book.id)}
                className="flex justify-center items-center gap-1 px-5 py-2 font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-800">
                Tạo&nbsp;tóm&nbsp;tắt
              </button>
            </td>
          </tr>
        ))}
      </>
    </Show>
    </tbody>
  )
}

const Pagination = () => {
  const { totalItems, page, pageSize, lastPage } = useAsyncValue();
  let [ , setSearchParams ] = useSearchParams();

  const prev = () => {
    setSearchParams({ page: String(Math.max(1, page - 1)) });
  };

  const next = () => {
    setSearchParams({ page: String(Math.min(lastPage, page + 1)) });
  };

  const setPage = (page) => {
    setSearchParams({ page: String(Math.max(1, Math.min(lastPage, page))) });
  };
  return (
    <>
      {totalItems > 0 && (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-start gap-3 sm:hidden">
            <button
              onClick={prev}
              disabled={page === 1}
              className="relative inline-flex items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={next}
              disabled={page === lastPage}
              className="relative ml-3 inline-flex items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(page - 1) * pageSize + 1 > totalItems
                    ? totalItems
                    : (page - 1) * pageSize + 1 < 0
                      ? 0
                      : (page - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {(page - 1) * pageSize + pageSize > totalItems
                    ? totalItems
                    : (page - 1) * pageSize + pageSize}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex gap-1" aria-label="Pagination">
                <button
                  onClick={prev}
                  disabled={page === 1}
                  className="relative inline-flex shadow-sm w-8 h-8 justify-center items-center rounded font-semibold bg-white text-indigo-500 ring-1 ring-inset ring-gray-300 hover:bg-indigo-100 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:bg-white"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {Array.from({ length: 5 }, (_, i) => i + 1).map((pageNumber) => (
                  (page + pageNumber - 3 > 0 && page + pageNumber - 3 <= lastPage) && (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(page + pageNumber - 3)}
                      disabled={page === page + pageNumber - 3}
                      className={`relative inline-flex shadow-sm w-8 h-8 justify-center items-center font-semibold rounded ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                        page === page + pageNumber - 3
                          ? "bg-indigo-500 text-white focus:outline-none focus:ring"
                          : "text-indigo-500 bg-white hover:bg-indigo-100"
                      }`}
                    >
                      {page + pageNumber - 3}
                    </button>
                  )
                ))}
                <button
                  onClick={next}
                  disabled={page === lastPage}
                  className="relative inline-flex shadow-sm w-8 h-8 justify-center items-center font-semibold rounded bg-white text-indigo-500 ring-1 ring-inset ring-gray-300 hover:bg-indigo-100 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:bg-white"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}