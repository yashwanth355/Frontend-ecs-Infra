import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import { getQuotesInfo, sendMail } from '../../../apis';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import '../../common.css'
import _ from 'lodash';
import useToken from '../../../hooks/useToken'
import roles from '../../../constants/roles';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: 10,
        },
        '& .MuiFormControl-fullWidth': {
            width: '95%',
        },
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        '& #top-row': {
            marginTop: 10,
            marginBottom: 5
        }
    }
}));


const formatDate = (datestr) => {
    let dateVal = datestr ? new Date(datestr) : new Date();
    return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
}

const currentDate = () => {
    // 2019-07-25 17:31:46.967
    var dateVal = new Date();
    return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate() + " " + dateVal.getHours() + ":" + dateVal.getMinutes() + ":" + dateVal.getSeconds();
}

const AddSample = (props) => {
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();
    const userRole = currentUserDetails?.role;
    const userId = currentUserDetails?.id;

    const classes = useStyles();
    const [sample, setSampleInfo] = useState({});
    const [accountName, setAccountName] = useState([]);
    const [contactList, setContactList] = useState([]);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    const [allShippingAddresses, setAllShippingAddresses] = useState([]);

    async function fetchData(data = {}) {
        const createdUser = userRole !== roles.managingDirector ? { "type": "accountdetailsforsamplerequest", "createdbyuserid": userId } : { "type": "accountdetailsforsamplerequest" };
        getQuotesInfo(createdUser).then(res => {
            let account = res;
            setAccountName(account !== null ? account : []);
        });
    }

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    // const formatSampleDetails = (viewPayload, contacts = {}) => ({
    //     ...sample,
    //     'account': viewPayload.account_id || '',   
    //     'address': viewPayload.billing_address || '',
    //     'contactList': contacts,
    // })

    const handleChange = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setSampleInfo({
            ...sample,
            [key]: value,
        })
    }
    const handleChangeContact = async (e, value) => {
        if (!value) {
            return;
        } else {
            // setS ...sample,
            //     'contact': value,
            // })ampleInfo({

            getQuotesInfo({ "type": "shippingaddressoncontacts", "account_id": sample?.account?.account_id?.toString(), "contact_id": value?.contact_id?.toString() }).then(contacts => {
                const unformattedAddressArray = [];
                const addressArray = [];
                contacts?.map(contact =>
                    contact?.shipping_address?.map(address => {
                        unformattedAddressArray.push(address);
                        addressArray.push(address)
                        return null;
                    }
                    )
                )
                setAllShippingAddresses(addressArray);
                let tempQuoteDetails = _.cloneDeep(sample);
                tempQuoteDetails.address =
                    unformattedAddressArray?.find(address =>
                        address?.primary_address) || unformattedAddressArray?.[0];
                tempQuoteDetails.contact = value;
                tempQuoteDetails.contact_id = value?.contact_id;
                setSampleInfo(tempQuoteDetails);

                // var defaultAddress = {};
                // if(response !== undefined) {
                //   setAllShippingAddresses(response !== null ? response[0]?.shipping_address : []);
                //   defaultAddress = (response !== null && response[0]?.shipping_address !== null) ? response[0]?.shipping_address?.find(e => e.primary_address === true) : null;

                // }
                //  setSampleInfo({
                //     ...sample,
                //     'address': defaultAddress !== null ? defaultAddress : {},
                //     'contact': value,
                //     'contact_id': value?.contact_id
                // })
            })
        }
    }

    const handleAddressChange = (e, value) => {
        if (!value) {
            return
        } else {
            setSampleInfo({
                ...sample,
                'address': value,
            })
        }
    }

    const handleChangeAccount = async (e, value) => {
        if (!value) {
            return;
        } else {
            setContactList(value.contact_details === null ? [] : value.contact_details)
            // setSampleInfo(formatSampleDetails(value, value.contact_details));

            setSampleInfo({
                ...sample,
                'account': value,
                'contact': '',
                'contactList': value.contact_details
                // 'account': value.account_id,
                // 'address': value.billing_address
            })
        }
    }

    const payload = [
        {
            label: 'Record type',
            type: 'input',
            disabled: true,
            value: "CCL"
        },
        {
            label: 'Account name',
            type: 'autocomplete',
            labelprop: "account_name",
            value: sample.account,
            options: accountName || [],
            onChange: handleChangeAccount,
        },
        {
            label: 'Created date',
            type: 'input',
            disabled: true,
            value: formatDate(sample.creationDate) || formatDate("")
        },
        {
            label: 'Contact name',
            type: 'autocomplete',
            labelprop: "contact_name",
            value: sample.contact,
            options: contactList || [],
            onChange: handleChangeContact
        },
        {
            label: 'Shipping address',
            type: 'autocomplete',
            labelprop: "address",
            options: allShippingAddresses !== null ? allShippingAddresses : [],
            value: sample.address || '',
            onChange: handleAddressChange,
        },
        // {
        //     label: 'Shipping address',
        //     type: 'input',
        //     multiline: true,
        //     rows: 3,            
        //     value: sample.address || '',           
        //     onChange: (e) => handleChange(e, 'address'),
        // },                     
        {
            label: 'Remarks',
            type: 'input',
            multiline: true,
            rows: 3,
            value: sample.remarks || '',
            onChange: (e) => handleChange(e, 'remarks'),
        }
    ]

    const submitContact = async () => {
        setLoading(true);
        console.log('sample::', sample)
        // let data = {
        //     "account_id": sample.account?.account_id?.toString(),
        //     "contact_id": sample.contact_id ? sample?.contact_id?.toString() : '',
        //     "createddate": currentDate(),
        //     "username": localStorage.getItem("currentUserName"),
        //     "CreatedUserid": localStorage.getItem("currentUserId"),
        //     "masterstatus": "New",
        //     "shipping_address": sample?.address?.shipping_id,
        //     "remarks": sample.remarks || ''
        // };

        // console.log("Data is", data);
        console.log('Account names are', accountName);
        console.log("Contact Name are", contactList);
        console.log("all shippin", allShippingAddresses);
        const account_name = accountName.find(account => account?.account_id === sample?.account?.account_id?.toString())?.account_name;
        const contact_name = contactList.find(contact => contact?.contact_id === sample?.contact_id?.toString())?.contact_name;
        const shipping_address = allShippingAddresses.find(address => address?.shipping_id === sample?.address?.shipping_id)?.address;
        const subject = ` Sample Request from ${account_name}`
        const message = ` A new sample is requested: \n Account Name: ${account_name} \n Contact Name: ${contact_name} \n Shipping Address: ${shipping_address}. \n Sample Requested by ${localStorage.getItem("currentUserName")} on ${currentDate()} `
        for (let email of ["pkonidena@dignosolutions.com", "shilpa.a@continental.coffee"]) {
            const data = {
                "to_email": email,
                "subject": subject,
                "message": message
            }
            try {
                // let response = await createSample(data)
                let response = await sendMail("https://c30j81s4jj.execute-api.ap-south-1.amazonaws.com/dev/", data);
                if (response) {
                    setSnack({
                        open: true,
                        message: "Sample requested successfully",
                    });
                    setTimeout(() => {
                        setLoading(false);
                        props.back()
                        // props.CreatedSample()
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

    return (
        <form className={classes.root} noValidate autoComplete="off">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        Sample request information
                    </Typography>
                </Grid>
            </Grid>
            <Template payload={payload} />
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Back" onClick={() => props.back()} />
                </Grid>
                <Grid item>
                    <Button disabled={loading} label={loading ? 'Loading ...' : 'Request Sample'} onClick={submitContact} />
                </Grid>
            </Grid>
        </form>
    )
}

export default AddSample;
