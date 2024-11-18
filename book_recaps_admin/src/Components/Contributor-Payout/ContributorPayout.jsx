import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ContributorPayout() {

    const navigate = useNavigate();

    const createPayout = (id) => {
        navigate(`/contributor-payout-history/${id}`)
    }

    const payoutData = [
        {
            id: '1',
            name: 'Contributor A',
            payoutPeriod: '01/11/2024 - 01/12/2024',
            newRevenue: '12.000.000 VND',
            status: 'Hoàn tất',

        },
        {
            id: '2',
            name: 'Contributor B',
            payoutPeriod: '01/10/2024 - 01/11/2024',
            newRevenue: '8.000.000 VND',
            status: 'Hoàn tất',

        },
        {
            id: '3',
            name: 'Contributor C',
            payoutPeriod: '01/09/2024 - 01/10/2024',
            newRevenue: '15.000.000 VND',
            status: 'Hoàn tất',

        },
    ];

    return (
        <Box sx={{ padding: '24px', width: '80vw' }}>
            <Typography variant='h5'>Quyết toán thu nhập cho Contributor</Typography>
            <Box display="flex" justifyContent="flex-end" mt={2} padding={2}>
                <Button variant="contained" color="primary">
                    Tạo mới
                </Button>
            </Box>
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
                                <TableCell><Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => createPayout(item.id)}
                                    sx={{
                                        backgroundColor: '#9fc5f8',
                                        '&:hover': { backgroundColor: '#6b9edb' },
                                    }}
                                >
                                    Thanh toán
                                </Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ContributorPayout;
