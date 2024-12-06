import React, { useEffect, useState } from 'react';
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
    TableContainer,
    Modal,
    TextField,
    MenuItem,
    Chip
} from '@mui/material';
import dayjs from 'dayjs';
import { CalendarMonth, Visibility } from '@mui/icons-material';
import { Hourglass } from 'react-loader-spinner';

import api from '../Auth/AxiosInterceptors';

const resolveRefs = (data) => {
    const refMap = new Map();
    const createRefMap = (obj) => {
        if (typeof obj !== "object" || obj === null) return;
        if (obj.$id) {
            refMap.set(obj.$id, obj);
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                createRefMap(obj[key]);
            }
        }
    };
    const resolveRef = (obj) => {
        if (typeof obj !== "object" || obj === null) return obj;
        if (obj.$ref) {
            return refMap.get(obj.$ref);
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = resolveRef(obj[key]);
            }
        }
        return obj;
    };
    createRefMap(data);
    return resolveRef(data);
};

function PublisherPayout() {
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const [payouts, setPayouts] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [selectedPublisher, setSelectedPublisher] = useState('');
    const [selectedPublisherName, setSelectedPublisherName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [isHover, setIsHover] = useState(false);

    const [loading, setLoading] = useState(true);

    const fetchPayoutList = async () => {
        try {
            const response = await api.get('/api/PublisherPayout/getallpublisherswithpayouts');
            const payouts = response.data.$values;
            setPayouts(payouts);
            console.log("Payouts: ", payouts);
            setLoading(false);
        } catch (error) {
            console.error("Error Fetching", error);
        }
    }

    const fetchPublishers = async () => {
        try {
            const response = await api.get('/api/publisher/getallpublishers');
            const publishers = resolveRefs(response.data.$values);
            console.log("Publishers: ", publishers);
            setPublishers(publishers)
            setLoading(false);
        } catch (error) {
            console.error("Error Fetching", error);
        }
    }

    useEffect(() => {
        fetchPayoutList();
        fetchPublishers();
    }, [])

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const historyPayout = (id) => {
        navigate(`/publisher-payout-history/${id}`);
    };

    const detailPayout = (id) => {
        navigate(`/publisher-payout-detail/${id}`)
    }
    // Fetch thông tin payout chuẩn bị tạo
    const inputCreatePayout = async () => {
        try {
            const response = await api.get(`/api/PublisherPayout/getpreparepayoutinfobypublisherid/${selectedPublisher}`,
                {
                    params: {
                        toDate: endDate
                    }
                }
            )
            console.log("Payout preparation successful:", response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("Error preparing payout", error);
            throw new Error("Failed to prepare payout");
        }
    }

    // Tạo quyết toán
    const handleCreatePayout = async () => {
        try {
            const data = await inputCreatePayout();
            setOpenModal(false);
            alert(`Đã tạo quyết toán cho ${selectedPublisherName} từ ngày: ${startDate} đến ngày: ${endDate}`);
            navigate(`/publisher-payout-create/${selectedPublisher}`, { state: data });
            // navigate(`/publisher-payout-create/${selectedPublisher}`);
        } catch (error) {
            console.error("Error creating payout", error);
            alert("Đã xảy ra lỗi khi tạo quyết toán. Vui lòng thử lại.");
        }
    };

    const handlePublisherChange = (event) => {
        const publisherId = event.target.value;

        // Tìm Publisher
        const publisher = publishers.find((c) => c.id === publisherId);
        const publisherName = publisher ? publisher.publisherName : "Unknown Publisher";

        // Tìm quyết toán gần nhất
        const selectedPayout = payouts.find((payout) => payout.id === publisherId);

        const startDate = selectedPayout?.todate
            ? dayjs(selectedPayout.todate).format('YYYY-MM-DD')
            : '';

        const endDate = dayjs().format('YYYY-MM-DD');

        setSelectedPublisher(publisherId);
        setSelectedPublisherName(publisherName);
        setStartDate(startDate);
        setEndDate(endDate);
    };

    const handleMouseEnter = () => {
        setIsHover(true);
    }

    const handleMouseLeave = () => {
        setIsHover(false);
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" width="80vw">
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    colors={["#306cce", "#72a1ed"]}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '24px', width: '80vw' }}>
            {/* Tiêu đề */}
            <Typography variant="h5" gutterBottom>
                Quyết toán tiền bản quyền
            </Typography>

            <Box display="flex" justifyContent="flex-end" mt={2} padding={2}>
                <Chip
                    label="Tạo mới quyết toán"
                    variant={isHover ? "contained" : "outlined"}
                    color="primary"
                    onClick={handleOpenModal}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
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
                        {payouts.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.publisherName}</TableCell>
                                <TableCell>{new Date(item.fromdate).toLocaleDateString('en-GB')} - {new Date(item.todate).toLocaleDateString('en-GB')}</TableCell>
                                <TableCell>{(item.totalEarnings ?? 0).toLocaleString("vi-VN")} VND</TableCell>
                                <TableCell><Typography color='success'>Đã Hoàn tất</Typography></TableCell>
                                <TableCell align="center">
                                    <Box>
                                        <Button
                                            color="primary"
                                            onClick={() => historyPayout(item.id)}
                                            sx={{
                                                '&:hover': { backgroundColor: '#edf5fa' },
                                            }}
                                        >
                                            <CalendarMonth />
                                        </Button>
                                        <Button
                                            color="primary"
                                            onClick={() => detailPayout(item.payoutId)}
                                            sx={{
                                                '&:hover': { backgroundColor: '#edf5fa' },
                                            }}
                                        >
                                            <Visibility />
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
                }}>
                    <Typography variant="h6" mb={2}>Tạo mới đợt quyết toán</Typography>
                    <TextField
                        fullWidth
                        select
                        label="Tên NXB"
                        value={selectedPublisher}
                        onChange={handlePublisherChange}
                        margin="normal"
                    >
                        {publishers.map((publisher) => (
                            <MenuItem key={publisher.id} value={publisher.id}>
                                {publisher.publisherName}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        label="Từ ngày"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        disabled
                    />
                    <TextField
                        fullWidth
                        label="Đến ngày"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                            // Disable past dates
                            min: startDate, // Chỉ lấy phần ngày (YYYY-MM-DD)
                        }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button color="error" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreatePayout}
                            disabled={!selectedPublisher || !endDate}
                        >
                            Tạo
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}

export default PublisherPayout;
