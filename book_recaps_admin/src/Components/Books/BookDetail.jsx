import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Box, Typography, Card, CardContent, Grid, Button, Paper } from '@mui/material';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import revenueData from './data/revenueData.json';

function BookDetail() {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [dateRange, setDateRange] = useState([]);

    useEffect(() => {
        if (chartRef.current) {
            // Hủy biểu đồ cũ nếu đã tồn tại
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            chartInstanceRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: revenueData.map((item) => item.label),
                    datasets: [
                        {
                            label: 'Revenue',
                            data: revenueData.map((item) => item.revenue),
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        },
                        {
                            label: 'Cost',
                            data: revenueData.map((item) => item.cost),
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Thu nhập của cuốn sách',
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
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


    const handleFilter = () => {
        const [startDate, endDate] = dateRange;
        if (startDate && endDate) {
            alert(`Đã chọn từ ngày: ${startDate.toLocaleDateString()} đến ngày: ${endDate.toLocaleDateString()}`);
          } else {
            alert('Vui lòng chọn khoảng thời gian hợp lệ.');
          }
    };

    return (
        <Box sx={{ padding: 4, width: "80vw" }}>
            <Typography variant="h4" gutterBottom>
                Doanh thu của cuốn (Tên fetch API sau)
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
                    <Typography
                        variant="caption"
                        display="block"
                        color="textSecondary"
                        gutterBottom
                    >
                        (01-02-2010 tới current_date)
                    </Typography>
                    <Typography variant="h6">-- VND</Typography>
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
                        (01-01-2010 tới 01-02-2010)
                    </Typography>
                    <Typography variant="h6">100.000 VND</Typography>
                </Paper>
            </Box>
            <Grid container spacing={1} mb={2}>
                <Grid item xs={4}>
                    <DateRangePicker
                        format="dd-MM-yyyy"
                        value={dateRange}
                        onChange={(value) => setDateRange(value)}
                        style={{ width: '100%' }}
                    />
                </Grid>
                <Grid item xs={8} sm={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleFilter}
                    >
                        Chọn
                    </Button>
                </Grid>
            </Grid>
            <Card>
                <CardContent>
                    <canvas ref={chartRef}></canvas>
                </CardContent>
            </Card>
        </Box>
    );
}

export default BookDetail;
