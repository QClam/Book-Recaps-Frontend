import React, { useEffect, useState } from 'react';
import { DateRangePicker } from 'rsuite';
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