import { Box, Button, Card, CardContent, Grid, Modal, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import api from '../Auth/AxiosInterceptors';
import { Article } from '@mui/icons-material';
import { fetchContractDetail } from './ContractServices';

function AddContractAttachment({ contractId }) {

    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [contract, setContract] = useState([]);
    const [contractAttachments, setContractAttachments] = useState([]);

    const [contractAttachment, setContractAttachment] = useState({
        Name: "",
        AttachmentURL: "",
        ContractId: contractId,
        file: null,
    });

    const disableUpdate = contract.status === 1 || contract.status === 2 || contract.status === 3;

    const getContractDetail = async () => {
        try {
            const result = await fetchContractDetail(contractId);
            if (result) {
                setContract(result.contract);
                setContractAttachments(result.contractAttachments);
                console.log(result.contract);
                console.log("Hợp đồng đính kèm: ", result.contractAttachments);
            }
        } catch (error) {
            console.error("Error Fetching Contract Details", error);
        }
    };

    useEffect(() => {
        getContractDetail();
    }, [contractId])

    const handleNameChange = (e) => {
        setContractAttachment((prevForm) => ({
            ...prevForm,
            Name: e.target.value,
        }));
    };

    const handleFileChange = (e) => {
        setContractAttachment((prevForm) => ({
            ...prevForm,
            file: e.target.files[0],
        }));
    };

    const handleAddContractAttachment = async () => {
        const formData = new FormData();
        formData.append("Name", contractAttachment.Name);
        formData.append("ContractId", contractId);
        formData.append("file", contractAttachment.file);

        try {
            const response = await api.post(`/api/contract-attachment/createcontractattachment`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const contractAttachment = response.data.data;
            setContractAttachment(contractAttachment);
            console.log("Hàng đính kèm: ", contractAttachment);
            handleClose();
            getContractDetail();
        } catch (error) {
            console.error("Error Posting", error);
        }
    };

    return (
        <div >
            <Typography variant="h6" gutterBottom>Tài liệu đính kèm</Typography>
            <Button color='primary' variant='outlined' onClick={handleOpen} sx={{ margin: 1 }} disabled={disableUpdate}>
                Thêm tài liệu
            </Button>

            <Box sx={{ width: '100%', maxWidth: 1000 }}>
                <Grid container spacing={2}>
                    {contractAttachments.map((item) => (
                        <Grid item xs={12} sm={8} md={4} key={item.id}>
                            <Card variant="outlined" sx={{ width: '100%', height: 320 }}>
                                <CardContent sx={{ padding: 2 }}>
                                    <Box sx={{ height: 150, border: '1px solid gray', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                                        <Article />
                                    </Box>
                                    <Typography variant="body1">{item.name}</Typography>
                                    <Typography variant="body2">Ngày tạo: {new Date(item.createdAt).toLocaleDateString()}</Typography>
                                    <Button href={item.attachmentURL} target="_blank" rel="noopener noreferrer">
                                        Chi tiết
                                    </Button>

                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 600,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                        Thêm tài liệu
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center">
                                <Typography sx={{ width: 200 }}>Tên bản hợp đồng: </Typography>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    value={contractAttachment.Name}
                                    onChange={handleNameChange}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center">
                                <Typography sx={{ width: 200 }}>Tệp đính kèm: </Typography>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    onChange={handleFileChange}
                                    type="file"
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
                        <Button onClick={handleClose} color="error" variant="contained">
                            Đóng
                        </Button>
                        <Button onClick={handleAddContractAttachment} color="primary" variant="contained">
                            Thêm
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}

export default AddContractAttachment;