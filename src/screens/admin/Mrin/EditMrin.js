import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Container, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SimpleModal from "../../../components/Modal";
import '../../common.css'
import { createOrUpdateMRINDetail, getMRINDetail, updateMRINGCSpec } from "../../../apis";
import useToken from '../../../hooks/useToken';
import BasicTable from './BasicTable';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: 10,
        },
        '& .MuiFormControl-fullWidth': {
            width: '95%'
        },
        '& .page-header': {
            width: '100%',
            marginBottom: 15,
        },
        '& .MuiAccordion-root': {
            width: '100%'
        },
        '& .dispatchTable': {
            maxHeight: '400px',
            overflowY: "auto",
        },
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    modal: {
        position: "absolute",
        margin: "auto",
        top: "30%",
        left: "30%",
        width: 700,
        backgroundColor: theme.palette.background.paper,
        border: "2px solid #000",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    control: {
        marginTop: 3,
        marginBottom: 3
    },
}));

const currentDate = () => {
    return new Date();
}

const formatGCCompositions = (delivered_spec, dispatched_spec, expected_spec) => {
    return [
        {
            composition_name: "Density(Gm/Cc)",
            key: "del_density",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_density : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_density : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_density : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_density - delivered_spec[0].del_density) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_density : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_density : 0
        },
        {
            composition_name: "Moisture (%)",
            key: "del_moisture",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_moisture : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_moisture : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_moisture : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_moisture - delivered_spec[0].del_moisture) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_moisture : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_moisture : 0
        },
        {
            composition_name: "Browns (%)",
            key: "del_browns",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_browns : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_browns : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_browns : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_browns - delivered_spec[0].del_browns) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_browns : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_browns : 0
        },
        {
            composition_name: "Blacks (%)",
            key: "del_blacks",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_blacks : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_blacks : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_blacks : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_blacks - delivered_spec[0].del_blacks) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_blacks : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_blacks : 0
        },
        {
            composition_name: "Broken & Bits (%)",
            key: "del_brokenbits",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_brokenbits : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_brokenbits : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_brokenbits : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_brokenbits - delivered_spec[0].del_brokenbits) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_brokenbits : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_brokenbits : 0
        },
        {
            composition_name: "Insected beans (%)",
            key: "del_insectedbeans",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_insectedbeans : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_insectedbeans : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_insectedbeans : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_insectedbeans - delivered_spec[0].del_insectedbeans) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_insectedbeans : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_insectedbeans : 0
        },
        {
            composition_name: "Bleached (%)",
            key: "del_bleached",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_bleached : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_bleached : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_bleached : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_bleached - delivered_spec[0].del_bleached) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_bleached : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_bleached : 0
        },
        {
            composition_name: "Husk (%)",
            key: "del_husk",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_husk : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_husk : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_husk : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_husk - delivered_spec[0].del_husk) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_husk : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_husk : 0
        },
        {
            composition_name: "Sticks (%)",
            key: "del_sticks",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_sticks : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_sticks : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_sticks : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_sticks - delivered_spec[0].del_sticks) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_sticks : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_sticks : 0
        },
        {
            composition_name: "Stones (%)",
            key: "del_stones",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_stones : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_stones : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_stones : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_stones - delivered_spec[0].del_stones) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_stones : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_stones : 0
        },
        {
            composition_name: "Beans retained on 5mm mesh during sieve analysis",
            key: "del_beansretained",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_beansretained : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_beansretained : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_beansretained : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_beansretained - delivered_spec[0].del_beansretained) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_beansretained : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_beansretained : 0
        },
    ];
};

