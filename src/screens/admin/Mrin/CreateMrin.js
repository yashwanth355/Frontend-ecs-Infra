import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Accordion, AccordionSummary, AccordionDetails, Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import useToken from '../../../hooks/useToken';
import { createOrUpdateMRINDetail } from "../../../apis"; //getMRINDetail
import SimpleModal from '../../../components/Modal';

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
        position: 'absolute',
        margin: '0 auto',
        top: '30%',
        right: '10%',
        left: '10%',
        width: 700,
        textAlign: 'center',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

const currentDate = () => {
    return new Date();
}

const CreateMrin = (props) => {
    const classes = useStyles();
    const [mrinDetails, setMrinDetails] = useState({});
    const [locationList, setLocationList] = useState([]);
    const [validationError, setValidationError] = useState({});
    const [disableInvoice, setDisableInvoice] = useState(false);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [payloadData, setPayloadData] = useState({});
    // const [ invoiceFile, setInvoiceFile ] = useState(""); 
    const [uploadedFile, setUploadedFile] = useState({});
    // const [fileUploadData, setFileUploadData] = useState({});
    // const [disableUpload, setDisableUpload] = useState(true);
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();
    const formatToSelection = (data = [], key, id) => {
        let formattedData = [];
        data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
        return formattedData;
    }

    useEffect(() => {
        if (props.createMrinData) {
            props.createMrinData.apStatus = "Pending";
            props.createMrinData.qcStatus = "Pending";
            props.createMrinData.invoiceStatus = false;
        }
        setMrinDetails(props.createMrinData);
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
    }, [props.createMrinData]);

    const handleChange = (event, key) => {
        var bal = 0;
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
            bal = parseFloat(mrinDetails.expected_quantity) - (parseFloat(event.target.value) + parseFloat(mrinDetails.delivered_quantity));
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
        console.log('::', parseFloat(event.target.value), mrinDetails.expected_quantity)
        setMrinDetails(data);
    };

    const handlelocationChange = (e, value) => {
        let data = {
            ...mrinDetails,
            'location': value,
        }
        setMrinDetails(data);
    }

    const handleDateChange = (date, key) => {
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
        if (_.isEmpty(mrinDetails.invoice_no?.toString())) {
            errorObj = { ...errorObj, invoice_no: message };
        }
        else {
            delete errorObj.invoice_no
        }
        if (_.isEmpty(mrinDetails.vehicle_no?.toString())) {
            errorObj = { ...errorObj, vehicle_no: message };
        }
        else {
            delete errorObj.vehicle_no
        }
        if (mrinDetails.wayBillDate === undefined) {
            errorObj = { ...errorObj, wayBillDate: message };
        }
        else {
            delete errorObj.wayBillDate
        }
        if (_.isEmpty(mrinDetails.wayBillNumber)) {
            errorObj = { ...errorObj, wayBillNumber: message };
        } else {
            delete errorObj.wayBillNumber
        }
        if (mrinDetails.subCategory === '1001' && _.isEmpty(mrinDetails.billOfEntry)) {
            errorObj = { ...errorObj, billOfEntry: message };
        } else {
            delete errorObj.billOfEntry
        }
        if (mrinDetails.subCategory === '1001' && _.isEmpty(mrinDetails.billOfEntryDate)) {
            errorObj = { ...errorObj, billOfEntryDate: message };
        } else {
            delete errorObj.billOfEntryDate
        }
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const error = { message: 'Please fill mandatory fields to save' }
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
            let data = {
                "createmrin": true,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "type": "uploadDocument",
                "doc_kind": "MRIN",
                "document_content": uploadedFile?.file,
                "document_name": uploadedFile?.name,
                "createduserid": localStorage.getItem("currentUserId"),
                "poid": mrinDetails.poid,
                "pono": mrinDetails.pono,
                "detid": mrinDetails.dispatch_id,
                "related_detid": mrinDetails.related_detid,
                "expected_quantity": mrinDetails.expected_quantity,
                "invoice_no": mrinDetails.invoice_no,
                "vehicle_no": mrinDetails.vehicle_no,
                "invoice_date": mrinDetails.invoice_date ? mrinDetails.invoice_date : currentDate(),
                "invoice_quantity": mrinDetails.invoice_quantity,
                "delivery_date": mrinDetails.delivery_date ? mrinDetails.delivery_date : currentDate(),
                "delivered_quantity": mrinDetails.delivered_quantity,
                "wayment_shortage": mrinDetails.wayment_shortage ? mrinDetails.wayment_shortage.toString() : '',
                "balance_quantity": mrinDetails.balance_quantity ? mrinDetails.balance_quantity.toString() === '' ? '0' : mrinDetails.balance_quantity.toString() : '0',
                "createdon": currentDate(),
                "createdby": localStorage.getItem("currentUserName"),
                "status": 'new',
                "vendor_id": mrinDetails.vendor_id,
                "entityid": mrinDetails.entityid,
                "mrindate": currentDate(),
                "wayBillDate": mrinDetails.wayBillDate,
                "wayBillNumber": mrinDetails.wayBillNumber,
                "billOfEntry": mrinDetails.billOfEntry,
                "billOfEntryDate": mrinDetails.billOfEntryDate,
                "apStatus": mrinDetails.apStatus,
                "qcStatus": mrinDetails.qcStatus,
                "apDetails": mrinDetails.apDetails,
                "invoiceAmount": mrinDetails.invoiceAmount,
                "location": mrinDetails.location?.value,
            };
            if (data.wayment_shortage === '0' && (data.balance_quantity !== '' || parseFloat(data.balance_quantity) !== 0)) {
                setLoading(true);
                var msg = 'MRIN created successfully';
                callCreateApi(data, msg);
                setShowConfirmation(false);
            } else if (data.wayment_shortage === '0') {
                setLoading(true);
                // eslint-disable-next-line
                var msg = 'MRIN created successfully';
                callCreateApi(data, msg);
                setShowConfirmation(false);
            } else if (data.wayment_shortage !== '' || parseInt(data.wayment_shortage) !== 0) {
                setPayloadData(data);
                setLoading(false);
                setShowConfirmation(true);
            }
        }
    }

    async function callCreateApi(data, msg) {
        try {
            let response = await createOrUpdateMRINDetail(data)
            if (response) {
                setSnack({
                    open: true,
                    message: msg,
                });
                setLoading(false);
                setTimeout(() => {
                    props.back();
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

    function onClickConfirm(val) {
        setLoading(true);
        setShowConfirmation(!showConfirmation);
        var msg = val === 'yes' ? 'Wayment shortage is ignored, MRIN created successfully' : 'MRIN create successfully. A new dispatch created with wayment shortage & balance quanotity';
        let temp = { ...payloadData };
        temp.wayment_shortage_flag = val === 'yes' ? true : false;
        setPayloadData(temp)
        callCreateApi(temp, msg);
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
        setUploadedFile({
            name: e.target.files[0].name,
            file: file
        });
    }

    // const uploadFileHandler = async (e) => {
    //     if (!uploadedFile) {
    //         return;
    //     }
    //     setFileUploadData({ "type": "uploadDocument", "doc_kind": "MRIN", "document_content": uploadedFile.file, "document_name": uploadedFile?.name || uploadedFile?.file });
    //     // try {
    //     //     let response = await createOrUpdateMRINDetail({
    //     //         "type":"uploadDocument",
    //     //         "doc_kind": "MRIN",
    //     //         "document_content": uploadedFile.file,
    //     //         "document_name": uploadedFile.name,
    //     //         "detid": mrinDetails.dispatch_id,
    //     //         "pono": mrinDetails.pono,                
    //     //     });
    //     //   console.log("Response", response);
    //     //    if(response) {
    //     //         setSnack({
    //     //             open: true,
    //     //             message: "File uploaded successfully",
    //     //         });               
    //     //         setInvoiceFile(uploadedFile.name);                
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
    //       let response = await getMRINDetail({
    //         type: "downloadMRINDocument",
    //         file_name: invoiceFile,
    //       });
    //       console.log("Response", response);
    //       if (response) {
    //         const linkSource = `data:application/pdf;base64,${response.fileData}`;
    //         const downloadLink = document.createElement("a");
    //         downloadLink.href = linkSource;
    //         downloadLink.download = invoiceFile;
    //         downloadLink.click();
    //         setSnack({
    //           open: true,
    //           message: "File downloaded successfully",
    //         });
    //       }
    //     } catch (e) {
    //       setSnack({
    //         open: true,
    //         message: e.message,
    //         severity: "error",
    //       });
    //     }
    // }

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
            value: mrinDetails.dispatch_id || '-',
            disabled: true,
        },
        {
            label: 'Expected quantity(Kgs)',
            type: 'number',
            value: mrinDetails.expected_quantity,
            disabled: true
        },
        {
            label: 'Vehicle/BL number',
            type: 'input',
            value: mrinDetails.vehicle_no || '',
            required: true,
            error: validationError?.vehicle_no,
            helperText: validationError?.vehicle_no,
            onChange: (e) => handleChange(e, 'vehicle_no')
        },
        {
            label: 'Invoice number',
            type: 'input',
            value: mrinDetails.invoice_no || '',
            required: true,
            error: validationError?.invoice_no,
            helperText: validationError?.invoice_no,
            onChange: (e) => handleChange(e, 'invoice_no')
        },
        {
            label: 'Invoice quantity(Kgs)',
            type: 'number',
            value: mrinDetails.invoice_quantity,
            onChange: (e) => handleChange(e, 'invoice_quantity')
        },
        {
            label: 'Invoice date',
            type: 'datePicker',
            value: mrinDetails.invoice_date === '' ? currentDate() : mrinDetails.invoice_date,
            onChange: (e) => handleDateChange(e, 'invoice_date')
        },
        {
            label: 'Delivery date',
            type: 'datePicker',
            value: mrinDetails.delivery_date === '' ? currentDate() : mrinDetails.delivery_date,
            onChange: (e) => handleDateChange(e, 'delivery_date')
        },
        {
            label: 'Delivered quantity(Kgs)',
            type: 'number',
            value: mrinDetails.delivered_quantity,
            required: true,
            error: validationError?.delivered_quantity,
            helperText: validationError?.delivered_quantity,
            onChange: (e) => {
                if (e.target.value >= 0) handleChange(e, 'delivered_quantity')
            }
        },
        {
            label: 'Weighment shortage',
            type: 'number',
            value: mrinDetails.wayment_shortage,
            required: true,
            error: validationError?.wayment_shortage,
            helperText: validationError?.wayment_shortage,
            onChange: (e) => {
                if (e.target.value >= 0) handleChange(e, 'wayment_shortage')
            }
        },
        {
            label: 'Balance quantity(Kgs)',
            type: 'number',
            value: mrinDetails.balance_quantity ? mrinDetails.balance_quantity.toFixed(4) : 0
        },
        {
            label: 'Way bill number',
            type: 'input',
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
            value: mrinDetails.location,
            options: locationList || [],
            onChange: handlelocationChange,
        }
    ];

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
            disabled: true,
            value: mrinDetails.apDetails || "",
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
            value: mrinDetails.qcStatus || "",
        },
    ]

    const payload4 = [
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
    //         label: 'Download Attachment',
    //         type: 'button',
    //         sm:12,
    //         onClick: (e) => downloadFileHandler(e, 'invoiceAttachment'),           
    //     },                    
    // ]

    // const payload6 = [
    //     {
    //         label: 'Upload attachment',
    //         type: uploadedFile ? 'text' : 'button',
    //         sm: 12,
    //         value: uploadedFile ? uploadedFile?.name : null,
    //         disabled: disableUpload,
    //         onClick: (e) => uploadFileHandler(e, 'invoiceAttachment'),
    //     },
    // ]

    const createAction = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Wayment confirmation
            </h2>
            <p>Are You Ok With Wayment Shortage?</p>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Yes" onClick={() => onClickConfirm('yes')} />
                </Grid>
                <Grid item>
                    <Button label="No" onClick={() => onClickConfirm('no')} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => setShowConfirmation(!showConfirmation)} />
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
                        </Grid>                                                                                               */}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        }
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                <Button disabled={loading} label={loading ? 'Loading ...' : 'Create'} onClick={createMrinAction} />
            </Grid>
            <Grid item>
                <Button label="Cancel" onClick={props.back} />
            </Grid>
        </Grid>
        {<SimpleModal open={showConfirmation} handleClose={() => setShowConfirmation(!showConfirmation)} body={createAction} />}
    </form>)
}
export default CreateMrin;