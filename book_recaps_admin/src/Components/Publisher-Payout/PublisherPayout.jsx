import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Paper,
    TableContainer
} from '@mui/material';

function PublisherPayout() {
    const navigate = useNavigate();

    // Dữ liệu mẫu
    const payoutData = [
        {
            id: '1',
            name: 'Publisher A',
            payoutPeriod: '01/11/2024 - 01/12/2024',
            newRevenue: '12.000.000 VND',
            status: 'Hoàn tất',
        },
        {
            id: '2',
            name: 'Publisher B',
            payoutPeriod: '01/10/2024 - 01/11/2024',
            newRevenue: '8.000.000 VND',
            status: 'Hoàn tất',
        },
        {
            id: '3',
            name: 'Publisher C',
            payoutPeriod: '01/09/2024 - 01/10/2024',
            newRevenue: '15.000.000 VND',
            status: 'Hoàn tất',
        },
    ];

    const createPayout = (id) => {
        navigate(`/publisher-payout-create/${id}`);
    };

    return (
        <Box sx={{ padding: '24px', width: '80vw' }}>
            {/* Tiêu đề */}
            <Typography variant="h5" gutterBottom>
                Quyết toán tiền bản quyền
            </Typography>

            <Box display="flex" justifyContent="flex-end" mt={2} padding={2}>
                <Button variant="contained" color="primary">
                    Tạo mới
                </Button>
            </Box>

            {/* Bảng quyết toán */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Tên</strong></TableCell>
                            <TableCell><strong>Đợt quyết toán gần nhất</strong></TableCell>
                            <TableCell><strong>Tổng tiền đã chi</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payoutData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.payoutPeriod}</TableCell>
                                <TableCell>{item.newRevenue}</TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => createPayout(item.id)}
                                        sx={{
                                            backgroundColor: '#9fc5f8',
                                            '&:hover': { backgroundColor: '#6b9edb' },
                                        }}
                                    >
                                        Thanh toán
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default PublisherPayout;
