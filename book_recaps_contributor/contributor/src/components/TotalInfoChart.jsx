import { cn } from "../utils/cn";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { axiosInstance } from "../utils/axios";
import { handleFetchError } from "../utils/handleFetchError";
import { useAuth } from "../contexts/Auth";

const getRecapsStats = async (contributorId, fromDate, toDate, request) => {
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

    const data = await getRecapsStats(user.id, fromDate, toDate, newController);

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

export default TotalInfoChart;