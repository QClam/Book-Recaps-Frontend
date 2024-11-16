import { Suspense, useEffect } from 'react';
import CustomBreadCrumb from "../../components/CustomBreadCrumb";
import {
  Await,
  defer,
  generatePath,
  json,
  Link,
  redirect,
  useActionData,
  useAsyncValue,
  useLoaderData,
  useSearchParams
} from "react-router-dom";
import Select from "../../components/form/Select";
import { ACCESS_TOKEN, axiosInstance, axiosInstance2 } from "../../utils/axios";
import { jwtDecode } from "jwt-decode";
import { handleFetchError } from "../../utils/handleFetchError";
import { ProgressSpinner } from "primereact/progressspinner";
import { cn } from "../../utils/cn";
import { routes } from "../../routes";
import { useToast } from "../../contexts/Toast";
import { Image } from "primereact/image";

async function getRecaps(published, request) {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN)
    if (!accessToken) {
      return []
    }

    const decoded = jwtDecode(accessToken)
    const id = decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]
    if (!id) {
      return []
    }

    const response = await axiosInstance2.get('/recaps/by-user/' + id, {
      params: {
        published
      },
      signal: request.signal
    })

    return response.data
  } catch (e) {
    const err = handleFetchError(e);
    throw json({ error: err.error }, { status: err.status });
  }
}

export async function recapsLoader({ request }) {
  const url = new URL(request.url);
  const published = url.searchParams.get("published");

  const recapsPromise = getRecaps(published, request);

  return defer({
    recaps: recapsPromise,
    params: {
      published,
    }
  });
}

export async function recapsAction({ request }) {
  const formData = await request.formData();
  const recapId = formData.get('recapId');

  if (!recapId) {
    return { error: "Invalid recap ID" };
  }

  try {
    const response = await axiosInstance.delete('/api/recap/deleterecap/' + recapId, {
      signal: request.signal
    });

    return {
      data: response.data,
      success: true,
      method: 'delete'
    }
  } catch (error) {
    const err = handleFetchError(error);
    console.log("err", err);

    if (err.status === 401) {
      return redirect(routes.logout);
    }
    return err;
  }
}

const RecapsPage = () => {
  const { recaps, params: { published } } = useLoaderData();
  const actionData = useActionData();
  const [ , setSearchParams ] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    document.getElementById("published").value = published ?? "";
  }, [ published ]);

  useEffect(() => {
    if (actionData?.error) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: actionData.error,
      });
    }

    if (actionData?.success && actionData.method === 'delete') {
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Recap deleted successfully',
      });
    }
  }, [ actionData ]);

  return (
    <>
      <CustomBreadCrumb items={[ { label: "Bài viết hiện có" } ]}/>

      <div className="p-4">
        <div className="mb-4 gap-1 flex items-center">
          <Select
            id="published"
            name="published"
            options={[
              { value: "", label: "Tất cả" },
              { value: "public", label: "Công khai" },
              { value: "private", label: "Ẩn" }
            ]}
            defaultValue={published}
            onChange={(e) => {
              e.target.value ? setSearchParams({ published: e.target.value }) : setSearchParams({});
            }}
          />
        </div>
        <Suspense
          fallback={
            <div className="h-32 text-center">
              <div className="flex gap-2 justify-center items-center">
                <div>
                  <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                                   fill="var(--surface-ground)" animationDuration=".5s"/>
                </div>
                <p>Loading recaps...</p>
              </div>
            </div>
          }
        >
          <Await
            resolve={recaps}
            errorElement={
              <div className="h-32 text-center">Error loading books!</div>
            }
          >
            <RecapsList/>
          </Await>
        </Suspense>
      </div>
    </>
  );
};

export default RecapsPage;

const RecapsList = () => {
  const recaps = useAsyncValue();

  return (
    <div className="grid grid-cols-5 gap-5">
      {recaps.map((recap) => (
        <div key={recap.id} className="border rounded-lg shadow p-4 relative bg-white hover:shadow-lg">
          {recap.isPremium && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-xs rounded px-2 py-1">Premium</span>
          )}
          <Link
            to={generatePath(routes.recapDetails, { recapId: recap.id })}
            className="block bg-gray-200 mb-4"
          >
            <Image
              src={recap.book.coverImage || "/empty-image.jpg"}
              alt={recap.book.title}
              imageClassName="aspect-[3/4] object-cover w-full bg-gray-50"
              className="block overflow-hidden rounded-md shadow-md"
            />
          </Link>
          <div className="relative">
            <h2 className="font-bold mb-2">
              <Link to={generatePath(routes.recapDetails, { recapId: recap.id })}>
                {recap.name || `"${recap.book.title}"`}
              </Link>
            </h2>
            <p className="text-gray-600 mb-2 italic line-clamp-1" title={recap.book.title}>
              <strong>Sách:</strong> {recap.book.title}
            </p>
            <p className="text-sm">
              Trạng thái: <span className={cn({
              "font-semibold": true,
              "text-green-500": recap.isPublished,
              "text-red-500": !recap.isPublished
            })}>{recap.isPublished ? "Công khai" : "Ẩn"}</span>
            </p>
            <p className="text-sm">
              Ngày tạo: {recap.createdAt ? new Date(recap.createdAt).toLocaleDateString() : 'N/A'}
            </p>
            {/*<Form className="absolute bottom-0 right-0" method="delete">*/}
            {/*  <input type="hidden" name="recapId" value={recap.id}/>*/}
            {/*  <button className="border rounded p-1 hover:bg-gray-100" type="submit">*/}
            {/*    <span className="text-lg"><TbTrash/></span>*/}
            {/*  </button>*/}
            {/*</Form>*/}
          </div>
        </div>
      ))}
    </div>
  )
}