import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import { getQuotesInfo, createQuote, getCountryNames } from '../../../apis';
import useToken from '../../../hooks/useToken';
import Snackbar from '../../../components/Snackbar';
import '../../common.css'
import roles from '../../../constants/roles';

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
    data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
    return formattedData;
}


const CreateQuote = (props) => {
    const classes = useStyles();
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();
    const userRole = currentUserDetails?.role;
    const userId = currentUserDetails?.id;

    const [quoteDetails, setQuoteDetails] = useState({});
    const [accountDetails, setAccountDetails] = useState([{}]);
    const [validationError, setValidationError] = useState({});
    const [accountName, setAccountName] = useState([]);
    const [contactName, setContactName] = useState({});
    const [finalClient, setFinalClient] = useState([]);
    const [incoterms, setIncoTerms] = useState([]);
    const [currency, setCurrency] = useState([]);
    const [loadingPorts, setLoadingPorts] = useState([]);
    const [destinationPorts, setDestinationports] = useState([]);
    const [billingAddresses, setBillingAddresses] = useState([]);
    const [countries, setCountries] = useState([]);
    const [isContactDisabled, setContactDisabled] = useState(true);
    const [currencyResponse, setCurrencyResponse] = useState([]);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    function formatBillingAddress(address) {
        return { label: address?.address, value: address?.billing_id }
    }
    useEffect(() => {
        getQuotesInfo({ "type": "incoterms" }).then(res => res !== null && setIncoTerms(formatToSelection(res, 'incoterms', 'incotermsid')));
        getQuotesInfo({ "type": "currencies" }).then(res => { res !== null && setCurrencyResponse(res); setCurrency(formatToSelection(res, 'currencyname', 'currencycode')) });
        getQuotesInfo({ "type": "loadingports" }).then(res => res !== null && setLoadingPorts(formatToSelection(res, "portloading_name", 'id')));
        getQuotesInfo({ "type": "destinationports" }).then(res => res !== null && setDestinationports(formatToSelection(res, 'destination_port', 'id')));

        getCountryNames().then(res => res !== null && setCountries(formatToSelection(res, 'country', 'countryid')));
        // eslint-disable-next-line 
    }, []);

    useEffect(() => {
        const createdUser = userRole !== roles.managingDirector ? { "type": "accountdetailsforQuotation", "createdbyuserid": userId } : { "type": "accountdetailsforQuotation" };
        getQuotesInfo(createdUser).then((res) => {
            if (res !== null) {
                setFinalClient(res !== null ? formatToSelection(res, 'account_name', "account_id") : []);
                if (props.accountId) {
                    // eslint-disable-next-line
                    let account = res !== null ? res.find(acc => acc.account_id == props.accountId) : undefined;
                    setAccountDetails(res !== null ? res : []);
                    setAccountName(res !== null ? formatToSelection(res, 'account_name', "account_id") : []);
                    let contactList = (account?.contact_details ? formatToSelection(account.contact_details, "contact_name", "contact_id") : []);
                    const defaultContactName = contactList.length !== 0 ?
                        { label: contactList[0]?.label, value: contactList[0]?.value } : {};
                    if (!!defaultContactName) {
                        setContactDisabled(false);
                    }
                    let temp = {
                        accountName: account !== undefined ? { label: account.account_name, value: account.account_id } : {},
                        contact: defaultContactName,
                        contactList: contactList,
                        accountType: account !== undefined ? account.accounttype_name : '',
                        accountTypeId: account !== undefined ? account.accounttype_id : '',
                    };
                    setQuoteDetails(temp);
                    setContactName(defaultContactName);
                } else {
                    setAccountDetails(res);
                    setAccountName(res !== null ? formatToSelection(res, 'account_name', "account_id") : []);
                }
            }
        });
        // eslint-disable-next-line
    }, [props.accountId])
    useEffect(() => {
        let tempQuoteDetails = _.cloneDeep(quoteDetails);
        getQuotesInfo({
            "type": "billingaddressoncontacts",
            "account_id": quoteDetails?.accountName?.value?.toString(),
            "contact_id": quoteDetails?.contact?.value?.toString(),
        })
            .then(contacts => {
                const unformattedAddressArray = [];
                const addressArray = [];
                contacts?.map(contact =>
                    contact?.billing_address?.map(address => {

                        unformattedAddressArray.push(address);
                        addressArray.push(formatBillingAddress(address));
                        return null;
                    }
                    )
                )
                setBillingAddresses(addressArray);
                tempQuoteDetails.billingAddress = formatBillingAddress(unformattedAddressArray?.find(address =>
                    address?.primary_address) || unformattedAddressArray?.[0])
                setQuoteDetails(tempQuoteDetails);
            }
            )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactName])
    const handleChange = (event, key,) => {
        let data = {
            ...quoteDetails,
            [key]: event.target.value
        }
        setQuoteDetails(data);
        console.log(data);
    };
    const handleAutoCompleteChange = (event, key, value,) => {

        let data = {
            ...quoteDetails,
            [key]: value
        }
        setQuoteDetails(data);
    };
    const handlecontactChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'contact': value
        }
        setContactName(value);
        setQuoteDetails(data);
    }
    const handleincoTermsChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'incoTerms': value
        }
        setQuoteDetails(data);
    }
    const handlecurrencyChange = (e, value) => {

        let data = {
            ...quoteDetails,
            'currency': value,
        }
        setQuoteDetails(data);
    }
    const handleclientChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'client': value
        }
        setQuoteDetails(data);
    }
    const handleloadingPortChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'loadingPort': value,
            "portLoadingName": value?.label
        }
        setQuoteDetails(data);
    }
    const handledestinationCountryChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'destinationCountry': value,
        }
        setQuoteDetails(data);
    }
    const handledestinationPortChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'destinationPort': value,
            "destinationPortName": value?.label,
        }
        setQuoteDetails(data);
    }

    const handleAccountNameChange = (event, value) => {
        // if (!value) {
        //     return;
        // } else {
        let details = accountDetails?.find(acc => acc.account_id === value?.value);
        console.log('details::', accountDetails, value?.value)
        let contactDetails = details?.contact_details ? formatToSelection(details?.contact_details, "contact_name", "contact_id") : [];
        let data = {
            ...quoteDetails,
            'accountName': value,
            "accountType": details?.accounttype_name,
            "accountTypeId": details?.accounttype_id,
            "billingAddress": details?.billing_address,
            "contactList": contactDetails,
            "contact": contactDetails?.length > 0 ? { label: contactDetails[0]?.label, value: contactDetails[0]?.value } : "1"
        }
        setContactDisabled(false);
        setContactName({});
        setQuoteDetails(data);
    };

    const handleDateChange = (date, key,) => {
        let data = {
            ...quoteDetails,
            [key]: date
        }
        setQuoteDetails(data);
        console.log(data);
    };

    const formatDate = (datestr) => {
        let dateVal = datestr ? new Date(datestr) : new Date();
        return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
    }

    const createQuoteAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = {};
        if (accountName.length > 0 && _.isEmpty(quoteDetails.accountName?.toString())) {
            errorObj = { ...errorObj, accountName: message };
        }
        if (_.isEmpty(quoteDetails.incoTerms)) {
            errorObj = { ...errorObj, incoTerms: message };
        }
        if (_.isEmpty(quoteDetails.currency)) {
            errorObj = { ...errorObj, currency: message };
        }
        if (_.isEmpty(quoteDetails?.billingAddress)) {
            errorObj = { ...errorObj, billingAddress: message }
        }
        if (!quoteDetails.loadingPort) {
            errorObj = { ...errorObj, loadingPort: message };
        }
        if (!quoteDetails.dispatchFrom) {
            errorObj = { ...errorObj, dispatchFrom: message };
        }
        if (!quoteDetails.dispatchTo) {
            errorObj = { ...errorObj, dispatchTo: message };
        }
        if (!_.isEmpty(errorObj)) {
            setValidationError(errorObj);
        }
        else {
            let data =
            {
                "update": false,
                "quoteid": new Date().getUTCMilliseconds(),
                "createduserid": (currentUserDetails.id),
                "accountid": quoteDetails.accountName?.value?.toString(),
                "accounttypeid": (quoteDetails.accountTypeId),
                "accounttypename": quoteDetails.accountType,
                "finalclientaccountid": quoteDetails.client?.value?.toString() || '0',
                "billing_id": quoteDetails?.billingAddress?.value,
                "incotermsid": quoteDetails.incoTerms.value,
                "createddate": new Date(),
                "fromdate": quoteDetails.dispatchFrom,
                "todate": quoteDetails.dispatchTo,
                "currencycode": quoteDetails.currency?.value,
                'currencyid': currencyResponse.find(currency => currency?.currencycode === quoteDetails?.currency?.value)?.currencyid,
                "portloadingid": quoteDetails.loadingPort?.value?.toString(),
                "destinationid": quoteDetails.destinationPort?.value?.toString() || '0',
                "isactive": 1,
                "payment_terms": quoteDetails.terms,
                "other_specification": quoteDetails.others,
                "remarks_marketing": quoteDetails.remarks,
                "destination_port": quoteDetails.destinationPortName,
                "port_loading": quoteDetails.portLoadingName,
                "destination_country": quoteDetails.destinationCountry?.label,
                "destination_countryid": quoteDetails.destinationCountry?.value,
                "status_id": "1",
                "master_status": "New",
                "contactid": quoteDetails.contact?.value?.toString() || '1'
            }
            // console.log('Data is',data);
            // return;
            setLoading(true);
            try {
                let response = await createQuote(data)
                console.log("Response", response);
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote created successfully",
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
            label: 'Account name',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.accountName,
            helperText: validationError?.accountName,
            value: quoteDetails.accountName || [],
            options: accountName || [],
            onChange: handleAccountNameChange
        },
        {
            label: 'Contact name',
            type: 'autocomplete',
            labelprop: "label",
            disabled: isContactDisabled,
            value: quoteDetails.contact || '',
            options: quoteDetails.contactList || [],
            onChange: handlecontactChange
        },
        {
            label: 'Account type',
            type: 'input',
            multiline: true,
            required: true,
            disabled: true,
            rows: 2,
            value: quoteDetails.accountType || ''
        },
        {
            label: 'Quote creation date',
            type: 'input',
            disabled: true,
            value: formatDate(quoteDetails.creationDate) || formatDate("")
        },
        {
            label: 'Billing address',
            type: 'autocomplete',
            options: billingAddresses || [],
            multiline: true,
            required: true,
            rows: 3,
            error: validationError?.billingAddress,
            helperText: validationError?.billingAddress,
            value: quoteDetails.billingAddress || '',
            onChange: (e, value) => handleAutoCompleteChange(e, "billingAddress", value),
        },
        {
            label: 'Payment terms',
            type: 'input',
            value: quoteDetails.terms,
            onChange: (e) => handleChange(e, 'terms')
        },
        {
            label: 'Incoterms',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.incoTerms,
            helperText: validationError?.incoTerms,
            value: quoteDetails.incoTerms,
            options: incoterms,
            onChange: handleincoTermsChange,
        },
        {
            label: 'Quote status',
            type: 'input',
            disabled: true,
            value: quoteDetails.status || 'New',
        },
        {
            label: 'Remarks from marketing',
            type: 'input',
            value: quoteDetails.remarks,
            multiline: true,
            onChange: (e) => handleChange(e, 'remarks'),
        },
        {
            label: 'Customer currency',
            type: 'autocomplete',
            labelprop: "label",
            value: quoteDetails.currency || [],
            required: true,
            error: validationError?.currency,
            helperText: validationError?.currency,
            options: currency,
            onChange: handlecurrencyChange
        },
        {
            label: 'Final client',
            type: 'autocomplete',
            labelprop: "label",
            value: quoteDetails.client || [],
            options: finalClient,
            onChange: handleclientChange
        },
    ]

    const payload1 = [
        {
            label: 'Port of loading',
            type: 'autocomplete',
            labelprop: "label",
            value: quoteDetails.loadingPort || [],
            required: true,
            error: validationError?.loadingPort,
            helperText: validationError?.loadingPort,
            options: loadingPorts,
            onChange: handleloadingPortChange,
        },
        {
            label: 'Destination country',
            type: 'autocomplete',
            labelprop: "label",
            value: quoteDetails.destinationCountry,
            options: countries,
            onChange: handledestinationCountryChange
        },
        {
            label: 'Dispatch period from',
            type: 'datePicker',
            value: quoteDetails.dispatchFrom || null,
            required: true,
            error: validationError?.dispatchFrom,
            helperText: validationError?.dispatchFrom,
            minDate: new Date(),
            onChange: (date) => handleDateChange(date, 'dispatchFrom'),
            sm: 3
        },
        {
            label: 'Dispatch period to',
            type: 'datePicker',
            value: quoteDetails.dispatchTo || null,
            required: true,
            error: validationError?.dispatchTo,
            helperText: validationError?.dispatchTo,
            minDate: new Date(),
            onChange: (date) => handleDateChange(date, 'dispatchTo'),
            sm: 3
        },
        {
            label: 'Destination port',
            type: 'autocomplete',
            labelprop: "label",
            value: quoteDetails.destinationPort,
            options: destinationPorts,
            onChange: handledestinationPortChange,
        },
        {
            label: 'Others (Specification)',
            type: 'input',
            value: quoteDetails.others,
            onChange: (e) => handleChange(e, 'others')
        },
    ]

    return (<form className={classes.root} noValidate autoComplete="off">
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Quote information</Typography>
            </Grid>
        </Grid>
        <Template payload={payload} />
        <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className='item'>
                <Typography>Dispatch details</Typography>
            </Grid>
        </Grid>
        <Template payload={payload1} />
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={createQuoteAction} />
            </Grid>
            <Grid item>
                <Button label="Cancel" onClick={props.back} />
            </Grid>
        </Grid>
    </form>)
}
export default CreateQuote;
