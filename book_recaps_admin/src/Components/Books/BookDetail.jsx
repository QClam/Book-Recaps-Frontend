import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Box, Typography, Card, CardContent, Grid, Button, Paper } from '@mui/material';
import { DateRangePicker } from 'rsuite';
import { useParams } from 'react-router-dom';
import api from '../Auth/AxiosInterceptors';
import dayjs from 'dayjs';

function BookDetail() {
    const { id } = useParams();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const today = dayjs().format("YYYY-MM-DD");
    const [dateRange, setDateRange] = useState([today, today]);

    const [bookData, setBookData] = useState({
        title: '',
        dailyStats: [],
        lastPayout: { fromDate: '', toDate: '', amount: 0 },
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
            });

            updateChart(dailyStats);
        } catch (error) {
            console.error("Error Fetching Book Detail: ", error);
        }
    };

    useEffect(() => {
        const [fromDate, toDate] = dateRange;
        getBookData(fromDate, toDate); // Sử dụng dateRange từ state
    }, []); // Chỉ chạy một lần khi component render


    const handleDateChange = async (range) => {
        if (range?.[0] && range?.[1]) {
            const fromDate = dayjs(range[0]).format("YYYY-MM-DD");
            const toDate = dayjs(range[1]).format("YYYY-MM-DD");

            setDateRange([fromDate, toDate]);
            await getBookData(fromDate, toDate);
        } else {
            console.error("Invalid date range");
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
                            label: 'Earnings',
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

    return (
        <Box sx={{ padding: 4, width: "80vw" }}>
            <Typography variant="h4" gutterBottom>
                Doanh thu của cuốn sách: {bookData.title}
            </Typography>
            <Box display="flex">
                <Paper
                    elevation={3}
                    style={{
                        padding: "16px",
                        borderRadius: "8px",
                        flex: 1,
                        margin: 15
                    }}
                >
                    <Typography variant="subtitle1" color="textSecondary">
                        Thu nhập
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary" gutterBottom>
                        ({bookData.lastPayout?.fromDate ? dayjs(bookData.lastPayout.fromDate).format('DD-MM-YYYY') : 'N/A'} -
                        {bookData.lastPayout?.toDate ? dayjs(bookData.lastPayout.toDate).format('DD-MM-YYYY') : 'N/A'})
                    </Typography>
                    <Typography variant="h6">
                        {(bookData.lastPayout?.amount ?? 0).toLocaleString('vi-VN')} VND
                    </Typography>

                </Paper>

                <Paper
                    elevation={3}
                    style={{
                        padding: "16px",
                        borderRadius: "8px",
                        flex: 1,
                        margin: 15
                    }}
                >
                    <Typography variant="subtitle1" color="textSecondary">
                        Quyết toán gần nhất
                    </Typography>
                    <Typography
                        variant="caption"
                        display="block"
                        color="textSecondary"
                        gutterBottom
                    >
                        ({dayjs(bookData.lastPayout.fromDate).format('DD-MM-YYYY')} - {dayjs(bookData.lastPayout.toDate).format('DD-MM-YYYY')})
                    </Typography>
                    <Typography variant="h6">{(bookData.lastPayout.amount ?? 0).toLocaleString('vi-VN')} VND</Typography>
                </Paper>
            </Box>
            <Box>
                <Typography textAlign='center' sx={{ marginBottom: 2 }}>Hãy chọn khoảng thời gian để hiển thị số liệu</Typography>
                <Box display='flex' justifyContent='center'>
                    <DateRangePicker
                        format="dd-MM-yyyy"
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
