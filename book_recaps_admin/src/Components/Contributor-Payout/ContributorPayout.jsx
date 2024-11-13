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
        },
        {
            id: '2',
            name: 'Contributor B',
            payoutPeriod: '01/10/2024 - 01/11/2024',
            newRevenue: '8.000.000 VND',
        },
        {
            id: '3',
            name: 'Contributor C',
            payoutPeriod: '01/09/2024 - 01/10/2024',
            newRevenue: '15.000.000 VND',
        },
    ];

    return (
        <div className='publisher-payout-container'>
            <Typography variant='h5'>Quyết toán thu nhập cho Contributor</Typography>
            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="contained" color="primary">
                    Thanh toán nhanh
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tên</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Đợt quyết toán gần nhất</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Doanh thu mới</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payoutData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.payoutPeriod}</TableCell>
                                <TableCell>{item.newRevenue}</TableCell>
                                <TableCell><Button onClick={() => createPayout(item.id)}>Thanh toán</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default ContributorPayout;
