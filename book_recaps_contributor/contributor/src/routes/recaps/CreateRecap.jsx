import { Form, useLoaderData, useSearchParams, useSubmit } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";
import TextInput from "../../components/form/TextInput";
import { TbSearch } from "react-icons/tb";
import Select from "../../components/form/Select";

export async function booksLoader({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const category = url.searchParams.get("category");
  const page = url.searchParams.get("page");

  try {
    const response = await axiosInstance.get('/api/book/getallbooks', {
      params: {
        q,
        category,
        page
      }
    });
    return {
      books: response.data.data.$values || [],
      params: {
        q,
        category,
        // page: response.data.data.page,
        // totalPages: response.data.data
      }
    };

  } catch (error) {
    return handleFetchError(error);
  }
}

const CreateRecap = () => {
  const { books, params: { q, category } } = useLoaderData();
  const submit = useSubmit();
  let [ , setSearchParams ] = useSearchParams();
  const [ categories, setCategories ] = useState([]);

  useEffect(() => {
    document.getElementById("q").value = decodeURIComponent(q ?? "");
    document.getElementById("category").value = category ?? "";
  }, [ q, category ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/category');
        setCategories(response.data.data.$values.map((category) => ({
          value: category.id,
          label: category.name
        })));
      } catch (error) {
        handleFetchError(error);
      }
    }

    fetchCategories();
  }, []);

  const resetFilter = () => {
    setSearchParams({});
  }

  return (
    <>
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
            type="search"
            name="q"
            defaultValue={q}
            inputClassName="pl-12"
            onChange={(event) => {
              const isFirstSearch = q == null;
              submit(event.currentTarget.form, {
                replace: !isFirstSearch,
              });
            }}
          />
          <button
            className="absolute inset-y-0 left-0 flex items-center pl-4 text-lg hover:text-indigo-600"
            type="submit"
            title="Search"
          >
            <TbSearch/>
          </button>
        </div>
        <div className="col-span-1">
          <Select
            id="category"
            placeholder="Thể loại"
            name="category"
            options={categories}
            defaultValue={category}
            onChange={(event) => {
              submit(event.currentTarget.form);
            }}
          />
        </div>
        <div className="flex justify-start">
          <button
            className="w-fit text-indigo-500 rounded px-2 mx-4 font-medium hover:text-indigo-700 hover:underline"
            type="button"
            onClick={resetFilter}
          >
            Xóa tìm kiếm
          </button>
        </div>
      </Form>
    </>
  );
}

export default CreateRecap;
