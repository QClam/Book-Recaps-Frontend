import React, { useEffect, useState } from 'react';
import {
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, Typography, Button, Box, Modal, TextField, MenuItem,
    Chip
} from '@mui/material';
import { CalendarMonth, Visibility } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../Auth/AxiosInterceptors';
import { Hourglass } from 'react-loader-spinner';

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

function ContributorPayout() {
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const [selectedContributor, setSelectedContributor] = useState('');
    const [selectedContributorName, setSelectedContributorName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [payouts, setPayouts] = useState([]);
    const [contributors, setContributors] = useState([]);
    const [isHover, setIsHover] = useState(false);

    const [loading, setLoading] = useState(true);

    const fetchPayoutList = async () => {
        try {
            const response = await api.get('/api/contributorpayout/getallcontributorswithpayouts')
            const payoutList = resolveRefs(response.data.$values);
            console.log(payoutList);
            setPayouts(payoutList);
            setLoading(false);
        } catch (error) {
            console.error("Error Fetching", error);
        }
    }

    const fetchContributor = async () => {
        try {
            const response = await api.get('/api/users/getalluser');
            const users = resolveRefs(response.data.$values);
            const contributors = users.filter(user => user.roleType === 2);
            console.log("Contributors: ", contributors);
            setContributors(contributors)
            setLoading(false);
        } catch (error) {
            console.error("Error Fetching", error);
        }
    }

    useEffect(() => {
        fetchPayoutList();
        fetchContributor();
    }, []);

    const historyPayout = (id) => {
        navigate(`/contributor-payout-history/${id}`);
    };

    const detailPayout = (id) => {
        navigate(`/contributor-payout-detail/${id}`);
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    // Fetch thông tin payout chuẩn bị tạo
    const inputCreatePayout = async () => {
        try {
            const response = await api.get(`/api/contributorpayout/getpreparepayoutinfobycontributorid/${selectedContributor}`,
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
            // alert(`Đã tạo quyết toán cho ${selectedContributorName} từ ngày: ${startDate} đến ngày: ${endDate}`);
            navigate(`/contributor-payout-create/${selectedContributor}`, { state: data });
        } catch (error) {
            console.error("Error creating payout", error);
            alert("Đã xảy ra lỗi khi tạo quyết toán. Vui lòng thử lại.");
        }
    };

    // Select tên Contributor trong form tạo quyết toán
    const handleContributorChange = (event) => {
        const contributorId = event.target.value;

        // Tìm thông tin contributor đã chọn
        const contributor = contributors.find((c) => c.id === contributorId);
        const contributorName = contributor ? contributor.fullName : "Unknown Contributor";

        // Tìm endDate của quyết toán gần nhất để paste vô Form
        const selectedPayout = payouts.find((payout) => payout.contributorId === contributorId);
        const startDate = selectedPayout?.todate
            ? dayjs(selectedPayout.todate).format('YYYY-MM-DD')
            : '';
        const endDate = dayjs().format('YYYY-MM-DD');

        // Cập nhật state
        setSelectedContributor(contributorId);
        setSelectedContributorName(contributorName);
        setStartDate(startDate);
        setEndDate(endDate);
        console.log(startDate);

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
            <Typography variant="h5">Quyết toán thu nhập cho Người đóng góp</Typography>
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Tên</strong></TableCell>
                            <TableCell><strong>Đợt quyết toán gần nhất</strong></TableCell>
                            <TableCell><strong>Tổng tiền đã chi (VND)</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payouts.map((item) => (
                            <TableRow key={item.contributorId}>
                                <TableCell>{item.contributorName}</TableCell>
                                <TableCell> {new Date(item.fromdate).toLocaleDateString('en-GB')} - {new Date(item.todate).toLocaleDateString('en-GB')}</TableCell>
                                <TableCell>{(item.totalEarnings ?? 0).toLocaleString("vi-VN")} VND</TableCell>
                                {item.status === "Done" ? (
                                    <TableCell><Typography color='success'>Đã Hoàn thành</Typography></TableCell>

                                ) : (
                                    <TableCell><Typography color='error'>Lỗi</Typography></TableCell>

                                )}
                                <TableCell>
                                    <Box>
                                        <Button
                                            color="primary"
                                            onClick={() => historyPayout(item.contributorId)}
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
                        label="Tên Contributor"
                        value={selectedContributor}
                        onChange={handleContributorChange}
                        margin="normal"
                    >
                        {contributors.map((contributor) => (
                            <MenuItem key={contributor.id} value={contributor.id}>
                                {contributor.fullName}
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
                    />
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button color="error" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreatePayout}
                            disabled={!selectedContributor || !endDate}>
                            Tạo
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}

export default ContributorPayout;
