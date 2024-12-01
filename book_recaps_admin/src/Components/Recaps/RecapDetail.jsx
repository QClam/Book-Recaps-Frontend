import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Box, Typography, Card, CardContent, Grid, Button, Paper, Divider } from '@mui/material';
import { DateRangePicker } from 'rsuite';
import { useParams } from 'react-router-dom';
import api from '../Auth/AxiosInterceptors';
import dayjs from 'dayjs';

function RecapDetail() {

    const { id } = useParams();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const today = dayjs().format("YYYY-MM-DD");
    const [dateRange, setDateRange] = useState([today, today]);

    const [recapData, setRecapData] = useState({
        recapName: '',
        dailyStats: [],
        lastPayout: { fromDate: '', toDate: '', amount: 0 },
    });

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

    const updateChart = (dailyStats) => {
        if (!chartInstanceRef.current || !chartRef.current || dailyStats.length === 0) return;

        const labels = dailyStats.map((stat) => dayjs(stat.date).format('DD-MM-YYYY'));
        const earnings = dailyStats.map((stat) => stat.earning);

        chartInstanceRef.current.data.labels = labels;
        chartInstanceRef.current.data.datasets[0].data = earnings;

        chartInstanceRef.current.update();
    };

    const getRecapData = async (fromDate, toDate) => {
        if(!id) {
            return;
        }

        try {
            const response = await api.get(`/api/dashboard/getrecapdetail/${id}`, {
                params: {fromDate, toDate}
            })

            const recapDetails = response.data.data || {};
            const dailyStats = recapDetails.dailyStats.$values || [];

            setRecapData({
                recapName: recapDetails.recapName || "Không có tiêu đề",
                dailyStats,
                lastPayout: recapDetails.lastPayout || { fromDate: '', toDate: '', amount: 0 },
            })

            updateChart(dailyStats);
        } catch (error) {
            console.error("Error Fetching Recap Detail: ", error);
        }
    }

    useEffect(() => {
        const [fromDate, toDate] = dateRange;
        getRecapData(fromDate, toDate);
    },[dateRange])

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

    const totalViews = recapData.dailyStats?.reduce((total, item) => total + item.views, 0);
    const totalTime = recapData.dailyStats?.reduce((total, item) => total + item.watchTime, 0);
    const totalEarnings = recapData.dailyStats?.reduce((total, item) => total + item.earning, 0);

    return (
        <Box sx={{ padding: 4, width: "80vw" }}>
            <Typography variant="h4" gutterBottom>
                Doanh thu của Recap: {recapData.recapName}
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
                                Thu nhập gần nhất
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary" gutterBottom>
                                ({recapData.lastPayout?.fromDate ? dayjs(recapData.lastPayout.fromDate).format('DD-MM-YYYY') : 'N/A'} -
                                {recapData.lastPayout?.toDate ? dayjs(recapData.lastPayout.toDate).format('DD-MM-YYYY') : 'N/A'})
                            </Typography>
                            <Typography variant="h6">
                                {(recapData.lastPayout?.amount ?? 0).toLocaleString('vi-VN')} VND
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
                                ({dayjs(recapData.lastPayout?.fromDate).format('DD-MM-YYYY')} - {dayjs(recapData.lastPayout?.toDate).format('DD-MM-YYYY')})
                            </Typography>
                            <Typography variant="h6">
                                {(recapData.lastPayout?.amount ?? 0).toLocaleString('vi-VN')} VND
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
                                            {totalTime} Phút
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
    )
}

export default RecapDetail