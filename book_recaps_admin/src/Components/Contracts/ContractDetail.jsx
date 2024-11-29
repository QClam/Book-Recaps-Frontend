import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    Box,
    TextField,
    Button,
    Typography,
    Card,
    CardContent, 
    Grid,   
    Select,
    MenuItem, 
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import Swal from 'sweetalert2';

import api from '../Auth/AxiosInterceptors';
import AddContractAttachment from './AddContractAttachment';
import AddContractBooks from './AddContractBooks';
import { fetchContractDetail } from './ContractServices';
import { Hourglass } from 'react-loader-spinner';


function ContractDetail() {

    const { contractId } = useParams();

    const [contract, setContract] = useState([]);
    const [contractAttachments, setContractAttachments] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [publishers, setPublishsers] = useState([]);
    const [isCheckbox, setIsCheckbox] = useState(false);
    const [loading, setLoading] = useState(true);

    const [contractForm, setContractForm] = useState({
        isPublisherApproved: false,
        separateRevenueShare: true,
        publisherId: "",
        revenueSharePercentage: 0,
        startDate: startDate,
        endDate: endDate,
        status: 0,
        autoRenew: false,
    });

    const disableUpdate = contract.status === 1 || contract.status === 2 || contract.status === 3;

    const getContractDetail = async () => {
        try {
            const result = await fetchContractDetail(contractId);
            if (result) {
                setContract(result.contract);
                setContractAttachments(result.contractAttachments);
                console.log(result.contract);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error Fetching Contract Details", error);
        }
    };

    const fetchPublishers = async () => {
        try {
            const response = await api.get('/api/publisher/getallpublishers');
            const publishers = response.data.$values;
            setPublishsers(publishers);
            console.log("Publishers: ", publishers);

        } catch (error) {
            console.error("Error Fetching Publishers", error);
        }
    }

    const handlePublisherIdChange = (e) => {
        setContractForm((prevForm) => ({
            ...prevForm,
            publisherId: e.target.value,
        }));
    };

    const handleRevenueShareChange = (e) => {

        const value = e.target.value;

        // Kiểm tra nếu giá trị là một số và nằm trong phạm vi 0 - 100
        if (!isNaN(value) && value !== "") {
            const numberValue = Number(value);

            // Kiểm tra xem giá trị có nằm trong phạm vi hợp lệ không
            if (numberValue >= 0 && numberValue <= 100) {
                setContractForm(prevForm => ({
                    ...prevForm,
                    revenueSharePercentage: numberValue,
                }));
            } else {
                console.log("Phần trăm chia sẻ doanh thu phải từ 0 đến 100");
            }
        } else {
            console.log("Vui lòng nhập một số hợp lệ");
        }
    };

    const handleStartDateChange = (e) => {
        setContractForm((prevForm) => ({
            ...prevForm,
            startDate: e.target.value,
        }));
    };

    const handleEndDateChange = (e) => {
        setContractForm((prevForm) => ({
            ...prevForm,
            endDate: e.target.value,
        }));
    };

    const handleAutoRenewChange = (e) => {
        setContractForm((prevForm) => ({
            ...prevForm,
            autoRenew: e.target.value,
        }));
    };

    const handleCheckboxChange = (e) => {
        setIsCheckbox(e.target.checked); // Cập nhật trạng thái của checkbox
    };

    const handleSaveContract = async () => {

        const contractFormData = {
            publisherId: contractForm.publisherId,
            separateRevenueShare: false,
            revenueSharePercentage: contractForm.revenueSharePercentage,
            startDate: contractForm.startDate,
            endDate: contractForm.endDate,
            autoRenew: contractForm.autoRenew,
            status: 0,
        };

        try {
            const response = await api.put(`api/Contract/update/${contractId}`, contractFormData);
            const contract = response.data.data;
            setContractForm(contract);
            console.log(contract);
            alert("Lưu thành công");
        } catch (error) {

        }
    }

    const handleSendContract = async () => {
        const contractFormData = {
            status: isCheckbox ? 3 : 1,
        };

        const result = await Swal.fire({
            title: isCheckbox ? 'Bạn có chắc chắn muốn kích hoạt hợp đồng?' : 'Bạn có chắc chắn muốn gửi?',
            text: isCheckbox ? 'Hợp đồng sẽ được kích hoạt ngay lập tức.' : 'Hợp đồng sẽ được gửi để xử lý.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Có, ' + (isCheckbox ? 'Kích hoạt' : 'Gửi') + '!',
            cancelButtonText: 'Hủy!',
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        });

        if (result.isConfirmed) {
            try {
                const response = await api.put(
                    `/api/Contract/change-status/${contractId}`,
                    contractFormData
                );
                setContractForm(response.data);
                console.log("Contract Form: ", response.data);
                getContractDetail();
                Swal.fire('Thành công',
                    isCheckbox ? 'Hợp đồng đã được kích hoạt!' : 'Bản hợp đồng đã được gửi!',
                    'success');
            } catch (error) {
                console.log("Error Posting", error);
                Swal.fire('Lỗi', 'Đã xảy ra lỗi!', 'error');
            }
        } else {
            Swal.fire('Đã hủy', 'Hành động đã bị hủy', 'info');
        }
    };

    useEffect(() => {
        getContractDetail();
        fetchPublishers();
    }, [contractId])

    useEffect(() => {
        if (contract) {
            setContractForm({
                ...contractForm,
                publisherId: contract.publisherId || "",
                revenueSharePercentage: contract.revenueSharePercentage || 0,
                startDate: contract.startDate || "",
                endDate: contract.endDate || "",
                autoRenew: contract.autoRenew || false,
            });
        }
    }, [contract]);

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
        <div className='contract-list-container'>
            <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>

                <Box sx={{ width: '100%', mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Chi tiết Bản hợp đồng</Typography>
                    <Card variant="outlined">
                        <CardContent>
                            <Grid container spacing={2}>

                                <Grid item xs={12} md={6}>
                                    <Box display="flex" alignItems="center">
                                        <Typography sx={{ width: 150 }}>Publisher:</Typography>
                                        <Select
                                            variant="outlined"
                                            sx={{ width: 360 }}
                                            value={contractForm.publisherId}
                                            onChange={handlePublisherIdChange}
                                            displayEmpty
                                            disabled={disableUpdate}
                                        >
                                            <MenuItem value="" disabled>
                                                Chọn Publisher
                                            </MenuItem>
                                            {publishers.map((publisher) => (
                                                <MenuItem key={publisher.id} value={publisher.id}>
                                                    {publisher.publisherName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box display="flex" alignItems="center">
                                        <Typography sx={{ width: 239 }}>Phần trăm chia sẻ doanh thu:</Typography>
                                        <TextField
                                            onChange={handleRevenueShareChange}
                                            name="revenueSharePercentage"
                                            type="number"
                                            value={contractForm.revenueSharePercentage}
                                            sx={{ width: 80 }}
                                            disabled={disableUpdate}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box display="flex" alignItems="center">
                                        <Typography sx={{ width: 150 }}>Ngày bắt đầu:</Typography>
                                        <TextField
                                            type="date"
                                            name="startDate"
                                            value={contractForm.startDate}
                                            onChange={handleStartDateChange}
                                            InputLabelProps={{ shrink: true }}
                                            disabled={disableUpdate}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box display="flex" alignItems="center">
                                        <Typography sx={{ width: 150 }}>Ngày kết thúc:</Typography>
                                        <TextField
                                            type="date"
                                            name="endDate"
                                            value={contractForm.endDate}
                                            onChange={handleEndDateChange}
                                            InputLabelProps={{ shrink: true }}
                                            disabled={disableUpdate}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box display="flex" alignItems="center">
                                        <Typography sx={{ width: 150 }}>Tự gia hạn:</Typography>
                                        <Select
                                            value={contractForm.autoRenew}
                                            onChange={handleAutoRenewChange}
                                            disabled={disableUpdate}
                                        >
                                            <MenuItem value={true}>Có</MenuItem>
                                            <MenuItem value={false}>Không</MenuItem>
                                        </Select>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="flex-end" gap={2}>
                                        <FormControlLabel
                                            control={<Checkbox checked={isCheckbox} onChange={handleCheckboxChange} disabled={disableUpdate} />}
                                            label="Kích hoạt ngay"
                                        />
                                        <Button
                                            variant= "contained"
                                            color="secondary"
                                            onClick={handleSendContract}
                                            disabled={!isCheckbox || disableUpdate}
                                        >
                                            Kích hoạt hợp đồng
                                        </Button>
                                        <Button variant="contained" color="primary" onClick={handleSendContract} disabled={disableUpdate || isCheckbox}>
                                            Gửi
                                        </Button>
                                        <Button variant="contained" color="success" onClick={handleSaveContract} disabled={disableUpdate}>
                                            Lưu chỉnh sửa
                                        </Button>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body1">
                                            Trạng thái: {contract.status === 0 ? (
                                                <Typography variant="contained" color='warning'>Bản nháp</Typography>
                                            ) : contract.status === 1 ? (
                                                <Typography variant="contained" color='primary'>Đang xử lý</Typography>
                                            ) : contract.status === 2 ? (
                                                <Typography variant="contained" color='info'>Chưa bắt đầu</Typography>
                                            ) : contract.status === 3 ? (
                                                <Typography variant="contained" color='success'>Đang kích hoạt</Typography>
                                            ) : contract.status === 4 ? (
                                                <Typography variant="contained" color='error'>Hết hạn</Typography>
                                            ) : contract.status === 5 ? (
                                                <Typography variant="contained" color='error'>Từ chối</Typography>
                                            ) : (
                                                <Typography variant="contained">Unknow</Typography>
                                            )}
                                        </Typography>
                                        <Typography variant="body2">Ngày tạo: {new Date(contract.createdAt).toLocaleDateString()}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>

                <AddContractAttachment contractId={contractId} disableUpdate={disableUpdate} />

                <AddContractBooks contractId={contractId} disableUpdate={disableUpdate} />

            </Box>
        </div>
    )
}

export default ContractDetail