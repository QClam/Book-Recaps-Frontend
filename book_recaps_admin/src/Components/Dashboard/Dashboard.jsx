import React, { useEffect, useState } from 'react';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Typography, Box } from '@mui/material';
import { BarChart, LocalOffer, Article, RemoveRedEye, AttachMoney } from '@mui/icons-material';
import dayjs from 'dayjs';

import './Dashboard.scss';
import api from '../Auth/AxiosInterceptors';

function Dashboard() {

    const today = dayjs().format("YYYY-MM-DD");
    const [dateRange, setDateRange] = useState([today, today]);

    const [dashboardData, setDashboardData] = useState([]);
    const [premiumPackage, setPremiumPackage] = useState([]);

    const fetchDashboardData = async (fromDate, toDate) => {
        try {
            const response = await api.get('/api/dashboard/admindashboard', {
                params: { fromDate, toDate },
            });
            const data = response.data.data || [];
            const premiumPackage = data.packageSales.$values;
            setDashboardData(data);
            setPremiumPackage(premiumPackage);
            console.log("DashboardData: ", data);
            console.log("Package: ", premiumPackage);

        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
        }
    };

    useEffect(() => {
        const fromDate = dayjs(today).format("YYYY-MM-DD");
        const toDate = dayjs(today).format("YYYY-MM-DD");
        fetchDashboardData(fromDate, toDate);
    }, []); // Chỉ chạy khi component được render lần đầu

    const handleDateChange = async (range) => {
        setDateRange(range);

        if (range[0] && range[1]) {
            const fromDate = dayjs(range[0]).format("YYYY-MM-DD");
            const toDate = dayjs(range[1]).format("YYYY-MM-DD");
            console.log('From Date:', fromDate, 'To Date:', toDate);

            fetchDashboardData(fromDate, toDate);
        }
    };

    const overview = [
        { title: 'Doanh thu gói Package', value: dashboardData?.revenueFromPackages || "Chưa tính toán" },
        { title: 'Số lượng Gói Premium đã bán (Theo tháng)', value: premiumPackage[0]?.count || "Chưa tính toán" },
        { title: 'Số lượng Gói Premium đã bán (Theo năm)', value: premiumPackage[1]?.count || "Chưa tính toán" },
        { title: 'Số bài viết mới', value: dashboardData?.newRecaps || "Chưa tính toán" },
        { title: 'Tiền chi cho Nhà xuất bản', value: dashboardData.publisherExpense || "Chưa tính toán" },
        { title: 'Tiền chi cho Người đóng góp', value: dashboardData.contributorExpense || "Chưa tính toán" },
    ];
    const views = [
        { title: 'Tổng lượt View', value: dashboardData.totalViews || "Chưa tính toán" },
        { title: 'Doanh thu từ lượt View', value: dashboardData.revenueFromViews || "Chưa tính toán" },
        { title: 'Lợi nhuận từ lượt View', value: dashboardData.platformProfit || "Chưa tính toán" },
    ];
    const platform = [
        { title: 'Số dư hiện tại', value: dashboardData.currentBalance || "Chưa tính toán" },
        { title: 'Tổng thu được', value: dashboardData.totalRevenue || "Chưa tính toán" },
        { title: 'Tổng đã chi', value: dashboardData.totalExpenses || "Chưa tính toán" },
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
        if (title.includes('Tổng lượt View')) return 'Views';
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
                    <Typography variant="h5">
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
                    <Typography variant='body' textAlign='center' sx={{ marginBottom: 2 }}>Hãy chọn khoảng thời gian để hiển thị số liệu</Typography>
                    <DateRangePicker
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
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
