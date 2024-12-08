import { Suspense, useEffect, useState } from "react";
import { Await, defer, generatePath, json, Link, useAsyncValue, useLoaderData } from "react-router-dom";
import { handleFetchError } from "../../utils/handleFetchError";
import { axiosInstance, axiosInstance2 } from "../../utils/axios";
import { Divider } from "primereact/divider";
import { RiEyeLine, RiHeadphoneLine, RiThumbUpLine } from "react-icons/ri";
import CustomBreadCrumb from "../CustomBreadCrumb";
import { routes } from "../../routes";
import { ProgressSpinner } from "primereact/progressspinner";
import { Image } from "primereact/image";
import { cn } from "../../utils/cn";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Show from "../Show";
import SuspenseAwait from "../SuspenseAwait";
import Table from "../table";
import { useAuth } from "../../contexts/Auth";
import { TbEye } from "react-icons/tb";
import { Tooltip as Tooltipp } from 'primereact/tooltip';

const getBookStats = async (bookId, fromDate, toDate, request) => {
  try {
    const response = await axiosInstance.get('/api/dashboard/getbookdetail/' + bookId, {
      params: { fromDate, toDate },
      signal: request.signal
    });
    return response.data.data;
  } catch (error) {
    const err = handleFetchError(error);
    console.log("err", err);
    return null;
  }
}

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

