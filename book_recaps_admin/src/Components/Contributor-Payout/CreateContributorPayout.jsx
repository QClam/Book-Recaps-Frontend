import { Box, Button, Grid, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../Auth/AxiosInterceptors';

function CreateContributorPayout() {

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const contributor = location.state; // Dữ liệu từ ContributorPayout 
    const [recaps, setRecps] = useState(location.state?.recapDetails.$values || []);
    const [description, setDescription] = useState('');

    const [payoutForm, setPayoutForm] = useState({
        contributorId: '',
        description: '',
        toDate: '',
    })
    console.log('Location State:', location.state);
    if (!contributor) {
        console.error('No initialData provided');
    } else {
        console.log('Initial Data:', contributor);
        console.log('Recaps:', contributor?.recapDetails);
    }

    const handleNoteChange = (event) => {
        const note = event.target.value;
        setDescription(note);
    }

    // Nếu không nhận đc state thì back về trang trước
    useEffect(() => {
        if (!contributor) {
            alert('Dữ liệu không hợp lệ. Điều hướng về trang trước.');
            navigate(-1); // Quay lại trang trước
        }
    }, [contributor, navigate]);

    // Format Date để Render UI
    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
    };

    // Format Date để post lên Swagger
    const formatDateISO = (date) => {
        return date ? new Date(date).toLocaleDateString('en-us') : null; // Định dạng yyyy-mm-dd
    };

    const postPayoutForm = async () => {

        const params = {
            description: description,
            toDate: formatDateISO(contributor?.todate),
        }

        try {
            const response = await api.post(`/api/contributorpayout/createpayout/${contributor?.contributorId}`, null, { params });
            console.log('Quyết Toán:', response.data);
            alert('Tạo quyết toán thành công!');
        } catch (error) {
            console.error('Lỗi khi tạo quyết toán:', error);
            alert('Không thể tạo quyết toán. Vui lòng thử lại.');
        }
    }

    const handleComplete = async () => {
        await postPayoutForm();
        alert('Hoàn tất');
    };

    return (
        <Box sx={{ width: "80vw" }}>
            <Box padding={3}>
                {/* Quyết toán tiền bản quyền */}
                <Typography variant='h5'>Quyết toán cho Contributor</Typography>
                <Box>
                    <Box sx={{ flexGrow: 1, padding: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={6}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 2,
                                        borderRadius: 2,
                                        border: '1px solid #ddd',
                                        width: '100%',
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tên Contributor:
                                        </Typography>
                                        <Typography variant="body1">{contributor.contributorName || 'N/A'}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body1" fontWeight="bold">
                                            Thông tin liên hệ:
                                        </Typography>
                                        <Typography variant="body1">{contributor.email || 'N/A'}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6} md={6}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 2,
                                        borderRadius: 2,
                                        border: '1px solid #ddd',
                                        width: '100%',
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Đợt quyết toán:
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(contributor?.fromdate)} - {formatDate(contributor?.todate)}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tổng chi:
                                        </Typography>
                                        <Typography variant="body1">{contributor.totalEarnings || 0} VND</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Link href={`/contributor-payout-history/${id}`} underline="hover">Xem lịch sử quyết toán</Link>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                {/* Tạo quyết toán mới */}
                <Box borderBottom={1} mb={3} pb={2}>
                    <Typography variant="h6" gutterBottom>Tạo quyết toán mới</Typography>
                    <Box display="flex" gap={2}>
                        <TextField label="Từ ngày" value={formatDate(contributor?.fromdate)} disabled />
                        <TextField label="Đến ngày" value={formatDate(contributor?.todate)} disabled />
                    </Box>
                    <Box mt={2}>
                        <TextField
                            label="Ghi chú"
                            multiline
                            rows={4}
                            fullWidth
                            value={description}
                            onChange={handleNoteChange}
                        />
                    </Box>
                </Box>

                {/* Recaps Table */}
                <Box>
                    <Typography variant="h6" gutterBottom>Recaps</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tiêu đề</TableCell>
                                    <TableCell>Từ ngày</TableCell>
                                    <TableCell>Tới ngày</TableCell>
                                    <TableCell>Lượt xem</TableCell>
                                    <TableCell>Doanh thu (VND)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recaps.map((item) => (
                                    <TableRow key={item.recapId}>
                                        <TableCell>{item.recapName}</TableCell>
                                        <TableCell>{formatDate(contributor?.fromdate)}</TableCell>
                                        <TableCell>{formatDate(contributor?.todate)}</TableCell>
                                        <TableCell>{item.viewCount}</TableCell>
                                        <TableCell>{item.recapEarnings}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Tổng tiền và hoàn tất */}
                <Box display="flex" justifyContent="space-between" mt={3}>
                    <Typography variant="h6">Tổng tiền: {contributor.totalEarnings} VND</Typography>
                    <Button variant="contained" color="primary" onClick={handleComplete}>Hoàn tất</Button>
                </Box>
            </Box >
        </Box>
    );
}

export default CreateContributorPayout