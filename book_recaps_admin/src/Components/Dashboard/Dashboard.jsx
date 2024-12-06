import React, { useEffect, useRef, useState } from 'react';
import { DateRangePicker } from 'rsuite';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Typography, Box, Card, CardContent } from '@mui/material';
import { BarChart, LocalOffer, Article, RemoveRedEye, AttachMoney } from '@mui/icons-material';
import dayjs from 'dayjs';
import Chart from 'chart.js/auto';

import './Dashboard.scss';
import api from '../Auth/AxiosInterceptors';

function Dashboard() {

    const today = dayjs();
    const oneWeekAgo = today.subtract(7, 'day');
    const [dateRange, setDateRange] = useState([oneWeekAgo.toDate(), today.toDate()]);

    const [dashboardData, setDashboardData] = useState([]);
    const [premiumPackage, setPremiumPackage] = useState([]);

    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [packageData, setPackageData] = useState({
        dailyStats: [],
    });
    const [viewData, setViewData] = useState({
        dailyStats: [],
    });
    

    const fetchDashboardData = async (fromDate, toDate) => {
        try {
            const response = await api.get('/api/dashboard/admindashboard', {
                params: { fromDate, toDate },
            });
            const data = response.data.data || [];
            const premiumPackage = data.packageSales.$values;
            setDashboardData(data);
            setPremiumPackage(premiumPackage);
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
        }
    };

    const updateChart = (dailyStatsPackage, dailyStatsView) => {
        if (!chartInstanceRef.current || !dailyStatsPackage || !dailyStatsView) return;
    
        // Tạo ánh xạ dữ liệu từ các dailyStats
        const packageMap = new Map(dailyStatsPackage.map(stat => [dayjs(stat.date).format('DD-MM-YYYY'), stat.earning]));
        const viewMap = new Map(dailyStatsView.map(stat => [dayjs(stat.date).format('DD-MM-YYYY'), stat.revenueEarning]));
    
        // Hợp nhất và sắp xếp các nhãn
        const allLabels = Array.from(new Set([...packageMap.keys(), ...viewMap.keys()])).sort((a, b) =>
            dayjs(a, 'DD-MM-YYYY').unix() - dayjs(b, 'DD-MM-YYYY').unix()
        );
    
        // Xây dựng dữ liệu cho từng dataset
        const packageData = allLabels.map(label => packageMap.get(label) || 0);
        const viewData = allLabels.map(label => viewMap.get(label) || 0);
    
        // Cập nhật biểu đồ
        chartInstanceRef.current.data.labels = allLabels;
        chartInstanceRef.current.data.datasets[0].data = viewData;
        chartInstanceRef.current.data.datasets[1].data = packageData;
    
        chartInstanceRef.current.update();
    };    

    const fetchPackageSale = async (fromDate, toDate) => {
        try {
            const response = await api.get('api/dashboard/package-sales', {
                params: { fromDate, toDate },
            });
            const dailyStats = response.data.data.dailyStats.$values || [];
            console.log("Package-Sale: ", dailyStats);
            setPackageData({
                dailyStats
            });
            updateChart(dailyStats, viewData.dailyStats); // Cập nhật biểu đồ với dữ liệu Package và View
        } catch (error) {
            console.error("Error Fetching Package Sale", error);
        }
    };
    
    const fetchViewRevenue = async (fromDate, toDate) => {
        try {
            const response = await api.get('api/dashboard/view-chart', {
                params: { fromDate, toDate },
            });
            const dailyStats = response.data.data.dailyStats.$values || [];
            console.log("View-Revenue: ", dailyStats);
            setViewData({
                dailyStats
            });
            updateChart(packageData.dailyStats, dailyStats); // Cập nhật biểu đồ với dữ liệu View và Package
        } catch (error) {
            console.error("Error Fetching Package Sale", error);
        }
    };    

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');

            chartInstanceRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [], // Sẽ được cập nhật sau
                    datasets: [
                        {
                            label: 'Lượt xem',
                            data: [],
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.2
                        },
                        {
                            label: 'Gói Premium',
                            data: [],
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            tension: 0.2
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Doanh thu theo thời gian (Lượt xem và gói Premium)' },
                    },
                    scales: {
                        y: { beginAtZero: true },
                    },
                },
            });
        }

        // Cleanup khi component unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        const fromDate = dayjs(dateRange[0]).format("YYYY-MM-DD");
        const toDate = dayjs(dateRange[1]).format("YYYY-MM-DD");
        fetchDashboardData(fromDate, toDate);
        fetchPackageSale(fromDate, toDate);
        fetchViewRevenue(fromDate, toDate);
    }, [dateRange]); // Cập nhật khi dateRange thay đổi

    const handleDateChange = async (range) => {
        setDateRange(range);

        if (range[0] && range[1]) {
            const fromDate = dayjs(range[0]).format("YYYY-MM-DD");
            const toDate = dayjs(range[1]).format("YYYY-MM-DD");
            console.log('From Date:', fromDate, 'To Date:', toDate);

            fetchDashboardData(fromDate, toDate);
            fetchPackageSale(fromDate, toDate);
            fetchViewRevenue(fromDate, toDate);
        }
    };

    const overview = [
        { title: 'Doanh thu gói Package', value: dashboardData?.revenueFromPackages || "0" },
        { title: 'Số lượng Gói Premium đã bán (Theo tháng)', value: premiumPackage[0]?.count || "0" },
        { title: 'Số lượng Gói Premium đã bán (Theo năm)', value: premiumPackage[1]?.count || "0" },
        { title: 'Số bài viết mới', value: dashboardData?.newRecaps || "0" },
        { title: 'Tiền chi cho Nhà xuất bản', value: dashboardData.publisherExpense || "0" },
        { title: 'Tiền chi cho Người đóng góp', value: dashboardData.contributorExpense || "0" },
    ];
    const views = [
        { title: 'Tổng lượt xem', value: dashboardData.totalViews || "0" },
        { title: 'Doanh thu từ lượt xem', value: dashboardData.revenueFromViews || "0" },
        { title: 'Lợi nhuận từ lượt xem', value: dashboardData.platformProfit || "0" },
    ];
    const platform = [
        { title: 'Số dư hiện tại', value: dashboardData.currentBalance || "0" },
        { title: 'Tổng thu được', value: dashboardData.totalRevenue || "0" },
        { title: 'Tổng đã chi', value: dashboardData.totalExpenses || "0" },
    ];

    const getIcon = (title) => {
        switch (title) {
            case 'Doanh thu gói Package':
            case 'Doanh thu từ lượt View':
            case 'Số dư hiện tại':
                return <AttachMoney sx={{ position: 'absolute', bottom: 8, right: 8 }} />;
            case 'Số lượng Package đã bán':
                return <LocalOffer sx={{ position: 'absolute', bottom: 8, right: 8 }} />;
            case 'Số bài viết mới':
                return <Article sx={{ position: 'absolute', bottom: 8, right: 8 }} />;
            case 'Tổng lượt View':
                return <RemoveRedEye sx={{ position: 'absolute', bottom: 8, right: 8 }} />;
            default:
                return <BarChart sx={{ position: 'absolute', bottom: 8, right: 8 }} />;
        }
    };

    const getUnit = (title) => {
        if (title.includes('Tổng lượt xem')) return 'Lượt';
        if (title.includes('Doanh thu') ||
            title.includes('Lợi nhuận') ||
            title.includes('Tiền chi') ||
            title.includes('Số dư') ||
            title.includes('Tổng')) return 'VND';
        if (title.includes('Package')) return 'Gói'
        if (title.includes('bài viết')) return 'Bài'
        return '';
    };

    const renderDataCards = (data) => {
        return data.map((item, index) => (
            <Grid item xs={4} sm={4} md={4} key={index}>
                <Paper elevation={3} sx={{ padding: 2, position: 'relative' }}>
                    <Typography variant="subtitle1">{item.title}</Typography>
                    <Typography variant="h6">
                        {(item.value ?? 0).toLocaleString('vi-VN')} {getUnit(item.title)}
                    </Typography>
                    {getIcon(item.title)}
                </Paper>
            </Grid>
        ));
    };

    return (
        <div className='dashboard-container'>
            <div className='header'>
                <div className="date-picker-container">
                    <Typography variant='h6' textAlign='center' sx={{ marginBottom: 2 }}>Hãy chọn khoảng thời gian để hiển thị số liệu</Typography>
                    <DateRangePicker
                        value={dateRange}
                        onChange={handleDateChange}
                    />
                </div>
            </div>

            <div className="dashboard-body">
                <div className="overview">
                    <h4>Tổng quan</h4>
                    <Box sx={{ flexGrow: 1, padding: 2 }}>
                        <Grid container spacing={3} columns={{ xs: 4, sm: 8, md: 12 }}>
                            {renderDataCards(overview)}
                        </Grid>
                    </Box>
                </div>

                <div className="view">
                    <h4>Lượt xem</h4>
                    <Box sx={{ flexGrow: 1, padding: 2 }}>
                        <Grid container spacing={3} columns={{ xs: 4, sm: 8, md: 12 }}>
                            {renderDataCards(views)}
                        </Grid>
                    </Box>
                </div>

                <div className="platform">
                    <h4>Nền Tảng</h4>
                    <Box sx={{ flexGrow: 1, padding: 2 }}>
                        <Grid container spacing={3} columns={{ xs: 4, sm: 8, md: 12 }}>
                            {renderDataCards(platform)}
                        </Grid>
                    </Box>
                    <Card>
                        <CardContent>
                            <canvas ref={chartRef}></canvas>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
