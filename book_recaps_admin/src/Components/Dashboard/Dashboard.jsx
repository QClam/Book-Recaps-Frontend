import React from 'react';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Typography, Box } from '@mui/material';
import { BarChart, LocalOffer, Article, RemoveRedEye, AttachMoney } from '@mui/icons-material';

import './Dashboard.scss';

function Dashboard() {
    const overview = [
        { title: 'Doanh thu gói Package', value: 24000000 },
        { title: 'Số lượng Package đã bán', value: 1200 },
        { title: 'Số bài viết mới', value: 20 },
    ];
    const views = [
        { title: 'Tổng lượt View', value: 18247 },
        { title: 'Doanh thu từ lượt View', value: 21000000 },
        { title: 'Lợi nhuận từ lượt View', value: 1000000 },
        { title: 'Tiền chi cho Publisher', value: 12000000 },
        { title: 'Tiền chi cho Contributor', value: 9000000 },
    ];
    const platform = [
        { title: 'Số dư hiện tại', value: 39000000 },
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
        if (title.includes('Doanh thu') || title.includes('Lợi nhuận') || title.includes('Tiền chi') || title.includes('Số dư')) return 'VND';
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
                        {item.value.toLocaleString()} {getUnit(item.title)}
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
                    <div className="date-picker">
                        <DateRangePicker />
                    </div>
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
                    <h4>Views</h4>
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
