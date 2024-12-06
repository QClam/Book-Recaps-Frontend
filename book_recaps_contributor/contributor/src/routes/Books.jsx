import {
  Await,
  defer,
  Form,
  generatePath,
  json,
  Link,
  Navigate,
  useActionData,
  useAsyncValue,
  useLoaderData,
  useMatch,
  useNavigation,
  useSearchParams
} from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Suspense, useEffect, useState } from "react";
import { TbSearch } from "react-icons/tb";

import { axiosInstance } from "../utils/axios";
import { handleFetchError } from "../utils/handleFetchError";
import TextInput from "../components/form/TextInput";
import Select from "../components/form/Select";
import { cn } from "../utils/cn";
import { useAuth } from "../contexts/Auth";
import { routes } from "../routes";
import { useToast } from "../contexts/Toast";
import CustomBreadCrumb from "../components/CustomBreadCrumb";
import Modal from "../components/modal";
import Table from "../components/table";
import Show from "../components/Show";
import { Image } from "primereact/image";
import { Tooltip } from 'primereact/tooltip';

const getBooks = async (q, category, publisher, sortby, sortorder, page, request) => {
  try {
    const response = await axiosInstance.get('/api/book/getallbooksbyfilterforcontributor', {
      params: {
        SearchTerm: q,
        CategoryId: category,
        PublisherId: publisher,
        PageNumber: page,
        PageSize: 10,
        SortBy: sortby,
        SortOrder: sortorder
      },
      signal: request.signal
    });
    return response.data.data;
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

const getPublishers = async (request) => {
  try {
    const response = await axiosInstance.get('/api/publisher/getallpublishers', {
      signal: request.signal
    });
    return (response.data.$values.map((publisher) => ({
      value: publisher.id,
      label: publisher.publisherName
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
  const publisher = url.searchParams.get("publisher");
  const page = url.searchParams.get("page");
  const sortby = url.searchParams.get("sortby") || "totalPublishedRecaps";
  const sortorder = url.searchParams.get("sortorder") || "asc";

  const booksPromise = getBooks(q, category, publisher, sortby, sortorder, page, request);
  const categories = await getCategories(request);
  const publishers = await getPublishers(request);

  return defer({
    booksPagination: booksPromise,
    categories,
    publishers,
    params: {
      q,
      category,
      publisher,
      page,
      sortby,
      sortorder
    }
  });
}

const Books = () => {
  const {
    booksPagination,
    categories,
    publishers,
    params: { q, category, publisher, sortby, sortorder }
  } = useLoaderData();
  const actionData = useActionData();
  let [ , setSearchParams ] = useSearchParams();
  const navigation = useNavigation()
  const { user } = useAuth();
  const { showToast } = useToast();
  const [ dialogVisible, setDialogVisible ] = useState(false);
  const [ chosenBookId, setChosenBookId ] = useState("");

  const matchBooksRoute = useMatch(routes.books);

  const isBooksRoute = !!matchBooksRoute;

  useEffect(() => {
    document.getElementById("q").value = decodeURIComponent(q ?? "");
    document.getElementById("category").value = category ?? "";
    document.getElementById("publisher").value = publisher ?? "";
    document.getElementById("sortby").value = sortby ?? "";
    document.getElementById("sortorder").value = sortorder ?? "";
  }, [ q, category, publisher, sortby, sortorder ]);

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
        setChosenBookId("");
        setDialogVisible(false);
      }
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

  if (actionData?.error && actionData.status === 400 && actionData.data?.id) {
    return <Navigate to={generatePath(routes.recapDetails, { recapId: actionData.data.id })}/>;
  }

  return (
    <>
      <CustomBreadCrumb items={[ { label: isBooksRoute ? "Books" : "Create Recap" } ]}/>
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
                <input type="hidden" name="bookId" value={chosenBookId}/>
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
                    onClick={(e) => {
                      setChosenBookId("");
                      hide(e);
                    }}
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
      <Show when={!isBooksRoute} fallback={
        <h1 className="mt-4 mb-6 text-xl font-semibold text-gray-900">Danh mục sách có thể tóm tắt</h1>
      }>
        <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
          <h1 className="font-semibold text-lg">Tạo bài viết tóm tắt mới</h1>
          <p>
            Chọn một quyển sách từ danh sách dưới đây để tạo bài viết tóm tắt mới.
          </p>
        </div>
      </Show>
      <Form id="search-form" role="search" className="grid grid-cols-8 gap-2 my-3">
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
        <div className="col-span-1">
          <Select
            id="publisher"
            placeholder="Nhà xuất bản"
            name="publisher"
            options={publishers ?? []}
            defaultValue={publisher}
          />
        </div>
        <div className="col-span-1">
          <Select
            id="sortby"
            placeholder="Sắp xếp theo"
            name="sortby"
            options={[
              { value: "title", label: "Tiêu đề" },
              { value: "publisherName", label: "Nhà xuất bản" },
              { value: "totalPublishedRecaps", label: "Số bài viết" },
              { value: "contributorSharePercentage", label: "Doanh thu chia sẻ" }
            ]}
            defaultValue={sortby}
          />
        </div>
        <div className="col-span-1">
          <Select
            id="sortorder"
            // placeholder="Thứ tự"
            name="sortorder"
            options={[
              { value: "desc", label: "Giảm dần" },
              { value: "asc", label: "Tăng dần" },
            ]}
            defaultValue={sortorder}
          />
        </div>
        <div className="col-span-2 flex gap-2.5">
          <button
            className={cn({
              "text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700": true,
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

      <Table.Container>
        <Table.Head columns={[
          'Hình ảnh',
          'Tiêu đề',
          'Tác giả',
          'Thể loại',
          'Nhà xuất bản',
          'Số bài viết',
          'Doanh thu chia sẻ',
          'Hành động'
        ]}/>
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
      </Table.Container>

      <Suspense>
        <Await resolve={booksPagination}>
          <Pagination/>
        </Await>
      </Suspense>
    </>
  );
}

export default Books;

function BooksTable({ handleClickCreate }) {
  const { data: { $values: items } } = useAsyncValue();

  return (
    <Table.Body
      when={items && items.length > 0}
      fallback={
        <tr>
          <td className="h-32 text-center" colSpan="100">
            <div className="flex gap-2 justify-center items-center">
              <p>No books found!</p>
            </div>
          </td>
        </tr>
      }
    >
      {items.map((book) => (
        <Table.Row key={book.id}>
          <Table.Cell isFirstCell={true}>
            <div className="w-20">
              <Image
                src={book.coverImage || "/empty-image.jpg"}
                alt={book.title}
                className="block overflow-hidden rounded-md shadow-md"
                imageClassName="aspect-[3/4] object-cover w-full bg-white"
                preview
              />
            </div>
          </Table.Cell>
          <Table.Cell>
            <div className="min-w-36">
              <Link
                to={generatePath(routes.bookDetails, { bookId: book.id })}
                className="min-w-full line-clamp-3 break-words hover:underline text-indigo-500 font-semibold"
              >
                {book.title} ({book.publicationYear})
              </Link>
            </div>
          </Table.Cell>
          <Table.Cell>
            <div className="min-w-28">
              <p className="min-w-full line-clamp-3 break-words">
                {book.authorNames?.$values.join(", ")}
              </p>
            </div>
          </Table.Cell>
          <Table.Cell>
            <div className="min-w-28">
              <p className="min-w-full line-clamp-3 break-words">
                {book.categoryNames?.$values.join(", ")}
              </p>
            </div>
          </Table.Cell>
          <Table.Cell>
            <p className="min-w-full line-clamp-3 break-words">
              {book.publisherName}
            </p>
          </Table.Cell>
          <Table.Cell>
            <Tooltip target=".tooltipppp" mouseTrack mouseTrackLeft={5} position="left" className="max-w-96"/>
            <p
              className="tooltipppp text-center font-semibold text-indigo-600 cursor-default"
              data-pr-tooltip={"Sách hiện có " + book.totalPublishedRecaps + " bài viết tóm tắt"}
            >
              {book.totalPublishedRecaps}
            </p>
          </Table.Cell>
          <Table.Cell>
            <p
              className="tooltipppp text-center font-semibold text-indigo-600 cursor-default"
              data-pr-tooltip={"Bạn sẽ nhận được " + book.contributorSharePercentage.toFixed(1).replace(/(\.0)$/, '') + "% doanh thu mà platform có được từ mỗi lượt xem premium từ bài viết tóm tắt của bạn.\n\nVí dụ: Nếu bài viết tóm tắt của bạn cho quyển sách này có 100 lượt xem premium và doanh thu platform có được từ mỗi lượt xem premium là 5.000₫, bạn sẽ nhận được " + (book.contributorSharePercentage / 100 * 5000).toLocaleString("vi-VN") + "₫ cho mỗi lượt xem premium."}
            >
              {book.contributorSharePercentage.toFixed(1).replace(/(\.0)$/, '')}%
            </p>
          </Table.Cell>
          <Table.Cell>
            <button
              onClick={() => handleClickCreate(book.id)}
              className="flex justify-center items-center gap-1 px-5 py-2 font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-800"
            >
              Tạo&nbsp;tóm&nbsp;tắt
            </button>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  )
}

const Pagination = () => {
  const { totalRecords: totalItems, pageNumber: page, pageSize, totalPages: lastPage } = useAsyncValue();
  let [ , setSearchParams ] = useSearchParams();

  const prev = () => {
    setSearchParams(searchParams => {
      searchParams.set('page', String(Math.max(1, page - 1)));
      return searchParams;
    });
  };

  const next = () => {
    setSearchParams(searchParams => {
      searchParams.set('page', String(Math.min(lastPage, page + 1)));
      return searchParams;
    });
  };

  const setPage = (page) => {
    setSearchParams(searchParams => {
      searchParams.set('page', String(Math.max(1, Math.min(lastPage, page))));
      return searchParams;
    });
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