import { Fragment, useEffect, useState } from 'react';
import { generatePath, Link } from 'react-router-dom';
import { useAuth } from "../../contexts/Auth";
import { axiosInstance } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";
import { cn } from "../../utils/cn";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Divider } from "primereact/divider";
import Show from "../Show";
import { routes } from "../../routes";
import { Image } from "primereact/image";

const getBooksStats = async (contributorId, fromDate, toDate, request) => {
  try {
    const response = await axiosInstance.get('/api/dashboard/getcontributorchart/' + contributorId, {
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

const Dashboard = () => {
  const { user } = useAuth();
  const [ books, setBooks ] = useState([]); // Danh sách sách
  const [ income, setIncome ] = useState(0);
  const [ newPosts, setNewPosts ] = useState(0);
  const [ views, setViews ] = useState(0);
  const [ incomeLastMonth, setIncomeLastMonth ] = useState(0);
  const [ newPostsLastMonth, setNewPostsLastMonth ] = useState(0);
  const [ viewsLastMonth, setViewsLastMonth ] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const publisherId = user.publisherData?.id;

        // Lấy dữ liệu bảng điều khiển
        const dashboardResponse = await axiosInstance.get('/api/dashboard/publisherdashboard/' + publisherId);
        const dashboardData = await dashboardResponse.data;

        const data = dashboardData?.data || {};
        setIncome(data.totalIncomeFromViewTracking || 0);
        setNewPosts(data.newRecapsCount || 0);
        setViews(data.newViewCount || 0);
        // Lấy dữ liệu tháng trước
        setIncomeLastMonth(data.lastPayoutAmount || 0);
        setNewPostsLastMonth(data.oldRecapsCount || 0);
        setViewsLastMonth(data.oldViewCount || 0);
        setBooks(data.books?.$values || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const bookItems = books.slice(0, 5) || [];

  return (
    <>
      <div className="grid grid-cols-3 gap-4 my-6">
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Thu nhập chưa quyết toán</div>
          <div className="text-2xl font-bold mb-2">
            {Number(income).toLocaleString("vi-VN")} VNĐ
          </div>
          <div>
            <div className="text-sm text-gray-500">Quyết toán gần nhất</div>
            <div className="flex items-center justify-between gap-3">
              <p>{Number(incomeLastMonth).toLocaleString("vi-VN")} VNĐ</p>
              <i className="pi pi-chart-line text-gray-500 text-2xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Lượt xem</div>
          <div className="text-2xl font-bold mb-2">{views} views</div>
          <div>
            <div className="text-sm text-gray-500">Tháng trước</div>
            <div className="flex items-center justify-between gap-3">
              <p>{viewsLastMonth} views</p>
              <i className="pi pi-eye text-gray-500 text-2xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Số bài viết mới</div>
          <div className="text-2xl font-bold mb-2">{newPosts} bài viết</div>
          <div>
            <div className="text-sm text-gray-500">Tháng trước</div>
            <div className="flex items-center justify-between gap-3">
              <p>{newPostsLastMonth} bài viết</p>
              <i className="pi pi-file text-gray-500 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-[2]">
          <TotalInfoChart/>
        </div>

        <div className="flex-1">
          <div className="space-y-4 bg-white rounded-md border border-gray-300 p-2">
            <div className="mt-2 mx-2 relative flex justify-between items-center">
              <p className="text-xl font-semibold">Sách hiện có</p>
              <Link to={routes.books}
                    className="bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-md">
                All books
              </Link>
            </div>
            <Divider/>
            <Show when={bookItems.length > 0} fallback={
              <div className="text-center text-gray-500">No books found</div>
            }>
              <div className="max-h-[505px] overflow-y-auto">
                {bookItems.map((book, index) => (
                  <Fragment key={index}>
                    <Show when={index !== 0}>
                      <Divider/>
                    </Show>
                    <Link to={generatePath(routes.bookDetails, { bookId: book.bookId })}
                          className="flex gap-4 p-5 hover:bg-gray-100">
                      <div className="w-20 bg-gray-200 rounded-md flex items-center justify-center">
                        <Image
                          src={book.coverImage || "/empty-image.jpg"}
                          alt={book.title}
                          className="block overflow-hidden rounded-md shadow-md"
                          imageClassName="aspect-[3/4] object-cover w-full bg-white"
                        />
                      </div>
                      <div>
                        <div
                          className="text-lg font-semibold"
                          title={book.title + "(" + book.publicationYear + ")"}>
                          {book.title} ({book.publicationYear})
                        </div>
                        <div className="text-sm text-gray-700">
                          Số bài viết hiện có: <strong>{book.recapCount}</strong>
                        </div>
                        <div className="text-sm text-gray-700">
                          Tổng thu nhập đã nhận: <strong>{book.paidEarnings.toLocaleString("vi-VN")} VNĐ</strong>
                        </div>
                        <div className="text-sm text-gray-700">
                          Thu nhập chưa thanh toán: <strong>{book.unPaidEarnings.toLocaleString("vi-VN")} VNĐ</strong>
                        </div>
                      </div>
                    </Link>
                  </Fragment>
                ))}
              </div>
            </Show>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const TotalInfoChart = () => {
  const [ fromDate, setFromDate ] = useState(oneWeekAgo.toISOString().split('T')[0]);
  const [ toDate, setToDate ] = useState(new Date().toISOString().split('T')[0]);
  const [ stats, setStats ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ activeTab, setActiveTab ] = useState('views');
  const [ controller, setController ] = useState(null);
  const { user } = useAuth();

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

    const data = await getBooksStats(user.id, fromDate, toDate, newController);

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
    <div className={cn("p-4 bg-white rounded-lg shadow-md border border-gray-300", { "cursor-progress": loading })}>
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

      <div className="max-h-[430px] aspect-video mx-auto">
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
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{
              bottom: -10,
              width: '100%',
            }}/>
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
    </div>
  )
}
