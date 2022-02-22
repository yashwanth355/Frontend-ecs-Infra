import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Accordion, AccordionSummary, AccordionDetails, Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import { getPOCreationInfo, getPoCreationInfo, getQuotesInfo, createGCPurchaseOrders, getGCApprovedQuotes, getTopApprovedPOs, getTopMrinDetails, getPortAndOriginForPo, getBalQuoteQtyForPoOrder } from '../../../apis';
import Snackbar from '../../../components/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import BasicTable from '../../../components/BasicTable';
import useToken from '../../../hooks/useToken';
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

const CreatePurchaseOrder = (props) => {
    const documents = ["Invoice", "Packing List", "Bill of Lading", "Phytosanitory Certificate",
        "Fumigation Certificate", "Certificate of Origin", "ICO Certificate of Origin", "Weight Certificate", "Quality Certificate", "Inspection and Stuffing Certificate", "Bill of Entry",
        "Dispatch Note"]
    const classes = useStyles();
    const [purchaseDetails, setPurchaseDetails] = useState({});
    const [validationError, setValidationError] = useState({});
    const [supplier, setSupplier] = useState(null);
    const [greencType, setgreencType] = useState(null);
    const [disableSupplier, setDisableSupplier] = useState(true);
    const [validationModal, setValidationModal] = useState(false);
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
    const [currency, setCurrency] = useState([]);
    const [categorySelectedType, setCategorySelectedType] = useState('');
    const [containerTypes, setContainerTypes] = useState([]);
    const [incoterms, setIncoTerms] = useState([]);
    const [loadingPortList, setLoadingPortList] = useState([]);
    const [originList, setOriginList] = useState([]);
    const [chargesList, setChargesList] = useState([]);
    const [transportList, setTransportList] = useState([]);
    const [insuranceList, setInsuranceList] = useState([]);
    const [showQuoteInfo, setShowQuoteInfo] = useState(false);
    const [showCategory, setShowCategory] = useState(true);
    const [showContractInfo, setShowContractInfo] = useState(false);
    const [showDispatchInfo, setShowDispatchInfo] = useState(false);
    const [showNoDispatchInfo, setShowNoDispatchInfo] = useState(false);
    const [showDispatchTableInfo, setShowDispatchTableInfo] = useState(false);
    const [confirmationCatChange, setConfirmationCatChange] = useState(false);
    const [currencyCodes, setCurrencyCodes] = useState([]);
    const [purchase_qty, setPurchase_qty] = useState('0');
    const [dispatchTotal, setDispatchTotal] = useState('0');
    const [openOtherCharges, setOpenOtherCharges] = useState(false);
    const [otherChargesList, setOtherChargesList] = useState([]);
    const [otherCharges, setOtherCharges] = useState({});
    const [documentsection, setDocumentSection] = useState(documents.map(val => {
        return {
            doc_kind: val,
            required: false,
        }
    }));
    // const [otherChargesRate, setOtherChargesRate] = useState(""); 
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [errorValidationMessage, setErrorValidationMessage] = useState("Please check and give mandatory fields to save");
    const [loading, setLoading] = useState(false);
    const { getCurrentUserDetails } = useToken();

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
        getPOCreationInfo({ "type": "greencoffee", item_type: event.target.value, po_subcategory: purchaseDetails.type === '1002' ? 'Domestic' : 'Import' }).then(res => {
            setgcTypeList(res === null ? [] : res);
        });

        if (purchaseDetails.gcType !== undefined && purchaseDetails.gcType !== '') {
            setCategorySelectedType(event.target.value)
            setConfirmationCatChange(true);
            return
        } else {
            let data = {};
            if (event.target.value === "ORM") {
                data = {
                    ...purchaseDetails,
                    [key]: event.target.value,
                    "bookedTerminalRate": purchaseDetails.purchasePrice,
                    "bookedDifferential": 0,
                    "fixedTerminalRate": purchaseDetails.purchasePrice,
                    "fixedDifferential": 0
                }
            } else {
                data = {
                    ...purchaseDetails,
                    [key]: event.target.value
                }
            }
            setPurchaseDetails(data);
        }
    };

    const clearGreenCoffee = () => {
        setgreencType(null);
        let data = {};
        if (categorySelectedType === "ORM") {
            data = {
                ...purchaseDetails,
                "category": categorySelectedType,
                "bookedTerminalRate": purchaseDetails.purchasePrice,
                "bookedDifferential": 0,
                "fixedTerminalRate": purchaseDetails.purchasePrice,
                "fixedDifferential": 0,
                "gcType": '',
                "gcCompositions": [],
                "quotation": '',
                "quotationDate": null
            }
        } else {
            data = {
                ...purchaseDetails,
                'category': categorySelectedType,
                "gcType": '',
                "gcCompositions": [],
                "quotation": '',
                "quotationDate": null
            }
        }

        setPurchaseDetails(data);
        setShowQuoteInfo(false);
        setShowDispatchInfo(false);
        setShowNoDispatchInfo(false);
        setShowDispatchTableInfo(false);
        setConfirmationCatChange(!confirmationCatChange)
    }

    const handleTypeChange = (event, key) => {

        getPOCreationInfo({ "type": "greencoffee", item_type: purchaseDetails.category, po_subcategory: event.target.value === '1002' ? 'Domestic' : 'Import' }).then(res => {
            res === null ? setgcTypeList([]) : setgcTypeList(res);
        });
        let datas = {
            // ...purchaseDetails,
            // "gcType": '',
            // "gcCompositions": [],
            // "quotation": '',
            // "quotationDate": null,
            [key]: event.target.value,
            // "supplierName": '',
            // "supplierId": '',
            // "supplierAddress": '',
            "currency": event.target.value === '1002' ? 'HO-101' : '',
            "importCurrency": event.target.value === '1001' ? 'HO-102' : ''
        }
        setPurchaseDetails(datas);
        setgreencType(null);
        setShowQuoteInfo(false);
        setShowDispatchInfo(false);
        setShowNoDispatchInfo(false);
        setShowDispatchTableInfo(false);

        getPOCreationInfo({ "type": "allsuppliers", "supplier_type_id": event.target.value }).then(res => {
            if (res)
                setSupplierList(res);
        });
        // let data = {
        //     ...purchaseDetails,
        //     [key]: event.target.value,           
        //     "supplierName": '',
        //     "supplierId": '',
        //     "supplierAddress": '',
        //     "currency": event.target.value === '1002' ? 'HO-101' : ''
        // }
        // setPurchaseDetails(data);
        setSupplier(null);
        setShowCategory(false);
        setDisableSupplier(false);
        if (event.target.value === "1001") {
            setShowContractInfo(true);
        } else {
            setShowContractInfo(false);
        }
    };

    const formatPriceInfo = (payload = []) => {
        payload?.forEach(element => {
            element.po_createddt = element.po_createddt ? formatDate(element.po_createddt) : '';
            element.price = element.price ? parseFloat(element.price).toFixed(2) : '';
        })
    };

    const handleSupplierChange = async (event, value) => {
        if (!value) {
            setSupplier(null);
            let data = {
                ...purchaseDetails,
                "supplierName": '',
                "supplierId": '',
                "supplierAddress": ''
            }
            setPurchaseDetails(data);
            return;
        }
        setSupplier(value);
        setgreencType(null);
        let temp = {
            ...purchaseDetails,
            "gcType": '',
            "gcCompositions": [],
            "quotation": '',
            "quotationDate": null
        }
        // setPurchaseDetails(data);
        setShowQuoteInfo(false);
        setShowDispatchInfo(false);
        setShowNoDispatchInfo(false);
        setShowDispatchTableInfo(false);

        getPOCreationInfo({ "type": "supplierinfo", "supplier_id": value.supplier_id }).then(res => {
            let data = {
                ...temp,
                "supplierName": res.supplier_name,
                "supplierId": res.supplier_id,
                "supplierAddress": res.supplier_address,
                "currency": res.supplier_type === "Domestic" ? "HO-101" : '',
            }
            setPurchaseDetails(data);
            getTopApprovedPOs({
                "type": "top3apprPosforselectedvendor",
                "vendor_id": value.supplier_id,
                "gcitem_id": ''
            }).then(res => {
                formatPriceInfo(res);
                setVendorPriceList((res));
            });
        });
    };

    const handleAddressChange = (event, key,) => {
        let data = {};
        if (key === "billingAt") {
            let res = billingAddressList.find(loc => loc.billing_at_id === event.target.value)
            data = {
                ...purchaseDetails,
                [key]: event.target.value,
                "billingAddress": res.billing_at_address
            }
        } else if (key === "deliveryAt") {
            let res = deliveryAddressList.find(loc => loc.delivery_at_id === event.target.value)
            data = {
                ...purchaseDetails,
                [key]: event.target.value,
                "deliveryAddress": res.delivery_at_address
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

    const handleGCTypeChange = (event, value) => {
        let data;
        if (!value) {
            setgreencType(null);

            data = {
                ...purchaseDetails,
                "gcType": '',
                "gcCompositions": [],
                "quotation": '',
                "quotationDate": null
            }
            setPurchaseDetails(data);
            setShowQuoteInfo(false);
            setShowDispatchInfo(false);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(false);
            return;
        }

        setgreencType(value);

        getPOCreationInfo({ "type": "gccomposition", "item_id": value.item_id }).then(res => {
            data = {
                ...purchaseDetails,
                "gcType": value.item_id,
                "gcCompositions": res ? formatGCCompositions(res[0]) : null,
                "quotation": '',
                "quotationDate": null,
                "qty": '',
                "price": '',
                "dispatch": '',
                "dispatchCount": ''
            }
            setPurchaseDetails(data);
        });
        setQuoteNumber(null);
        setShowDispatchInfo(false);
        setShowNoDispatchInfo(false);
        setShowDispatchTableInfo(false);
        // console.log("value::", value)
        if (value.gc_type === "speciality") {
            getGCApprovedQuotes({
                "type": "approvedqtlines",
                "gc_type": value.item_id,
                "po_date": currentPODate(),
            }).then(res => {
                setQuotationList(res);
                setShowQuoteInfo(true);
            });
        } else {
            setShowQuoteInfo(false);
        }
        getTopApprovedPOs({
            "type": "top3apprPosforselectedvendor",
            "vendor_id": purchaseDetails.supplierId,
            "gcitem_id": value.item_id
        }).then(res => {
            formatPriceInfo(res);
            setVendorPriceList(res);
        });
        getTopApprovedPOs({
            "type": "top3apprPosforothervendor",
            "vendor_id": purchaseDetails.supplierId,
            "gcitem_id": value.item_id
        }).then(res => {
            formatPriceInfo(res);
            setOtherVendorPriceList(res);
        });
        getTopMrinDetails({
            "type": "topmrinrecord",
            "gcitem_id": value.item_id,
            "po_date": purchaseDetails.poDate || new Date()
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
    const calculateTotalPrice = (data, otherChargesList = []) => {

        const otherCharge = (otherChargesList).reduce((total, current) => {
            total = total + parseFloat(current.rate || 0);
            return total;
        }, 0)
        const amount = parseFloat(data.purchasePriceInr || 0) * parseFloat(data.qty || 0);
        const tax = parseFloat(data.cgst || 0) + parseFloat(data.sgst || 0) + parseFloat(data.igst || 0);
        const taxedPrice = (amount + (amount * tax / 100));
        return taxedPrice + parseFloat(otherCharge);
    }
    const handleQuantityChange = (event, key,) => {
        let totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: event.target.value }, otherChargesList);
        if (purchaseDetails.quotation !== '') {
            if (parseFloat(event.target.value) > parseFloat(purchase_qty) && parseFloat(purchase_qty) !== 0) {
                setValidationError({ ...validationError, "qty": `You cannot enter value more than ${purchase_qty} for this PO` });
                setErrorValidationMessage(`You cannot enter value more than ${purchase_qty} for this PO`);
            } else {
                if (parseFloat(event.target.value) !== parseFloat(dispatchTotal)) {
                    setValidationError({ ...validationError, "qty": 'Total Dispatch Quatity not matches Quantity entered' });
                    setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered')
                } else {
                    if (validationError.qty) {
                        let error = { ...validationError };
                        delete error.qty;
                        setValidationError(error);
                        setValidationModal(false);
                    }
                }
            }
        }
        let data = {
            ...purchaseDetails,
            [key]: event.target.value,
            "grossPrice": (parseFloat(purchaseDetails.purchasePriceInr === undefined ? 0 : purchaseDetails.purchasePriceInr) * parseFloat(event.target.value)),
            "totalPrice": purchaseDetails.type === "1002" ? totalPriceInr :
                ((parseFloat(purchaseDetails.purchasePrice === undefined ? 0 : purchaseDetails.purchasePrice) * parseFloat(event.target.value / 1000)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
        }
        if (event.target.value > 0) {
            setShowDispatchInfo(true);
        } else {
            data = {
                ...data,
                'dispatch': '',
                'dispatchCount': ''
            }
            setShowDispatchInfo(false);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(false);
        }
        setPurchaseDetails(data);
        if (dispatchTableData && showDispatchTableInfo) {
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
        }
    };

    const handleOtherChargesChange = (event, key) => {
        let temp = chargesList.find(data => data.value === event.target.value)
        setOtherCharges({
            ...otherCharges,
            "item": event.target.value,
            "label": temp.label
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
            "totalPrice": purchaseDetails.type === "1002" ? totalPriceInr :
                ((parseFloat(purchaseDetails.purchasePrice === undefined ? 0 : purchaseDetails.purchasePrice) * parseFloat(purchaseDetails.qty / 1000)) + (event.target.value ? parseFloat(event.target.value) : 0)),
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

    const handleFTRChange = (event, key) => {
        let purchasePrice = (parseFloat(event.target.value) + parseFloat(purchaseDetails.bookedDifferential === undefined ? 0 : purchaseDetails.bookedDifferential));
        let marketPrice = (parseFloat(event.target.value) + parseFloat(purchaseDetails.fixedDifferential === undefined ? 0 : purchaseDetails.fixedDifferential));
        let data = {
            ...purchaseDetails,
            "purchasePrice": purchasePrice,
            "marketPrice": marketPrice,
            "poMargin": parseFloat(marketPrice) - parseFloat(purchasePrice),
            "totalPrice": ((parseFloat(purchasePrice) * parseFloat(purchaseDetails.qty === undefined ? 0 : purchaseDetails.qty / 1000)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    };

    const handleBDChange = (event, key) => {
        let purchasePrice = (parseFloat(event.target.value) + parseFloat(purchaseDetails.fixedTerminalRate === undefined ? 0 : purchaseDetails.fixedTerminalRate));
        let data = {
            ...purchaseDetails,
            "purchasePrice": purchasePrice,
            "totalPrice": ((parseFloat(purchasePrice) * parseFloat(purchaseDetails.qty === undefined ? 0 : purchaseDetails.qty / 1000)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
            "poMargin": parseFloat(purchaseDetails.marketPrice === undefined ? 0 : purchaseDetails.marketPrice) - parseFloat(purchasePrice),
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    };

    const handleFDChange = (event, key) => {
        let marketPrice = (parseFloat(event.target.value) + parseFloat(purchaseDetails.fixedTerminalRate === undefined ? 0 : purchaseDetails.fixedTerminalRate));
        let data = {
            ...purchaseDetails,
            "marketPrice": marketPrice,
            "poMargin": parseFloat(marketPrice) - parseFloat(purchaseDetails.purchasePrice === undefined ? 0 : purchaseDetails.purchasePrice),
            [key]: event.target.value
        }
        setPurchaseDetails(data);

    };

    const handleMPChange = (event, key) => {
        let data = {
            ...purchaseDetails,
            "poMargin": (parseFloat(event.target.value) - parseFloat(purchaseDetails.purchasePrice === undefined ? 0 : purchaseDetails.purchasePrice)),
            [key]: event.target.value
        }
        setPurchaseDetails(data);

    };

    const handlePurchasePriceChange = (event, key) => {
        let data = {
            ...purchaseDetails,
            "poMargin": (parseFloat(purchaseDetails.marketPrice === undefined ? 0 : purchaseDetails.marketPrice) - parseFloat(event.target.value)),
            "totalPrice": ((parseFloat(event.target.value) * parseFloat(purchaseDetails.qty === undefined ? 0 : purchaseDetails.qty / 1000)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
            [key]: event.target.value
        }
        setPurchaseDetails(data);

    };

    const handlePurchasePriceInrChange = (event, key) => {
        const totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: event.target.value }, otherChargesList)
        let data = {
            ...purchaseDetails,
            "grossPrice": (parseFloat(event.target.value) * parseFloat(purchaseDetails.qty === undefined ? 0 : purchaseDetails.qty)),
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

    const handlecurrencyChange = (e, value) => {
        let data = {
            ...purchaseDetails,
            'currency': value
        }
        setPurchaseDetails(data);
    }

    const handleDispatchCountChange = (event, key) => {
        let data = {
            ...purchaseDetails,
            [key]: event.target.value
        }
        setPurchaseDetails(data);
        if (event.target.value > 99 || event.target.value < 1) {
            setValidationError({ dispatchCount: 'Please enter valid details: 1 - 99' });
            return;
        } else {
            if (validationError.dispatchCount) {
                let error = { ...validationError };
                delete error.dispatchCount;
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
            tabledata[index] = { "number": (index + 1), "dispatch_quantity": 0, "date": new Date() };
        }
        setDispatchTableData(tabledata);
    };

    const handleQuotationChange = (event, value) => {
        const totalPriceInr = calculateTotalPrice(purchaseDetails, otherChargesList)
        getBalQuoteQtyForPoOrder({ "type": "getBalqtyforPo", "quotation_no": value?.quotation_no }).then((res) => {
            var qty_gc = (res.order_qty === '') ? value?.qty : (value?.qty - res.order_qty);
            setPurchase_qty(qty_gc);
            let data = {
                ...purchaseDetails,
                'quotation': value?.quotation_no,
                'quotationId': value?.quotation_id,
                'quotationDate': value?.quotation_date,
                'price': value?.price,
                'qty': qty_gc,
                "grossPrice": (parseFloat(purchaseDetails.purchasePriceInr === undefined ? 0 : purchaseDetails.purchasePriceInr) * parseFloat(value?.qty)),
                'totalPrice': purchaseDetails.type === "1002" ? totalPriceInr :
                    ((parseFloat(purchaseDetails.purchasePrice === undefined ? 0 : purchaseDetails.purchasePrice) * parseFloat(value?.qty / 1000)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
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
        if (parseFloat(purchaseDetails.qty) !== parseFloat(total)) {
            setValidationError({ ...validationError, "qty": 'Total Dispatch Quatity not matches Quantity entered' });
            setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered')
            return;
        } else {
            if (parseFloat(purchaseDetails.qty) > parseFloat(purchase_qty) && parseFloat(purchase_qty) !== 0) {
                setValidationError({ ...validationError, "qty": `You cannot enter value more than ${purchase_qty} for this PO` });
                setErrorValidationMessage(`You cannot enter value more than ${purchase_qty} for this PO`);
            } else {
                if (validationError.qty) {
                    let error = { ...validationError };
                    delete error.qty;
                    setValidationError(error);
                    setValidationModal(false);
                }
            }
        }
    }

    const rateUpdate = (total, otherChargesList) => {
        const totalPriceInr = calculateTotalPrice(purchaseDetails, otherChargesList)
        let data = {
            ...purchaseDetails,
            'totalPrice': purchaseDetails.type === "1002" ? totalPriceInr :
                ((parseFloat(purchaseDetails.purchasePrice === undefined ? 0 : purchaseDetails.purchasePrice) * parseFloat(purchaseDetails.qty / 1000)) + (total ? parseFloat(total) : 0)),
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


    const formatDate = (datestr) => {
        let dateVal = new Date(datestr);
        return dateVal.getDate() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getFullYear();
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

    const createActionForCatChange = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Confirmation
            </h2>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={6} md={10} container direction="column">
                    If you change PO Category, then Green Coffee Details will reset. <br /><br />
                    Are You want to change PO category?
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Yes" onClick={() => clearGreenCoffee()} />
                </Grid>
                <Grid item>
                    <Button label="No" onClick={() => setConfirmationCatChange(!confirmationCatChange)} />
                </Grid>
            </Grid>
        </Container>
    );

    const currentDate = () => {
        // 2019-07-25 17:31:46.967
        var dateVal = new Date();
        return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate() + " " + dateVal.getHours() + ":" + dateVal.getMinutes() + ":" + dateVal.getSeconds();
    }

    const currentPODate = () => {
        // 2019-07-25 17:31:46.967
        var dateVal = new Date();
        return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate();
    }

    const payload = [
        {
            label: 'PO date',
            type: 'datePicker',
            required: true,
            error: validationError?.poDate,
            helperText: validationError?.poDate,
            value: purchaseDetails.poDate ? purchaseDetails.poDate : currentDate(),
            onChange: (e) => handleDateChange(e, 'poDate'),
            sm: 12
        },
        {
            label: 'PO category *',
            type: 'select',
            value: purchaseDetails.category || '',
            required: true,
            disabled: showCategory,
            error: validationError?.category,
            helperText: validationError?.category,
            options: categoryList || [],
            onChange: (e) => handleCategoryChange(e, 'category'),
            sm: 12
        },
    ]

    const payload17 = [{
        label: 'PO sub category *',
        type: 'select',
        required: true,
        error: validationError?.type,
        helperText: validationError?.type,
        value: purchaseDetails.type || '',
        options: typeList || [],
        onChange: (e) => handleTypeChange(e, 'type'),
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
            disabled: disableSupplier,
            onChange: handleSupplierChange,
        },
        {
            label: 'Supplier id',
            type: 'input',
            disabled: true,
            required: true,
            error: validationError?.supplierId,
            helperText: validationError?.supplierId,
            value: purchaseDetails.supplierId || ''
        },
        {
            label: 'Supplier name',
            type: 'input',
            disabled: true,
            value: purchaseDetails.supplierName || ''
        },
        {
            label: 'Supplier address',
            type: 'input',
            disabled: true,
            rows: 3,
            multiline: true,
            value: purchaseDetails.supplierAddress || ''
        }
    ]

    const payload2 = [
        {
            label: 'Currency',
            type: 'autocomplete',
            labelprop: 'label',
            options: currency || [],
            value: purchaseDetails.currency || '',
            onChange: handlecurrencyChange
        },
        {
            label: 'Advance type',
            type: 'select',
            value: purchaseDetails.advanceType || '',
            options: advanceTypeList || [],
            onChange: (e) => handleChange(e, 'advanceType'),
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
            label: 'NO of days IOM can be generated from date of invoice',
            type: 'number',
            required: true,
            error: validationError?.iom,
            helperText: validationError?.iom,
            value: purchaseDetails.iom || '',
            onChange: (e) => handleChange(e, 'iom'),
        }
    ];

    const payload3 = [
        {
            label: 'Billing at *',
            type: 'select',
            value: purchaseDetails.billingAt || '',
            options: billingAtList || [],
            required: true,
            error: validationError?.billingAt,
            helperText: validationError?.billingAt,
            onChange: (e) => handleAddressChange(e, 'billingAt'),
        },
        {
            label: 'Delivery at *',
            type: 'select',
            value: purchaseDetails.deliveryAt || '',
            options: deliveryAtList || [],
            required: true,
            error: validationError?.deliveryAt,
            helperText: validationError?.deliveryAt,
            onChange: (e) => handleAddressChange(e, 'deliveryAt'),
        },
        {
            label: 'Billing address',
            type: 'input',
            rows: 4,
            multiline: true,
            value: purchaseDetails.billingAddress || '',
            onChange: (e) => handleChange(e, 'billingAddress'),
        },
        {
            label: 'Delivery address',
            type: 'input',
            rows: 4,
            multiline: true,
            value: purchaseDetails.deliveryAddress || '',
            onChange: (e) => handleChange(e, 'deliveryAddress'),
        },
    ];
    const payload4 = [
        {
            label: 'Green coffee type',
            type: 'autocomplete',
            labelprop: 'item_name',
            value: greencType,
            options: gcTypeList || [],
            required: true,
            error: validationError?.gcType,
            helperText: validationError?.gcType,
            onChange: handleGCTypeChange,
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
            md: 12,
            sm: 12,
            xs: 12
        },
        // {
        //     label: 'Quotation Id',                                                         
        //     type: 'input',           
        //     value: purchaseDetails.quotationId || '',
        //     disabled: true,
        //     md: 12,
        //     sm:12,
        //     xs:12
        // },
        {
            label: 'Quotation date',
            type: 'datePicker',
            value: purchaseDetails.quotationDate || null,
            disabled: true,
            md: 12,
            sm: 12,
            xs: 12
        },
        {
            label: 'Price',
            type: 'float',
            value: purchaseDetails.price || '',
            onChange: (e) => handleChange(e, 'price'),
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload7 = [
        {
            label: 'Quantity(Kgs)*',
            type: 'number',
            value: purchaseDetails.qty === 0 ? '0' : purchaseDetails.qty,
            error: validationError?.qty,
            helperText: validationError?.qty,
            onChange: (e) => handleQuantityChange(e, 'qty'),
            md: 12,
            sm: 12,
            xs: 12
        }
    ];

    const payload8 = [
        {
            label: 'Dispatch type*',
            type: 'select',
            value: purchaseDetails.dispatch || '',
            options: dispatchList || [],
            error: validationError?.dispatch,
            helperText: validationError?.dispatch,
            onChange: (e) => handleDispatchChange(e, 'dispatch'),
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload9 = [
        {
            label: 'Dispatch count*',
            type: 'number',
            value: purchaseDetails.dispatchCount || '',
            error: validationError?.dispatchCount,
            helperText: validationError?.dispatchCount,
            onChange: (e) => handleDispatchCountChange(e, 'dispatchCount'),
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload10 = [
        {
            label: 'Taxes & Duties',
            type: 'input',
            value: purchaseDetails.taxesDuties || '',
            onChange: (e) => handleChange(e, 'taxesDuties'),
        },
        {
            label: 'Mode of transport',
            type: 'input',
            value: purchaseDetails.modeOfTransport || '',
            onChange: (e) => handleChange(e, 'modeOfTransport'),
        },
        {
            label: 'Transit insurance',
            type: 'input',
            value: purchaseDetails.transitInsurance || '',
            onChange: (e) => handleChange(e, 'transitInsurance'),
        },
        {
            label: 'Packing & Forwarding',
            type: 'input',
            value: purchaseDetails.packing || '',
            onChange: (e) => handleChange(e, 'packing'),
        }
    ]

    const payload15 = [
        {
            label: 'Purchase type',
            type: 'select',
            value: purchaseDetails.type === "1002" ? 'Fixed' : purchaseDetails.purchaseType || '',
            options: purchaseTypeList || [],
            disabled: purchaseDetails.type === "1002" ? true : false,
            onChange: (e) => handleChange(e, 'purchaseType'),
        },
        {
            label: 'Terminal month',
            type: 'datePicker',
            value: purchaseDetails.terminalMonth || null,
            onChange: (e) => handleDateChange(e, 'terminalMonth'),
        },]

    const payload11 = [
        {
            label: 'Booked terminal rate',
            type: 'float',
            value: purchaseDetails.bookedTerminalRate,
            onChange: (e) => handleChange(e, 'bookedTerminalRate'),
        },
        {
            label: 'Booked differential',
            type: 'float',
            value: purchaseDetails.purchaseType === 'Fixed' ? '0' : purchaseDetails.bookedDifferential === undefined ? '' : purchaseDetails.bookedDifferential,
            disabled: purchaseDetails.purchaseType === 'Fixed' ? true : false,
            onChange: (e) => handleBDChange(e, 'bookedDifferential'),
        },
        {
            label: 'Fixed terminal rate',
            type: 'float',
            value: purchaseDetails.fixedTerminalRate,
            onChange: (e) => handleFTRChange(e, 'fixedTerminalRate'),
        },
        {
            label: 'Fixed differential',
            type: 'float',
            value: purchaseDetails.purchaseType === 'Fixed' ? '0' : purchaseDetails.fixedDifferential === undefined ? '' : purchaseDetails.fixedDifferential,
            disabled: purchaseDetails.purchaseType === 'Fixed' ? true : false,
            onChange: (e) => handleFDChange(e, 'fixedDifferential'),
        },
        {
            label: "Purchase price" + (purchaseDetails.category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails.purchasePrice || '',
            required: true,
            error: validationError?.purchasePrice,
            helperText: validationError?.purchasePrice,
            onChange: (e) => handlePurchasePriceChange(e, 'purchasePrice'),
        },
        {
            label: "Market price" + (purchaseDetails.category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails.marketPrice || '',
            required: true,
            error: validationError?.marketPrice,
            helperText: validationError?.marketPrice,
            onChange: (e) => handleMPChange(e, 'marketPrice'),
        },
        {
            label: 'PO margin',
            type: 'float',
            value: purchaseDetails.poMargin || '',
            onChange: (e) => handleChange(e, 'poMargin'),
        },
        {
            label: "Total price" + (purchaseDetails.category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails.totalPrice || '',
            required: true,
            error: validationError?.totalPrice,
            helperText: validationError?.totalPrice,
            onChange: (e) => handleChange(e, 'totalPrice'),
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

    const payload14 = [
        {
            label: 'Terminal (USD)',
            type: 'float',
            value: purchaseDetails.terminalPrice || '',
            onChange: (e) => handleChange(e, 'terminalPrice'),
            sm: 6
        },
        // {
        //     label: 'Market price (INR/KG)',                                                         
        //     type: 'float',           
        //     value: purchaseDetails.marketPriceInr || '',                                   
        //     onChange: (e) => handleChange(e, 'marketPriceInr'),
        //     sm:6
        // }, 
        {
            label: 'Purchase price (INR/KG)',
            type: 'float',
            value: purchaseDetails.purchasePriceInr || '',
            onChange: (e) => handlePurchasePriceInrChange(e, 'purchasePriceInr'),
            sm: 6
        },
        {
            label: 'Gross price (INR)',
            type: 'float',
            value: purchaseDetails.grossPrice || '',
            onChange: (e) => handleChange(e, 'grossPrice'),
            sm: 6
        },
        {
            label: 'PO Value (INR)',
            type: 'float',
            value: purchaseDetails.totalPrice || '',
            onChange: (e) => handleChange(e, 'totalPrice'),
            sm: 6
        }
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
    ]

    const handleimportCurrencyChange = (e, value) => {
        let data = {
            ...purchaseDetails,
            'importCurrency': value
        }
        setPurchaseDetails(data);
    }

    const handleincotermsidChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'incoterm': value
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
            'portOfLoading': value
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
            'containerType': value
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
            value: purchaseDetails.incoterm,
            options: incoterms || [],
            onChange: handleincotermsidChange
        },
        {
            label: 'Origin',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.origin,
            options: originList || [],
            onChange: handleoriginChange
        },
        {
            label: 'Port of loading',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.portOfLoading,
            options: loadingPortList || [],
            onChange: handleportsChange
        },
        {
            label: 'Mode of transport',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.mode_of_transport,
            options: transportList || [],
            onChange: handlemode_of_transportChange
        },
        {
            label: 'Insurance',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.insurance,
            options: insuranceList || [],
            onChange: handleinsuranceChange
        },
        {
            label: 'Place of destination',
            type: 'input',
            value: purchaseDetails.destination,
            onChange: (e) => handleChange(e, 'destination'),
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
            labelprop: 'label',
            value: purchaseDetails.importCurrency,
            options: currency || [],
            onChange: handleimportCurrencyChange,
        },
        {
            label: 'No of bags',
            type: 'input',
            value: purchaseDetails.noofbags,
            onChange: (e) => handleChange(e, 'noofbags'),
        },
        {
            label: 'Net weight',
            type: 'input',
            value: purchaseDetails.netweight,
            onChange: (e) => handleChange(e, 'netweight'),
        },
        {
            label: 'No of containers',
            type: 'number',
            value: purchaseDetails.noofContainers,
            onChange: (e) => handleChange(e, 'noofContainers'),
        },
        {
            label: 'Payment terms',
            type: 'input',
            rows: 3,
            multiline: true,
            value: purchaseDetails.paymentTerms,
            onChange: (e) => handleChange(e, 'paymentTerms'),
        },
        {
            label: 'Container type',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.containerType,
            options: containerTypes || [],
            onChange: handlecontainer_typeChange
        },
        {
            label: 'Comments',
            type: 'input',
            rows: 3,
            multiline: true,
            value: purchaseDetails.comments,
            onChange: (e) => handleChange(e, 'comments'),
        },
    ];



    const payload20 = [
        {
            label: 'Comments',
            type: 'input',
            rows: 4,
            multiline: true,
            value: purchaseDetails.comments || '',
            onChange: (e) => handleChange(e, 'comments'),
        },
    ]
    const handleDocSectionChange = (label) => {
        console.log("Came inside");
        const tempDocuments = _.cloneDeep(documentsection);
        const index = tempDocuments.findIndex(doc => doc.doc_kind === label);
        console.log("index is", index);
        tempDocuments[index].required = !tempDocuments[index]?.required
        setDocumentSection(tempDocuments);
    }
    console.log('Document section is', documentsection);
    const payload21 = documents.map(document => {
        return {
            label: document,
            type: "checkbox",
            checked: !!documentsection.find(doc => doc.doc_kind === document)?.required,
            onChange: () => handleDocSectionChange(document),

        }
    })
    const payload18 = [
        {
            label: 'Other charges',
            type: 'select',
            value: otherCharges.item,
            options: chargesList || [],
            //  className: classes.modalSelect,         
            // onChange: (e) => handleChange(e, 'otherCharges'), 
            onChange: (e) => handleOtherChargesChange(e, 'item'),
            // sm:12          
        },
        {
            label: purchaseDetails.type === '1002' ? 'Rate(INR)' : 'Rate',
            type: 'number',
            value: otherCharges.rate,
            className: classes.otherModal,
            // onChange: (e) => handleRateChange(e, 'rate'),
            onChange: (e) => handleOtherRateChange(e, 'rate'),
            // sm:12
        },
    ]

    const payload19 = [
        {
            label: 'Other charges',
            type: 'autocomplete',
            labelprop: 'label',
            value: purchaseDetails.otherCharges,
            options: chargesList || [],
            onChange: handleChangeotherCharges
            // onChange: (e) => handleOtherChargesChange(e, 'item'),          
        },
        {
            label: purchaseDetails.type === '1002' ? 'Rate(INR)' : 'Rate',
            type: 'number',
            value: purchaseDetails.rate,
            className: classes.otherModal,
            onChange: (e) => handleRateChange(e, 'rate'),
            // onChange: (e) => handleOtherRateChange(e, 'rate'),
            // sm:12
        },
    ]


    const gcTableColumns = [
        { id: 'composition_name', label: 'Item', },
        { id: 'composition_rate', label: 'Composition' }
    ];

    const dispatchTableColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'dispatch_quantity', label: 'Dispatch quantity(Kgs)', type: 'number', isEditable: true },
        { id: 'date', label: 'Dispatch date', isEditable: true, type: 'date' }
    ];

    const gcTableVendorPriceColumns = [
        { id: 'po_no', label: 'PO NO' },
        { id: 'po_createddt', label: 'PO date' },
        { id: 'vendor_name', label: 'Vendor' },
        { id: 'price', label: 'Price' }
    ];

    const gcTableOtherVendorPriceColumns = [
        { id: 'po_no', label: 'PO NO' },
        { id: 'po_createddt', label: 'PO date' },
        { id: 'vendor_name', label: 'Vendor' },
        { id: 'price', label: 'Price' }
    ];

    const taxColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'mrin_date', label: 'MRIN date' },
        { id: 'cgst_per', label: 'Tax (%)' },
    ];

    const ocTableColumns = [
        { id: 'label', label: 'Item', },
        { id: 'rate', label: 'Rate', type: "number" },//, isEditable: true
        { id: 'delete', label: 'Delete', isEditable: true, type: "button", handler: { handleClick } }
    ]

    const createPurchaseAction = async () => {
        console.log("Purchase details are", purchaseDetails);
        const message = 'Please enter valid details';
        let errorObj = { ...validationError };
        setValidationError(errorObj);
        if (purchaseDetails.type === "1002" && _.isEmpty(purchaseDetails.advance)) {
            errorObj = { ...errorObj, advance: message };
        }
        else {
            delete errorObj.advance
        }
        if (purchaseDetails.type === "1002" && _.isEmpty(purchaseDetails.cgst) && !_.isEmpty(purchaseDetails.sgst)) {
            errorObj = { ...errorObj, cgst: message };
        }
        else {
            delete errorObj.cgst
        }
        if (purchaseDetails.type === "1002" && _.isEmpty(purchaseDetails.sgst) && !_.isEmpty(purchaseDetails.cgst)) {
            errorObj = { ...errorObj, sgst: message };
        }
        else {
            delete errorObj.sgst
        }
        if (purchaseDetails.type !== "1002" && _.isEmpty(purchaseDetails.marketPrice?.toString())) {
            errorObj = { ...errorObj, marketPrice: message };
        }
        else {
            delete errorObj.marketPrice
        }
        if (purchaseDetails.type !== "1002" && _.isEmpty(purchaseDetails.purchasePrice?.toString())) {
            errorObj = { ...errorObj, purchasePrice: message };
        }
        else {
            delete errorObj.purchasePrice
        }
        if (purchaseDetails.type === "1002" && _.isEmpty(purchaseDetails.purchasePriceInr)) {
            errorObj = { ...errorObj, purchasePriceInr: message };
        } else {
            delete errorObj.purchasePriceInr
        }
        if (purchaseDetails.type !== "1002" && _.isEmpty(purchaseDetails.totalPrice?.toString())) {
            errorObj = { ...errorObj, totalPrice: message };
        }
        else {
            delete errorObj.totalPrice
        }
        if (_.isEmpty(purchaseDetails.type)) {
            errorObj = { ...errorObj, type: message };
        }
        else {
            delete errorObj.type
        }
        if (!_.isEmpty(purchaseDetails.gcType) && _.isEmpty(purchaseDetails.qty)) {
            errorObj = { ...errorObj, qty: message };
        }
        else {
            delete errorObj.qty
        }
        if (_.isEmpty(purchaseDetails.gcType)) {
            errorObj = { ...errorObj, gcType: message };
        }
        else {
            delete errorObj.gcType
        }
        if (_.isEmpty(purchaseDetails.category)) {
            errorObj = { ...errorObj, category: message };
        }
        else {
            delete errorObj.category
        }
        if (_.isEmpty(purchaseDetails.dispatch)) {
            errorObj = { ...errorObj, dispatch: message };
        }
        else {
            delete errorObj.dispatch
        }
        if (purchaseDetails.dispatch === 'Multiple' && _.isEmpty(purchaseDetails.dispatchCount)) {
            errorObj = { ...errorObj, dispatchCount: message };
        }
        else {
            delete errorObj.dispatchCount
        }
        if (purchaseDetails.billingAt === undefined) {
            errorObj = { ...errorObj, billingAt: message };
        }
        else {
            delete errorObj.billingAt
        }
        if (purchaseDetails.deliveryAt === undefined) {
            errorObj = { ...errorObj, deliveryAt: message };
        }
        else {
            delete errorObj.deliveryAt
        }
        if (purchaseDetails.type === "1002" && _.isEmpty(purchaseDetails.iom)) {
            errorObj = { ...errorObj, iom: message };
        }
        else {
            delete errorObj.iom
        }
        if (purchaseDetails.supplierId === undefined) {
            errorObj = { ...errorObj, supplierId: message };
        }
        else {
            delete errorObj.supplierId
        }
        if (!_.isEmpty(errorObj)) {
            setValidationError(errorObj);
            setValidationModal(true);
        } else {
            setValidationModal(false);
            dispatchTableData.forEach((row) => {
                row.dispatch_date = formatDate(row.date);
            })
            let data =
            {
                "po_create": true,
                "quotation_id": purchaseDetails.quotationId,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "place_of_destination": purchaseDetails.destination,
                "delivery_at_id": purchaseDetails.deliveryAt?.toString(),
                "billing_at_id": purchaseDetails.billingAt?.toString(),
                "incoterms": purchaseDetails.incoterm?.value,
                "origin": purchaseDetails.origin?.value,
                "ports": purchaseDetails.portOfLoading?.value,
                "payment_terms": purchaseDetails.paymentTerms,
                "container_type": purchaseDetails.containerType?.value,
                "payment_terms_days": purchaseDetails.iom,
                "forwarding": purchaseDetails.forwarding,
                "no_of_containers": purchaseDetails.noofContainers?.toString(),
                "no_of_bags": purchaseDetails.noofbags,
                "net_weight": purchaseDetails.netweight,
                "comments": purchaseDetails.comments,
                "po_date": purchaseDetails.poDate || new Date(),
                "po_category": purchaseDetails.category,
                "supplier_id": purchaseDetails.supplierId,
                "quot_no": purchaseDetails.quotation?.toString(),
                "quot_price": purchaseDetails.price?.toString(),
                "quot_date": purchaseDetails.quotationDate || null,
                "advance": purchaseDetails.advance?.toString(),
                "advance_type": purchaseDetails.advanceType?.toString(),
                "currency_id": purchaseDetails.type === "1002" ? purchaseDetails.currency?.value : purchaseDetails.importCurrency?.value,
                "taxes_duties": purchaseDetails.taxesDuties,
                "mode_of_transport": purchaseDetails.type === "1002" ? purchaseDetails.modeOfTransport : purchaseDetails.mode_of_transport?.value,
                "insurance": purchaseDetails.insurance?.value,
                "transit_insurance": purchaseDetails.transitInsurance,
                "packing_forwarding": purchaseDetails.packing,
                "dispatch_type": purchaseDetails.dispatch,
                "dispatch_count": purchaseDetails.dispatchCount,
                "item_dispatch": dispatchTableData,
                "supplier_type": purchaseDetails.type,
                "item_id": purchaseDetails.gcType,
                "cgst": purchaseDetails.cgst,
                "igst": purchaseDetails.igst,
                "sgst": purchaseDetails.sgst,
                "purchase_type": purchaseDetails.purchaseType,
                "terminal_month": purchaseDetails.terminalMonth || null,
                "fixation_date": purchaseDetails.fixation || null,
                "terminalPrice": purchaseDetails.terminalPrice?.toString(),
                "marketPriceInr": purchaseDetails.marketPriceInr?.toString(),
                "purchasePriceInr": purchaseDetails.purchasePriceInr?.toString(),
                "grossPrice": purchaseDetails.grossPrice?.toString(),
                "totalPrice": purchaseDetails.totalPrice?.toString(),
                "booked_terminal_rate": purchaseDetails.bookedTerminalRate?.toString(),
                "booked_differential": purchaseDetails.bookedDifferential?.toString(),
                "fixed_terminal_rate": purchaseDetails.fixedTerminalRate?.toString(),
                "fixed_differential": purchaseDetails.fixedDifferential?.toString(),
                "purchase_price": purchaseDetails.purchasePrice?.toString(),
                "market_price": purchaseDetails.marketPrice?.toString(),
                "po_margin": purchaseDetails.poMargin?.toString(),
                "createduserid": getCurrentUserDetails().id,
                "total_quantity": purchaseDetails.qty?.toString(),
                "contract": purchaseDetails.contract,
                "otherCharges": purchaseDetails.otherCharges?.value,
                "rate": purchaseDetails.rate?.toString(),

                "packing_forward_charges": purchaseDetails.packing_forward_charges ? purchaseDetails.packing_forward_charges.toString() : '0',
                "installation_charges": purchaseDetails.installation_charges ? purchaseDetails.installation_charges.toString() : '0',
                "freight_charges": purchaseDetails.freight_charges ? purchaseDetails.freight_charges.toString() : '0',
                "handling_charges": purchaseDetails.handling_charges ? purchaseDetails.handling_charges.toString() : '0',
                "misc_charge": purchaseDetails.misc_charge ? purchaseDetails.misc_charge.toString() : '0',
                "hamali_charge": purchaseDetails.hamali_charge ? purchaseDetails.hamali_charge.toString() : '0',
                "mandifee_charges": purchaseDetails.mandifee_charges ? purchaseDetails.mandifee_charges.toString() : '0',
                "fulltax_charges": purchaseDetails.fulltax_charges ? purchaseDetails.fulltax_charges.toString() : '0',
                "insurance_charges": purchaseDetails.insurance_charges ? purchaseDetails.insurance_charges.toString() : '0',
                "documentsection": documentsection.length > 0 ? documentsection : null
            }
            setLoading(true);
            try {
                let response = await createGCPurchaseOrders(data)
                console.log("Response", response);
                if (response) {
                    setSnack({
                        open: true,
                        message: "GC Purchase Order created successfully",
                    });
                    setTimeout(() => {
                        props.back()
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

    const OtherChargesAction = async () => {
        let state = [...otherChargesList];
        var matchIndex = state.findIndex(function (s) {
            return s.name === otherCharges.item;
        });
        if (matchIndex >= 0) {
            state[matchIndex].rate = otherCharges.rate;
        } else {
            state.push({ "name": otherCharges.item, "label": otherCharges.label, "rate": otherCharges.rate });
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

    return (
        <form className={classes.root} noValidate autoComplete="off">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
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
                purchaseDetails.type === "1002" &&
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
                purchaseDetails.type === "1001" &&
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
                        <Grid item md={6} xs={12}>
                            <Template payload={payload4} />
                            {
                                showQuoteInfo &&
                                <Template payload={payload5} />
                            }
                            {
                                purchaseDetails.gcType &&
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
                                    <BasicTable rows={dispatchTableData} columns={dispatchTableColumns} hasTotal={true} totalColId="dispatch_quantity" onUpdate={dispatchDataUpdate}></BasicTable>
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

                        <Grid item md={6} xs={12}>
                            {
                                purchaseDetails.gcType &&
                                <>
                                    <Grid item md={12} xs={12} className='item' style={{ marginRight: 25 }}>
                                        <Typography>Historical price data for selected vendor</Typography>
                                    </Grid>
                                    <BasicTable rows={vendorPriceList} columns={gcTableVendorPriceColumns}></BasicTable>
                                </>
                            }
                            {
                                purchaseDetails.gcType &&
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
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
                                purchaseDetails.type === "1001" &&
                                <Template payload={payload11} />
                            }
                            {
                                purchaseDetails.purchaseType?.value === 'Differential' &&
                                <Template payload={payload36} />
                            }
                            {
                                purchaseDetails.type === "1002" &&
                                <Template payload={payload14} />
                            }
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
            {
                purchaseDetails.gcType && purchaseDetails.type === "1002" &&
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
                purchaseDetails.type === "1002" &&
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
                        {purchaseDetails.type === "1002" &&
                            <>
                                <Grid md={12} xs={12} justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                                    <Button label="Add Other Charges" onClick={() => setOpenOtherCharges(!openOtherCharges)} />
                                </Grid>
                                <BasicTable rows={(otherChargesList)} columns={ocTableColumns} hasTotal={true} totalColId="rate" onUpdate={rateUpdate}></BasicTable>
                            </>}
                        {purchaseDetails.type === "1001" && <Template payload={payload19} />}
                        {purchaseDetails.type === "1002" && <Template payload={payload20} />}
                    </Grid>
                </AccordionDetails>
            </Accordion>


            {purchaseDetails.type !== "1001" && (
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

            {purchaseDetails.type === "1001" && (
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

            <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                <Grid item>
                    <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={createPurchaseAction} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={props.back} />
                </Grid>
            </Grid>
            <SimpleModal open={validationModal} handleClose={() => setValidationModal(!validationModal)} body={createAction} />
            <SimpleModal open={confirmationCatChange} handleClose={() => setConfirmationCatChange(!confirmationCatChange)} body={createActionForCatChange} />
            <SimpleModal open={openOtherCharges} handleClose={() => setOpenOtherCharges(!openOtherCharges)} body={otherChargesHandler} />

        </form>
    )
}
export default CreatePurchaseOrder;