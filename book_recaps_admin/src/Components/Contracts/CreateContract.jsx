import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Card,
    CardContent,
    IconButton,
    Grid,
    List,
    ListItem,
    ListItemButton,
    Select,
    MenuItem,
    InputLabel,
    Input,
} from "@mui/material";
import axios from "axios";
import api from "../Auth/AxiosInterceptors";

function CreateContract() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [publisherName, setPublisherName] = useState("");
    const [filteredPublishers, setFilteredPublishers] = useState([]);

    const [contractForm, setContractForm] = useState({
        isPublisherApproved: false,
        publisherId: "",
        revenueSharePercentage: 0,
        startDate: startDate,
        endDate: endDate,
        status: 0,
        autoRenew: false,
    });

    const resetContractForm = () => {
        setContractForm({
            isPublisherApproved: false,
            publisherId: "",
            revenueSharePercentage: 0,
            startDate: "",
            endDate: "",
            status: 0,
            autoRenew: false,
        });
    };

    const handlePublisherIdChange = (e) => {
        setContractForm((prevForm) => ({
            ...prevForm,
            publisherId: e.target.value,
        }));
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setPublisherName(value);

        if (value) {
            const filtered = publishers.filter((publisher) =>
                publisher.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredPublishers(filtered);
        } else {
            setFilteredPublishers([]);
        }
    };

    const handlePublisherClick = (publisher) => {
        setPublisherName(publisher);
        setFilteredPublishers([]);
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

    const handleDraftContract = async () => {
        const contractFormData = {
            publisherId: contractForm.publisherId,
            revenueSharePercentage: contractForm.revenueSharePercentage,
            startDate: contractForm.startDate,
            endDate: contractForm.endDate,
            autoRenew: contractForm.autoRenew,
            status: 0,
        };
        try {
            const response = await api.post(
                "/api/Contract/create",
                contractFormData
            );
            setContractForm(response.data);
            console.log("Contract Form: ", response.data);
            alert("Draft thành công")
            resetContractForm();
        } catch (error) {
            console.log("Error Posting", error);
        }
    };

    const handleSendContract = async () => {
        const contractFormData = {
            status: 1,
        };
        try {
            const response = await api.put(
                `/api/Contract/change-status/${id}`,
                contractFormData
            );
            setContractForm(response.data);
            console.log("Contract Form: ", response.data);
            alert("Gửi thành công")
        } catch (error) {
            console.log("Error Posting", error);
        }
    };

    const publishers = [
        "Nhà xuất bản Kim Đồng",
        "Nhà xuất bản Trẻ",
        "Nhà xuất bản Giáo dục Việt Nam",
        "Nhà xuất bản Văn học",
        "Nhà xuất bản Lao động",
        "Nhà xuất bản Chính trị Quốc gia - Sự thật",
        "Nhà xuất bản Phụ nữ Việt Nam",
        "Nhà xuất bản Khoa học và Kỹ thuật",
        "Nhà xuất bản Thế giới",
        "Nhà xuất bản Mỹ thuật",
    ];

    return (
        <div className="contract-list-container">
            <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
                {/* Contact Detail Section */}
                <Box sx={{ width: "100%", mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Tạo Hợp Đồng
                    </Typography>
                    <Card variant="outlined">
                        <CardContent>
                            <Box display="flex" gap={1} alignItems="center" mb={1}>
                                <Typography>Publisher: </Typography>
                                <TextField
                                    variant="outlined"
                                    sx={{ width: 350 }}
                                    value={contractForm.publisherId}
                                    onChange={handlePublisherIdChange}
                                />
                            </Box>
                            {filteredPublishers.length > 0 && (
                                <List
                                    sx={{
                                        width: 350,
                                        border: "1px solid #ddd",
                                        maxHeight: 200,
                                        overflowY: "auto",
                                        marginLeft: 10,
                                        marginBottom: 2,
                                        zIndex: 1,
                                    }}
                                >
                                    {filteredPublishers.map((publisher, index) => (
                                        <ListItem key={index} disablePadding>
                                            <ListItemButton
                                                onClick={() => handlePublisherClick(publisher)}
                                            >
                                                {publisher}
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                            <Box display="flex" gap={1} mb={2} alignItems="center">
                                <Typography>Phần trăm chia sẻ doanh thu: </Typography>
                                <TextField
                                    onChange={handleRevenueShareChange}
                                    name="revenueSharePercentage"
                                    type="number"
                                    value={contractForm.revenueSharePercentage}
                                    sx={{ width: 80 }}
                                />
                            </Box>
                            <Box display="flex" gap={1} mb={2} alignItems="center">
                                <Typography>Ngày bắt đầu: </Typography>
                                <TextField
                                    label="Ngày bắt đầu"
                                    type="date"
                                    name="startDate"
                                    value={contractForm.startDate}
                                    onChange={handleStartDateChange}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ color: "black" }}
                                />
                                <Typography>Ngày kết thúc: </Typography>
                                <TextField
                                    label="Ngày kết thúc"
                                    type="date"
                                    name="endDate"
                                    value={contractForm.endDate}
                                    onChange={handleEndDateChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>
                            <Box display="flex" gap={1} mb={2} alignItems="center">
                                {/* <Typography variant="body1">
                                    Trạng thái: <span style={{ color: 'orange' }}>Bản nháp</span>
                                </Typography> */}
                                <Typography variant="body2">Tự gia hạn: </Typography>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={contractForm.autoRenew}
                                    onChange={handleAutoRenewChange}
                                >
                                    <MenuItem value={true}>Có</MenuItem>
                                    <MenuItem value={false}>Không</MenuItem>
                                </Select>
                            </Box>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    
                                >
                                    Gửi
                                </Button>
                                <Button variant="contained" color="success" onClick={handleDraftContract}>
                                    Lưu chỉnh sửa
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Tài liệu đính kèm Section */}
                <Box sx={{ width: "100%", maxWidth: 800 }}>
                    <Typography variant="h6" gutterBottom>
                        Tài liệu đính kèm
                    </Typography>
                    <Button variant="outlined" color="success" sx={{ mb: 2 }}>
                        Thêm tài liệu
                    </Button>
                    <Grid container spacing={2}>
                        {[1, 2, 3, 4].map((item, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box
                                            sx={{
                                                height: 150,
                                                border: "1px dashed gray",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                mb: 2,
                                            }}
                                        >
                                            Preview Image
                                        </Box>
                                        <Typography variant="body1">Document {item}</Typography>
                                        <Typography variant="body2">Ngày tạo: ...</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </div>
    );
}

export default CreateContract;
