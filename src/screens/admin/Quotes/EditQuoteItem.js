import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Card, CardContent, CardHeader, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import useToken from '../../../hooks/useToken';
import AuditLog from "./AuditLog";
import { getQuoteItemsInfo, createQuoteItem, updateQuoteItem } from "../../../apis";
import '../../common.css'
import roles from '../../../constants/roles';
import SimpleStepper from '../../../components/SimpleStepper';

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
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    card: {
        boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
        marginBottom: 5
    }
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data?.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
    return formattedData;
}

const EditQuoteItem = (props) => {
    const { getCurrentUserDetails } = useToken()
    const currentUserDetails = getCurrentUserDetails();
    const userRole = currentUserDetails?.role;
    const userId = currentUserDetails?.id;
    const classes = useStyles();
    const [quoteItemDetails, setQuoteItemDetails] = useState({});
    const [marginInfo, setMarginInfo] = useState({});
    const [currentMarginStatus, setCurrentMarginStatus] = useState(null);
    const [customerApprovalDetails, setCustomerApprovalDetails] = useState({});
    const [gmcDetails, setgmcDetails] = useState({});
    const [validationError, setValidationError] = useState({});
    const [category, setCategory] = useState([]);
    const [categoryId, setCategoryId] = useState(0);
    const [categoryTypeId, setCategoryTypeId] = useState(0);
    const [weightId, setWeightId] = useState(0);
    const [secondaryId, setSecondaryId] = useState(0);
    const [secondaryCountId, setSecondaryCountId] = useState(0);
    const [capTypeId, setCapTypeId] = useState(0);
    const [cartonTypeId, setCartonTypeId] = useState(0);
    const [upcId, setUpcId] = useState(0);
    const [isCategoryTypeDisabled, setCategoryTypeDisabled] = useState(true);
    const [categoryType, setCategoryType] = useState([]);
    const [isWeightDisabled, setWeightDisabled] = useState(true);
    const [isPalletizationDisabled, setPalletizationDisabled] = useState(true);
    const [isSecondaryDisabled, setSecondaryDisabled] = useState(true);
    const [secondary, setSecondary] = useState([]);
    const [isSecondaryCountDisabled, setSecondaryCountDisabled] = useState(true);
    const [secondaryCount, setSecondaryCount] = useState([]);
    const [isUpcDisabled, setUpcDisabled] = useState(true);
    const [upc, setUpc] = useState([]);
    const [isCartonDisabled, setCartonDisabled] = useState(true);
    const [carton, setCarton] = useState([]);
    const [isCapDisabled, setCapDisabled] = useState(true);
    const [cap, setCap] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [isPackingCategoryDisabled, setIsPackingCategoryDisabled] = useState(false);
    // const [isPackagingRequirementDisabled, setPackagingRequirementDisabled] = useState(true);
    const [weight, setWeight] = useState([]);
    const [sample, setSample] = useState([]);
    const [sampleCoffee, setSampleCoffee] = useState([]);
    const [logData, setLogData] = useState([]);
    const [showNewPackingTypeForm, setShowNewPackingTypeForm] = useState(false);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    useEffect(() => {
        getQuoteItemsInfo({
            "type": "samplecode",
            "account_id": props.accountId?.toString()
        }).then(res => {
            setSample(formatToSelection(res, 'sample_code', 'sample_id'))
            setSampleCoffee(res);
        });
        getQuoteItemsInfo({ "type": "allCategories" }).then(res => {
            setCategory(formatToSelection(res, 'category_name', 'category_id'));
            getQuoteItemsInfo({
                "type": "Viewquotelineitem",
                "quotelineitem_id": parseInt(props.id)
            }).then(res => {
                console.log("Response is", res);
                setCategoryId(res.category_id);
                // var temp = {...res};
                // temp.isreqnew_packing = temp.isreqnew_packing === 1 ? 'Yes' : 'No';
                setQuoteItemDetails({
                    sampleCode: res.sample_code,
                    sampleId: res.sample_id,
                    lineItemNumber: res.quotelineitem_number,
                    customerBrand: res.customerbrand_name,
                    isPalletization: res.palletizationrequire_id,
                    orderQty: res.expectedorder_kgs,
                    additionalRequirements: res.additional_req,
                    coffeeType: res.coffee_type,
                    isreqnew_packing: res.isreqnew_packing === 1 ? "Yes" : "No",
                    taskdesc: res.taskdesc,
                    baseprice: res.baseprice,
                });
                setMarginInfo({
                    margin: parseFloat(res?.margin.replace(/\$|,/g, '')),
                    margin_percentage: res.margin_percentage,
                    final_price: res.final_price,
                    negativemargin_status: res.negativemargin_status,
                    negativemargin_reason: res?.negativemargin_reason,
                    negativemargin_remarks: res?.negativemargin_remarks
                })
                setCurrentMarginStatus(res?.negativemargin_status)
                setCustomerApprovalDetails({
                    customer_approval: res?.customer_approval,
                    confirmed_orderquantity: res?.confirmed_orderquantity
                })
                setgmcDetails({
                    gms_approvalstatus: res?.gms_approvalstatus,
                    gms_rejectionremarks: res?.gms_rejectionremarks,
                })
                setPalletizationDisabled(false);
                setLogData(res.audit_log);
                getQuoteItemsInfo({
                    "type": "categoryTypes",
                    "category_id": res.category_id
                }).then(response => {
                    setCategoryType(formatToSelection(response, 'categorytype_name', 'categorytype_id'));
                    if (response) {
                        setCategoryTypeDisabled(false);
                        setCategoryTypeId(res.categorytype_id);
                    }
                });
                getQuoteItemsInfo({
                    "type": "weights",
                    "category_id": res.category_id || 0,
                    "categorytype_id": res.categorytype_id || 0
                }).then(response => {
                    setWeight(formatToSelection(response, 'weight_name', 'weight_id'));
                    if (response) {
                        setWeightDisabled(false);
                        setWeightId(res.weight_id);
                    }
                });
                getQuoteItemsInfo({
                    "type": "secondarypackings",
                    "category_id": res.category_id,
                    "categorytype_id": res.categorytype_id,
                    "weight_id": res.weight_id,
                }).then(response => {
                    setSecondary(formatToSelection(response, 'secondary_name', 'secondary_id'));
                    if (response) {
                        setSecondaryDisabled(false);
                        setSecondaryId(res.secondary_id);
                    }
                });
                getQuoteItemsInfo({
                    "type": "noofsecondarypacks",
                    "category_id": res.category_id || 0,
                    "categorytype_id": res.categorytype_id || 0,
                    "weight_id": res.weight_id || 0,
                    "secondary_id": res.secondary_id || 0,
                }).then(response => {
                    setSecondaryCount(formatToSelection(response, 'noofsecondary_name', 'noofsecondary_id'));
                    if (response) {
                        setSecondaryCountDisabled(false);
                        setSecondaryCountId(res.noofsecondary_id);
                    }
                });
                getQuoteItemsInfo({
                    "type": "upcs",
                    "category_id": res.category_id,
                    "categorytype_id": res.categorytype_id,
                    "weight_id": res.weight_id,
                    "secondary_id": res.secondary_id,
                }).then(response => {
                    setUpc(formatToSelection(response, 'upc_name', 'upc_id'));
                    if (response) {
                        setUpcDisabled(false);
                        setUpcId(res.upc_id);
                    }
                });
                if (res.category_id !== 2 && res.category_id !== 1 && res.category_id !== 4) {
                    getQuoteItemsInfo({
                        "type": "captypes",
                    }).then(response => {
                        setCap(formatToSelection(response, 'captype_name', 'captype_id'));
                        if (response) {
                            setCapDisabled(false);
                            setCapTypeId(res.captype_id);
                        }
                    });
                }
                if (!(res.category_id === 2 && !res.weight_id) && res.category_id !== 1) {
                    getQuoteItemsInfo({
                        "type": "cartontypes"
                    }).then(response => {
                        setCarton(formatToSelection(response, 'cartontype_name', 'cartontype_id'));
                        if (response) {
                            setCartonDisabled(false);
                            setCartonTypeId(res.cartontype_id);
                        }
                    });
                }
                // if (res.isreqnew_packing) {
                //     setPackagingRequirementDisabled(false);
                // }
            });
        });
        // eslint-disable-next-line 
    }, []);
    useEffect(() => {
        if (Boolean(parseInt(customerApprovalDetails.customer_approval))) {
            setCustomerApprovalDetails({ ...customerApprovalDetails, rejectionRemarks: null })
        }
        else {
            setCustomerApprovalDetails({ ...customerApprovalDetails, confirmed_orderquantity: null })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerApprovalDetails.customer_approval])
    const handleChange = (event, key,) => {
        let data = {
            ...quoteItemDetails,
            [key]: event.target.value
        }
        setQuoteItemDetails(data);
    };
    const handleMarginChange = (event, key,) => {
        let data = {
            ...marginInfo,
            [key]: event.target.value
        }
        if (key === "margin") {
            data.margin_percentage = !_.isEmpty(data?.margin) ?
                (parseFloat(data?.margin) /
                    parseFloat(quoteItemDetails?.baseprice.replace(/\$|,/g, '')) * 100)?.toFixed(2) : null;
            data.final_price = !_.isEmpty(data?.margin) ?
                (parseFloat(quoteItemDetails?.baseprice.replace(/\$|,/g, '')) +
                    parseFloat(data?.margin))?.toFixed(2) : null;
            if (parseFloat(data[key]) >= 0) {
                data.negativemargin_status = null;
                data.negativemargin_remarks = null;
                data.negativemargin_reason = null;
            }

        }
        setMarginInfo(data);
    };
    const handleCustomerChange = (event, key,) => {
        let data = {
            ...customerApprovalDetails,
            [key]: event.target.value
        }

        setCustomerApprovalDetails(data);
    };
    const handleGMCChange = (event, key,) => {
        let data = {
            ...gmcDetails,
            [key]: event.target.value
        }
        if (key === "gms_approvalstatus") {
            data["gms_rejectionremarks"] = null;
        }
        setgmcDetails(data);
    };
    // const handleapprovalStatusChange = (event, value) => {
    //     let data = {
    //         ...quoteItemDetails,
    //         'approvalStatus': value
    //     }
    //     setQuoteItemDetails(data);
    // };

    const handleisPalletizationChange = (event, value) => {
        let data = {
            ...quoteItemDetails,
            'isPalletization': value?.value
        }
        setQuoteItemDetails(data);
    };

    const handleSampleChange = (event, value) => {
        let coffee = sampleCoffee.find(sam => sam.sample_id === value?.value);
        let data = {
            ...quoteItemDetails,
            'sampleId': value?.value,
            'coffeeType': coffee?.coffee_tyoe,
        }
        setQuoteItemDetails(data);
    };

    const fillWeight = (categoryId, typeId) => {
        setWeightId(0);
        setWeightDisabled(true);
        getQuoteItemsInfo({
            "type": "weights",
            "category_id": categoryId || 0,
            "categorytype_id": typeId || 0
        }).then(res => {
            setWeight(formatToSelection(res, 'weight_name', 'weight_id'));
            if (res) {
                setWeightDisabled(false);
            }
        });
    }

    const fillSecondaryCount = (categoryId, typeId, weightId, secondaryId) => {
        setSecondaryCountId(0);
        setSecondaryCountDisabled(true);
        getQuoteItemsInfo({
            "type": "noofsecondarypacks",
            "category_id": categoryId || 0,
            "categorytype_id": typeId || 0,
            "weight_id": weightId || 0,
            "secondary_id": secondaryId || 0,
        }).then(res => {
            setSecondaryCount(formatToSelection(res, 'noofsecondary_name', 'noofsecondary_id'));
            if (res) {
                setSecondaryCountDisabled(false);
            }
        });
    }

    const fillUpc = (categoryId, typeId, weightId, secondaryId) => {
        setUpcId(0);
        setUpcDisabled(true);
        getQuoteItemsInfo({
            "type": "upcs",
            "category_id": categoryId,
            "categorytype_id": typeId,
            "weight_id": weightId,
            "secondary_id": secondaryId,
        }).then(res => {
            setUpc(formatToSelection(res, 'upc_name', 'upc_id'));
            if (res) {
                setUpcDisabled(false);
            }
        });
    }
    const fillCap = (categoryId) => {
        setCapTypeId(0);
        setCapDisabled(true);
        if (categoryId === 2 || categoryId === 1 || categoryId === 4 || categoryId === 5) {
            setCap([]);
            return;
        }
        getQuoteItemsInfo({
            "type": "captypes",
        }).then(res => {
            setCap(formatToSelection(res, 'captype_name', 'captype_id'));
            if (res) {
                setCapDisabled(false);
            }
        });
    }

    const fillCarton = (categoryId, weightId) => {
        setCartonTypeId(0);
        setCartonDisabled(true);
        if ((categoryId === 2 && !weightId) || categoryId === 1) {
            setCarton([]);
            return;
        }
        getQuoteItemsInfo({
            "type": "cartontypes"
        }).then(res => {
            setCarton(formatToSelection(res, 'cartontype_name', 'cartontype_id'));
            if (res) {
                setCartonDisabled(false);
            }
        });
    }

    const handleCategoryChange = (event, value) => {
        setCategoryId(value?.value);
        setCategoryTypeId(0);
        setWeight([]);
        setSecondaryId(0);
        setSecondaryCountId(0);
        setSecondaryCount([]);
        setUpc([]);
        setSecondary([]);
        setCarton([]);
        setCap([]);
        setUpcDisabled(true);
        setSecondaryDisabled(true);
        setCategoryTypeDisabled(true);
        setSecondaryCountDisabled(true);
        setCartonDisabled(true);
        setCapDisabled(true);
        getQuoteItemsInfo({
            "type": "categoryTypes",
            "category_id": value?.value
        }).then(res => {
            setCategoryType(formatToSelection(res, 'categorytype_name', 'categorytype_id'));
            if (res) {
                setCategoryTypeDisabled(false);
            }
        });
        fillWeight(value?.value);
        fillSecondaryCount(value?.value);
        setPalletizationDisabled(false);
    };

    const handleCategoryTypeChange = (event, value) => {
        setCategoryTypeId(value?.value);
        setWeight([]);
        setSecondaryId(0);
        setUpcId(0);
        setCartonTypeId(0);
        setCapTypeId(0);
        setSecondaryCountId(0);
        setSecondaryCount([]);
        setUpc([]);
        setSecondary([]);
        setCarton([]);
        setCap([]);
        setUpcDisabled(true);
        setSecondaryDisabled(true);
        setSecondaryCountDisabled(true);
        setCartonDisabled(true);
        setCapDisabled(true);
        fillWeight(categoryId, value?.value);
    };

    const handleWeightChange = (event, value) => {
        setWeightId(value?.value);
        setSecondaryDisabled(true);
        setUpcId(0);
        setUpc([]);
        setUpcDisabled(true);
        getQuoteItemsInfo({
            "type": "secondarypackings",
            "category_id": categoryId,
            "categorytype_id": categoryTypeId,
            "weight_id": value?.value,
        }).then(res => {
            setSecondary(formatToSelection(res, 'secondary_name', 'secondary_id'));
            if (res) {
                setSecondaryDisabled(false);
            }
        });
        fillUpc(categoryId, categoryTypeId, value?.value, secondaryId);
        if (categoryId === 2) {
            fillCarton(categoryId, value?.value);
        }
    };

    const handleSecondaryChange = (event, value) => {
        setSecondaryId(value?.value);
        setCapTypeId(0);
        setCap([]);
        setCapDisabled(true);
        fillCarton(categoryId);
        fillUpc(categoryId, categoryTypeId, weightId, value?.value);
        fillSecondaryCount(categoryId, categoryTypeId, weightId, value?.value);
    };

    const handleSecondaryCountChange = (event, value) => {
        setSecondaryCountId(value?.value);
        fillCarton(categoryId);
        fillCap(categoryId);
    };

    const handleUpcChange = (event, value) => {
        setUpcId(value?.value);
        setCapTypeId(0);
        setCap([]);
        setCapDisabled(true);
        fillCarton(categoryId, weightId);
    };

    const handleCartonChange = (event, value) => {
        setCartonTypeId(value?.value);
        fillCap(categoryId);
    };

    const handleCapChange = (event, value) => {
        setCapTypeId(value?.value);
    };

    // const handleNewTypeChange = (event, key,) => {
    //     let data = {
    //         ...quoteItemDetails,
    //         [key]: event.target.value,
    //     }
    //     setQuoteItemDetails(data);
    //     if (event.target.value === "Yes") {
    //         setIsPackingCategoryDisabled(true);
    //         handleCategoryChange(null, null);
    //         // setPackagingRequirementDisabled(false);
    //         setPalletizationDisabled(true);
    //     } else {
    //         setIsPackingCategoryDisabled(false);
    //         // setPackagingRequirementDisabled(true);
    //         setQuoteItemDetails({ ...data, taskdesc: "" })
    //     }
    // };

    const getAutocompleteValue = (options = [], value) => {
        return options?.filter(option => option.value === value)[0]
    }
    const editQuoteItemAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = {};
        if (quoteItemDetails?.isPalletization === undefined || _.isEmpty(quoteItemDetails?.isPalletization.toString())) {
            if ((quoteItemDetails?.isreqnew_packing === undefined || quoteItemDetails?.isreqnew_packing === 'No')) {
                errorObj = { ...errorObj, isPalletization: message };
            }
        }
        if (!categoryId && quoteItemDetails?.isreqnew_packing === "No") {
            errorObj = { ...errorObj, category: message };
        }
        if (_.isEmpty(quoteItemDetails?.orderQty?.toString())) {
            errorObj = { ...errorObj, orderQty: message };
        }
        if (_.isEmpty(quoteItemDetails?.sampleId)) {
            errorObj = { ...errorObj, sampleId: message };
        }

        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const errorMessage = { message: "Please fill all mandatory fields to save" }
                throw errorMessage
            }
            catch (err) {
                setSnack({
                    open: true,
                    severity: "error",
                    message: err.message
                })
                setTimeout(() => {
                    setSnack({
                        open: false,
                        message: "",
                    })
                }, 2000)
            }
        } else {
            let data =
            {
                "update": true,
                "quote_id": props.quoteId,
                "quotelineitem_id": parseInt(props.id),
                "sample_id": quoteItemDetails?.sampleId,
                "category_id": categoryId,
                "categorytype_id": categoryTypeId,
                "weight_id": weightId,
                "cartontype_id": cartonTypeId,
                "captype_id": capTypeId,
                "secondary_id": secondaryId,
                "noofsecondary_id": secondaryCountId,
                "upc_id": upcId,
                "palletizationrequire_id": quoteItemDetails?.isreqnew_packing === 'No' ? quoteItemDetails?.isPalletization : null,
                "customerbrand_name": quoteItemDetails?.customerBrand,
                "additional_req": quoteItemDetails?.additionalRequirements,
                "expectedorder_kgs": parseInt(quoteItemDetails?.orderQty),
                "isreqnew_packing": quoteItemDetails?.isreqnew_packing ? quoteItemDetails?.isreqnew_packing === 'Yes' ? 1 : 0 : 0,
                "taskdesc": quoteItemDetails?.taskdesc,
                "modified_date": new Date(),
                "modified_by": currentUserDetails.name,
                "modified_byuserid": currentUserDetails.id
            }
            setLoading(true);
            try {
                let response = await createQuoteItem(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote Item updated successfully",
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
    const editMarginInfo = async () => {
        const message = 'Please enter valid details';
        let errorObj = {};
        if (_.isEmpty(marginInfo?.margin.toString())) {
            errorObj = { ...errorObj, margin: message };
        }
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const errorMessage = { message: "Please fill all mandatory fields to save" }
                throw errorMessage
            }
            catch (err) {
                setSnack({
                    open: true,
                    severity: "error",
                    message: err.message
                })
                setTimeout(() => {
                    setSnack({
                        open: false,
                        message: "",
                    })
                }, 2000)
            }
        } else {
            setLoading(true);
            try {
                let response = await updateQuoteItem({ type: "marginInfo", ...marginInfo, "lineitem_id": parseInt(props.id) })
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote item updated successfully",
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
    const editCustomerApproval = async () => {
        const message = 'Please enter valid details';
        let errorObj = {};
        if (_.isEmpty(customerApprovalDetails?.customer_approval?.toString())) {
            errorObj = { ...errorObj, customer_approval: message };
        }
        if (_.isEmpty(customerApprovalDetails?.confirmed_orderquantity) && Boolean(parseInt(customerApprovalDetails?.customer_approval))) {
            errorObj = { ...errorObj, confirmed_orderquantity: message };
        }
        if (_.isEmpty(customerApprovalDetails?.rejectionRemarks) && !Boolean(parseInt(customerApprovalDetails?.customer_approval))) {
            errorObj = { ...errorObj, rejectionRemarks: message };
        }
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const errorMessage = { message: "Please fill all mandatory fields to save" }
                throw errorMessage
            }
            catch (err) {
                setSnack({
                    open: true,
                    severity: "error",
                    message: err.message
                })
                setTimeout(() => {
                    setSnack({
                        open: false,
                        message: "",
                    })
                }, 2000)
            }
        } else {
            setLoading(true);
            try {
                let response = await updateQuoteItem({
                    type: "customerInfo", ...customerApprovalDetails,
                    customer_approval: parseInt(customerApprovalDetails?.customer_approval),
                    "lineitem_id": parseInt(props.id)
                })
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote item updated successfully",
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
    const editgmcApproval = async () => {
        const message = 'Please enter valid details';
        let errorObj = {};
        if (_.isEmpty(gmcDetails?.gms_approvalstatus?.toString())) {
            errorObj = { ...errorObj, gms_approvalstatus: message };
        }
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const errorMessage = { message: "Please fill all mandatory fields to save" }
                throw errorMessage
            }
            catch (err) {
                setSnack({
                    open: true,
                    severity: "error",
                    message: err.message
                })
                setTimeout(() => {
                    setSnack({
                        open: false,
                        message: "",
                    })
                }, 2000)
            }
        } else {
            setLoading(true);
            try {
                let response = await updateQuoteItem({
                    type: "gmcInfo", ...gmcDetails,
                    "lineitem_id": parseInt(props.id)
                })
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote item updated successfully",
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
    const payload = [
        {
            label: 'Sample code',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(sample, quoteItemDetails?.sampleId) || '',
            required: true,
            error: validationError?.sampleId,
            helperText: validationError?.sampleId,
            options: sample || [],
            onChange: handleSampleChange,
            disabled: props.status !== "New"
        },
        {
            label: 'Coffee type',
            type: 'input',
            disabled: props.status !== "New",
            value: quoteItemDetails?.coffeeType || '',
        },
        {
            label: 'Customer brand name',
            type: 'input',
            value: quoteItemDetails?.customerBrand || '',
            onChange: (e) => handleChange(e, quoteItemDetails, 'customerBrand'),
            disabled: props.status !== "New"
        },
    ];
    // const payload1 = [
    //     {
    //         label: 'Request new packaging type',
    //         type: 'radio',
    //         value: quoteItemDetails?.isreqnew_packing || 'No',
    //         options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
    //         sm: 6,
    //         onChange: (e) => handleNewTypeChange(e, 'isreqnew_packing'),
    //         disabled: props.status !== "New"
    //     },
    //     {
    //         label: 'New packaging type requirement',
    //         type: 'input',
    //         multiline: true,
    //         disabled: isPackagingRequirementDisabled || props.status !== "New",
    //         rows: 3,
    //         value: quoteItemDetails?.taskdesc || '',
    //         onChange: (e) => handleChange(e, quoteItemDetails, 'taskdesc'),
    //     }
    // ];
    const payload2 = [
        {
            label: 'Packaging category',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            // disabled: isPackingCategoryDisabled || props.status !== "New",
            error: validationError?.category,
            helperText: validationError?.category,
            value: getAutocompleteValue(category, categoryId) || '',
            options: category || [],
            onChange: handleCategoryChange,
        },
        {
            label: 'Packaging type',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isCategoryTypeDisabled || props.status !== "New",
            value: getAutocompleteValue(categoryType, categoryTypeId) || '',
            options: categoryType || [],
            onChange: handleCategoryTypeChange,
        },
        {
            label: 'Weight',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isWeightDisabled || props.status !== "New",
            value: getAutocompleteValue(weight, weightId) || '',
            options: weight || [],
            onChange: handleWeightChange,
        },
        {
            label: 'Secondary packaging',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isSecondaryDisabled || props.status !== "New",
            value: getAutocompleteValue(secondary, secondaryId) || '',
            options: secondary,
            onChange: handleSecondaryChange, //'secondaryPackaging') ,
        },
        {
            label: 'No of secondary packs/master carton',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isSecondaryCountDisabled || props.status !== "New",
            value: getAutocompleteValue(secondaryCount, secondaryCountId) || '',
            options: secondaryCount || [],
            onChange: handleSecondaryCountChange, //'secondaryPackCount') ,
        },
        {
            label: 'UPC',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isUpcDisabled || props.status !== "New",
            value: getAutocompleteValue(upc, upcId) || '',
            options: upc,
            onChange: handleUpcChange,
        },
        {
            label: 'Carton type',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isCartonDisabled || props.status !== "New",
            value: getAutocompleteValue(carton, cartonTypeId) || '',
            options: carton || [],
            onChange: handleCartonChange,
        },
        {
            label: 'Cap type',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isCapDisabled || props.status !== "New",
            value: getAutocompleteValue(cap, capTypeId) || '',
            options: cap || [],
            onChange: handleCapChange,
        },
        {
            label: quoteItemDetails?.isreqnew_packing === 'Yes' ? 'Is palletization required?' : 'Is palletization required?*',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isPalletizationDisabled || props.status !== "New",
            required: true,
            error: validationError?.isPalletization,
            helperText: validationError?.isPalletization,
            value: getAutocompleteValue([{ label: 'Yes', value: true }, { label: 'No', value: false }], quoteItemDetails?.isPalletization) || 0,
            options: [{ label: 'Yes', value: true }, { label: 'No', value: false }],
            onChange: handleisPalletizationChange,
        },
        {
            label: 'Additional requirements',
            type: 'input',
            value: quoteItemDetails?.additionalRequirements || '',
            multiline: true,
            onChange: (e) => handleChange(e, 'additionalRequirements'),
            disabled: props.status !== "New"
        },
    ]
    const payload10 = [
        {
            label: 'Packaging category',
            type: 'input',
            required: true,
            value: categoryId,
            onChange: (e) => setCategoryId(e.target.value),
        },
        {
            label: 'Packaging type',
            type: 'input',
            value: categoryTypeId,
            onChange: (e) => setCategoryTypeId(e.target.value),
        },
        {
            label: 'Weight',
            type: 'input',
            value: weightId,
            onChange: (e) => setWeightId(e.target.value),
        },
        {
            label: 'Secondary packaging',
            type: 'input',
            value: secondaryId,
            onChange: (e) => setSecondaryId(e.target.value), //'secondaryPackaging') ,
        },
        {
            label: 'No of secondary packs/master carton',
            type: 'input',
            value: secondaryCountId,
            onChange: (e) => setSecondaryCountId(e.target.value), //'secondaryPackCount') ,
        },
        {
            label: 'UPC',
            type: 'input',
            value: upcId,
            onChange: (e) => setUpcId(e.target.value),
        },
        {
            label: 'Carton type',
            type: 'input',
            value: cartonTypeId,
            onChange: (e) => setCartonTypeId(e.target.value),
        },
        {
            label: 'Cap type',
            type: 'input',
            value: capTypeId,
            onChange: (e) => setCapTypeId(e.target.value),
        },
        {
            label: quoteItemDetails?.isreqnew_packing === 'Yes' ? 'Is palletization required?' : 'Is palletization required?*',
            type: 'input',
            labelprop: "label",
            disabled: isPalletizationDisabled || props.status !== "New",
            required: true,
            error: validationError?.isPalletization,
            helperText: validationError?.isPalletization,
            value: getAutocompleteValue([{ label: 'Yes', value: true }, { label: 'No', value: false }], quoteItemDetails?.isPalletization) || 0,
            options: [{ label: 'Yes', value: true }, { label: 'No', value: false }],
            onChange: handleisPalletizationChange,
        },
        {
            label: 'Additional requirements',
            type: 'input',
            value: quoteItemDetails?.additionalRequirements || '',
            multiline: true,
            onChange: (e) => handleChange(e, 'additionalRequirements'),
            disabled: props.status !== "New"
        },
    ]
    const payload3 = [
        {
            label: 'Expected order Qty(Kg)',
            type: 'input',
            required: true,
            error: validationError?.orderQty,
            helperText: validationError?.orderQty,
            value: quoteItemDetails?.orderQty || '',
            onChange: (e) => handleChange(e, 'orderQty'),
            disabled: props.status !== "New"
        },
    ]

    const payload4 = [
        {
            label: 'Base price(per Kg)(GBP)',
            type: 'input',
            multiline: true,
            rows: 3,
            value: quoteItemDetails?.baseprice || '',
            onChange: (e) => handleChange(e, 'baseprice'),
            disabled: true,
        },
    ]
    const payload5 = [
        {
            label: 'Margin value(GBP)',
            type: 'number',
            value: marginInfo?.margin || '',
            required: props.status === "Base Price Received",
            disabled: !(props.status === "Base Price Received"
                && (userRole !== roles.managingDirector || userRole !== roles.marketingExecutive) &&
                currentMarginStatus !== "Pending"),
            error: !!validationError?.margin,
            helperText: validationError?.margin,
            onChange: (e) => handleMarginChange(e, 'margin')
        },
        {
            label: 'Negative margin status',
            type: 'select',
            required: props.status === "Quote Submitted",
            disabled: props.status !== "Base Price Received"
                || (userRole !== roles.gmc && userRole !== roles.managingDirector)
                || currentMarginStatus !== "Pending"
                || parseFloat(marginInfo?.margin) >= 0,
            error: !!validationError?.negativemargin_status,
            helperText: validationError?.negativemargin_status,
            options: [{ label: 'Approved', value: "Approved" },
            { label: 'Pending', value: "Pending" },
            { label: 'Rejected', value: "Rejected" }],
            value: marginInfo?.negativemargin_status || '',
            onChange: (e) => handleMarginChange(e, 'negativemargin_status')
        },
        {
            label: 'Margin(%)',
            type: 'input',
            value: marginInfo?.margin_percentage || '',
            disabled: true,
        },
        {
            label: 'Negative margin remarks',
            type: 'input',
            multiline: true,
            rows: 6,
            value: marginInfo?.negativemargin_remarks || '',
            disabled: props.status !== "Base Price Received"
                || (userRole !== roles.gmc && userRole !== roles.managingDirector)
                || currentMarginStatus !== "Pending"
                || parseFloat(marginInfo?.margin) >= 0,
            onChange: (e) => handleMarginChange(e, 'negativemargin_remarks')
        },
        {
            label: 'Final price (Per KG) (GBP)',
            type: 'input',
            value: marginInfo?.final_price || '',
            disabled: true,
            // onChange: (e) => handleMarginChange(e, 'final_price')
        },
        {
            label: 'Negative margin reason',
            type: 'input',
            multiline: true,
            rows: 3,
            value: marginInfo?.negativemargin_reason || '',
            disabled: props.status !== "Base Price Received"
                || (userRole !== roles.gmc && userRole !== roles.managingDirector)
                || currentMarginStatus !== "Pending"
                || parseFloat(marginInfo?.margin) >= 0,
            onChange: (e) => handleMarginChange(e, 'negativemargin_reason')
        },
    ]

    const payload6 = [
        {
            label: 'Customer approval status',
            type: 'select',
            required: props.status === "Quote Submitted",
            disabled: !(props.status === "Quote Submitted"
                && (userRole !== roles.managingDirector || userRole !== roles.marketingExecutive)),
            error: !!validationError?.customer_approval,
            helperText: validationError?.customer_approval,
            options: [{ label: 'Approved', value: "1" }, { label: 'Rejected', value: "0" }],
            value: customerApprovalDetails?.customer_approval || '',
            onChange: (e) => handleCustomerChange(e, 'customer_approval')
        },
        {
            label: 'Customer rejection remarks',
            type: 'input',
            required: props.status === "Quote Submitted" &&
                !Boolean(parseInt(customerApprovalDetails?.customer_approval)),
            disabled: !(props.status === "Quote Submitted"
                && (userRole !== roles.managingDirector || userRole !== roles.marketingExecutive)) ||
                Boolean(parseInt(customerApprovalDetails?.customer_approval)),
            multiline: true,
            error: !!validationError?.rejectionRemarks,
            helperText: validationError?.rejectionRemarks,
            rows: 4,
            value: customerApprovalDetails?.rejectionRemarks || '',
            onChange: (e) => handleCustomerChange(e, 'rejectionRemarks')
        },
        {
            label: 'Confirmed order quantity(Kgs)',
            type: 'number',
            error: !!validationError?.confirmed_orderquantity,
            helperText: validationError?.confirmed_orderquantity,
            disabled: !(props.status === "Quote Submitted"
                && (userRole !== roles.managingDirector || userRole !== roles.marketingExecutive)) ||
                !Boolean(parseInt(customerApprovalDetails?.customer_approval)),
            required: props.status === "Quote Submitted" &&
                Boolean(parseInt(customerApprovalDetails?.customer_approval)),
            value: customerApprovalDetails?.confirmed_orderquantity || '',
            onChange: (e) => handleCustomerChange(e, 'confirmed_orderquantity')
        }
    ]
    const payload7 = [
        {
            label: 'GMC approval status',
            type: 'select',
            disabled: !(props.status === "Bid Submitted to GMC" && (userRole !== roles.managingDirector || userRole !== roles.gmc)),
            options: [{ label: 'Approved', value: "Approved" }, { label: 'Rejected', value: "Rejected" }],
            value: gmcDetails?.gms_approvalstatus || '',
            required: props.status === "Bid Submitted to GMC",
            error: !!validationError?.gms_approvalstatus,
            helperText: validationError?.gms_approvalstatus,
            onChange: (e) => handleGMCChange(e, 'gms_approvalstatus')
        },
        {
            label: 'GMC rejection remarks',
            type: 'input',
            disabled: !(props.status === "Bid Submitted to GMC" && (userRole !== roles.managingDirector
                || userRole !== roles.gmc) && gmcDetails?.gms_approvalstatus === "Rejected"),
            multiline: true,
            rows: 4,
            value: gmcDetails?.gms_rejectionremarks || '',
            onChange: (e) => handleGMCChange(e, 'gms_rejectionremarks')
        }
    ]

    const payload8 = [
        {
            label: 'General remarks',
            type: 'input',
            multiline: true,
            rows: 3,
            value: gmcDetails?.generalRemarks || '',
            onChange: (e) => handleChange(e, 'generalRemarks')
        }
    ]
    const getSaveButton = () => {
        switch (props.status) {
            case "New":
                return <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={editQuoteItemAction} />
            case "Base Price Received":
                return <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={editMarginInfo} />
            case "Quote Submitted":
                return <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={editCustomerApproval} />
            case "Bid Submitted to GMC":
                return <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={editgmcApproval} />
            default:
                return null;
        }
    }
    const requestNegativeMarginApproval = async () => {
        let errorObj = {};
        if (parseInt(marginInfo?.margin) > 0) {
            errorObj = { ...errorObj, margin: "Margin cannot be positive" };
        }
        if (Number.isNaN(marginInfo?.margin)) {
            errorObj = { ...errorObj, margin: "Margin is invalid" };
        }
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const errorMessage = { message: "Please fill all mandatory fields to save" }
                throw errorMessage
            }
            catch (err) {
                setSnack({
                    open: true,
                    severity: "error",
                    message: err.message
                })
                setTimeout(() => {
                    setSnack({
                        open: false,
                        message: "",
                    })
                }, 2000)
            }
        } else {
            setLoading(true);
            try {
                const data = {
                    type: "negativemarginrequest",
                    role: userRole,
                    loginuserid: userId,
                    margin: marginInfo?.margin,
                    margin_percentage: marginInfo?.margin_percentage,
                    negativemargin_status: "Pending",
                    lineitem_id: parseInt(props.id),
                    final_price: marginInfo?.final_price,
                }
                let response = await updateQuoteItem(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote item updated successfully",
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
    const submitNegativeMarginApproval = async () => {
        let errorObj = {};
        if (marginInfo?.negativemargin_status === "Pending") {
            errorObj = { ...errorObj, negativemargin_status: "Margin status cannot be pending" };
        }
        console.log("Error obj is", errorObj);
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const errorMessage = { message: "Please fill all mandatory fields to save" }
                throw errorMessage
            }
            catch (err) {
                setSnack({
                    open: true,
                    severity: "error",
                    message: err.message
                })
                setTimeout(() => {
                    setSnack({
                        open: false,
                        message: "",
                    })
                }, 2000)
            }
        } else {
            setLoading(true);
            try {
                const data = {
                    type: "negativemarginapproval",
                    role: userRole,
                    loginuserid: userId,
                    negativemargin_remarks: marginInfo?.negativemargin_remarks,
                    negativemargin_reason: marginInfo?.negativemargin_reason,
                    negativemargin_status: marginInfo?.negativemargin_status,
                    lineitem_id: parseInt(props.id)
                }
                let response = await updateQuoteItem(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote item updated successfully",
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
    useEffect(() => {
        if (!showNewPackingTypeForm) {
            setCategoryId(null);
            setCategoryTypeId(null);
            setWeightId(null);
            setSecondaryId(0);
            setUpcId(0);
            setCartonTypeId(0);
            setCapTypeId(0);
            setSecondaryCountId(0);
        }
        else {
            setCategoryId("");
            setCategoryTypeId("");
            setWeightId("");
            setSecondaryId("");
            setUpcId("");
            setCartonTypeId("");
            setCapTypeId("");
            setSecondaryCountId("");
        }
    }, [showNewPackingTypeForm])
    const sampleSteps = [
        'Customer Approved',
        'Customer Rejected',
        'GMC Approved',
        'GMC Rejected',
    ];

    const getActiveStep = () => {
        if (gmcDetails?.gms_approvalstatus === 'Rejected') {
            return 4;
        } else if (gmcDetails?.gms_approvalstatus === 'Approved') {
            return 3;
        } else if (customerApprovalDetails?.customer_approval === '0') {
            return 2;
        } else if (customerApprovalDetails?.customer_approval === '1') {
            return 1;
        } else {
            return 0;
        }
    };

    return (<form className={classes.root} noValidate autoComplete="off">
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Card className="page-header">
            <CardHeader
                title=" Quotation item details"
                className='cardHeader'
            />
            <CardContent>
                <Grid container md={6}>
                    <Grid item md={3} xs={12} >
                        <Typography variant="h7">Quote number</Typography>
                        <Typography>{props.quoteId}</Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h7">Quote item id</Typography>
                        <Typography>{quoteItemDetails?.lineItemNumber}</Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h7">Sample code</Typography>
                        <Typography>{(quoteItemDetails?.sampleCode)}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        <Card className="page-header">
            <CardContent>
                <Grid container md={12}>
                    <Grid item md={12} xs={12}>
                        <SimpleStepper
                            activeStep={getActiveStep()}
                            steps={sampleSteps}
                            stepClick={(e) => {
                                console.log("e::", e);
                            }}
                        ></SimpleStepper>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        <Grid container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Sample information</Typography>
            </Grid>
        </Grid>
        <Template payload={payload} />
        {/* <Grid id="top-row" container>
            <Grid item md={12} xs={12} className='item'>
                <Typography>New packaging type request</Typography>
            </Grid>
        </Grid>
        <Template payload={payload1} /> */}
        <Grid id="top-row" container>
            <Grid container md={12} xs={12} className='item' alignItems="center"
                justifyContent='space-between'>
                <Typography>Packaging details</Typography>
                <Grid container md={6} xs={6} alignItems='center' justifyContent='flex-end'>
                    <Typography>Request New Packing Type</Typography>
                    <Switch checked={showNewPackingTypeForm}
                        color={"secondary"}
                        onChange={() => setShowNewPackingTypeForm(prevState => !prevState)} />
                </Grid>
                {/* <Fab label="New Packing Type" variant="extended" onClick={() => setShowNewPackingTypeForm(true)} /> */}
            </Grid>
        </Grid>
        <Template payload={showNewPackingTypeForm ? payload10 : payload2} />
        <Grid id="top-row" container>
            <Grid item md={12} xs={12} className='item'>
                <Typography>Expected order quantity details</Typography>
            </Grid>
        </Grid>
        <Template payload={payload3} />
        <Grid id="top-row" container>
            <Grid item md={12} xs={12} className='item'>
                <Typography>Prices from ERP</Typography>
            </Grid>
        </Grid>
        <Template payload={payload4} />
        <React.Fragment>
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Margin information</Typography>
                </Grid>
            </Grid><Template payload={payload5} />
        </React.Fragment>
        <Grid id="top-row" container >
            <Grid item md={6} xs={12}>
                <Button label={loading ? "Loading..." : "Request For Approval"}
                    disabled={loading ||
                        _.isEmpty(marginInfo?.margin) || parseFloat(marginInfo?.margin) >= 0 ||
                        currentMarginStatus === "Pending" ||
                        (userRole !== roles.managingDirector && userRole !== roles.marketingExecutive)}
                    onClick={requestNegativeMarginApproval}
                />
                <Button label={loading ? "Loading..." : "Save"}
                    onClick={submitNegativeMarginApproval}
                    disabled={loading ||
                        (userRole !== roles.managingDirector && userRole !== roles.gmc) ||
                        currentMarginStatus !== "Pending"}

                />
            </Grid>
        </Grid>
        <React.Fragment>
            <Grid id="top-row" container>
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Customer approval & confirmed order quantity</Typography>
                </Grid>
            </Grid>
            <Template payload={payload6} />
        </React.Fragment>
        <React.Fragment>
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>GMC approval</Typography>
                </Grid>
            </Grid>
            <Template payload={payload7} />
        </React.Fragment>
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>General remarks</Typography>
            </Grid>
        </Grid>
        <Template payload={payload8} />
        <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className="item">
                <Typography>Audit log information</Typography>
            </Grid>
        </Grid>
        <AuditLog data={logData} />
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                {getSaveButton()}
            </Grid>
            <Grid item>
                <Button label="Cancel" onClick={props.back} />
            </Grid>
        </Grid>
    </form>)
}
export default EditQuoteItem;