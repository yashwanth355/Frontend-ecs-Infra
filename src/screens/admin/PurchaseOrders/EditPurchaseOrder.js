import React, { useState, useEffect, useRef } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Container, Card, CardContent, CardHeader, Grid, Typography, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import SimpleStepper from '../../../components/SimpleStepper';
import SimplePopper from '../../../components/Popper';
import Button from '../../../components/Button';
import { getPOCreationInfo, getPoCreationInfo, updateGCPurchaseOrders, updateGCPoStatus, poDocumentsUpload, getQuotesInfo, getPODetails, getGCApprovedQuotes, getTopApprovedPOs, getTopMrinDetails, getPortAndOriginForPo, getMrinListForPoDetails, getBalQuoteQtyForPoOrder } from '../../../apis';
import Snackbar from '../../../components/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import BasicTable from '../../../components/BasicTable';
import DispatchList from './DispatchList';
import DispatchDetails from './DispatchDetails';
// import DocumentList from './DocumentList';
import AuditLog from './AuditLog';
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
        margin: 'auto',
        top: '25%',
        left: '25%',
        width: 700,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    otherModal: {
        marginTop: '8px',
        marginBottom: '8px'
    }
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


const EditPurchaseOrder = (props) => {
    const classes = useStyles();
    const [purchaseDetails, setPurchaseDetails] = useState({});
    const [validationError, setValidationError] = useState({});
    const [validationModal, setValidationModal] = useState(false);
    const [supplier, setSupplier] = useState(null);
    const [gc, setGc] = useState(null);
    const [disableSupplier, setDisableSupplier] = useState(true);
    const [quoteNumber, setQuoteNumber] = useState(null);
    const [supplierList, setSupplierList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [typeList, setTypeList] = useState([]);
    const [advanceTypeList, setAdvanceTypeList] = useState([]);
    const [gcTypeList, setgcTypeList] = useState([]);
    const [vendorPriceList, setVendorPriceList] = useState([]);
    const [otherVendorPriceList, setOtherVendorPriceList] = useState([]);
    const [mrinList, setMrinList] = useState([]);
    const [purchaseTypeList, setPurchaseTypeList] = useState([]);
    const [billingAddressList, setBillingAddressList] = useState([]);
    const [deliveryAddressList, setDeliveryAddressList] = useState([]);
    const [billingAtList, setBillingAtList] = useState([]);
    const [deliveryAtList, setDeliveryAtList] = useState([]);
    const [quotationList, setQuotationList] = useState([]);
    const [dispatchList, setDispatchList] = useState([]);
    const [dispatchTableData, setDispatchTableData] = useState([]);
    const [mrinTableData, setMrinTableData] = useState([]);
    const [currency, setCurrency] = useState([]);
    const [currencyCodes, setCurrencyCodes] = useState([]);
    const [containerTypes, setContainerTypes] = useState([]);
    const [incoterms, setIncoTerms] = useState([]);
    const [loadingPortList, setLoadingPortList] = useState([]);
    const [originList, setOriginList] = useState([]);
    const [transportList, setTransportList] = useState([]);
    const [insuranceList, setInsuranceList] = useState([]);
    const [chargesList, setChargesList] = useState([]);
    const [documents, setDocuments] = useState([]);
    const dispatchInfoRef = useRef(null)
    const [showQuoteInfo, setShowQuoteInfo] = useState(false);
    const [showContractInfo, setShowContractInfo] = useState(false);
    const [showDispatchInfo, setShowDispatchInfo] = useState(false);
    const [showNoDispatchInfo, setShowNoDispatchInfo] = useState(false);
    const [showDispatchTableInfo, setShowDispatchTableInfo] = useState(false);
    const [showDispatchDetails, setShowDispatchDetails] = useState(false);
    const [dispatchDetails, setDispatchDetails] = useState({});
    const [logData, setLogData] = useState([]);
    const [purchase_qty, setPurchase_qty] = useState('0');
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [activeStep, setActiveStep] = React.useState(-1);
    const [stepProgress, setStepProgress] = useState("100%");
    const [errorValidationMessage, setErrorValidationMessage] = useState("Please check and give mandatory fields to save");
    const [dispatchTotal, setDispatchTotal] = useState('0');
    const [openOtherCharges, setOpenOtherCharges] = useState(false);
    const [otherChargesList, setOtherChargesList] = useState([]);
    const [otherCharges, setOtherCharges] = useState({});
    const [loading, setLoading] = useState(false);
    const documentsRequired = ["Invoice", "Packing List", "Bill of Lading", "Phytosanitory Certificate",
        "Fumigation Certificate", "Certificate of Origin", "ICO Certificate of Origin", "Weight Certificate", "Quality Certificate", "Inspection and Stuffing Certificate", "Bill of Entry", "Dispatch Note"]

    const fetchDocumnetData = (poid) => {
        // let documentsEnum = {
        //     document1: "Invoice",
        //     document2: "Packing list",
        //     document3: "Bill of lading",
        //     document4: "Phytosanitory certificate",
        //     document5: "Fumigation certificate",
        //     document6: "Certificate of origin",
        //     document7: "ICO certificate of origin",
        //     document8: "Weight certificate",
        //     document9: "Quality certificate",
        //     document10: "Inspection and stuffing certificate",
        //     document11: "Bill of Entry",
        //     document12: "Dispatch Note",
        // }
        poDocumentsUpload({
            "type": "getDocumentsOnPo",
            "po_id": poid
        }).then(res => {
            // Object.values(documentsEnum).forEach(doc => {
            //     var poDoc = res !== null ? res.find(x => x.doc_kind === doc) : '';
            //     if (poDoc && poDoc !== '') {

            let docs = [];
            documentsRequired?.map(doc => {
                const index = res?.findIndex(document => document?.doc_kind === doc)
                if (index > -1) {
                    docs.push({
                        upload: !!res[index]?.file_name,
                        file_name: res[index]?.file_name,
                        document_name: res[index]?.document_name,
                        doc_kind: res[index]?.doc_kind,
                        required: res[index]?.required,
                        docid: res[index]?.docid,
                    })
                }
                else {
                    docs.push({
                        upload: false,
                        file_name: "",
                        document_name: "",
                        doc_kind: doc,
                        required: false,
                        docid: null,
                    })
                }
                return null;
            })
            console.log("Documents are", docs)
            setDocuments(docs);
        });
        // console.log("Documents are", documents);
        // console.log("Documents are", documents);
        // setDocuments(documents);
    };
    useEffect(() => {
        getPOCreationInfo({ "type": "posubcategory" }).then(res => {
            setTypeList(formatToSelection(res, "supplier_type_name", "supplier_type_id"));
        });
        getQuotesInfo({ "type": "currencies" }).then(res => {
            setCurrency(formatToSelection(res, 'currencyname', 'currencyid'));
            var currencyCodes = {};
            res.forEach((cur, i) => {
                currencyCodes[cur.currencyid] = cur.currencycode;
            });
            setCurrencyCodes(currencyCodes);
        }
        );
        getPoCreationInfo({ "type": "containerTypes" }).then(res => setContainerTypes(formatToSelection(res, 'conttype_name', 'conttype_name')));
        setCategoryList(formatToSelection([{ category: "GC", id: "GC" }, { category: "ORM", id: "ORM" }], "category", "id"));
        getPOCreationInfo({ "type": "deliveryinfo" }).then(res => {
            setDeliveryAddressList(res);
            setDeliveryAtList(formatToSelection(res, 'delivery_at_name', "delivery_at_id"));
        });
        getPOCreationInfo({ "type": "billinginfo" }).then(res => {
            setBillingAddressList(res);
            setBillingAtList(formatToSelection(res, 'billing_at_name', "billing_at_id"));
        });
        setAdvanceTypeList(formatToSelection([{ advance: "Percentage", id: 101 }, { advance: "Amount", id: 102 }], "advance", "id"))

        getPortAndOriginForPo({
            "type": "portLoadingDetails"
        }).then(res => {
            setLoadingPortList(formatToSelection(res, "Ports", "Ports"));
        });
        getPortAndOriginForPo({
            "type": "originDetails"
        }).then(res => {
            setOriginList(formatToSelection(res, "origin", "origin"));
        });
        setChargesList(formatToSelection([
            { id: "packing_forward_charges", label: "Packaging & Forwarding" },
            { id: "installation_charges", label: "Installation" },
            { id: "freight_charges", label: "Freight" },
            { id: "handling_charges", label: "Handling" },
            { id: "misc_charges", label: "Miscellaneous" },
            { id: "hamali_charges", label: "Hamali" },
            { id: "mandifee_charges", label: "Mandi Fee" },
            { id: "fulltax_charges", label: "Full Tax(Form Nill)" },
            { id: "insurance_charges", label: "Insurance" }], "label", "id"))
        setTransportList(formatToSelection([{ id: "By Sea", label: "By Sea" }, { id: "By Air", label: "By Air" }, { id: "By Road", label: "By Road" }], "label", "id"))
        setInsuranceList(formatToSelection([{ id: "By Supplier", label: "By Supplier" }, { id: "By Self", label: "By Self" }], "label", "id"))
        setDispatchList(formatToSelection([{ id: "Single", label: "Single" }, { id: "Multiple", label: "Multiple" }], "label", "id"));
        setPurchaseTypeList(formatToSelection([{ id: "Fixed", label: "Fixed" }, { id: "Differential", label: "Differential" }], "label", "id"))
        getQuotesInfo({ "type": "incoterms" }).then(res => setIncoTerms(formatToSelection(res, 'incoterms', 'incotermsid')));

        getMrinListForPoDetails({ "type": "mrinsonponoforview", "po_no": props.id?.toString() }).then(response => {
            setMrinTableData(response);
        });

        getPODetails({
            "po_no": (props.id?.toString())
        }).then(res => {
            setPurchaseDetails({
                ...res,
                'currency_id': { label: res.currency_name, value: res.currency_id },
                "gcCompositions": res ? formatGCCompositions(res) : null,
                "advance_type": res.advance_type === "Amount" ? "102" : "101",
                "po_qty": res.total_quantity,
                "incotermsid": { label: res.incoterms, value: res.incotermsid },
                "origin": { label: res.origin, value: res.origin },
                "ports": { label: res.ports, value: res.ports },
                "mode_of_transport": res?.supplier_type_id === '1002' ? res.mode_of_transport : { label: res.mode_of_transport, value: res.mode_of_transport },
                "insurance": { label: res.insurance, value: res.insurance },
                "container_type": { label: res.container_type, value: res.container_type },
                "otherCharges": { label: res.otherCharges, value: res.otherCharges },
                // "po_margin":(parseFloat(res.market_price === undefined ? 0 : res.market_price) - parseFloat(res.purchase_price)),           
                // "totalPrice": (parseFloat(res.purchase_price) * parseFloat(res.po_qty === undefined ? 0 : res.po_qty)),
            });
            let other = [
                { id: "packing_forward_charges", label: "Packaging & Forwarding" },
                { id: "installation_charges", label: "Installation" },
                { id: "freight_charges", label: "Freight" },
                { id: "handling_charges", label: "Handling" },
                { id: "misc_charges", label: "Miscellaneous" },
                { id: "hamali_charges", label: "Hamali" },
                { id: "mandifee_charges", label: "Mandi Fee" },
                { id: "fulltax_charges", label: "Full Tax(Form Nill)" },
                { id: "insurance_charges", label: "Insurance" }
            ];
            let temp = [];
            // eslint-disable-next-line
            other.map((item, index) => {
                if (res[item.id] !== '') {
                    temp.push({ "name": item.id, "label": item.label, "rate": res[item.id] })
                }
            })
            setOtherChargesList(temp);
            // setOtherChargesRate(0)
            if (res.supplier_type_id === "1001") {
                setShowContractInfo(true);
            }
            setActiveStep(parseInt(res.status) - 1);
            if (res.status === "4" || res.status === "3") {
                var delivered = res.item_dispatch
                    ?.map((dispatch) => (dispatch.delivered_quantity ? parseInt(dispatch.delivered_quantity) : 0))
                    .reduce((sum, i) => sum + i, 0);
                setStepProgress(((delivered / res.total_quantity) * 100) + "%");
            }
            getPOCreationInfo({ "type": "allsuppliers", "supplier_type_id": res.supplier_type_id }).then(response => {
                setSupplierList(response);
                setSupplier({ "supplier_id": res.supplier_id, "supplier_name": res.supplier_name });
                setDisableSupplier(false);
            });
            getPOCreationInfo({ item_type: "GC", "type": "greencoffee" }).then(response => {
                setgcTypeList(response === null ? [] : response);
                setGc({ "item_id": res.item_id, "item_name": res.item_name });

                if (res.coffee_type === "speciality") {
                    getGCApprovedQuotes({
                        "type": "approvedqtlines",
                        "gc_type": res.item_id,
                        "po_date": currentPODate(purchaseDetails.po_date || new Date()),
                    }).then(quotes => {
                        setQuotationList(quotes);
                        setQuoteNumber(quotes?.find(r => r.qtline_item === res.quot_no));
                        setShowQuoteInfo(true);
                    });
                } else {
                    setShowQuoteInfo(false);
                }
                setShowDispatchInfo(true);
                setShowNoDispatchInfo(true);
                setShowDispatchTableInfo(true);
                getTopApprovedPOs({
                    "type": "top3apprPosforselectedvendor",
                    "vendor_id": res.supplier_id,
                    "gcitem_id": res.item_id
                }).then(pos => {
                    setVendorPriceList(pos);
                });
                getTopApprovedPOs({
                    "type": "top3apprPosforothervendor",
                    "vendor_id": res.supplier_id,
                    "gcitem_id": res.item_id
                }).then(pos => {
                    setOtherVendorPriceList(pos);
                });
                getTopMrinDetails({
                    "type": "topmrinrecord",
                    "gcitem_id": res.item_id,
                    "po_date": res.po_date
                }).then(mrin => {
                    if (mrin?.gcitem_id) {
                        let data = {
                            ...mrin,
                            "number": 1
                        }
                        setMrinList([data]);
                    } else {
                        setMrinList(null);
                    }
                });
                setLogData(res.audit_log_gc_po);
            });

            // setCompositions(formatGCCompositions(res));  
            if (res.item_dispatch?.length > 0) {
                res.item_dispatch.forEach((dispatch, i) => {
                    dispatch.number = ++i;
                    var date = dispatch.dispatch_date?.split("-");
                    if (date) {
                        dispatch.date = new Date(date[2], date[1], date[0])
                    }
                });
                setDispatchTableData(res.item_dispatch);
            } else {
                setDispatchTableData(null)
            }
            fetchDocumnetData(res.poid);
        });
        // eslint-disable-next-line 
    }, []);

    const handleChange = (event, key,) => {
        let data = {
            ...purchaseDetails,
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    };

    const handleCategoryChange = (event, key) => {
        let data = {};
        if (event.target.value === "ORM") {
            data = {
                ...purchaseDetails,
                [key]: event.target.value,
                "booked_terminal_rate": purchaseDetails.purchase_price,
                "booked_differential": 0,
                "fixed_terminal_rate": purchaseDetails.purchase_price,
                "fixed_differential": 0
            }
        } else {
            data = {
                ...purchaseDetails,
                [key]: event.target.value
            }
        }
        setPurchaseDetails(data);
    };

    const handleTypeChange = (event, key) => {
        getPOCreationInfo({ "type": "allsuppliers", "supplier_type_id": event.target.value }).then(res => {
            setSupplierList(res);
        });
        let data = {
            ...purchaseDetails,
            [key]: event.target.value,
            "supplier_name": '',
            "supplier_id": '',
            "supplier_address": '',
        }
        setPurchaseDetails(data);
        setSupplier(null);
        setDisableSupplier(false);
    };

    const handleSupplierChange = (event, value) => {
        if (!value) {
            setSupplier(null);
            let data = {
                ...purchaseDetails,
                "supplier_name": '',
                "supplier_id": '',
                "supplier_address": ''
            }
            setPurchaseDetails(data);
            return;
        }
        setSupplier(value);

        getPOCreationInfo({ "type": "supplierinfo", "supplier_id": value.supplier_id }).then(res => {
            let data = {
                ...purchaseDetails,
                "supplier_name": res.supplier_name,
                "supplier_id": res.supplier_id,
                "supplier_address": res.supplier_address,
                "currency_id": res.supplier_type === "Domestic" ? "HO-101" : ''
            }
            setPurchaseDetails(data);
            getTopApprovedPOs({
                "type": "top3apprPosforselectedvendor",
                "vendor_id": value.supplier_id,
                "gcitem_id": purchaseDetails.item_id
            }).then(res => {
                setVendorPriceList(res);
            });
        });
    };

    const handleAddressChange = (event, key,) => {
        let data = {};
        if (key === "billing_at_id") {
            let res = billingAddressList.find(loc => loc.billing_at_id === event.target.value)
            data = {
                ...purchaseDetails,
                [key]: event.target.value,
                "billing_at_address": res.billing_at_address
            }
        } else if (key === "delivery_at_id") {
            let res = deliveryAddressList.find(loc => loc.delivery_at_id === event.target.value)
            data = {
                ...purchaseDetails,
                [key]: event.target.value,
                "delivery_at_address": res.delivery_at_address
            }
        }
        setPurchaseDetails(data);
    };

    const formatGCCompositions = (compostion = {}) => {
        return [
            { composition_name: "Density(Gm/Cc)", composition_rate: compostion.density },
            { composition_name: "Moisture (%)", composition_rate: compostion.moisture },
            { composition_name: "Browns (%)", composition_rate: compostion.browns },
            { composition_name: "Blacks (%)", composition_rate: compostion.blacks },
            { composition_name: "Broken & Bits (%)", composition_rate: compostion.brokenbits },
            { composition_name: "Insected Beans (%)", composition_rate: compostion.insectedbeans },
            { composition_name: "Bleached (%)", composition_rate: compostion.bleached },
            { composition_name: "Husk (%)", composition_rate: compostion.husk },
            { composition_name: "Sticks (%)", composition_rate: compostion.sticks },
            { composition_name: "Stones (%)", composition_rate: compostion.stones },
            { composition_name: "Beans retained on 5mm mesh during sieve analysis", composition_rate: compostion.beansretained }

        ];
    }

    const currentPODate = (date) => {
        // 2019-07-25 17:31:46.967
        var dateVal = new Date(date);
        return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate();
    }

    const handleGCTypeChange = (event, value) => {
        let data;
        if (!value) {
            data = {
                ...purchaseDetails,
                "item_id": '',
                "gcCompositions": [],
                "quot_no": '',
                "quot_date": null
            }
            setPurchaseDetails(data);
            setShowQuoteInfo(false);
            setShowDispatchInfo(false);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(false);
            return;
        }
        setGc({ "item_id": value.item_id, "item_name": value.item_name });
        getPOCreationInfo({ "type": "gccomposition", "item_id": value.item_id }).then(res => {
            data = {
                ...purchaseDetails,
                "item_id": value.item_id,
                "gcCompositions": res ? formatGCCompositions(res[0]) : null,
                "quot_no": '',
                "quot_date": null,
                "po_qty": '',
                "quot_price": '',
                "dispatch_type": '',
                "dispatch_count": ''
            }
            setPurchaseDetails(data);
        });
        setQuoteNumber(null);
        setShowDispatchInfo(false);
        setShowNoDispatchInfo(false);
        setShowDispatchTableInfo(false);
        if (value.gc_type === "speciality") {
            getGCApprovedQuotes({
                "type": "approvedqtlines",
                "gc_type": value.item_id,
                "po_date": currentPODate(purchaseDetails.po_date || new Date()),
            }).then(res => {
                setQuotationList(res);
                setShowQuoteInfo(true);
            });
        } else {
            setShowQuoteInfo(false);
        }
        getTopApprovedPOs({
            "type": "top3apprPosforselectedvendor",
            "vendor_id": purchaseDetails.supplier_id,
            "gcitem_id": value.item_id
        }).then(res => {
            setVendorPriceList(res);
        });
        getTopApprovedPOs({
            "type": "top3apprPosforothervendor",
            "vendor_id": purchaseDetails.supplier_id,
            "gcitem_id": value.item_id
        }).then(res => {
            setOtherVendorPriceList(res);
        });
        getTopMrinDetails({
            "type": "topmrinrecord",
            "gcitem_id": value.item_id,
            "po_date": purchaseDetails.po_date || new Date()
        }).then(res => {
            if (res?.gcitem_id) {
                let data = {
                    ...res,
                    "number": 1
                }
                setMrinList([data]);
            } else {
                setMrinList(null);
            }
        });
    };

    const handleDateChange = (date, key,) => {
        let data = {
            ...purchaseDetails,
            [key]: date
        }
        setPurchaseDetails(data);
    };

    const handleQuantityChange = (event, key) => {
        const totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: event.target.value }, otherChargesList);
        if (parseFloat(purchase_qty) !== 0 && parseFloat(event.target.value) > parseFloat(purchase_qty)) {
            setValidationError({ ...validationError, "qty": `You cannot enter value more than ${purchase_qty} for this PO` });
            setErrorValidationMessage(`You cannot enter value more than ${purchase_qty} for this PO`)
        } else {
            if (parseFloat(event.target.value) !== parseFloat(dispatchTotal)) {
                setValidationError({ ...validationError, "po_qty": 'Total Dispatch Quatity not matches Quantity entered' });
                setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered')
            } else {
                if (validationError.po_qty) {
                    let error = { ...validationError };
                    delete error.po_qty;
                    setValidationError(error);
                }
            }
        }
        //  }
        let data = {
            ...purchaseDetails,
            [key]: event.target.value,
            "grossPrice": (parseFloat(purchaseDetails.purchasePriceInr === undefined ? 0 : purchaseDetails.purchasePriceInr) * parseFloat(event.target.value)),
            "totalPrice": purchaseDetails.supplier_type_id === "1002" ? totalPriceInr :
                ((parseFloat(purchaseDetails.purchase_price === undefined ? 0 : purchaseDetails.purchase_price) * parseFloat(event.target.value)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
        }
        if (event.target.value > 0) {
            setShowDispatchInfo(true);
        } else {
            data = {
                ...data,
                'dispatch_type': '',
                'dispatch_count': ''
            }
            setShowDispatchInfo(false);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(false);
        }
        setPurchaseDetails(data);
        if (dispatchTableData) {
            var totalDispatchQty = dispatchTableData?.map(row => parseInt(row["dispatchqty"])).reduce((sum, i) => sum + i, 0);

            if (parseFloat(event.target.value) > parseFloat(totalDispatchQty)) {
                setValidationError({ ...validationError, "qty": 'Total Dispatch Quatity not matches Quantity entered' });
                setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered')
            } else {
                if (parseFloat(purchaseDetails.qty) > parseFloat(purchase_qty) && parseFloat(purchase_qty) !== 0) {
                    setValidationError({ ...validationError, "qty": `You cannot enter value more than ${purchase_qty} for this PO` });
                    setErrorValidationMessage(`You cannot enter value more than ${purchase_qty} for this PO`);
                } else {
                    if (validationError.qty) {
                        let error = { ...validationError };
                        delete error.qty;
                        setValidationError(error);
                    }
                }
            }

            //   if (totalDispatchQty > parseFloat(event.target.value)) {
            //       setValidationError({ ...validationError, "po_qty": 'Total Dispatch Quatity exceeds Quantity entered' });
            //   } else {
            //       if (validationError.po_qty) {
            //           let error = { ...validationError };
            //           delete error.po_qty;
            //           setValidationError(error);
            //       }
            //   }
        }
    };

    const handleFTRChange = (event, key) => {
        let purchasePrice = (parseFloat(event.target.value) + parseFloat(purchaseDetails.booked_differential === undefined ? 0 : purchaseDetails.booked_differential));
        let marketPrice = (parseFloat(event.target.value) + parseFloat(purchaseDetails.fixed_differential === undefined ? 0 : purchaseDetails.fixed_differential));
        let data = {
            ...purchaseDetails,
            "purchase_price": purchasePrice,
            "market_price": marketPrice,
            "po_margin": parseFloat(marketPrice) - parseFloat(purchasePrice),
            "totalPrice": ((parseFloat(purchasePrice) * parseFloat(purchaseDetails.po_qty === undefined ? 0 : purchaseDetails.po_qty)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    };

    const handleBDChange = (event, key) => {
        let purchasePrice = (parseFloat(event.target.value) + parseFloat(purchaseDetails.fixed_terminal_rate === undefined ? 0 : purchaseDetails.fixed_terminal_rate));
        let data = {
            ...purchaseDetails,
            "purchase_price": purchasePrice,
            "totalPrice": ((parseFloat(purchasePrice) * parseFloat(purchaseDetails.po_qty === undefined ? 0 : purchaseDetails.po_qty)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
            "po_margin": parseFloat(purchaseDetails.market_price === undefined ? 0 : purchaseDetails.market_price) - parseFloat(purchasePrice),
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    };

    const handleFDChange = (event, key) => {
        let marketPrice = (parseFloat(event.target.value) + parseFloat(purchaseDetails.fixed_terminal_rate === undefined ? 0 : purchaseDetails.fixed_terminal_rate));
        let data = {
            ...purchaseDetails,
            "market_price": marketPrice,
            "po_margin": parseFloat(marketPrice) - parseFloat(purchaseDetails.purchase_price === undefined ? 0 : purchaseDetails.purchase_price),
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    };

    const handleMPChange = (event, key) => {
        let data = {
            ...purchaseDetails,
            "po_margin": (parseFloat(event.target.value) - parseFloat(purchaseDetails.purchase_price === undefined ? 0 : purchaseDetails.purchase_price)),
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    };

    const handlePurchasePriceChange = (event, key) => {
        let data = {
            ...purchaseDetails,
            "po_margin": (parseFloat(purchaseDetails.market_price === undefined ? 0 : purchaseDetails.market_price) - parseFloat(event.target.value)),
            "totalPrice": ((parseFloat(event.target.value) * parseFloat(purchaseDetails.po_qty === undefined ? 0 : purchaseDetails.po_qty)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    };

    const handlePurchasePriceInrChange = (event, key) => {
        const totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: event.target.value }, otherChargesList)
        let data = {
            ...purchaseDetails,
            "grossPrice": (parseFloat(event.target.value) * parseFloat(purchaseDetails.po_qty === undefined ? 0 : purchaseDetails.po_qty)),
            "totalPrice": totalPriceInr,
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    };

    const handleDispatchChange = (event, key,) => {
        let data = {
            ...purchaseDetails,
            [key]: event.target.value
        }
        if (event.target.value === "Multiple") {
            setShowNoDispatchInfo(true);
        } else {
            let tabledata = [];
            tabledata[0] = { "number": (1), "dispatch_quantity": 0, "date": new Date() };
            setDispatchTableData(tabledata);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(true);
        }
        setPurchaseDetails(data);
    };

    const handleDispatchCountChange = (event, key) => {
        let data = {
            ...purchaseDetails,
            [key]: event.target.value
        }
        setPurchaseDetails(data);
        if (event.target.value > 99 || event.target.value < 1) {
            setValidationError({ dispatch_count: 'Please enter valid details: 1 - 99' });
            return;
        } else {
            if (validationError.dispatch_count) {
                let error = { ...validationError };
                delete error.dispatch_count;
                setValidationError(error);
            }
        }
        if (event.target.value < 1) {
            setShowDispatchTableInfo(false);
            return;
        }
        setShowDispatchTableInfo(true);
        let tabledata = [];
        for (let index = 0; index < event.target.value; index++) {
            tabledata[index] = { "number": (index + 1), "dispatchqty": 0, "dispatchdate": new Date() };
        }
        setDispatchTableData(tabledata);
    };

    const handleOtherChargesChange = (event, value) => {
        // let temp = chargesList.find(data => data.value === value.value)
        setOtherCharges({
            ...otherCharges,
            "item": value,
            "label": value.label
        })
    }

    const handleOtherRateChange = (event, key) => {
        setOtherCharges({
            ...otherCharges,
            "rate": event.target.value
        })
    }

    const handleRateChange = (event, key) => {
        const totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: event.target.value }, otherChargesList)
        let data = {
            ...purchaseDetails,
            "totalPrice": purchaseDetails.supplier_type_id === "1002" ? totalPriceInr :
                ((parseFloat(purchaseDetails.purchase_price === undefined ? 0 : purchaseDetails.purchase_price) * parseFloat(event.target.value)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    }

    const handleTaxChange = (event, key) => {

        const totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: event.target.value }, otherChargesList);
        let data = {
            ...purchaseDetails,
            "totalPrice": totalPriceInr,
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    }

    const handleQuotationChange = (event, value) => {
        const totalPriceInr = calculateTotalPrice(purchaseDetails, otherChargesList)
        getBalQuoteQtyForPoOrder({ "type": "getBalqtyforPo", "quotation_no": value?.quotation_no }).then((res) => {
            var qty_gc = (res.order_qty === '') ? value?.qty : (value?.qty - res.order_qty);
            setPurchase_qty(value?.qty);
            let data = {
                ...purchaseDetails,
                'quot_no': value?.quotation_no,
                'quotation_id': value?.quotation_id,
                'quot_date': value?.quotation_date,
                'quot_price': value?.price,
                'po_qty': qty_gc,
                "grossPrice": (parseFloat(purchaseDetails.purchasePriceInr === undefined ? 0 : purchaseDetails.purchasePriceInr) * parseFloat(value?.qty)),
                'totalPrice': purchaseDetails.supplier_type_id === "1002" ? totalPriceInr :
                    ((parseFloat(purchaseDetails.purchase_price === undefined ? 0 : purchaseDetails.purchase_price) * parseFloat(value?.qty)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
            }
            if (value?.qty > 0) {
                setShowDispatchInfo(true);
            }
            setPurchaseDetails(data);
            setQuoteNumber(value);
        });
    };

    const dispatchDataUpdate = (total) => {
        setDispatchTotal(total);
        if (parseFloat(purchaseDetails.po_qty) !== total) {
            setValidationError({ ...validationError, "po_qty": 'Total Dispatch Quatity not matches Quantity entered' });
            setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered')
            return;
        } else {
            if (validationError.po_qty) {
                let error = { ...validationError };
                delete error.po_qty;
                setValidationError(error);
            }
        }
    }

    const rateUpdate = (total, otherChargesList) => {
        const totalPriceInr = calculateTotalPrice(purchaseDetails, otherChargesList)
        let data = {
            ...purchaseDetails,
            'totalPrice': purchaseDetails.supplier_type_id === "1002" ? totalPriceInr :
                ((parseFloat(purchaseDetails.purchase_price === undefined ? 0 : purchaseDetails.purchase_price) * parseFloat(purchaseDetails.qty / 1000)) + (total ? parseFloat(total) : 0)),
        }
        setPurchaseDetails(data);
    }


    const handleClick = (index) => {
        let state = [...otherChargesList];
        // eslint-disable-next-line       
        state.map((item, index1) => {
            if (index1 === index) {
                let temp = { ...purchaseDetails };
                delete purchaseDetails[item.name];
                setPurchaseDetails(temp);
            }
        })
        if (index !== -1) {
            state.splice(index, 1);
            setOtherChargesList(state);
        }

        if (state.length === 0) {
            rateUpdate(0, state);
        } else {

            rateUpdate(state?.map(row => parseInt(row["rate"])).reduce((sum, i) => sum + i, 0), state);
        }
    }

    const createPurchaseAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = { ...validationError };
        // setValidationError(errorObj);
        if (purchaseDetails.supplier_type_id === "1002" && _.isEmpty(purchaseDetails.advance)) {
            errorObj = { ...errorObj, advance: message };
        } else {
            delete errorObj.advance
        }
        if (purchaseDetails.supplier_type_id === "1002" && _.isEmpty(purchaseDetails.cgst) && !_.isEmpty(purchaseDetails.sgst)) {
            errorObj = { ...errorObj, cgst: message };
        } else {
            delete errorObj.cgst
        }
        if (purchaseDetails.supplier_type_id === "1002" && _.isEmpty(purchaseDetails.sgst) && !_.isEmpty(purchaseDetails.cgst)) {
            errorObj = { ...errorObj, sgst: message };
        } else {
            delete errorObj.sgst
        }
        if (purchaseDetails.supplier_type_id === "1001" && _.isEmpty(purchaseDetails.market_price?.toString())) {
            errorObj = { ...errorObj, market_price: message };
        } else {
            delete errorObj.market_price
        }
        if (purchaseDetails.supplier_type_id === "1001" && _.isEmpty(purchaseDetails.purchase_price?.toString())) {
            errorObj = { ...errorObj, purchase_price: message };
        } else {
            delete errorObj.purchase_price
        }
        if (purchaseDetails.supplier_type_id === "1002" && _.isEmpty(purchaseDetails.purchasePriceInr?.toString())) {
            errorObj = { ...errorObj, purchasePriceInr: message };
        } else {
            delete errorObj.purchasePriceInr
        }
        // if (purchaseDetails.supplier_type_id === "1001" && _.isEmpty(purchaseDetails.totalPrice)) {
        //     errorObj = { ...errorObj, totalPrice: message };
        // }
        if (_.isEmpty(purchaseDetails.supplier_type_id)) {
            errorObj = { ...errorObj, supplier_type_id: message };
        } else {
            delete errorObj.supplier_type_id
        }
        if (_.isEmpty(purchaseDetails.po_category)) {
            errorObj = { ...errorObj, po_category: message };
        } else {
            delete errorObj.po_category
        }
        if (purchaseDetails.status === "1" && purchaseDetails.status === "2" && _.isEmpty(purchaseDetails.dispatch_type)) {
            errorObj = { ...errorObj, dispatch_type: message };
        } else {
            delete errorObj.dispatch_type
        }
        if (purchaseDetails.status === "1" && purchaseDetails.status === "2" && purchaseDetails.dispatch_type === 'Multiple' && _.isEmpty(purchaseDetails.dispatch_count)) {
            errorObj = { ...errorObj, dispatch_count: message };
        } else {
            delete errorObj.dispatch_count
        }
        if (purchaseDetails.billing_at_id === undefined) {
            errorObj = { ...errorObj, billing_at_id: message };
        } else {
            delete errorObj.billing_at_id
        }
        if (purchaseDetails.delivery_at_id === undefined) {
            errorObj = { ...errorObj, delivery_at_id: message };
        } else {
            delete errorObj.delivery_at_id
        }
        if (purchaseDetails.supplier_type_id === "1002" && _.isEmpty(purchaseDetails.payment_terms_days)) {
            errorObj = { ...errorObj, payment_terms_days: message };
        } else {
            delete errorObj.payment_terms_days
        }
        if (purchaseDetails.supplier_id === undefined) {
            errorObj = { ...errorObj, supplier_id: message };
        } else {
            delete errorObj.supplier_id
        }
        if (!_.isEmpty(errorObj)) {
            setValidationError(errorObj);
            setValidationModal(true);
        } else {
            let data =
            {
                "createduserid": localStorage.getItem('currentUserId'),
                "po_update": true,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "po_no": purchaseDetails.po_no,
                "quotation_id": purchaseDetails.quotation_id,
                "place_of_destination": purchaseDetails.place_of_destination,
                "delivery_at_id": purchaseDetails.delivery_at_id?.toString(),
                "billing_at_id": purchaseDetails.billing_at_id?.toString(),
                "incoterms": purchaseDetails.incotermsid?.value,
                "origin": purchaseDetails.origin?.value,
                "ports": purchaseDetails.ports?.value,
                "payment_terms": purchaseDetails.payment_terms,
                "container_type": purchaseDetails.container_type?.value,
                "payment_terms_days": purchaseDetails.payment_terms_days,
                "forwarding": purchaseDetails.forwarding,
                "no_of_bags": purchaseDetails.no_of_bags,
                "net_weight": purchaseDetails.net_weight,
                "no_of_containers": purchaseDetails.no_of_containers?.toString(),
                "comments": purchaseDetails.comments,
                "po_date": purchaseDetails.po_date,
                "po_category": purchaseDetails.po_category,
                "supplier_id": purchaseDetails.supplier_id,
                "quot_no": purchaseDetails.quot_no,
                "quot_price": purchaseDetails.quot_price?.toString(),
                "quot_date": purchaseDetails.quot_date || null,
                "advance": purchaseDetails.advance?.toString(),
                "advance_type": purchaseDetails.advance_type?.toString(),
                "currency_id": purchaseDetails.currency_id?.value,
                "taxes_duties": purchaseDetails.taxes_duties,
                "mode_of_transport": purchaseDetails.mode_of_transport?.value,
                "insurance": purchaseDetails.insurance?.value,
                "transit_insurance": purchaseDetails.transit_insurance,
                "packing_forwarding": purchaseDetails.packing_forwarding,
                "supplier_type": purchaseDetails.supplier_type_id,
                "cgst": purchaseDetails.cgst,
                "igst": purchaseDetails.igst,
                "sgst": purchaseDetails.sgst,
                "purchase_type": purchaseDetails.purchase_type,
                "terminal_month": purchaseDetails.terminal_month || null,
                "fixation_date": purchaseDetails.fixation || null,
                "booked_terminal_rate": purchaseDetails.booked_terminal_rate?.toString(),
                "booked_differential": purchaseDetails.booked_differential?.toString(),
                "fixed_terminal_rate": purchaseDetails.fixed_terminal_rate?.toString(),
                "fixed_differential": purchaseDetails.fixed_differential?.toString(),
                "purchase_price": purchaseDetails.purchase_price?.toString(),
                "market_price": purchaseDetails.market_price?.toString(),
                "po_margin": purchaseDetails.po_margin?.toString(),
                "terminalPrice": purchaseDetails.terminalPrice?.toString(),
                "marketPriceInr": purchaseDetails.marketPriceInr?.toString(),
                "purchasePriceInr": purchaseDetails.purchasePriceInr?.toString(),
                "totalPrice": purchaseDetails.totalPrice?.toString(),
                "grossPrice": purchaseDetails.grossPrice?.toString(),
                "total_quantity": purchaseDetails.po_qty?.toString(),
                "contract": purchaseDetails.contract,
                "otherCharges": purchaseDetails.otherCharges?.value,
                "rate": purchaseDetails.rate?.toString(),
                "dispatch_type": purchaseDetails.dispatch_type,
                "dispatch_count": purchaseDetails.dispatch_count,
                "item_dispatch": dispatchTableData,
                "item_id": purchaseDetails.item_id,
                "poid": purchaseDetails?.poid,
                "packing_forward_charges": purchaseDetails.packing_forward_charges ? purchaseDetails.packing_forward_charges.toString() : '',
                "installation_charges": purchaseDetails.installation_charges ? purchaseDetails.installation_charges.toString() : '',
                "freight_charges": purchaseDetails.freight_charges ? purchaseDetails.freight_charges.toString() : '',
                "handling_charges": purchaseDetails.handling_charges ? purchaseDetails.handling_charges.toString() : '',
                "misc_charge": purchaseDetails.misc_charge ? purchaseDetails.misc_charge.toString() : '',
                "hamali_charge": purchaseDetails.hamali_charge ? purchaseDetails.hamali_charge.toString() : '',
                "mandifee_charges": purchaseDetails.mandifee_charges ? purchaseDetails.mandifee_charges.toString() : '',
                "fulltax_charges": purchaseDetails.fulltax_charges ? purchaseDetails.fulltax_charges.toString() : '',
                "insurance_charges": purchaseDetails.insurance_charges ? purchaseDetails.insurance_charges.toString() : '',
                "documentsection": documents.length > 0 ? documents : null
            }
            setLoading(true);
            try {
                let response = await updateGCPurchaseOrders(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "GC Purchase Order updated successfully",
                    });
                    setTimeout(() => {
                        props.back("purchase_edit", "allpos")
                    }, 2000)
                }
            } catch (e) {
                setSnack({
                    open: true,
                    message: e.message,
                    severity: 'error',
                })
            }
            finally {
                setLoading(false);
            }
        }
    }

    const createAction = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Validation
            </h2>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={6} md={10} container direction="column">
                    {errorValidationMessage}
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Ok" onClick={() => setValidationModal(!validationModal)} />
                </Grid>
            </Grid>
        </Container>
    );
    const handleDocumentsRequiredChange = (val) => {
        const tempDocuments = _.cloneDeep(documents);
        const index = tempDocuments.findIndex(doc => doc.doc_kind === val);
        if (index > -1)
            tempDocuments[index].required = !tempDocuments[index]?.required
        setDocuments(tempDocuments);
    }
    const payload = [
        {
            label: 'PO date',
            type: 'datePicker',
            required: true,
            disabled: true,
            error: validationError?.po_date,
            helperText: validationError?.po_date,
            value: purchaseDetails.po_date || new Date(),
            maxDate: new Date(),
            onChange: (e) => handleDateChange(e, 'po_date'),
            sm: 12
        },
        {
            label: 'PO category *',
            type: 'select',
            value: purchaseDetails.po_category || '',
            required: true,
            disabled: true,
            error: validationError?.po_category,
            helperText: validationError?.po_category,
            options: categoryList || [],
            onChange: (e) => handleCategoryChange(e, 'po_category'),
            sm: 12
        },

    ]

    const payload17 = [{
        label: 'PO sub category *',
        type: 'select',
        required: true,
        disabled: true,
        error: validationError?.supplier_type_id,
        helperText: validationError?.supplier_type_id,
        value: purchaseDetails.supplier_type_id || '',
        options: typeList || [],
        onChange: (e) => handleTypeChange(e, 'supplier_type_id'),
        sm: 12
    }]

    const payload16 = [{
        label: 'Contract no',
        type: 'input',
        value: purchaseDetails.contract,
        onChange: (e) => handleChange(e, 'contract'),
        sm: 12
    }]

    const payload1 = [
        {
            label: 'Supplier',
            type: 'autocomplete',
            value: supplier,
            labelprop: "supplier_name",
            options: supplierList || [],
            disabled: disableSupplier || parseInt(purchaseDetails.status) >= 3 ? true : false,
            onChange: handleSupplierChange,
        },
        {
            label: 'Supplier id',
            type: 'input',
            disabled: true,
            required: true,
            error: validationError?.supplier_id,
            helperText: validationError?.supplier_id,
            value: purchaseDetails.supplier_id || ''
        },
        {
            label: 'Supplier name',
            type: 'input',
            disabled: true,
            value: purchaseDetails.supplier_name || ''
        },
        {
            label: 'Supplier address',
            type: 'input',
            disabled: true,
            rows: 3,
            multiline: true,
            value: purchaseDetails.supplier_address || ''
        }
    ]
    const payload21 = documentsRequired.map(doc => {
        return {
            label: doc,
            type: "checkbox",
            checked: !!documents.find(val => val.doc_kind === doc)?.required,
            onChange: () => handleDocumentsRequiredChange(doc)
        }
    })
    const handlecurrencyChange = (e, value) => {
        let data = {
            ...purchaseDetails,
            'currency_id': value
        }
        setPurchaseDetails(data);
    }

    const payload2 = [
        {
            label: 'Currency',
            type: 'autocomplete',
            labelprop: 'label',
            options: currency || [],
            value: purchaseDetails.currency_id,
            onChange: handlecurrencyChange,
        },
        {
            label: 'Advance type',
            type: 'select',
            value: purchaseDetails.advance_type || '',
            options: advanceTypeList || [],
            onChange: (e) => handleChange(e, 'advance_type'),
        },
        {
            label: 'Advance',
            type: 'float',
            required: true,
            error: validationError?.advance,
            helperText: validationError?.advance,
            value: purchaseDetails.advance || '',
            onChange: (e) => handleChange(e, 'advance'),
        },
        {
            label: 'No of days IOM can be generated from date of invoice',
            type: 'number',
            required: true,
            error: validationError?.payment_terms_days,
            helperText: validationError?.payment_terms_days,
            value: purchaseDetails.payment_terms_days || '',
            onChange: (e) => handleChange(e, 'payment_terms_days'),
        }
    ];

    const payload3 = [
        {
            label: 'Billing at *',
            type: 'select',
            value: purchaseDetails.billing_at_id || '',
            options: billingAtList || [],
            required: true,
            error: validationError?.billing_at_id,
            helperText: validationError?.billing_at_id,
            onChange: (e) => handleAddressChange(e, 'billing_at_id'),
        },
        {
            label: 'Delivery at *',
            type: 'select',
            value: purchaseDetails.delivery_at_id || '',
            options: deliveryAtList || [],
            required: true,
            error: validationError?.delivery_at_id,
            helperText: validationError?.delivery_at_id,
            onChange: (e) => handleAddressChange(e, 'delivery_at_id'),
        },
        {
            label: 'Billing address',
            type: 'input',
            rows: 4,
            multiline: true,
            value: purchaseDetails.billing_at_address || '',
            onChange: (e) => handleChange(e, 'billing_at_address'),
        },
        {
            label: 'Delivery address',
            type: 'input',
            rows: 4,
            multiline: true,
            value: purchaseDetails.delivery_at_address || '',
            onChange: (e) => handleChange(e, 'delivery_at_address'),
        },
    ];

    const payload4 = [
        {
            label: 'Green coffee Type',
            type: 'autocomplete',
            labelprop: 'item_name',
            value: gc,
            options: gcTypeList || [],
            onChange: handleGCTypeChange,
            disabled: (purchaseDetails.status !== "1" && purchaseDetails.status !== "2"),
            required: true,
            error: validationError?.gcType,
            helperText: validationError?.gcType,
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload5 = [
        {
            label: 'Quotation no',
            type: 'autocomplete',
            labelprop: 'quotation_no',
            value: quoteNumber,
            options: quotationList || [],
            onChange: handleQuotationChange,
            disabled: (purchaseDetails.status !== "1" && purchaseDetails.status !== "2"),
            md: 12,
            sm: 12,
            xs: 12
        },
        {
            label: 'Quotation date',
            type: 'datePicker',
            value: purchaseDetails.quot_date || null,
            onChange: (e) => handleDateChange(e, 'quot_date'),
            disabled: true,
            md: 12,
            sm: 12,
            xs: 12
        },
        {
            label: 'Price',
            type: 'float',
            value: purchaseDetails.quot_price || '',
            onChange: (e) => handleChange(e, 'quot_price'),
            disabled: true,
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload7 = [
        {
            label: 'Quantity(Kgs)',
            type: 'number',
            value: purchaseDetails.po_qty || '',
            error: validationError?.po_qty,
            helperText: validationError?.po_qty,
            onChange: (e) => handleQuantityChange(e, 'po_qty'),
            disabled: (purchaseDetails.status !== "1" && purchaseDetails.status !== "2"),
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload8 = [
        {
            label: 'Dispatch type*',
            type: 'select',
            value: purchaseDetails?.dispatch_type === '' ? purchaseDetails.item_dispatch?.length > 1 ? "Multiple" : "Single" : purchaseDetails.dispatch_type,
            options: dispatchList || [],
            error: validationError?.dispatch_type,
            helperText: validationError?.dispatch_type,
            onChange: (e) => handleDispatchChange(e, 'dispatch_type'),
            disabled: (purchaseDetails.status !== "1" && purchaseDetails.status !== "2"),
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload9 = [
        {
            label: 'Dispatch count*',
            type: 'number',
            value: purchaseDetails.dispatch_count === '' ? purchaseDetails.item_dispatch?.length : purchaseDetails.dispatch_count,
            error: validationError?.dispatch_count,
            helperText: validationError?.dispatch_count,
            onChange: (e) => handleDispatchCountChange(e, 'dispatch_count'),
            disabled: (purchaseDetails.status !== "1" && purchaseDetails.status !== "2"),
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload10 = [
        {
            label: 'Taxes & Duties',
            type: 'input',
            value: purchaseDetails.taxes_duties || '',
            onChange: (e) => handleChange(e, 'taxes_duties'),
        },
        {
            label: 'Mode of transport',
            type: 'input',
            value: purchaseDetails.mode_of_transport || '',
            onChange: (e) => handleChange(e, 'mode_of_transport'),
        },
        {
            label: 'Transit insurance',
            type: 'input',
            value: purchaseDetails.transit_insurance || '',
            onChange: (e) => handleChange(e, 'transit_insurance'),
        },
        {
            label: 'Packing & Forwarding',
            type: 'input',
            value: purchaseDetails.packing_forwarding || '',
            onChange: (e) => handleChange(e, 'packing_forwarding'),
        }
    ]

    const payload15 = [
        {
            label: 'Purchase type',
            type: 'select',
            value: purchaseDetails.supplier_type_id === "1002" ? 'Fixed' : purchaseDetails.purchase_type || '',
            options: purchaseTypeList || [],
            disabled: purchaseDetails.supplier_type_id === "1002" ? true : false,
            onChange: (e) => handleChange(e, 'purchase_type'),
        },
        {
            label: 'Terminal month',
            type: 'datePicker',
            value: purchaseDetails.terminal_month || null,
            onChange: (e) => handleDateChange(e, 'terminal_month'),
        },
    ]

    const payload36 = [
        {
            label: 'Fixation date',
            type: 'datePicker',
            value: purchaseDetails.fixation || null,
            onChange: (e) => handleDateChange(e, 'fixation'),
        }
    ]

    const payload11 = [
        {
            label: 'Booked terminal Rate',
            type: 'float',
            value: purchaseDetails.booked_terminal_rate === undefined ? '' : purchaseDetails.booked_terminal_rate,
            onChange: (e) => handleChange(e, 'booked_terminal_rate'),
        },
        {
            label: 'Booked differential',
            type: 'float',
            value: purchaseDetails.purchase_type === 'Fixed' ? '0' : purchaseDetails.booked_differential === undefined ? '' : purchaseDetails.booked_differential,
            disabled: purchaseDetails.purchase_type === 'Fixed' ? true : false,
            onChange: (e) => handleBDChange(e, 'booked_differential'),
        },
        {
            label: 'Fixed terminal Rate',
            type: 'float',
            value: purchaseDetails.fixed_terminal_rate === undefined ? '' : purchaseDetails.fixed_terminal_rate,
            onChange: (e) => handleFTRChange(e, 'fixed_terminal_rate'),
        },
        {
            label: 'Fixed differential',
            type: 'float',
            value: purchaseDetails.purchase_type === 'Fixed' ? '0' : purchaseDetails.fixed_differential === undefined ? '' : purchaseDetails.fixed_differential,
            disabled: purchaseDetails.purchase_type === 'Fixed' ? true : false,
            onChange: (e) => handleFDChange(e, 'fixed_differential'),
        },
        {
            label: "Purchase price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id?.value] ? " (" + currencyCodes[purchaseDetails.currency_id?.value] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails.purchase_price || '',
            required: true,
            error: validationError?.purchase_price,
            helperText: validationError?.purchase_price,
            onChange: (e) => handlePurchasePriceChange(e, 'purchase_price'),
        },
        {
            label: "Market price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id?.value] ? " (" + currencyCodes[purchaseDetails.currency_id?.value] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails.market_price || '',
            required: true,
            error: validationError?.market_price,
            helperText: validationError?.market_price,
            onChange: (e) => handleMPChange(e, 'market_price'),
        },
        {
            label: 'PO margin',
            type: 'float',
            value: purchaseDetails.po_margin || '',
            onChange: (e) => handleChange(e, 'po_margin'),
        },
        {
            label: "Total price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id?.value] ? " (" + currencyCodes[purchaseDetails.currency_id?.value] + "/MT)" : "") : ' (USD/MT)'),
            type: 'float',
            value: purchaseDetails.totalPrice || '',
            required: true,
            error: validationError?.totalPrice,
            helperText: validationError?.totalPrice,
            onChange: (e) => handleChange(e, 'totalPrice'),
        },

    ]

    const payload14 = [
        {
            label: 'Terminal (USD)',
            type: 'float',
            value: purchaseDetails.terminalPrice || '',
            onChange: (e) => handleChange(e, 'terminalPrice'),
        },
        // {
        //     label: 'Market price (INR/KG)',                                                         
        //     type: 'float',           
        //     value: purchaseDetails.marketPriceInr || '',                                   
        //     onChange: (e) => handleChange(e, 'marketPriceInr'),
        // }, 
        {
            label: 'Purchase price (INR/KG)*',
            type: 'float',
            required: true,
            error: validationError?.purchasePriceInr,
            helperText: validationError?.purchasePriceInr,
            value: purchaseDetails.purchasePriceInr || '',
            onChange: (e) => handlePurchasePriceInrChange(e, 'purchasePriceInr'),
        },
        {
            label: 'Gross price (INR)',
            type: 'float',
            value: purchaseDetails.grossPrice || '',
            onChange: (e) => handleChange(e, 'grossPrice'),
        },
        {
            label: 'PO Value (INR)',
            type: 'float',
            value: purchaseDetails.totalPrice || '',
            onChange: (e) => handleChange(e, 'totalPrice'),
        },
    ]

    const payload12 = [
        {
            label: 'SGST (%)',
            type: 'float',
            value: purchaseDetails.sgst,
            error: validationError?.sgst,
            helperText: validationError?.sgst,
            onChange: (e) => handleTaxChange(e, 'sgst'),
        },
        {
            label: 'CGST (%)',
            type: 'float',
            value: purchaseDetails.cgst,
            error: validationError?.cgst,
            helperText: validationError?.cgst,
            onChange: (e) => handleTaxChange(e, 'cgst'),
        },
        {
            label: 'IGST (%)',
            type: 'float',
            value: purchaseDetails.igst,
            onChange: (e) => handleTaxChange(e, 'igst'),
        }
    ];

    const handleincotermsidChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'incotermsid': value
        }
        setPurchaseDetails(data);
    };
    const handleinsuranceChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'insurance': value
        }
        setPurchaseDetails(data);
    };
    const handleoriginChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'origin': value
        }
        setPurchaseDetails(data);
    };
    const handleportsChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'ports': value
        }
        setPurchaseDetails(data);
    };
    const handlemode_of_transportChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'mode_of_transport': value
        }
        setPurchaseDetails(data);
    };
    const handlecontainer_typeChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'container_type': value
        }
        setPurchaseDetails(data);
    };
    const handleChangeotherCharges = (event, value) => {
        let data = {
            ...purchaseDetails,
            'otherCharges': value
        }
        setPurchaseDetails(data);
    };

    const payload13 = [
        {
            label: 'Incoterm',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.incotermsid,
            options: incoterms || [],
            onChange: handleincotermsidChange,
        },
        {
            label: 'Origin',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.origin,
            options: originList || [],
            onChange: handleoriginChange,
        },
        {
            label: 'Port of loading',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.ports,
            options: loadingPortList || [],
            onChange: handleportsChange,
        },
        {
            label: 'Mode of transport',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.mode_of_transport,
            options: transportList || [],
            onChange: handlemode_of_transportChange,
        },
        {
            label: 'Insurance',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.insurance,
            options: insuranceList || [],
            onChange: handleinsuranceChange,
        },
        {
            label: 'Place of destination',
            type: 'input',
            value: purchaseDetails.place_of_destination,
            onChange: (e) => handleChange(e, 'place_of_destination'),
        },
        {
            label: 'Forwarding',
            type: 'input',
            value: purchaseDetails.forwarding,
            onChange: (e) => handleChange(e, 'forwarding'),
        },
        {
            label: 'Currency',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.currency_id,
            options: currency || [],
            onChange: handlecurrencyChange,
        },
        {
            label: 'No of bags',
            type: 'input',
            value: purchaseDetails.no_of_bags,
            onChange: (e) => handleChange(e, 'no_of_bags'),
        },
        {
            label: 'Net weight',
            type: 'input',
            value: purchaseDetails.net_weight,
            onChange: (e) => handleChange(e, 'net_weight'),
        },
        {
            label: 'No of containers',
            type: 'number',
            value: purchaseDetails.no_of_containers,
            onChange: (e) => handleChange(e, 'no_of_containers'),
        },
        {
            label: 'Payment terms',
            type: 'input',
            rows: 3,
            multiline: true,
            value: purchaseDetails.payment_terms,
            onChange: (e) => handleChange(e, 'payment_terms'),
        },
        {
            label: 'Container type',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.container_type,
            options: containerTypes || [],
            onChange: handlecontainer_typeChange,
        },
        {
            label: 'Comments',
            type: 'input',
            rows: 3,
            multiline: true,
            value: purchaseDetails.comments,
            onChange: (e) => handleChange(e, 'comments'),
        },
    ]
    const payload18 = [
        {
            label: 'Other charges',
            type: 'autocomplete',
            labelprop: 'label',
            value: otherCharges.item || '',
            options: chargesList || [],
            //    className: classes.modalSelect,             
            // onChange: (e) => handleChange(e, 'otherCharges'),
            onChange: handleOtherChargesChange,
            sm: 6
        },
        {
            label: purchaseDetails.supplier_type_id === '1002' ? 'Rate(INR)' : 'Rate',
            type: 'number',
            value: otherCharges.rate || '',
            className: classes.otherModal,
            // onChange: (e) => handleRateChange(e, 'rate'),
            onChange: (e) => handleOtherRateChange(e, 'rate'),
            sm: 6
        },
    ]

    const payload19 = [
        {
            label: 'Other charges',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.otherCharges || '',
            options: chargesList || [],
            onChange: handleChangeotherCharges,
            // onChange: (e) => handleOtherChargesChange(e, 'item'), 
            sm: 6
        },
        {
            label: purchaseDetails.supplier_type_id === '1002' ? 'Rate(INR)' : 'Rate',
            type: 'number',
            value: purchaseDetails.rate || '',
            className: classes.otherModal,
            onChange: (e) => handleRateChange(e, 'rate'),
            // onChange: (e) => handleOtherRateChange(e, 'rate'),
            sm: 6
        },
    ]

    const payload20 = [
        {
            label: 'Comments',
            type: 'input',
            rows: 4,
            multiline: true,
            value: purchaseDetails.comments || '',
            onChange: (e) => handleChange(e, 'comments'),
            md: 6,
            sm: 6,
            xs: 6
        },
    ]

    const gcTableColumns = [
        { id: 'composition_name', label: 'Item', },
        { id: 'composition_rate', label: 'Composition' }
    ];

    const dispatchTableColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'dispatch_quantity', label: 'Dispatch Quantity(Kgs)', isEditable: true, type: 'number' },
        { id: 'date', label: 'Dispatch Date', isEditable: true, type: 'date' }
    ];

    const displaydispatchTableColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'dispatch_quantity', label: 'Dispatch Quantity(Kgs)' },
        { id: 'dispatch_date', label: 'Dispatch Date' }
    ];

    const gcTableVendorPriceColumns = [
        { id: 'po_no', label: 'PO NO' },
        { id: 'po_createddt', label: 'PO Date' },
        { id: 'vendor_name', label: 'Vendor' },
        { id: 'price', label: 'Price' }
    ];

    const gcTableOtherVendorPriceColumns = [
        { id: 'po_no', label: 'PO NO' },
        { id: 'po_createddt', label: 'PO Date' },
        { id: 'vendor_name', label: 'Vendor' },
        { id: 'price', label: 'Price' }
    ];

    const taxColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'mrin_date', label: 'MRIN Date' },
        { id: 'cgst_per', label: 'Tax (%)' },
    ];

    const mrinTableColumns = [
        { id: 'mrin_date', label: 'Date' },
        { id: 'mrin_no', label: 'MRIN' },
        { id: 'dispatch', label: 'Dispatch' },
        { id: 'expectedqty', label: 'Expected(Kgs)' },
        { id: 'deliveredqty', label: 'Delivered(Kgs)' },
        { id: 'balance_quantity', label: 'Balance Quantity(Kgs)' },
        { id: 'related_detid', label: 'Parent dispatch' },
        { id: 'apStatus', label: 'AP Status' },
        { id: 'qcStatus', label: 'QC Status' },
    ];

    const ocTableColumns = [
        { id: 'label', label: 'Item' },
        { id: 'rate', label: 'Rate', type: "number" },//isEditable: true
        { id: 'delete', label: 'Delete', isEditable: true, type: "button", handler: { handleClick } }
    ]
    const calculateTotalPrice = (data, otherChargesList = []) => {
        const otherCharge = (otherChargesList).reduce((total, current) => {
            total = total + parseFloat(current.rate || 0);
            return total;
        }, 0)
        const amount = parseFloat(data.purchasePriceInr || 0) * parseFloat(data.po_qty || 0);
        const tax = parseFloat(data.cgst || 0) + parseFloat(data.sgst || 0) + parseFloat(data.igst || 0);
        const taxedPrice = (amount + (amount * tax / 100));
        return taxedPrice + parseFloat(otherCharge);
    }
    const OtherChargesAction = async () => {
        let state = [...otherChargesList];
        var matchIndex = state.findIndex(function (s) {
            return s.name === otherCharges.item?.value;
        });
        if (matchIndex >= 0) {
            state[matchIndex].rate = otherCharges.rate;
        } else {
            state.push({ "name": otherCharges.item?.value, "label": otherCharges.label, "rate": otherCharges.rate });
        }
        let data = { ...purchaseDetails };
        // eslint-disable-next-line
        state.map((item, index) => {
            data[item.name] = item.rate;
        })
        const totalPrice = calculateTotalPrice(data, state)
        await setPurchaseDetails({ ...data, totalPrice });
        setOtherChargesList(state);
        setOpenOtherCharges(!openOtherCharges)
        // rateUpdate(state?.map(row => parseInt(row["rate"])).reduce((sum, i) => sum + i, 0));
    }

    const otherChargesHandler = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">Other Charges</h2>
            <Grid id="top-row" container>
                <Grid id="top-row" xs={6} md={12} container direction="column">
                    <Template payload={payload18} />
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
                    <Button label="Add" onClick={OtherChargesAction} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => setOpenOtherCharges(!openOtherCharges)} />
                </Grid>
            </Grid>
        </Container>
    );
    const approvePo = async (e) => {
        try {
            let status = parseInt(purchaseDetails.status) === 1 ? "changeToPendingStatus" : parseInt(purchaseDetails.status) === 3 ? "changeToclosedStatus" : "changeToInprogessStatus";
            let response = await updateGCPoStatus({
                "type": status,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "po_id": purchaseDetails.poid
            });
            if (response) {
                setSnack({
                    open: true,
                    message: parseInt(purchaseDetails.status) === 1 ? "PO sent for request approval" : parseInt(purchaseDetails.status) === 3 ? "PO closed successfully" : "PO approved successfully",
                });
                setTimeout(() => {
                    props.back("purchase_edit", parseInt(purchaseDetails.status) === 1 ? "pendingwithapprovalpos" : parseInt(purchaseDetails.status) === 3 ? "closedpos" : "inprogresspos")
                }, 2000)
            }
        } catch (e) {
            setSnack({
                open: true,
                message: e.message,
                severity: 'error',
            })
        }
    }

    const sendEmail = async (e) => {
        try {
            let response = await updateGCPoStatus({
                "notify_email": true,
                "vendor_email": JSON.parse(localStorage.getItem('preference')).name,
                po_id: purchaseDetails.poid,
            });
            if (response) {
                setSnack({
                    open: true,
                    message: "Email Sent Successfully"
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

    const purchaseSteps = ['Req Approval', 'Approve', 'In Progress', 'Shipped', 'Close Order'];

    const dispatchInfo = () => (
        <Container className={classes.popover}>
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Dispatch information</Typography>
                </Grid>
            </Grid>
            <DispatchList data={dispatchTableData} mrin={mrinTableData} dispatchDetails={(event, data) => ShowDispatchDetailsHandler(event, data)} />
        </Container>
    );

    const ShowDispatchDetailsHandler = (event, data) => {
        setShowDispatchDetails(true);
        setDispatchDetails(data)
    };

    const HideDispatchDetailsHandler = (event, data) => {
        setShowDispatchDetails(false);
    };

    let component;
    if (showDispatchDetails) {
        component = <DispatchDetails details={dispatchDetails} expComposition={purchaseDetails.gcCompositions} back={HideDispatchDetailsHandler}></DispatchDetails>
    } else {
        component = (
            <form className={classes.root} noValidate autoComplete="off">
                {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
                <Card className="page-header">
                    <CardHeader
                        title=" Purchase Order Details"
                        className='cardHeader'
                    />
                    <CardContent>
                        <Grid container md={12}>
                            <Grid container md={8}>
                                <Grid item md={4} xs={12} >
                                    <Typography variant="h7">PO no</Typography>
                                    <Typography>{props.id}</Typography>
                                </Grid>
                                <Grid item md={4} xs={12}>
                                    <Typography variant="h7">PO date</Typography>
                                    <Typography>{formatDate((purchaseDetails?.po_date))}</Typography>
                                </Grid>
                                <Grid item md={4} xs={12}>
                                    <Typography variant="h7">PO category</Typography>
                                    <Typography>{(purchaseDetails?.po_category)}</Typography>
                                </Grid>
                            </Grid>
                            {parseInt(purchaseDetails.status) === 1 &&
                                <Grid container md={4} justify="flex-end" style={{ display: 'flex' }}>
                                    <Grid item>
                                        <Button label="Request Approval" onClick={approvePo} />
                                    </Grid>
                                </Grid>
                            }
                            {parseInt(purchaseDetails.status) === 2 &&
                                <Grid container md={4} justify="flex-end" style={{ display: 'flex' }}>
                                    <Grid item>
                                        <Button label="Approve" onClick={approvePo} />
                                    </Grid>
                                </Grid>
                            }
                            {(parseInt(purchaseDetails.status) === 3 || parseInt(purchaseDetails.status) === 4) &&
                                <Grid container md={2} justify="flex-end" style={{ display: 'flex' }}>
                                    <Grid item>
                                        <Button label="Send Email" onClick={sendEmail} />
                                    </Grid>
                                </Grid>
                            }
                            {parseInt(purchaseDetails.status) === 4 && stepProgress === "100%" &&
                                <Grid container md={2} justify="flex-end" style={{ display: 'flex' }}>
                                    <Grid item>
                                        <Button label="Close Order" onClick={approvePo} />
                                    </Grid>
                                </Grid>
                            }
                        </Grid>
                        <Grid container md={12}>
                            <Grid item md={3} xs={6} >
                                <SimplePopper linkLabel="Dispatch information" body={dispatchInfo} linkRef={dispatchInfoRef}></SimplePopper>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Card className="page-header">
                    <CardContent>
                        <Grid container md={12}>
                            <Grid item md={12} xs={12} >
                                {activeStep !== -1 ?
                                    <SimpleStepper activeStep={activeStep} completeStep={activeStep} steps={purchaseSteps} activeStepProgress={stepProgress}></SimpleStepper> : 'Loading ...'
                                }
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container >
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Purchase order information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={12}>
                                <Template payload={payload} />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <Template payload={payload17} />
                                {
                                    showContractInfo && <Template payload={payload16} />
                                }
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Vendor/Supplier information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Template payload={payload1} />
                    </AccordionDetails>
                </Accordion>
                {
                    purchaseDetails.supplier_type_id === "1002" &&
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Currency & Advance information</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Template payload={payload2} />
                        </AccordionDetails>
                    </Accordion>
                }
                {
                    purchaseDetails.supplier_type_id === "1001" &&
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Currency & Incoterms</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Template payload={payload13} />
                        </AccordionDetails>
                    </Accordion>
                }
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Billing & Delivery information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Template payload={payload3} />
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Green coffee information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={6}>
                                <Template payload={payload4} />
                                {
                                    showQuoteInfo &&
                                    <Template payload={payload5} />
                                }
                                {
                                    purchaseDetails.item_id &&
                                    <Template payload={payload7} />
                                }
                                {
                                    showDispatchInfo &&
                                    <Template payload={payload8} />
                                }
                                {
                                    showNoDispatchInfo &&
                                    <Template payload={payload9} />
                                }
                                {
                                    showDispatchTableInfo &&
                                    <Grid item style={{ marginTop: 15 }}>
                                        <BasicTable rows={dispatchTableData} columns={purchaseDetails.status === "1" || purchaseDetails.status === "2" ? dispatchTableColumns : displaydispatchTableColumns} hasTotal={purchaseDetails.status === "1" || purchaseDetails.status === "2" ? true : false} totalColId="dispatch_quantity" onUpdate={dispatchDataUpdate}></BasicTable>
                                    </Grid>
                                }

                                {
                                    purchaseDetails.gcType &&
                                    <Grid item style={{ marginTop: 15, marginRight: 30 }}>
                                        <Accordion defaultExpanded={true}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                                                <Grid id="top-row" container>
                                                    <Grid item md={12} xs={12} className='item'>
                                                        <Typography>Specification information</Typography>
                                                    </Grid>
                                                </Grid>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <BasicTable rows={purchaseDetails.gcCompositions} columns={gcTableColumns} hasTotal={false}></BasicTable>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Grid>
                                }


                            </Grid>
                            <Grid item md={6} xs={6}>
                                {
                                    purchaseDetails.item_id &&
                                    <>
                                        <Grid item md={12} xs={12} className='item' style={{ marginRight: 25 }}>
                                            <Typography>Historical price data for selected vendor</Typography>
                                        </Grid>
                                        <BasicTable rows={vendorPriceList} columns={gcTableVendorPriceColumns}></BasicTable>
                                    </>
                                }
                                {
                                    purchaseDetails.item_id &&
                                    <>
                                        <Grid item md={12} xs={12} className='item' style={{ marginRight: 25 }}>
                                            <Typography>Historical price data for other vendors</Typography>
                                        </Grid>
                                        <BasicTable rows={otherVendorPriceList} columns={gcTableOtherVendorPriceColumns}></BasicTable>
                                    </>
                                }
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded={true} ref={dispatchInfoRef}>
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
                    purchaseDetails.item_id && purchaseDetails.supplier_type_id === "1002" &&
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Previous tax information</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <BasicTable rows={mrinList} columns={taxColumns}></BasicTable>
                        </AccordionDetails>
                    </Accordion>
                }
                {
                    purchaseDetails.supplier_type_id === "1002" &&
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Tax information</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Template payload={payload12} />
                        </AccordionDetails>
                    </Accordion>
                }
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Other charges</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid item md={12} xs={12}>
                            {purchaseDetails.supplier_type_id === "1002" &&
                                <>
                                    <Grid md={12} xs={12} justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                                        <Button label="Add Other Charges" onClick={() => setOpenOtherCharges(!openOtherCharges)} />
                                    </Grid>
                                    <BasicTable rows={(otherChargesList)} columns={ocTableColumns} hasTotal={true} totalColId="rate" onUpdate={rateUpdate}></BasicTable>
                                </>}
                            {purchaseDetails.supplier_type_id === "1001" && <Template payload={payload19} />}
                            {/* <Template payload={payload18 }/> */}
                            {purchaseDetails.supplier_type_id === "1002" && <Template payload={payload20} />}
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Price information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container md={12} xs={12}>
                            <Grid item md={12} xs={12}>
                                <Template payload={payload15} />
                                {
                                    purchaseDetails.supplier_type_id === "1001" &&
                                    <Template payload={payload11} />
                                }
                                {
                                    purchaseDetails.purchase_type === 'Differential' &&
                                    <Template payload={payload36} />
                                }
                                {
                                    purchaseDetails.supplier_type_id === "1002" &&
                                    <Template payload={payload14} />
                                }
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {purchaseDetails.supplier_type_id !== "1001" && (
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Other information</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Template payload={payload10} />
                        </AccordionDetails>
                    </Accordion>
                )}


                {/* {purchaseDetails.supplier_type_id === "1001" &&
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Document information</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <DocumentList data={documents} edit={true} uploadFile={(event, fileContent, docName, fileName) => uploadFileHandler(event, fileContent, docName, fileName)} downloadFile={(event, fileName, docName) => downloadFileHandler(event, fileName, docName)} deleteFile={(event, fileName) => deleteFileHandler(event, fileName)} />
                        </AccordionDetails>
                    </Accordion>
                } */}
                {purchaseDetails.supplier_type_id === "1001" && (
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Documents Required</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Template payload={payload21} />
                        </AccordionDetails>
                    </Accordion>
                )}
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Audit log information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <AuditLog data={logData} />
                    </AccordionDetails>
                </Accordion>

                <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                    <Grid item>
                        <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={createPurchaseAction} />
                    </Grid>
                    <Grid item>
                        <Button label="Cancel" onClick={props.back} />
                    </Grid>
                </Grid>
                <SimpleModal open={validationModal} handleClose={() => setValidationModal(!validationModal)} body={createAction} />
                <SimpleModal open={openOtherCharges} handleClose={() => setOpenOtherCharges(!openOtherCharges)} body={otherChargesHandler} />
            </form>
        )
    }
    return (<>
        {component}
    </>
    )
}
export default EditPurchaseOrder;