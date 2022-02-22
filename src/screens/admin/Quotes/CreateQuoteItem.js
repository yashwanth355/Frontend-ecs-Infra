import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import useToken from '../../../hooks/useToken';
import { getQuoteItemsInfo, createQuoteItem } from "../../../apis";
// import Fab from '../../../components/Fab';
// import CreatePackagingType from './CreatePackagingType';
import '../../common.css'
const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: 10,
        },
        '& .MuiFormControl-fullWidth': {
            width: '95%'
        },
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    }
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data?.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
    return formattedData;
}

const CreateQuoteItem = (props) => {
    const classes = useStyles();
    const [quoteItemDetails, setQuoteItemDetails] = useState({});
    const [validationError, setValidationError] = useState({});
    const [category, setCategory] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
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
    // const [isPackingCategoryDisabled, setIsPackingCategoryDisabled] = useState(false);
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
    const [showNewPackingTypeForm, setShowNewPackingTypeForm] = useState(false);

    // const [isPackagingRequirementDisabled, setPackagingRequirementDisabled] = useState(true);
    const [weight, setWeight] = useState([]);
    const [sample, setSample] = useState([]);
    const [sampleCoffee, setSampleCoffee] = useState([]);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();
    useEffect(() => {
        getQuoteItemsInfo({ "type": "allCategories" }).then(res => setCategory(formatToSelection(res, 'category_name', 'category_id')));

        getQuoteItemsInfo({
            "type": "samplecode",
            "account_id": props.accountId?.toString()
        }).then(res => {
            setSample(formatToSelection(res, 'sample_code', 'sample_id'))
            setSampleCoffee(res);
        });
        // eslint-disable-next-line 
    }, []);
    const handleChange = (event, key,) => {
        let data = {
            ...quoteItemDetails,
            [key]: event.target.value
        }
        setQuoteItemDetails(data);
        console.log(data);
    };

    const handleisPalletizationChange = (event, value) => {
        let data = {
            ...quoteItemDetails,
            'isPalletization': value?.value
        }
        setQuoteItemDetails(data);
    };

    const handleSampleChange = (event, value) => {
        let coffee = sampleCoffee ? sampleCoffee.find(sam => sam.sample_code === value?.label) : null;
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
        fillUpc(categoryId, categoryTypeId, weightId, value?.value)
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
    //     if (event.target.value === "Yes") {
    //         setIsPackingCategoryDisabled(true);
    //         handleCategoryChange(null, null);
    //         // setPackagingRequirementDisabled(false);
    //         setPalletizationDisabled(true);
    //     } else {
    //         data.taskdesc = "";
    //         setIsPackingCategoryDisabled(false);
    //         // setPackagingRequirementDisabled(true);
    //     }
    //     setQuoteItemDetails(data);
    // };


    const createQuoteItemAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = {};
        if (_.isEmpty(quoteItemDetails?.sampleId)) {
            errorObj = { ...errorObj, sampleId: message }
        }
        if (_.isEmpty(categoryId?.toString()) || categoryId === undefined) {
            errorObj = { ...errorObj, category: message }
        }
        if (quoteItemDetails.isPalletization === undefined || _.isEmpty(quoteItemDetails.isPalletization.toString())) {
            if ((quoteItemDetails.isreqnew_packing === undefined || quoteItemDetails.isreqnew_packing === 'No')) {
                errorObj = { ...errorObj, isPalletization: message };
            }
        }
        if (!categoryId && quoteItemDetails.isreqnew_packing === "No") {
            errorObj = { ...errorObj, category: message };
        }
        if (_.isEmpty(quoteItemDetails.orderQty)) {
            errorObj = { ...errorObj, orderQty: message };
        }
        // if (_.isEmpty(quoteItemDetails.sampleId)) {
        //     errorObj = { ...errorObj, sampleId: message };
        // }
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
                "update": false,
                "quote_id": props.quoteId,
                "sample_id": quoteItemDetails.sampleId,
                "category_id": categoryId,
                "categorytype_id": categoryTypeId,
                "weight_id": weightId,
                "cartontype_id": cartonTypeId,
                "captype_id": capTypeId,
                "secondary_id": secondaryId,
                "noofsecondary_id": secondaryCountId,
                "upc_id": upcId,
                "palletizationrequire_id": quoteItemDetails.isreqnew_packing === 'No' ? quoteItemDetails.isPalletization : null,
                "customerbrand_name": quoteItemDetails.customerBrand,
                "additional_req": quoteItemDetails.additionalRequirements,
                "expectedorder_kgs": parseInt(quoteItemDetails.orderQty),
                "isreqnew_packing": quoteItemDetails.isreqnew_packing ? quoteItemDetails.isreqnew_packing === 'Yes' ? 1 : 0 : 0,
                "taskdesc": quoteItemDetails.taskdesc,
                "created_date": new Date(),
                "created_by": currentUserDetails.name,
                "created_byuserid": currentUserDetails.id
            }
            console.log("Data is", data);
            setLoading(true);
            try {
                let response = await createQuoteItem(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote Item created successfully",
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
    const getAutocompleteValue = (options = [], value) => {
        return options?.filter(option => option.value === value)[0]
    }
    const payload = [
        {
            label: 'Sample code',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(sample, quoteItemDetails.sampleId) || '',
            required: true,
            error: validationError?.sampleId,
            helperText: validationError?.sampleId,
            options: sample || [],
            onChange: handleSampleChange
        },
        {
            label: 'Coffee type',
            type: 'input',
            disabled: true,
            // onChange: (e) => handleChange(e, 'coffeeType'),  
            value: quoteItemDetails.coffeeType || ''
        },
        {
            label: 'Customer brand name',
            type: 'input',
            value: quoteItemDetails.customerBrand || '',
            onChange: (e) => handleChange(e, 'customerBrand')
        },
    ]

    // const payload1 = [
    //     {
    //         label: 'Request new packaging type',
    //         type: 'radio',
    //         value: quoteItemDetails.isreqnew_packing || 'No',
    //         options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
    //         sm: 6,
    //         onChange: (e) => handleNewTypeChange(e, 'isreqnew_packing')
    //     },
    //     {
    //         label: 'New packaging type requirement',
    //         type: 'input',
    //         multiline: true,
    //         disabled: isPackagingRequirementDisabled,
    //         rows: 3,
    //         value: quoteItemDetails.taskdesc || '',
    //         onChange: (e) => handleChange(e, 'taskdesc')
    //     }
    // ];

    const payload2 = [
        {
            label: 'Packaging category',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            // disabled: isPackingCategoryDisabled,
            error: validationError?.category,
            helperText: validationError?.category,
            value: getAutocompleteValue(category, categoryId) || '',
            options: category || [],
            onChange: handleCategoryChange
        },
        {
            label: 'Packaging type',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isCategoryTypeDisabled,
            value: getAutocompleteValue(categoryType, categoryTypeId) || '',
            options: categoryType || [],
            onChange: handleCategoryTypeChange
        },
        {
            label: 'Weight',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isWeightDisabled,
            value: getAutocompleteValue(weight, weightId) || '',
            options: weight || [],
            onChange: handleWeightChange
        },
        {
            label: 'Secondary packaging',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isSecondaryDisabled,
            value: getAutocompleteValue(secondary, secondaryId) || '',
            options: secondary,
            onChange: handleSecondaryChange
        },
        {
            label: 'No of secondary packs/master carton',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isSecondaryCountDisabled,
            value: getAutocompleteValue(secondaryCount, secondaryCountId) || '',
            options: secondaryCount || [],
            onChange: handleSecondaryCountChange
        },
        {
            label: 'UPC',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isUpcDisabled,
            value: getAutocompleteValue(upc, upcId) || '',
            options: upc,
            onChange: handleUpcChange
        },
        {
            label: 'Carton type',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isCartonDisabled,
            value: getAutocompleteValue(carton, cartonTypeId) || '',
            options: carton || [],
            onChange: handleCartonChange
        },
        {
            label: 'Cap type',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isCapDisabled,
            value: getAutocompleteValue(cap, capTypeId) || '',
            options: cap || [],
            onChange: handleCapChange
        },
        {
            label: quoteItemDetails.isreqnew_packing === 'Yes' ? 'Is palletization required?' : 'Is palletization required?',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isPalletizationDisabled,
            required: true,
            error: validationError?.isPalletization,
            helperText: validationError?.isPalletization,
            value: getAutocompleteValue([{ label: 'Yes', value: true }, { label: 'No', value: false }], quoteItemDetails.isPalletization),
            options: [{ label: 'Yes', value: true }, { label: 'No', value: false }],
            onChange: handleisPalletizationChange
        },
        {
            label: 'Additional requirements',
            type: 'input',
            value: quoteItemDetails.additionalRequirements || '',
            multiline: true,
            onChange: (e) => handleChange(e, 'additionalRequirements'),
        },
    ]

    const payload3 = [
        {
            label: 'Expected order Qty(Kg)',
            type: 'input',
            required: true,
            error: validationError?.orderQty,
            helperText: validationError?.orderQty,
            value: quoteItemDetails.orderQty || '',
            onChange: (e) => handleChange(e, 'orderQty')
        },
    ]
    const payload4 = [
        {
            label: 'Packaging category',
            type: 'input',
            required: true,
            error: validationError?.category,
            helperText: validationError?.category,
            value: categoryId,
            onChange: (e) => setCategoryId(e.target.value)
        },
        {
            label: 'Packaging type',
            type: 'input',
            labelprop: "label",
            value: categoryTypeId || '',
            onChange: (e) => setCategoryTypeId(e.target.value)
        },
        {
            label: 'Weight',
            type: 'input',
            labelprop: "label",
            value: weightId || '',
            onChange: (e) => setWeightId(e.target.value)
        },
        {
            label: 'Secondary packaging',
            type: 'input',
            labelprop: "label",
            value: secondaryId || '',
            onChange: (e) => setSecondaryId(e.target.value)
        },
        {
            label: 'No of secondary packs/master carton',
            type: 'input',
            labelprop: "label",
            value: secondaryCountId || '',
            onChange: (e) => setSecondaryCountId(e.target.value)
        },
        {
            label: 'UPC',
            type: 'input',
            value: upcId || '',
            options: upc,
            onChange: (e) => setUpcId(e.target.value)
        },
        {
            label: 'Carton type',
            type: 'input',
            value: cartonTypeId || '',
            options: carton || [],
            onChange: (e) => setCartonTypeId(e.target.value)
        },
        {
            label: 'Cap type',
            type: 'input',
            value: capTypeId || '',
            onChange: (e) => setCapTypeId(e.target.value)
        },
        {
            label: quoteItemDetails.isreqnew_packing === 'Yes' ? 'Is palletization required?' : 'Is palletization required?',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isPalletizationDisabled,
            required: true,
            error: validationError?.isPalletization,
            helperText: validationError?.isPalletization,
            value: getAutocompleteValue([{ label: 'Yes', value: true }, { label: 'No', value: false }], quoteItemDetails.isPalletization),
            options: [{ label: 'Yes', value: true }, { label: 'No', value: false }],
            onChange: handleisPalletizationChange
        },
        {
            label: 'Additional requirements',
            type: 'input',
            value: quoteItemDetails.additionalRequirements || '',
            multiline: true,
            onChange: (e) => handleChange(e, 'additionalRequirements'),
        },
    ]
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
    return (<form className={classes.root} noValidate autoComplete="off">
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Sample information</Typography>
            </Grid>
        </Grid>
        <Template payload={payload} />
        {/* <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className='item'>
                <Typography>New packaging type request</Typography>
            </Grid>
        </Grid>
        <Template payload={payload1} /> */}
        <Grid id="top-row" container style={{ margin: 6 }}>
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
        <Template payload={showNewPackingTypeForm ? payload4 : payload2} />
        <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className='item'>
                <Typography>Expected order quantity details</Typography>
            </Grid>
        </Grid>
        <Template payload={payload3} />
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={createQuoteItemAction} />
            </Grid>
            <Grid item>
                <Button label="Cancel" onClick={props.back} />
            </Grid>
        </Grid>
        {/* <Dialog open={showNewPackingTypeForm} maxWidth={"md"}>
            <DialogContent>

                <CreatePackagingType handleClose={() => setShowNewPackingTypeForm(false)} />
            </DialogContent>
        </Dialog> */}
    </form>)
}
export default CreateQuoteItem;