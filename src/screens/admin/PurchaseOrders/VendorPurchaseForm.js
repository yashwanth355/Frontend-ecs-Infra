import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Card, CardContent, CardHeader, Grid, Typography, Accordion, AccordionSummary, AccordionDetails, Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import { getPODetails, createVendorDetails, poDocumentsUpload } from '../../../apis';
import Snackbar from '../../../components/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import BasicTable from '../../../components/BasicTable';
import SimpleModal from '../../../components/Modal';
import { useNavigate } from "react-router-dom";
import DocumentList from './DocumentList';
const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        minWidth: '100%',
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
        margin: 'auto',
        top: '30%',
        right: '10%',
        left: '10%',
        width: 900,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
    return formattedData;
}

const formatDate = (datestr) => {
    let dateVal = new Date(datestr);
    return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
}

const VendorPurchaseForm = (props) => {
    const classes = useStyles();
    const navigate = useNavigate();
    const [purchaseDetails, setPurchaseDetails] = useState({});
    const [dispatchId, setDispatchId] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [purchaseTop, setPurchaseTop] = useState({});
    const [validationError, setValidationError] = useState({});
    const [dispatchList, setDispatchList] = useState([]);
    const [gcCompositions, setgcCompositions] = useState([]);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    const [displayModal, setDisplayModal] = useState(false);
    const [pono, setPono] = useState(-1);
    const [poList, setPoList] = useState([]);
    const [showLogout, setShowLogout] = useState(false);
    const [disableForm, setDisableForm] = useState(false);
    const [editDocumentList, setEditDocumentList] = useState(false);

    useEffect(() => {
        fetchData();
        setDisplayModal(true);
        // eslint-disable-next-line
    }, []);

    async function fetchData() {
        //  setMrinTableData([
        //     {
        //         "mrin_date": "2021-07-12",
        //         "mrin_no": "MRIN-123",
        //         "dispatch": "FAC-1271",
        //         "expectedqty": "1500",
        //         "deliveredqty": "500"
        //     },
        //     {
        //         "mrin_date": "2021-07-12",
        //         "mrin_no": "MRIN-125",
        //         "dispatch": "FAC-1271",
        //         "expectedqty": "1000",
        //         "deliveredqty": "200"
        //     },
        //     {
        //         "mrin_date": "2021-07-13",
        //         "mrin_no":"MRIN-124",
        //         "dispatch": "FAC-1272",
        //         "expectedqty":"2500",
        //         "deliveredqty": "500"   
        //        }
        // ]);           

        // eslint-disable-next-line
        //JSON.parse(localStorage.getItem('preference')).name
        let response = await createVendorDetails(
            {
                "po_list": true,
                "username": JSON.parse(localStorage.getItem('preference')).name
            }
        );
        if (response && response.length) {
            setPoList((response));
        } else {
            setPoList([]);
            setShowLogout(true);
        }
        //  setPoList(formatToSelection([
        //      { pono: "CCL/HIG/1234" },
        //      { pono: "CCL/HIG/1290" },
        //      { pono: "CCL/HIG/1245" },
        //      { pono: "SECCL/HIG/1235" },
        //  ], "pono", "pono"));

        //  localStorage.getItem('isVendorFirstScreen') === 'true' && setDisplayModal(true);
    }
    const getAutocompleteValue = (options = [], value) => {
        const result = options?.filter(option => option.value === value)[0]
        return result;
    }
    const handleChange = (event, key,) => {
        let data = {
            ...purchaseDetails,
            [key]: event.target.value
        }
        setPurchaseDetails(data);
        console.log(data);
    };

    const formatGCCompositions = (compostion = {}) => {
        return [
            { composition_name: "Density(Gm/Cc)", composition_rate: compostion.density },
            { composition_name: "Moisture (%)", composition_rate: compostion.moisture },
            { composition_name: "Browns (%)", composition_rate: compostion.browns },
            { composition_name: "Blacks (%)", composition_rate: compostion.blacks },
            { composition_name: "Broken & Bits (%)", composition_rate: compostion.brokenbits },
            { composition_name: "Insected beans (%)", composition_rate: compostion.insectedbeans },
            { composition_name: "Bleached (%)", composition_rate: compostion.bleached },
            { composition_name: "Husk (%)", composition_rate: compostion.husk },
            { composition_name: "Sticks (%)", composition_rate: compostion.sticks },
            { composition_name: "Stones (%)", composition_rate: compostion.stones },
            { composition_name: "Beans retained on 5mm mesh during sieve analysis", composition_rate: compostion.beansretained }

        ];
    }

    //   const handleDispatchChange = (event, key) => { 
    //     let data = {            
    //         [key]: event.target.value
    //     }       
    //     setPurchaseDetails(data);                      
    //     setValidationError({});
    // };                

    const saveDispatchDetails = async () => {
        const message = 'Please enter valid details';
        let errorObj = {};
        setValidationError(errorObj);
        if (_.isEmpty(purchaseDetails.dispatch)) {
            errorObj = { ...errorObj, dispatch: message };
        }
        if (_.isEmpty(purchaseDetails.invoice)) {
            errorObj = { ...errorObj, invoice: message };
        }
        if (_.isEmpty(purchaseDetails.dispatchQty)) {
            errorObj = { ...errorObj, dispatchQty: message };
        }
        if (_.isEmpty(purchaseDetails.coffeeGrade)) {
            errorObj = { ...errorObj, coffeeGrade: message };
        }
        if (_.isEmpty(purchaseDetails.vehicleDetails)) {
            errorObj = { ...errorObj, vehicleDetails: message };
        }
        if (_.isEmpty(purchaseDetails.moisture)) {
            errorObj = { ...errorObj, moisture: message };
        }
        if (_.isEmpty(purchaseDetails.brokenbits)) {
            errorObj = { ...errorObj, brokenbits: message };
        }
        if (_.isEmpty(purchaseDetails.insectedbeans)) {
            errorObj = { ...errorObj, insectedbeans: message };
        }
        if (_.isEmpty(purchaseDetails.sticks)) {
            errorObj = { ...errorObj, sticks: message };
        }
        if (_.isEmpty(purchaseDetails.stones)) {
            errorObj = { ...errorObj, stones: message };
        }
        if (_.isEmpty(purchaseDetails.husk)) {
            errorObj = { ...errorObj, husk: message };
        }
        if (!_.isEmpty(errorObj)) {
            setValidationError(errorObj);
        } else {
            setLoading(true);
            let data = {
                "vendor_create": true,
                "dispatch_id": purchaseDetails.dispatch,
                "invoice_no": purchaseDetails.invoice,
                "dispatch_quantity": purchaseDetails.dispatchQty,
                "coffee_grade": purchaseDetails.coffeeGrade,
                "vehicle_no": purchaseDetails.vehicleDetails,
                "po_no": purchaseTop.po_no,
                "po_date": purchaseTop.po_date,
                "po_category": purchaseTop.po_category,
                "supplier_id": purchaseTop.supplier_id,
                "supplier_email": purchaseTop.supplier_email,
                "item_id": purchaseTop.item_id,
                "total_quantity": purchaseTop.total_quantity ? purchaseTop.total_quantity : '',
                "density": purchaseDetails.density ? purchaseDetails.density !== '' ? purchaseDetails.density.toString() : 0 : 0,
                "moisture": purchaseDetails.moisture.toString(),
                "browns": purchaseDetails.browns ? purchaseDetails.browns !== '' ? purchaseDetails.browns.toString() : 0 : 0,
                "blacks": purchaseDetails.blacks ? purchaseDetails.blacks !== '' ? purchaseDetails.blacks.toString() : 0 : 0,
                "brokenbits": purchaseDetails.brokenbits.toString(),
                "insectedbeans": purchaseDetails.insectedbeans.toString(),
                "bleached": purchaseDetails.bleached ? purchaseDetails.bleached !== '' ? purchaseDetails.bleached.toString() : 0 : 0,
                "husk": purchaseDetails.husk.toString(),
                "sticks": purchaseDetails.sticks.toString(),
                "stones": purchaseDetails.stones.toString(),
                "beansretained": purchaseDetails.beansretained ? purchaseDetails.beansretained !== '' ? purchaseDetails.beansretained.toString() : 0 : 0,

            };
            try {
                let response = await createVendorDetails(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "Dispatch information sent successfully",
                    });
                    setTimeout(() => {
                        setLoading(false);
                        localStorage.setItem('vendorAllDisable', true);
                        // setAllDisable(true);
                        setPurchaseDetails({});
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

    const handleDispatchChange = async (event, value) => {
        console.log("Came insdie this");
        let data = {
            ...purchaseDetails,
            'dispatch': value.value
        }
        setDispatchId(value?.value)
        createVendorDetails({
            "type": "dispatch_view",
            "dispatch_id": value.value
        }).then(async res => {
            data = {
                ...data,
                "related_detid": res.related_detid,
                "delivered_quantity": res.delivered_quantity,
                "expected_quantity": res.expected_quantity,
                "dispatch_date": res.dispatch_date
            }
            await setPurchaseDetails(data);
            if (res.dispatch_sumbit) {
                setDisableForm(true);
            } else {
                setDisableForm(false);
            }
        });
    }

    const payload = [
        {
            label: 'Dispatch details *',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(dispatchList, purchaseDetails.dispatch) || '',
            required: true,
            error: validationError?.dispatch,
            helperText: validationError?.dispatch,
            options: dispatchList || [],
            sm: 12,
            onChange: handleDispatchChange
            // disabled: allDisable
        }
    ]

    const payload1 = [
        {
            label: 'Expected quantity',
            type: 'number',
            value: purchaseDetails.expected_quantity || '',
            disabled: true
        },
        {
            label: 'Delivery date',
            type: 'datePicker',
            value: purchaseTop.dispatch_date,
            disabled: true
        },
        {
            label: 'Delivered quantity',
            type: 'number',
            value: purchaseDetails.delivered_quantity || '',
            disabled: true
        },
        {
            label: 'Parent dispatch',
            type: 'input',
            value: purchaseTop.parentDispatch || "-",
            disabled: true
        },
        {
            label: 'Invoice number',
            type: 'input',
            required: true,
            error: validationError?.invoice,
            helperText: validationError?.invoice,
            value: purchaseDetails.invoice || '',
            onChange: (e) => handleChange(e, 'invoice'),
            disabled: disableForm,
        },
        {
            label: 'Dispatch quantity (KGS)',
            type: 'number',
            required: true,
            error: validationError?.dispatchQty,
            helperText: validationError?.dispatchQty,
            value: purchaseDetails.dispatchQty || '',
            onChange: (e) => handleChange(e, 'dispatchQty'),
            disabled: disableForm,
        },
        {
            label: 'Coffee grade',
            type: 'input',
            required: true,
            error: validationError?.coffeeGrade,
            helperText: validationError?.coffeeGrade,
            value: purchaseDetails.coffeeGrade || '',
            onChange: (e) => handleChange(e, 'coffeeGrade'),
            disabled: disableForm,
        },
        {
            label: 'Vehicle/BL number details',
            type: 'input',
            required: true,
            error: validationError?.vehicleDetails,
            helperText: validationError?.vehicleDetails,
            rows: 3,
            multiline: true,
            value: purchaseDetails.vehicleDetails || '',
            onChange: (e) => handleChange(e, 'vehicleDetails'),
            disabled: disableForm,
        }
    ]

    const payload2 = [
        {
            label: 'Density(Gm/Cc)',
            type: 'number',
            value: purchaseDetails.density || '',
            sm: 12,
            onChange: (e) => handleChange(e, 'density'),
            disabled: disableForm,
        },
        {
            label: 'Moisture(%)',
            type: 'number',
            required: true,
            sm: 12,
            error: validationError?.moisture,
            helperText: validationError?.moisture,
            value: purchaseDetails.moisture || '',
            onChange: (e) => handleChange(e, 'moisture'),
            disabled: disableForm,
        },
        {
            label: 'Browns (%)',
            type: 'number',
            sm: 12,
            value: purchaseDetails.browns || '',
            onChange: (e) => handleChange(e, 'browns'),
            disabled: disableForm,
        },
        {
            label: 'Blacks (%)',
            type: 'number',
            sm: 12,
            value: purchaseDetails.blacks || '',
            onChange: (e) => handleChange(e, 'blacks'),
            disabled: disableForm,
        },
        {
            label: 'Broken & Bits (%)',
            type: 'number',
            required: true,
            sm: 12,
            error: validationError?.brokenbits,
            helperText: validationError?.brokenbits,
            value: purchaseDetails.brokenbits || '',
            onChange: (e) => handleChange(e, 'brokenbits'),
            disabled: disableForm,
        },
        {
            label: 'Insected beans (%)',
            type: 'number',
            required: true,
            sm: 12,
            error: validationError?.insectedbeans,
            helperText: validationError?.insectedbeans,
            value: purchaseDetails.insectedbeans || '',
            onChange: (e) => handleChange(e, 'insectedbeans'),
            disabled: disableForm,
        },
        {
            label: 'Bleached (%)',
            type: 'number',
            sm: 12,
            value: purchaseDetails.bleached || '',
            onChange: (e) => handleChange(e, 'bleached'),
            disabled: disableForm,
        },
        {
            label: 'Husk (%)',
            type: 'number',
            required: true,
            sm: 12,
            error: validationError?.husk,
            helperText: validationError?.husk,
            value: purchaseDetails.husk || '',
            onChange: (e) => handleChange(e, 'husk'),
            disabled: disableForm,
        },
        {
            label: 'Sticks (%)',
            type: 'number',
            required: true,
            sm: 12,
            error: validationError?.sticks,
            helperText: validationError?.sticks,
            value: purchaseDetails.sticks || '',
            onChange: (e) => handleChange(e, 'sticks'),
            disabled: disableForm,
        },
        {
            label: 'Stones (%)',
            type: 'number',
            required: true,
            sm: 12,
            error: validationError?.stones,
            helperText: validationError?.stones,
            value: purchaseDetails.stones || '',
            onChange: (e) => handleChange(e, 'stones'),
            disabled: disableForm,
        },
        {
            label: 'Beans retained on 5mm mesh during sieve analysis',
            type: 'number',
            sm: 12,
            value: purchaseDetails.beansretained || '',
            onChange: (e) => handleChange(e, 'beansretained'),
            disabled: disableForm,
        },
    ]

    const gcTableColumns = [
        { id: 'composition_name', label: 'Item', },
        { id: 'composition_rate', label: 'Composition' }
    ];

    const handlePoChange = (e, value) => {
        e.preventDefault();
        setPono(value.po_no);
        getPODetails({
            "po_no": value.po_no
        }).then(res => {
            setPurchaseTop(res);
            setgcCompositions(res ? formatGCCompositions(res) : null);
        });
        createVendorDetails({
            "type": "all_dispatches",
            "po_no": value.po_no
        }).then(res => {
            if (res.dispatches_for_po) {
                setDispatchList(formatToSelection(res.dispatches_for_po, "dispatch_id", "dispatch_id"));
            }
        });
    }
    const fetchDocumnetData = (poid) => {
        let documents = [];
        poDocumentsUpload({
            "type": "getDocumentsOnPo",
            "po_id": poid
        }).then(res => {
            res?.map(doc => {
                documents.push({
                    upload: !!doc?.file_name,
                    file_name: doc?.file_name,
                    document_name: doc?.document_name,
                    doc_kind: doc?.doc_kind,
                    required: doc?.required,
                    docid: doc?.docid,
                    dispatchid: doc?.dispatchid
                });
                return null;
            })
            setDocuments(documents);
        });
    };
    useEffect(() => {
        if (purchaseTop?.poid) {
            const documents = [];
            poDocumentsUpload({
                type: "getDocumentsOnPo",
                po_id: purchaseTop?.poid,
            }).then((response) => {
                response?.map(doc => documents.push({
                    upload: !!doc?.file_name,
                    file_name: doc?.file_name,
                    document_name: doc?.document_name,
                    doc_kind: doc?.doc_kind,
                    required: doc?.required,
                    docid: doc?.docid,
                    dispatchid: doc?.dispatchid,
                }))
                setDocuments(documents);
            });
        }
    }, [purchaseTop?.poid,])
    const payload3 = [
        {
            label: 'PO Number',
            type: 'autocomplete',
            required: true,
            labelprop: "po_no",
            value: getAutocompleteValue(poList, pono),
            options: poList || [],
            onChange: handlePoChange,
            sm: 12
        },
    ]

    const showmainScrren = () => {
        // localStorage.setItem('isVendorFirstScreen', 'false') 
        setDisplayModal(!displayModal);

    }
    const uploadFileHandler = async (e, fileContent, docName, fileName, docid, dispatchid) => {
        if (!fileContent) {
            return;
        }
        try {
            let response = await poDocumentsUpload({
                "type": "uploadDocument",
                "document_name": fileName,
                "po_id": purchaseTop?.poid,
                "docid": docid,
                "dispatchid": dispatchid,
                "document_content": fileContent,
                "doc_kind": docName,
                "updatedBy": localStorage.getItem("currentUserId")
            });
            console.log("Response", response);
            if (response) {
                setSnack({
                    open: true,
                    message: "File uploaded successfully",
                });
                fetchDocumnetData(purchaseTop?.poid);
                setEditDocumentList(prevState => !prevState)
            }
        } catch (e) {
            setSnack({
                open: true,
                message: e.message,
                severity: 'error',
            })
        }
    }
    const downloadFileHandler = async (e, fileName, docName, docid, dispatchid) => {
        try {
            let response = await poDocumentsUpload({
                type: "downloadDocument",
                file_name: fileName,
                docid: docid,
                dispatchid: dispatchid
            });
            if (response) {
                const linkSource = `data:application/pdf;base64,${response.fileData}`;
                const downloadLink = document.createElement("a");
                downloadLink.href = linkSource;
                downloadLink.download = docName;
                downloadLink.click();
                setSnack({
                    open: true,
                    message: "File downloaded successfully",
                });
            }
        } catch (e) {
            setSnack({
                open: true,
                message: e.message,
                severity: "error",
            });
        }
    };
    const deleteFileHandler = async (e, fileName, docid, dispatchid) => {
        try {
            let response = await poDocumentsUpload({
                "type": "removeDocument",
                "file_name": fileName,
                "docid": docid,
                "dispatchid": dispatchid
            });
            console.log("Response", response);
            if (response) {
                setSnack({
                    open: true,
                    message: "File deleted successfully",
                });
                fetchDocumnetData(purchaseTop?.poid);
            }
        } catch (e) {
            setSnack({
                open: true,
                message: e.message,
                severity: 'error',
            })
        }
    }
    const createAction = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Select PO details
            </h2>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={6} md={10} container direction="column">
                    <Template payload={payload3}></Template>
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Next" onClick={() => showmainScrren()} />
                </Grid>
                {
                    showLogout &&
                    <Grid item>
                        <Button label="Exit" onClick={() => setDisplayModal(false)} />
                    </Grid>
                }
            </Grid>
        </Container>
    );

    // isVendorFirstScreen
    let component = [];
    if (displayModal === true) {
        component = <SimpleModal open={displayModal} handleClose={() => setDisplayModal(!displayModal)} body={createAction} />
    } else {
        return (
            <form className={classes.root} noValidate autoComplete="off">
                {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
                <Card className="page-header">
                    <CardHeader
                        title=" Purchase Order Details"
                        className='cardHeader'
                    />
                    <CardContent>
                        <Grid container md={12}>
                            <Grid container md={12}>
                                <Grid item md={2} xs={12} >
                                    <Typography variant="h7">PO no</Typography>
                                    <Typography>{purchaseTop?.po_no}</Typography>
                                </Grid>
                                <Grid item md={2} xs={12}>
                                    <Typography variant="h7">PO date</Typography>
                                    <Typography>{formatDate((purchaseTop?.po_date))}</Typography>
                                </Grid>
                                <Grid item md={2} xs={12}>
                                    <Typography variant="h7">PO category</Typography>
                                    <Typography>{(purchaseTop?.po_category)}</Typography>
                                </Grid>
                                <Grid item md={2} xs={12}>
                                    <Typography variant="h7">Item name</Typography>
                                    <Typography>{(purchaseTop?.item_name)}</Typography>
                                </Grid>
                                <Grid item md={2} xs={12}>
                                    <Typography variant="h7">Total quantity</Typography>
                                    <Typography>{(purchaseTop?.total_quantity)}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Dispatch information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container>
                            <Grid item md={12} xs={12} className='dispatch_details' >
                                <Template payload={payload} />
                                {
                                    disableForm &&
                                    <Card className="page-header">
                                        <CardContent className='cardHeader'>
                                            <Grid item md={12} xs={12}>
                                                <Typography variant="h7">Dispatch Details already submitted</Typography>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                }
                                <Template payload={payload1} />
                            </Grid>
                            <Grid item md={6} xs={6}>
                                <Grid item md={12} xs={12} style={{ marginRight: 25 }}>
                                    <Grid item md={12} xs={12} className='item'>
                                        <Typography>Expected order composition information</Typography>
                                    </Grid>
                                    <BasicTable rows={gcCompositions} columns={gcTableColumns} hasTotal={false}></BasicTable>
                                </Grid>
                            </Grid>
                            <Grid item md={6} xs={6}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Dispatch composition information</Typography>
                                </Grid>
                                <Template payload={payload2} />
                            </Grid>
                            <Grid container md={12} xs={12}>
                                <Grid container className="item" md={12} xs={12} direction="row" alignItems="center" justifyContent="space-between">
                                    <Grid item >
                                        <Typography style={{ fontSize: '1.2rem' }}>Document information</Typography>
                                    </Grid>
                                    <Button
                                        label={editDocumentList ? "Done" : "Edit"}
                                        onClick={(event) => {
                                            event.stopPropagation();;
                                            setEditDocumentList(prevState => !prevState)
                                        }}
                                    />
                                </Grid>
                                <DocumentList data={documents?.filter(document => {
                                    console.log("Document is", document);
                                    return document?.dispatchid === dispatchId
                                }
                                )}
                                    edit={editDocumentList}
                                    details={!editDocumentList}
                                    uploadFile={(event, fileContent, docName, fileName, docid, dispatchid) => uploadFileHandler(event, fileContent, docName, fileName, docid, dispatchid)}
                                    downloadFile={(event, fileName, docName, docid, dispatchid) => downloadFileHandler(event, fileName, docName, docid, dispatchid)} deleteFile={(event, fileName, docid, dispatchid) => deleteFileHandler(event, fileName, docid, dispatchid)} />
                            </Grid>
                        </Grid>

                    </AccordionDetails>
                </Accordion>
                <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                    <Grid item>
                        {
                            !disableForm &&
                            <Button disabled={loading} label={loading ? 'Loading ...' : 'Submit'} onClick={saveDispatchDetails} />
                        }
                        {
                            disableForm &&
                            <Button label='Exit' onClick={() => navigate("/Vendor")} />
                        }
                        <Button label='Back' onClick={() => setDisplayModal(true)} />
                    </Grid>
                </Grid>

            </form>
        )
    }

    return (
        <Container className={classes.root}>
            {component}

        </Container>
    )
}
export default VendorPurchaseForm;