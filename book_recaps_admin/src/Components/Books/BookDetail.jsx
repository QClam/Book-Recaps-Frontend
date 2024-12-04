import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Box, Typography, Card, CardContent, Grid, Button, Paper, Divider } from '@mui/material';
import { DateRangePicker } from 'rsuite';
import { useParams, useLocation } from 'react-router-dom';
import api from '../Auth/AxiosInterceptors';
import dayjs from 'dayjs';

function BookDetail() {
    const { id } = useParams();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const location = useLocation();
    const { fromDate, toDate } = location.state || {};

    const today = dayjs();
    const oneWeekAgo = today.subtract(7, 'day');
    const [dateRange, setDateRange] = useState([
        fromDate || oneWeekAgo.toDate(),
        toDate || today.toDate(),
    ]);

    const [bookData, setBookData] = useState({
        title: '',
        dailyStats: [],
        lastPayout: { fromDate: '', toDate: '', amount: 0 },
        unpaidEarning: 0,
        originalTitle: '',
    });

    const getBookData = async (fromDate, toDate) => {
        if (!id) return;

        try {
            const response = await api.get(`/api/dashboard/getbookdetail/${id}`, {
                params: { fromDate, toDate },
            });

            const bookDetails = response.data.data || {};
            const dailyStats = bookDetails.dailyStats?.$values || [];

            setBookData({
                title: bookDetails.title || "Không có tiêu đề",
                dailyStats,
                lastPayout: bookDetails.lastPayout || { fromDate: '', toDate: '', amount: 0 },
                unpaidEarning: bookDetails.unpaidEarning,
                originalTitle: bookDetails.originalTitle
            });

            updateChart(dailyStats);
        } catch (error) {
            console.error("Error Fetching Book Detail: ", error);
        }
    };

    useEffect(() => {
        const fromDate = dayjs(dateRange[0]).format("YYYY-MM-DD");
        const toDate = dayjs(dateRange[1]).format("YYYY-MM-DD");
        getBookData(fromDate, toDate); // Sử dụng dateRange từ state
    }, [dateRange]); // Chỉ chạy một lần khi component render


    const handleDateChange = async (range) => {

        setDateRange(range);

        if (range?.[0] && range?.[1]) {
            const fromDate = dayjs(range[0]).format("YYYY-MM-DD");
            const toDate = dayjs(range[1]).format("YYYY-MM-DD");

            await getBookData(fromDate, toDate);
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
                            label: 'Thu nhập',
                            data: [],
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Doanh thu theo thời gian' },
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

    const updateChart = (dailyStats) => {
        if (!chartInstanceRef.current || !chartRef.current || dailyStats.length === 0) return;

        const labels = dailyStats.map((stat) => dayjs(stat.date).format('DD-MM-YYYY'));
        const earnings = dailyStats.map((stat) => stat.earning);

        chartInstanceRef.current.data.labels = labels;
        chartInstanceRef.current.data.datasets[0].data = earnings;

        chartInstanceRef.current.update();
    };

    const totalViews = bookData.dailyStats?.reduce((total, item) => total + item.views, 0);
    const totalTime = bookData.dailyStats?.reduce((total, item) => total + item.watchTime, 0);
    const totalEarnings = bookData.dailyStats?.reduce((total, item) => total + item.earning, 0);

    return (
        <Box sx={{ padding: 4, width: "80vw" }}>
            <Typography variant="h4" gutterBottom>
                Doanh thu của cuốn sách: {bookData.title} | Tên gốc: {bookData.originalTitle}
            </Typography>
            <Box display="flex" flexDirection="column">
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Paper
                            elevation={3}
                            style={{
                                padding: "16px",
                                borderRadius: "8px",
                            }}
                        >
                            <Typography variant="h5" color="textSecondary">
                                Thu nhập chưa quyết toán
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary" gutterBottom>
                                ({bookData.lastPayout?.toDate ? dayjs(bookData.lastPayout.toDate).format('DD-MM-YYYY') : 'N/A'} -
                                {today.format("DD-MM-YYYY")})
                            </Typography>
                            <Typography variant="h6">
                                {(bookData.unpaidEarning ?? 0).toLocaleString('vi-VN')} VND
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper
                            elevation={3}
                            style={{
                                padding: "16px",
                                borderRadius: "8px",
                            }}
                        >
                            <Typography variant="h5" color="textSecondary">
                                Quyết toán gần nhất
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary" gutterBottom>
                                ({dayjs(bookData.lastPayout?.fromDate).format('DD-MM-YYYY')} - {dayjs(bookData.lastPayout?.toDate).format('DD-MM-YYYY')})
                            </Typography>
                            <Typography variant="h6">
                                {(bookData.lastPayout?.amount ?? 0).toLocaleString('vi-VN')} VND
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box mt={2}>
                    <Grid container spacing={2}>
                        {/* Lượt xem */}
                        <Grid item xs={4}>
                            <Paper elevation={3} style={{ padding: "16px", borderRadius: "8px" }}>
                                <Typography variant="h5" color="textSecondary" textAlign="center">
                                    Lượt xem
                                </Typography>
                                <Typography variant="caption" display="block" color="textSecondary" textAlign="center">
                                    ({dateRange[0] ? dayjs(dateRange[0]).format('DD-MM-YYYY') : 'N/A'} -
                                    {dateRange[1] ? dayjs(dateRange[1]).format('DD-MM-YYYY') : 'N/A'})
                                </Typography>
                                <Divider sx={{ margin: "8px 0" }} />
                                <Grid container direction="column" spacing={1}>
                                    <Grid item>
                                        <Typography variant="h6" textAlign="center">
                                            {totalViews}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Thời lượng xem */}
                        <Grid item xs={4}>
                            <Paper elevation={3} style={{ padding: "16px", borderRadius: "8px" }}>
                                <Typography variant="h5" color="textSecondary" textAlign="center">
                                    Thời lượng xem
                                </Typography>
                                <Typography variant="caption" display="block" color="textSecondary" textAlign="center">
                                    ({dateRange[0] ? dayjs(dateRange[0]).format('DD-MM-YYYY') : 'N/A'} -
                                    {dateRange[1] ? dayjs(dateRange[1]).format('DD-MM-YYYY') : 'N/A'})
                                </Typography>
                                <Divider sx={{ margin: "8px 0" }} />
                                <Grid container direction="column" spacing={1}>
                                    <Grid item>
                                        <Typography variant="h6" textAlign="center">
                                            {totalTime} Giây
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Thu nhập trong khoảng */}
                        <Grid item xs={4}>
                            <Paper elevation={3} style={{ padding: "16px", borderRadius: "8px" }}>
                                <Typography variant="h5" color="textSecondary" textAlign="center">
                                    Thu nhập trong khoảng
                                </Typography>
                                <Typography variant="caption" display="block" color="textSecondary" textAlign="center">
                                    ({dateRange[0] ? dayjs(dateRange[0]).format('DD-MM-YYYY') : 'N/A'} -
                                    {dateRange[1] ? dayjs(dateRange[1]).format('DD-MM-YYYY') : 'N/A'})
                                </Typography>
                                <Divider sx={{ margin: "8px 0" }} />
                                <Typography variant="h6" textAlign="center">
                                    {(totalEarnings ?? 0).toLocaleString('vi-VN')} VND
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                </Box>
            </Box>

            <Box>
                <Typography textAlign='center' sx={{ marginBottom: 2, marginTop: 2 }}>Hãy chọn khoảng thời gian để hiển thị số liệu</Typography>
                <Box display='flex' justifyContent='center'>
                    <DateRangePicker
                        value={[new Date(dateRange[0]), new Date(dateRange[1])]}
                        onChange={handleDateChange}
                    />
                </Box>
            </Box>
            <Card>
                <CardContent>
                    <canvas ref={chartRef}></canvas>
                </CardContent>
            </Card>
        </Box>
    );
}

export default BookDetail;