const EditMrin = (props) => {
    const classes = useStyles();
    const [mrinDetails, setMrinDetails] = useState({});
    const [locationList, setLocationList] = useState([]);
    const [disableInvoice, setDisableInvoice] = useState(false);
    const [invoiceFile, setInvoiceFile] = useState({});
    // const [disableUpload, setDisableUpload] = useState(true);
    const [uploadedFile, setUploadedFile] = useState({});
    const [validationError, setValidationError] = useState({});
    const [validationErrorPaid, setValidationErrorPaid] = useState({});
    const [openApprove, setApprove] = useState(false);
    const [openPaid, setPaid] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [fileUploadData, setFileUploadData] = useState({});

    // console.log("File upload data is", fileUploadData);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const { getCurrentUserDetails } = useToken();
    const [compositions, setCompositions] = useState([]);

    let currentUserDetails = getCurrentUserDetails();

    const formatToSelection = (data = [], key, id) => {
        let formattedData = [];
        data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
        return formattedData;
    }

    useEffect(() => {
        let temp = { ...props.editData };
        temp.location = { label: props.editData?.location, value: props.editData?.location };
        setMrinDetails(temp);
        setCompositions(formatGCCompositions(props.editData.delivered_spec, props.editData.dispatched_spec, props.editData.expected_spec));
        getMRINDetail({ type: "getDocumentsOnMRIN", mrinid: props.id }).then((res) => {
            if (res) {
                setInvoiceFile(res[res.length - 1]);
            }
        });
        if (currentUserDetails.role === "QC Manager") {
            setDisableInvoice(true);
        }
        setLocationList(formatToSelection([
            { id: "Silo No 1", label: "Silo No 1" },
            { id: "Silo No 2", label: "Silo No 2" },
            { id: "Silo No 3", label: "Silo No 3" },
            { id: "Silo No 4", label: "Silo No 4" },
            { id: "Silo No 5", label: "Silo No 5" },
            { id: "Silo No 6", label: "Silo No 6" },
            { id: "Silo No 7", label: "Silo No 7" },
            { id: "Silo No 8", label: "Silo No 8" },
            { id: "Silo No 9", label: "Silo No 9" },
            { id: "Silo No 10", label: "Silo No 10" },
            { id: "Silo No 11", label: "Silo No 11" },
            { id: "Silo No 12", label: "Silo No 12" },
            { id: "Silo No 13", label: "Silo No 13" },
            { id: "Silo No 14", label: "Silo No 14" },
            { id: "Green Coffee Godown 1", label: "Green Coffee Godown 1" }], "label", "id"))
        // eslint-disable-next-line 
    }, [props.editData]);

    const handleChange = (event, key,) => {
        var bal = '';
        let data = { ...mrinDetails };
        if (key === "delivered_quantity") {
            if (parseFloat(event.target.value) > parseFloat(mrinDetails.expected_quantity)) {
                let errorObj = { ...validationError };
                errorObj = { ...errorObj, delivered_quantity: 'Delivered quantity should not be greater than Expected  quantity.' };
                setValidationError(errorObj);

                data = {
                    ...mrinDetails,
                    [key]: event.target.value,
                }

            } else {
                let errorObj = { ...validationError };
                delete errorObj.delivered_quantity;
                setValidationError(errorObj);

                bal = parseFloat(mrinDetails.expected_quantity) - (parseFloat(event.target.value) + parseFloat(mrinDetails.wayment_shortage || 0));
                data = {
                    ...mrinDetails,
                    [key]: event.target.value,
                    "balance_quantity": bal === isNaN ? 0 : bal
                };
            }

        } else if (key === "wayment_shortage") {
            bal = parseFloat(mrinDetails.expected_quantity) - (parseFloat(event.target.value) + parseFloat(mrinDetails.delivered_quantity))
            data = {
                ...mrinDetails,
                [key]: event.target.value,
                "balance_quantity": bal === isNaN ? 0 : bal
            };
        } else {
            data = {
                ...mrinDetails,
                [key]: event.target.value,
            }
        }
        setMrinDetails(data);
    };

    const handleChangeinvoice = (event, key) => {
        let data = {
            ...mrinDetails,
            [key]: event.target.value,
        }
        setMrinDetails(data);
    };

    const handlelocationChange = (event, value) => {
        let data = {
            ...mrinDetails,
            'location': value,
        }
        setMrinDetails(data);
    };

    const handleDateChange = (date, key,) => {
        let data = {
            ...mrinDetails,
            [key]: date
        }
        setMrinDetails(data);
        console.log(data);
    };


    const createMrinAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = { ...validationError };
        setValidationError(errorObj);
        if (_.isEmpty(mrinDetails.delivered_quantity?.toString())) {
            errorObj = { ...errorObj, delivered_quantity: message };
        }
        else {
            delete errorObj.delivered_quantity
        }
        if (_.isEmpty(mrinDetails.wayment_shortage?.toString())) {
            errorObj = { ...errorObj, wayment_shortage: message };
        }
        else {
            delete errorObj.wayment_shortage
        }
        if (_.isEmpty(mrinDetails.invoice_date?.toString())) {
            errorObj = { ...errorObj, invoice_date: message };
        }
        else {
            delete errorObj.invoice_date
        }
        if (_.isEmpty(mrinDetails.invoiceno?.toString())) {
            errorObj = { ...errorObj, invoiceno: message };
        }
        else {
            delete errorObj.invoiceno
        }
        if (_.isEmpty(mrinDetails.vehicle_no?.toString())) {
            errorObj = { ...errorObj, vehicle_no: message };
        }
        else {
            delete errorObj.vehicle_no
        }
        if (_.isEmpty(mrinDetails.wayBillDate)) {
            errorObj = { ...errorObj, wayBillDate: message };
        }
        else {
            delete errorObj.wayBillDate
        }
        if (_.isEmpty(mrinDetails.wayBillNumber)) {
            errorObj = { ...errorObj, wayBillNumber: message };
        }
        else {
            delete errorObj.wayBillNumber
        }
        if (mrinDetails.subCategory === '1001' && _.isEmpty(mrinDetails.billOfEntry)) {
            errorObj = { ...errorObj, billOfEntry: message };
        }
        else {
            delete errorObj.billOfEntry
        }
        if (mrinDetails.subCategory === '1001' && _.isEmpty(mrinDetails.billOfEntryDate)) {
            errorObj = { ...errorObj, billOfEntryDate: message };
        }
        else {
            delete errorObj.billOfEntryDate
        }
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const error = { message: 'Please fill mandatory fields to update' }
                throw error
            }
            catch (err) {
                setSnack({
                    open: true,
                    message: err.message,
                    severity: 'error'
                });
            }
        } else {
            setLoading(true);
            let data = {
                "update": true,
                "type": "uploadDocument",
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "doc_kind": "MRIN",
                "document_content": uploadedFile?.file,
                "document_name": uploadedFile?.document_name,
                "expected_quantity": mrinDetails.expected_quantity,
                "detid": mrinDetails.detid,
                "delivery_date": mrinDetails.delivery_date,
                "delivered_quantity": mrinDetails.delivered_quantity,
                "wayment_shortage": mrinDetails.wayment_shortage,
                "balance_quantity": mrinDetails.balance_quantity ? mrinDetails.balance_quantity?.toString() === '' ? '0' : mrinDetails.balance_quantity?.toString() : '0',
                "mrinid": props.id,
                "invoice_date": mrinDetails.invoice_date ? mrinDetails.invoice_date : currentDate(),
                "invoice_no": mrinDetails.invoiceno,
                "vehicle_no": mrinDetails.vehicle_no,
                "invoice_quantity": mrinDetails.invoice_quantity,
                "wayBillDate": mrinDetails.wayBillDate,
                "wayBillNumber": mrinDetails.wayBillNumber,
                "billOfEntry": mrinDetails.billOfEntry,
                "billOfEntryDate": mrinDetails.billOfEntryDate,
                "apStatus": mrinDetails.apStatus,
                "apDetails": mrinDetails.apDetails,
                "qcStatus": mrinDetails.qcStatus,
                "invoiceAmount": mrinDetails.invoiceAmount,
                "location": mrinDetails.location?.value,
                "invoiceStatus": mrinDetails.invoiceStatus,
                "role": localStorage.getItem('currentUserRole'),
                "pono": mrinDetails.pono,
                "itemid": mrinDetails.item_id,
            }
            try {
                let response = await createOrUpdateMRINDetail(data)
                console.log("Response", response);
                if (response) {
                    setSnack({
                        open: true,
                        message: "MRIN updated successfully",
                    });

                    setTimeout(() => {
                        setLoading(false);
                        props.back()
                    }, 2000)

                }
            } catch (e) {
                setLoading(false);
                setSnack({
                    open: true,
                    message: e.message,
                    severity: 'error',
                })
            }

            let data1 = {
                "update_spec": true,
                "detid": mrinDetails.detid,
                "role": localStorage.getItem('currentUserRole'),
                "itemid": mrinDetails.item_id,
                "del_density": mrinDetails?.del_density?.toString(),
                "del_moisture": mrinDetails.del_moisture?.toString(),
                "del_browns": mrinDetails.del_browns?.toString(),
                "del_blacks": mrinDetails.del_blacks?.toString(),
                "del_brokenbits": mrinDetails.del_brokenbits?.toString(),
                "del_insectedbeans": mrinDetails.del_insectedbeans?.toString(),
                "del_bleached": mrinDetails.del_bleached?.toString(),
                "del_husk": mrinDetails.del_husk?.toString(),
                "del_sticks": mrinDetails.del_sticks?.toString(),
                "del_stones": mrinDetails.del_stones?.toString(),
                "del_beansretained": mrinDetails.del_beansretained?.toString(),
            };
            try {
                let response = await updateMRINGCSpec(data1)
                if (response) {
                    setSnack({
                        open: true,
                        message: "MRIN GC specification updated successfully",
                    });
                    setTimeout(() => {
                        setLoading(false);
                        props.back()
                    }, 2000)

                }
            } catch (e) {
                setLoading(false);
                setSnack({
                    open: true,
                    message: e.message,
                    severity: 'error',
                })
            }



        }
    }

    const onUpdateOrderSpec = (val) => {
        // eslint-disable-next-line
        let temp = { ...mrinDetails };// eslint-disable-next-line
        val && val.map((item, index) => {
            temp[item.key] = parseFloat(item.delivered_spec);
        })
        setMrinDetails(temp);
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleFileChange = async (e) => {
        if (!e.target.files) {
            return;
        }
        // setDisableUpload(false);
        let file = await toBase64(e.target.files[0]);
        file = file.replace(/^data:application\/(pdf);base64,/, "")
        // setInvoiceFile({
        //     file_name: e.target.files[0].name,
        //     document_name: e.target.files[0].name,
        //     file: file
        // });
        setUploadedFile({
            file_name: e.target.files[0].name,
            document_name: e.target.files[0].name,
            file: file
        });
    }

    // const uploadFileHandler = async (e) => {
    //     if (!uploadedFile) {
    //         return;
    //     }
    //     console.log("Uploaded file is", uploadedFile);
    //     setFileUploadData({ "type": "uploadDocument", "doc_kind": "MRIN", "document_content": uploadedFile.file, "document_name": uploadedFile.document_name });
    //     // setDisableUpload(true);
    //     // try {                                                     
    //     //     let response = await createOrUpdateMRINDetail({
    //     //         "type":"uploadDocument",
    //     //         "doc_kind": "MRIN",
    //     //         "document_content": uploadedFile.file,               
    //     //         "document_name": uploadedFile.file_name,
    //     //         "detid": mrinDetails.detid,
    //     //         "pono": mrinDetails.pono,                
    //     //     });
    //     //   console.log("Response", response);
    //     //    if(response) {
    //     //         setSnack({
    //     //             open: true,
    //     //             message: "File uploaded successfully",
    //     //         });               
    //     //         setInvoiceFile(uploadedFile);                
    //     //    }
    //     // } catch(e) {
    //     //     setSnack({
    //     //         open: true,
    //     //         message: e.message,
    //     //         severity: 'error',
    //     //     })
    //     // }                        
    // }

    // const downloadFileHandler = async (e) => {
    //     try {
    //         let response = await getMRINDetail({
    //             type: "downloadMRINDocument",
    //             file_name: invoiceFile.file_name,
    //         });
    //         console.log("Response", response);
    //         if (response) {
    //             const linkSource = `data:application/pdf;base64,${response.fileData}`;
    //             const downloadLink = document.createElement("a");
    //             downloadLink.href = linkSource;
    //             downloadLink.download = invoiceFile.file_name;
    //             downloadLink.click();
    //             setSnack({
    //                 open: true,
    //                 message: "File downloaded successfully",
    //             });
    //         }
    //     } catch (e) {
    //         setSnack({
    //             open: true,
    //             message: e.message,
    //             severity: "error",
    //         });
    //     }
    // }
    // mrinDetails.status === 'Pending with QC Approval' ? true : false
    const gcTableColumns = [
        { id: "composition_name", label: "Item" },
        { id: "expected_spec", label: "Expected" },
        { id: "dispatched_spec", label: "Dispatched" },
        { id: "delivered_spec", label: "Delivered", isEditable: true, type: 'number' },
        { id: "difference", label: "Difference", isEditable: true, type: 'number' },
    ];

    const payload = [
        {
            label: 'PO number',
            type: 'input',
            disabled: true,
            value: mrinDetails.pono
        },
        {
            label: 'Parent dispatch',
            type: 'input',
            value: mrinDetails.related_detid || '-',
            disabled: true,
        },
        {
            label: 'Dispatch number',
            type: 'input',
            value: mrinDetails.detid || '-',
            disabled: true
        },
        {
            label: 'Expected quantity(Kgs)',
            type: 'number',
            value: mrinDetails.expected_quantity ? parseFloat(mrinDetails.expected_quantity).toFixed(4) : '-',
            disabled: true
        },
        {
            label: 'Vehicle number',
            type: 'input',
            value: mrinDetails.vehicle_no || '',
            required: true,
            error: validationError?.vehicle_no,
            helperText: validationError?.vehicle_no,
            onChange: (e) => handleChangeinvoice(e, 'vehicle_no')
        },
        {
            label: 'Invoice number',
            type: 'input',
            value: mrinDetails.invoiceno || '',
            required: true,
            error: validationError?.invoiceno,
            helperText: validationError?.invoiceno,
            onChange: (e) => handleChangeinvoice(e, 'invoiceno')
        },
        {
            label: 'Invoice quantity(Kgs)',
            type: 'number',
            value: mrinDetails.invoice_quantity ? parseFloat(mrinDetails.invoice_quantity).toFixed(4) : '',
            onChange: (e) => handleChange(e, 'invoice_quantity')
        },
        {
            label: 'Invoice date',
            type: 'datePicker',
            value: mrinDetails.invoice_date || currentDate(),
            required: true,
            error: validationError?.invoice_date,
            helperText: validationError?.invoice_date,
            onChange: (e) => handleDateChange(e, 'invoice_date')
        },
        {
            label: 'Delivery date',
            type: 'datePicker',
            value: mrinDetails.delivery_date,
            required: true,
            error: validationError?.delivery_date,
            helperText: validationError?.delivery_date,
            onChange: (e) => handleDateChange(e, 'delivery_date')
        },
        {
            label: 'Delivered quantity(Kgs)',
            type: 'number',
            disabled: true,
            inputProps: { min: 0 },
            value: mrinDetails.delivered_quantity ? parseFloat(mrinDetails.delivered_quantity).toFixed(4) : '-',
            required: true,
            error: validationError?.delivered_quantity,
            helperText: validationError?.delivered_quantity,
            onChange: (e) => {
                if (e.target.value >= 0)
                    handleChange(e, 'delivered_quantity')
            }
        },
        {
            label: 'Weighment shortage',
            type: 'number',
            disabled: true,
            value: mrinDetails.wayment_shortage ? parseFloat(mrinDetails.wayment_shortage).toFixed(4) : '',
            required: true,
            error: validationError?.wayment_shortage,
            helperText: validationError?.wayment_shortage,
            onChange: (e) => { if (e.target.value >= 0) handleChange(e, 'wayment_shortage') }
        },
        {
            label: 'Balance quantity(Kgs)',
            type: 'number',
            disabled: true,
            value: mrinDetails.balance_quantity ? parseFloat(mrinDetails.balance_quantity).toFixed(4) : '',
        },
        {
            label: 'Way bill number',
            type: 'input',
            disabled: true,
            value: mrinDetails.wayBillNumber,
            required: true,
            error: validationError?.wayBillNumber,
            helperText: validationError?.wayBillNumber,
            onChange: (e) => handleChange(e, 'wayBillNumber'),
            sm: 6
        },
        {
            label: 'Way bill date',
            type: 'datePicker',
            value: mrinDetails.wayBillDate || null,
            required: true,
            error: validationError?.wayBillDate,
            helperText: validationError?.wayBillDate,
            onChange: (e) => handleDateChange(e, 'wayBillDate'),
        },
        {
            label: 'Locations',
            type: 'autocomplete',
            labelprop: "label",
            value: mrinDetails.location ? mrinDetails.location : '',
            options: locationList || [],
            onChange: handlelocationChange,
        }
    ]

    const payload1 = [
        {
            label: 'Bill of entry number',
            type: 'input',
            value: mrinDetails.billOfEntry,
            required: true,
            error: validationError?.billOfEntry,
            helperText: validationError?.billOfEntry,
            onChange: (e) => handleChange(e, 'billOfEntry'),
            sm: 6
        },
        {
            label: 'Bill of entry date',
            type: 'datePicker',
            value: mrinDetails.billOfEntryDate || null,
            required: true,
            error: validationError?.billOfEntryDate,
            helperText: validationError?.billOfEntryDate,
            onChange: (e) => handleDateChange(e, 'billOfEntryDate'),
        },
    ]

    const payload2 = [
        {
            label: 'AP status',
            type: 'input',
            disabled: true,
            value: mrinDetails.apStatus,
            sm: 6
        },
        {
            label: 'AP details',
            type: 'input',
            value: mrinDetails.apDetails || "",
            disabled: true,
            onChange: (e) => handleChange(e, 'apDetails'),
            sm: 6
        },
        {
            label: 'Invoice amount',
            type: 'number',
            value: mrinDetails.invoiceAmount || "",
            disabled: true,
            onChange: (e) => handleChange(e, 'invoiceAmount'),
            sm: 6
        },
    ]

    const payload3 = [
        {
            label: 'QC status',
            type: 'input',
            disabled: true,
            value: mrinDetails.qcStatus || "-",
        },
    ]

    const payload4 = [
        {
            type: "label",
            value: "Invoice file",
            bold: true,
            sm: "1",
        },
        {
            type: "label",
            value: invoiceFile.document_name,
            sm: "6",
        },
        {
            type: 'file',
            disabled: disableInvoice,
            onChange: (e) => handleFileChange(e),
        },
        {
            label: 'Invoice status',
            type: 'checkbox',
            sm: 6,
            disabled: true,
            checked: mrinDetails.invoiceStatus,
        },
    ]

    // const payload5 = [
    //     {
    //         label: 'Download attachment',
    //         type: 'button',
    //         sm: 12,
    //         onClick: (e) => downloadFileHandler(e, 'invoiceAttachment'),
    //     },
    // ]

    // const payload6 = [
    //     {
    //         label: 'Upload attachment',
    //         type: 'button',
    //         sm: 12,
    //         disabled: disableUpload,
    //         onClick: (e) => uploadFileHandler(e, 'invoiceAttachment'),
    //     },
    // ]

    const payload7 = [
        {
            label: 'AP details',
            type: 'input',
            value: mrinDetails.apDetails || "",
            onChange: (e) => handleChange(e, 'apDetails'),
            className: classes.control,
            sm: 12
        },
        {
            label: 'Invoice amount',
            type: 'number',
            value: mrinDetails.invoiceAmount || "",
            error: validationErrorPaid?.invoiceAmount,
            helperText: validationErrorPaid?.invoiceAmount,
            onChange: (e) => handleChange(e, 'invoiceAmount'),
            className: classes.control,
            sm: 12
        },
    ]

    const paidAction = async (e) => {
        // const message = 'Please enter valid details';
        let errorObj = {};
        // if (_.isEmpty(mrinDetails.invoiceAmount)) {
        //   errorObj = { ...errorObj, invoiceAmount: message };
        // }
        if (!_.isEmpty(mrinDetails.invoiceAmount) && (parseFloat(mrinDetails.invoiceAmount) > parseInt(mrinDetails.totalPrice))) {
            errorObj = { ...errorObj, invoiceAmount: 'Cannot enter Invoice Amount more than PO Total Amount.' };
        }
        if (!_.isEmpty(errorObj)) {
            setValidationErrorPaid(errorObj);
        } else {
            try {
                let response = await createOrUpdateMRINDetail({
                    "type": "Paid",
                    "role": currentUserDetails.role,
                    "createduserid": currentUserDetails.id,
                    "emailid": JSON.parse(localStorage.getItem('preference')).name,
                    "mrinid": props.id,
                    "apStatus": "Paid",
                    "apDetails": mrinDetails.apDetails,
                    "invoiceAmount": mrinDetails.invoiceAmount
                });
                if (response) {
                    setSnack({
                        open: true,
                        message: "MRIN paid successfully",
                    });
                    setPaid(!openPaid);
                    setTimeout(() => {
                        props.back()
                    }, 2000);
                }
            } catch (e) {
                setSnack({
                    open: true,
                    message: e.message,
                    severity: 'error',
                })
            }
        }
    }

    const approveAction = async (e) => {
        try {
            let response = await createOrUpdateMRINDetail({
                "qcStatus": "Approved",
                "type": "Approve",
                "invoiceStatus": true,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "role": currentUserDetails.role,
                "createduserid": currentUserDetails.id,
                "mrinid": props.id
            });
            if (response) {
                setSnack({
                    open: true,
                    message: "MRIN approved successfully",
                });
                setApprove(!openApprove);
                setTimeout(() => {
                    props.back()
                }, 2000);
            }
        } catch (e) {
            setSnack({
                open: true,
                message: e.message,
                severity: 'error',
            })
        }
    }

    const paidHandler = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">Paid</h2>
            <Grid id="top-row">
                <Grid id="top-row" xs={6} md={12} direction="column">
                    <Template payload={payload7} />
                </Grid>
            </Grid>
            <Grid
                id="top-row"
                container
                spacing={24}
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <Button label="Yes" onClick={paidAction} />
                </Grid>
                <Grid item>
                    <Button label="No" onClick={() => setPaid(!openPaid)} />
                </Grid>
            </Grid>
        </Container>
    );

    const approveHandler = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">Approve</h2>
            <p>You are approving the Quality and invoice attachment. Are you sure you want to approve both?</p>
            <Grid
                id="top-row"
                container
                spacing={24}
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <Button label="Yes" onClick={approveAction} />
                </Grid>
                <Grid item>
                    <Button label="No" onClick={() => setApprove(!openApprove)} />
                </Grid>
            </Grid>
        </Container>
    );



    return (<form className={classes.root} noValidate autoComplete="off">
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container >
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>MRIN information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Template payload={payload} />
            </AccordionDetails>
            <AccordionDetails>
                {
                    mrinDetails.subCategory === '1001' &&
                    <Template payload={payload1} />
                }
            </AccordionDetails>
        </Accordion>
        {
            (currentUserDetails.role === "Accounts Executive" || currentUserDetails.role === "Accounts Manager" || currentUserDetails.role === "Managing Director") &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Finance information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Template payload={payload2} />
                </AccordionDetails>
            </Accordion>
        }
        {
            (currentUserDetails.role === "QC Manager" || currentUserDetails.role === "Managing Director"
            ) &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Quality information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Template payload={payload3} />
                </AccordionDetails>
            </Accordion>
        }
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid id="top-row" container>
                    <Grid item md={12} xs={12} className="item">
                        <Typography>Order specification information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container md={12} xs={12}>
                    <BasicTable
                        rows={compositions}
                        columns={gcTableColumns}
                        hasTotal={false}
                        onUpdate={onUpdateOrderSpec}
                    ></BasicTable>
                </Grid>
            </AccordionDetails>
        </Accordion>
        {
            (currentUserDetails.role === "QC Manager" || currentUserDetails.role === "Managing Director"
                || currentUserDetails.role === "GC Stores Executive") &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Invoice information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container md={12} xs={12}>
                        <Template payload={payload4} />
                        {/* <Grid item md={2} xs={12}>
                            {
                                currentUserDetails.role !== "QC Manager" &&
                                <Template payload={payload6} />
                            }
                        </Grid> */}
                        {/* <Grid item md={2} xs={12}>
                            {
                                invoiceFile &&
                                <Template payload={payload5} />
                            }
                        </Grid> */}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        }
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                <Button disabled={loading} label={loading ? 'Loading ...' : 'Save'} onClick={createMrinAction} />
            </Grid>
            <Grid item>
                <Button label="Cancel" onClick={props.back} />
            </Grid>
            {
                mrinDetails.status === "Pending with QC Approval" && (currentUserDetails.role === "QC Manager" || currentUserDetails.role === "Managing Director") &&
                <Grid item>
                    <Button label="Approve" disabled={true} onClick={() => setApprove(!openApprove)} />
                </Grid>
            }
            {
                mrinDetails.status === "Pending with Finance" && (currentUserDetails.role === "Accounts Executive" || currentUserDetails.role === "Accounts Manager" || currentUserDetails.role === "Managing Director") &&
                <Grid item>
                    <Button label="Paid" disabled={true} onClick={() => setPaid(!openPaid)} />
                </Grid>
            }
        </Grid>
        <SimpleModal
            open={openApprove}
            handleClose={() => setApprove(!openApprove)}
            body={approveHandler}
        />
        <SimpleModal
            open={openPaid}
            handleClose={() => setPaid(!openPaid)}
            body={paidHandler}
        />
    </form>)
}
export default EditMrin;