const BookDetail = () => {
  const { book } = useLoaderData();

  return (
    <>
      <CustomBreadCrumb items={[ { label: "Books", path: routes.books }, { label: "Book details" } ]}/>

      <div className="flex gap-6 items-start">
        <div className="flex-[3] space-y-4">
          <SuspenseAwait
            resolve={book}
            errorElement={
              <div className="h-14 flex gap-2 justify-center items-center italic font-semibold text-gray-400">
                Error loading book stats!
              </div>
            }>
            <TotalInfoChart/>
          </SuspenseAwait>

          <SuspenseAwait resolve={book}>
            <Contracts/>
          </SuspenseAwait>
        </div>
        <div className="flex-[2]">
          <Suspense
            fallback={
              <div className="h-32 flex gap-2 justify-center items-center">
                <div>
                  <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"/>
                </div>
                <p>Loading book information...</p>
              </div>
            }>
            <Await resolve={book} errorElement={
              <div className="h-14 flex gap-2 justify-center items-center italic font-semibold text-gray-400">
                Error loading book info!
              </div>
            }>
              <BookDetailsImpl/>
            </Await>
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default BookDetail;

const BookDetailsImpl = () => {
  const book = useAsyncValue();
  const [ readMore, setReadMore ] = useState(false);

  const recaps = book.recaps?.$values.filter(recap => recap.isPublished) || [];

  return (
    <div className="p-6 max-w-2xl bg-white shadow-md rounded-lg border border-gray-300">
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
          <h1 className="text-3xl font-bold mb-2">{book.title} ({book.publicationYear})</h1>
          {book.originalTitle && (
            <h2 className="text-gray-700 mb-3 italic">
              Tên gốc: {book.originalTitle}
            </h2>
          )}
          <p className={cn("text-gray-800 mb-4", {
            "line-clamp-3": !readMore,
          })}>
            {book.description}
          </p>

          <div className="mb-3">
            <p className="min-w-full line-clamp-2 break-words">
              <strong>ISBN-10:</strong> {book.isbN_10 || "N/A"}
            </p>
            <p className="min-w-full line-clamp-2 break-words">
              <strong>ISBN-13:</strong> {book.isbN_13 || "N/A"}
            </p>
          </div>

          <Show when={readMore}>
            <div className="mb-3">
              <p className="min-w-full line-clamp-2 break-words">
                <strong>Thông tin liên hệ NXB:</strong> {book.publisher?.contactInfo || "N/A"}
              </p>
            </div>

            <div className="mb-3">
              <p className="min-w-full line-clamp-2 break-words">
                <strong>Giới hạn tuổi:</strong> {book.ageLimit || "N/A"}
              </p>
            </div>

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
          </Show>

          <div className="mt-4">
            <button
              className="bg-indigo-600 text-white rounded py-1 px-3 border font-semibold hover:bg-indigo-700"
              onClick={() => setReadMore(!readMore)}
            >
              {readMore ? "Thu gọn" : "Xem thêm"}
            </button>
          </div>
        </div>
      </div>

      <Divider/>

      <h2 className="font-semibold mb-3 italic text-gray-700">
        Các bài viết đang công khai:
      </h2>
      <div className="max-h-[500px] overflow-y-auto">
        {recaps.length > 0 ? (
          recaps.map((recap) => {
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
            Sách chưa có Recap nào hiện đang công khai.
          </p>
        )}
      </div>
    </div>
  );
}

const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 30);

const TotalInfoChart = () => {
  const book = useAsyncValue();
  const [ fromDate, setFromDate ] = useState(oneWeekAgo.toISOString().split('T')[0]);
  const [ toDate, setToDate ] = useState(new Date().toISOString().split('T')[0]);
  const [ stats, setStats ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ activeTab, setActiveTab ] = useState('views');
  const [ controller, setController ] = useState(null);

  useEffect(() => {
    applyDateFilter()
    return () => controller?.abort();
  }, []);

  const applyDateFilter = async () => {
    // Convert dates to UTC format before sending to the backend
    const newController = new AbortController();
    if (controller) controller.abort();

    setLoading(true);
    setController(newController);

    const data = await getBookStats(book.id, fromDate, toDate, newController);

    setStats(data);
    setLoading(false);
  };

  const dashboardData = stats ? stats.dailyStats.$values.map((item) => ({
    date: new Date(item.date).toLocaleDateString().slice(0, 5),
    views: item.views,
    watchTime: item.watchTime,
    earning: item.earning
  })) : [];

  const color = {
    stroke: {
      views: "#82ca9d",
      watchTime: "#8884d8",
      earning: "#f0ad4e"
    },
    fill: {
      views: "url(#colorViews)",
      watchTime: "url(#colorWatchTime)",
      earning: "url(#colorEarning)"
    },
    name: {
      views: "Lựợt xem",
      watchTime: "Thời gian xem (giây)",
      earning: "Thu nhập"
    }
  }

  return (
    <div className="space-y-4">
      <Show when={stats}>
        <div className="flex bg-white p-6 rounded-md shadow-sm border border-gray-300 gap-4">
          <div>
            <div className="text-lg font-semibold">Thu nhập chưa quyết toán</div>
            <div className="text-2xl font-bold mb-2 text-indigo-600">
              {Number(stats?.unpaidEarning).toLocaleString("vi-VN")} VNĐ
            </div>
          </div>
          <Divider layout="vertical"/>
          <div>
            <div className="text-lg font-semibold">Quyết toán gần nhất</div>
            <div className="text-2xl font-bold mb-2">
              <p>{Number(stats?.lastPayout?.amount || 0).toLocaleString("vi-VN")} VNĐ</p>
              <i className="pi pi-chart-line text-gray-500 text-2xl"></i>
            </div>
          </div>
        </div>
      </Show>
      <div className={cn("p-4 bg-white rounded-lg shadow-md border border-gray-300", { "cursor-progress": loading })}>
        <div className="space-y-3 mb-4">
          <div className="flex gap-4 mb-4 justify-start">
            <div className="flex items-center gap-4">
              <label className="block font-semibold">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={loading}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="block font-semibold">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={loading}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
              />
            </div>
            <button
              onClick={applyDateFilter}
              disabled={loading}
              className="px-4 py-0.5 bg-blue-500 font-semibold text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-progress"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="flex justify-between gap-3 text-center mb-4">
          <button
            className={cn("flex-1 rounded-md bg-gray-100", {
              "bg-blue-500 text-white py-3": activeTab === 'views',
            })}
            onClick={() => setActiveTab('views')}
          >
            <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
            <div>Lượt xem</div>
          </button>
          <button
            className={cn("flex-1 rounded-md bg-gray-100", {
              "bg-blue-500 text-white py-3": activeTab === 'watchTime',
            })}
            onClick={() => setActiveTab('watchTime')}
          >
            <div
              className="text-2xl font-bold">{((stats?.totalWatchTime || 0) / 60).toFixed(1).replace(/(\.0)$/, '')}</div>
            <div>Thời gian xem (phút)</div>
          </button>
          <button
            className={cn("flex-1 rounded-md bg-gray-100", {
              "bg-blue-500 text-white py-3": activeTab === 'earning',
            })}
            onClick={() => setActiveTab('earning')}
          >
            <div className="text-2xl font-bold">{(stats?.totalEarnings || 0).toLocaleString('vi-VN')}</div>
            <div>Thu nhập (VNĐ)</div>
          </button>
        </div>

        <div className="max-h-[410px] aspect-video mx-auto">
          <ResponsiveContainer>
            <AreaChart data={dashboardData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f0ad4e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f0ad4e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date"/>
              <YAxis/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip/>
              {/*<Legend verticalAlign="bottom" height={36} wrapperStyle={{*/}
              {/*  bottom: -10,*/}
              {/*  width: '100%',*/}
              {/*}}/>*/}

              <Area
                type="monotone"
                fillOpacity={1}
                dataKey={activeTab}
                stroke={color.stroke[activeTab]}
                fill={color.fill[activeTab]}
                name={color.name[activeTab]}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <h1 className="text-lg font-semibold mb-4 mt-2 italic text-center text-gray-600">
          Thông số tổng hợp từ các bài viết của sách
        </h1>
      </div>
    </div>
  )
}

const Contracts = () => {
  const book = useAsyncValue();
  const { user } = useAuth();
  const [ contracts, setContracts ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const [ controller, setController ] = useState(null);

  useEffect(() => {
    const getContracts = async () => {
      const newController = new AbortController();
      if (controller) controller.abort();

      setController(newController);

      try {
        const response = await axiosInstance2.get('/contracts/book/' + book.id + '/publisher/' + user.publisherData?.id, {
          signal: controller
        });
        setContracts(response.data);
      } catch (error) {
        const err = handleFetchError(error);
        console.log("err", err);
      }
      setController(null);
      setLoading(false);
    };

    getContracts();
    return () => controller?.abort();
  }, []);

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
        return "Unknown";
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-300">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Các hợp đồng liên quan</h2>
      <Table.Container>
        <Table.Head columns={[
          'ID',
          'Tỷ lệ doanh thu',
          'Bắt Đầu',
          'Kết Thúc',
          'Trạng Thái',
          'Ngày Tạo',
          ''
        ]}/>
        <Table.Body
          when={contracts && contracts.length > 0 && !loading}
          fallback={
            <tr>
              <td className="h-32 text-center" colSpan="100">
                <div className="flex gap-2 justify-center items-center">
                  <p>No contract found</p>
                </div>
              </td>
            </tr>
          }>
          {contracts.map((contract) => (
            <Table.Row key={contract.id}>
              <Table.Cell isFirstCell={true}>
                <Link
                  to={generatePath(routes.contractDetails, { id: contract.id })}
                  className="max-w-sm line-clamp-1 hover:underline text-blue-600"
                  title={contract.id}
                >
                  {contract.id}
                </Link>
              </Table.Cell>
              <Table.Cell>
                <Tooltipp target=".tooltipppp" mouseTrack mouseTrackLeft={5} position="left" className="max-w-96"/>
                <p
                  className="tooltipppp font-semibold text-blue-600"
                  data-pr-tooltip={"Bạn sẽ nhận được " + Number(contract.revenueSharePercentage).toFixed(1).replace(/(\.0)$/, '') + "% doanh thu mà platform có được từ mỗi lượt xem premium từ các bài viết tóm tắt cho sách này."}
                >
                  {Number(contract.revenueSharePercentage).toFixed(1).replace(/(\.0)$/, '')}%
                </p>
              </Table.Cell>
              <Table.Cell>
                {contract.startDate ? new Date(contract.startDate + "Z").toLocaleDateString() : 'N/A'}
              </Table.Cell>
              <Table.Cell>
                {contract.endDate ? new Date(contract.endDate + "Z").toLocaleDateString() : 'N/A'}
              </Table.Cell>
              <Table.Cell>
                <p className={cn("rounded-full w-max px-2 py-1 text-white text-sm font-semibold text-center", {
                  "bg-gray-400": contract.status === 0,
                  "bg-yellow-400": contract.status === 1,
                  "bg-blue-400": contract.status === 2,
                  "bg-green-400": contract.status === 3,
                  "bg-red-400": contract.status === 4,
                  "bg-red-600": contract.status === 5,
                })}>
                  {getStatusLabel(contract.status)}
                </p>
              </Table.Cell>
              <Table.Cell>
                {new Date(contract.createdAt + "Z").toLocaleDateString()}
              </Table.Cell>
              <Table.Cell>
                <Link
                  to={generatePath(routes.contractDetails, { id: contract.id })}
                  className="block w-fit border rounded p-1 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-progress"
                  title="View details"
                >
                  <span className="text-lg"><TbEye/></span>
                </Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
    </div>
  )
}