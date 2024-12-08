import { Suspense, useEffect } from 'react';
// import '../BookList/BookList.scss';
import {
  Await,
  defer,
  Form,
  generatePath,
  json,
  Link,
  useAsyncValue,
  useLoaderData,
  useNavigation,
  useSearchParams
} from 'react-router-dom';
import { axiosInstance, axiosInstance2 } from "../../../utils/axios";
import { handleFetchError } from "../../../utils/handleFetchError";
import { ProgressSpinner } from "primereact/progressspinner";
import TextInput from "../../form/TextInput";
import { TbSearch } from "react-icons/tb";
import Select from "../../form/Select";
import { cn } from "../../../utils/cn";
import Table from "../../table";
import { Image } from "primereact/image";
import { routes } from "../../../routes";
import CustomBreadCrumb from "../../CustomBreadCrumb";

const getBooks = async (q, category, contract, page, request) => {
  try {
    const publisherId = localStorage.getItem('publisher');
    if (!publisherId) {
      throw new Error('Publisher not found');
    }
    const response = await axiosInstance2.get('/books/publisher/' + publisherId + "/search", {
      params: {
        q,
        category,
        page,
        contract,
        page_size: 10,
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
  const contract = url.searchParams.get("contract");
  const page = url.searchParams.get("page");

  const booksPromise = getBooks(q, category, contract, page, request);
  const categories = await getCategories(request);

  return defer({
    booksPagination: booksPromise,
    categories,
    params: {
      q,
      category,
      contract,
      page,
    }
  });
}

const BookList = () => {
  const { booksPagination, categories, params: { q, category, contract } } = useLoaderData();
  const [ , setSearchParams ] = useSearchParams();
  const navigation = useNavigation()

  useEffect(() => {
    document.getElementById("q").value = decodeURIComponent(q ?? "");
    document.getElementById("category").value = category ?? "";
    document.getElementById("contract").value = contract ?? "";
  }, [ q, category, contract ]);

  const resetFilter = () => {
    setSearchParams({});
  }

  return (
    <>
      <CustomBreadCrumb items={[ { label: "Books" } ]}/>
      <Form id="search-form" role="search" className="grid grid-cols-6 gap-2 my-3">
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
            id="contract"
            placeholder="Tất cả hợp đồng"
            name="contract"
            options={[
              { value: "-1", label: "Chưa có hợp đồng" },
              { value: "0", label: "Bản nháp" },
              { value: "1", label: "Đang xử lý" },
              { value: "2", label: "Chưa bắt đầu" },
              { value: "3", label: "Đã kích hoạt" },
              { value: "4", label: "Hết hạn" },
              { value: "5", label: "Từ chối" },
            ]}
            defaultValue={contract}
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
          'Hợp đồng',
          'Hành động'
        ]}/>
        <Suspense
          fallback={
            <tbody>
            <tr>
              <td className="h-32 text-center" colSpan="100">
                <div className="flex gap-2 justify-center items-center">
                  <div>
                    <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"/>
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
            <BooksTable/>
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
};

export default BookList;

function BooksTable() {
  const { items } = useAsyncValue();

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return "Bản nháp";
      case 1:
        return "Đang xử lý";
      case 2:
        return "Chưa bắt đầu";
      case 3:
        return "Đã kích hoạt";
      case 4:
        return "Hết hạn";
      case 5:
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };
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
                className="min-w-full line-clamp-3 break-words hover:underline text-indigo-500 font-semibold mb-2"
              >
                {book.title} ({book.publicationYear})
              </Link>
              <p className="min-w-full line-clamp-2 break-words">
                <strong>ISBN-10:</strong> {book.isbn10 || "N/A"}
              </p>
              <p className="min-w-full line-clamp-2 break-words">
                <strong>ISBN-13:</strong> {book.isbn13 || "N/A"}
              </p>
            </div>
          </Table.Cell>
          <Table.Cell>
            <div className="min-w-28 max-w-64">
              <p className="min-w-full line-clamp-3 break-words">
                {book.authors?.map(a => a.name).join(", ")}
              </p>
            </div>
          </Table.Cell>
          <Table.Cell>
            <div className="min-w-28 max-w-64">
              <p className="min-w-full line-clamp-3 break-words">
                {book.categories?.map(c => c.name).join(", ")}
              </p>
            </div>
          </Table.Cell>
          <Table.Cell>
            {book.contracts?.map((contract) => (
              <div key={contract.id} className="flex gap-2 items-center max-w-80">
                <Link
                  to={generatePath(routes.contractDetails, { id: contract.id })}
                  className="flex-1 line-clamp-1 hover:underline text-indigo-600">
                  {contract.id}
                </Link>
                <p className={cn("font-semibold", {
                  "text-orange-500": contract.status === 0,
                  "text-yellow-500": contract.status === 1,
                  "text-blue-500": contract.status === 2,
                  "text-green-500": contract.status === 3,
                  "text-red-500": contract.status === 4,
                  "text-gray-500": contract.status === 5,
                })}>({getStatusLabel(contract.status)})</p>
              </div>
            ))}
          </Table.Cell>
          <Table.Cell>
            <Link
              to={generatePath(routes.bookDetails, { bookId: book.id })}
              className="flex justify-center items-center gap-1 px-5 py-2 font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-800"
            >
              Chi tiết
            </Link>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  )
}

const Pagination = () => {
  const { totalItems, page, pageSize, lastPage } = useAsyncValue();
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
