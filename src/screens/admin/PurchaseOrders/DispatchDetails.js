import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { Typography, Card, CardContent, CardHeader, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import Button from '../../../components/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import BasicTable from '../../../components/BasicTable';
import { getMrinListForPoDetails, getDispatchDetails } from '../../../apis';
import DocumentList from './DocumentList';
import Snackbar from "../../../components/Snackbar";
import {
    poDocumentsUpload,
} from "../../../apis";
const DispatchDetails = (props) => {
    const { purchaseDetails, activeStep } = props;
    const [dispatchDetails, setDispatchDetails] = useState({});
    const [mrinTableData, setMrinTableData] = useState([]);
    const [editDocumentList, setEditDocumentList] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [showSnack, setSnack] = useState({
        open: false,
        message: "",
        severity: "",
    });
    const fetchDocumnetData = (poid) => {
        // let documentsEnum = {
        //   document1: "Invoice",
        //   document2: "Packing list",
        //   document3: "Bill of lading",
        //   document4: "Phytosanitory certificate",
        //   document5: "Fumigation certificate",
        //   document6: "Certificate of origin",
        //   document7: "ICO certificate of origin",
        //   document8: "Weight certificate",
        //   document9: "Quality certificate",
        //   document10: "Inspection and stuffing certificate",
        //   document11: "Bill of Entry",
        //   document12: "Dispatch Note",
        // }
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
                    dispatchid: doc?.dispatchid,
                });
                return null;
            })
            setDocuments(documents);
        });
    };
    const formatGCCompositions = (compostion = {}) => {
        return [
            {
                composition_name: "Density(Gm/Cc)",
                composition_rate: compostion.density,
            },
            { composition_name: "Moisture (%)", composition_rate: compostion.moisture },
            { composition_name: "Browns (%)", composition_rate: compostion.browns },
            { composition_name: "Blacks (%)", composition_rate: compostion.blacks },
            {
                composition_name: "Broken & Bits (%)",
                composition_rate: compostion.brokenbits,
            },
            {
                composition_name: "Insected beans (%)",
                composition_rate: compostion.insectedbeans,
            },
            { composition_name: "Bleached (%)", composition_rate: compostion.bleached },
            { composition_name: "Husk (%)", composition_rate: compostion.husk },
            { composition_name: "Sticks (%)", composition_rate: compostion.sticks },
            { composition_name: "Stones (%)", composition_rate: compostion.stones },
            {
                composition_name: "Beans retained on 5mm mesh during sieve analysis",
                composition_rate: compostion.beansretained,
            },
        ];
    };
    const uploadFileHandler = async (e, fileContent, docName, fileName, docid, dispatchid) => {
        if (!fileContent) {
            return;
        }
        try {
            let response = await poDocumentsUpload({
                "type": "uploadDocument",
                "document_name": fileName,
                "po_id": purchaseDetails.poid,
                "document_content": fileContent,
                "doc_kind": docName,
                "docid": docid,
                "dispatchid": dispatchid,
                "updatedBy": localStorage.getItem("currentUserId")
            });
            console.log("Response", response);
            if (response) {
                setSnack({
                    open: true,
                    message: "File uploaded successfully",
                });
                fetchDocumnetData(purchaseDetails.poid);
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
                fetchDocumnetData(purchaseDetails.poid);
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
    const fetchData = async () => {
        getMrinListForPoDetails({ type: "viewmrinsondispatch", dispatch_id: props.details.dispatchNo }).then((res) => {
            if (res) {
                setMrinTableData(res);
            } else {
                setMrinTableData(null)
            }
        });
        getDispatchDetails({ dispatch_id: props.details.dispatchNo }).then((res) => {
            if (res.expected_composition) {
                res.expected_composition = formatGCCompositions(res.expected_composition[0]);
            }
            if (res.vendor_composition) {
                res.vendor_composition = formatGCCompositions(res.vendor_composition[0]);
            }
            setDispatchDetails(res);
        });
        let documents = [];
        poDocumentsUpload({
            type: "getDocumentsOnPo",
            po_id: purchaseDetails?.poid,
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
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line 
    }, [props.details, purchaseDetails?.poid]);

    const gcTableColumns = [
        { id: 'composition_name', label: 'Item', },
        { id: 'composition_rate', label: 'Composition' }
    ];

    const mrinTableColumns = [
        { id: 'mrindate', label: 'Date' },
        { id: 'mrin_id', label: 'MRIN' },
        { id: 'dispatch_id', label: 'Dispatch' },
        { id: 'expected_quantity', label: 'Expected(Kgs)' },
        { id: 'delivered_quantity', label: 'Delivered(Kgs)' },
        { id: 'balance_quantity', label: 'Balance Quantity(Kgs)' },
        { id: 'related_detid', label: 'Parent dispatch' },
        { id: 'apStatus', label: 'AP Status' },
        { id: 'qcStatus', label: 'QC Status' },
    ];

    return (<>
        <Card className="page-header" >
            <CardHeader
                title=" Dispatch Details"
                className='cardHeader'
            />
            <CardContent>
                <Grid container md={12}>
                    <Grid container md={8}>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">Dispatch no</Typography>
                            <Typography>{dispatchDetails.dispatch_id}</Typography>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">Dispatch date</Typography>
                            <Typography>{dispatchDetails.dispatch_date}</Typography>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">Quantity</Typography>
                            <Typography>{dispatchDetails.dispatch_quantity}</Typography>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">Delivered</Typography>
                            <Typography>{dispatchDetails.delivered_quantity || '-'}</Typography>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">Balance</Typography>
                            <Typography>{dispatchDetails.balance_quantity || '-'}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Specification information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid item md={6} xs={6}>
                    <Grid item md={12} xs={12} style={{ marginRight: 25 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Expected order specification information</Typography>
                        </Grid>
                        <BasicTable rows={dispatchDetails.expected_composition ? dispatchDetails.expected_composition : null} columns={gcTableColumns} hasTotal={false}></BasicTable>
                    </Grid>
                </Grid>
                <Grid item md={6} xs={6}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Dispatch specification information</Typography>
                    </Grid>
                    <BasicTable rows={dispatchDetails.vendor_composition ? dispatchDetails.vendor_composition : null} columns={gcTableColumns} hasTotal={false}></BasicTable>
                </Grid>
            </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>MRIN information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <BasicTable rows={mrinTableData} columns={mrinTableColumns}></BasicTable>
            </AccordionDetails>
        </Accordion>
        {
            purchaseDetails.supplier_type_id === "1001" && (
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid container className="item" md={12} xs={12} direction="row" alignItems="center" justifyContent="space-between">
                                <Grid item >
                                    <Typography style={{ fontSize: '1.2rem' }}>Document information</Typography>
                                </Grid>
                                {activeStep >= 2 ? <Button
                                    label={editDocumentList ? "Done" : "Edit"}
                                    onClick={(event) => {
                                        event.stopPropagation();;
                                        setEditDocumentList(prevState => !prevState)
                                    }}
                                /> : null}
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <DocumentList
                            data={documents.filter(document => {
                                console.log("doc, dip", document, props?.details?.dispatchNo);
                                return document?.dispatchid === props?.details?.dispatchNo
                            }
                            )}
                            edit={editDocumentList}
                            details={!editDocumentList}
                            downloadFile={(event, fileName, docName, docid, dispatchid) =>
                                downloadFileHandler(event, fileName, docName, docid, dispatchid)
                            }
                            uploadFile={(event, fileContent, docName, fileName, docid, dispatchid) =>
                                uploadFileHandler(event, fileContent, docName, fileName, docid, dispatchid)}
                            deleteFile={deleteFileHandler}
                        />
                    </AccordionDetails>
                </Accordion>
            )
        }
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                <Button label="Back" onClick={props.back} />
            </Grid>
        </Grid>
        {showSnack.open && (
            <Snackbar
                {...showSnack}
                handleClose={() =>
                    setSnack({ open: false, message: "", severity: "" })
                }
            />
        )}
    </>);
}
export default DispatchDetails;