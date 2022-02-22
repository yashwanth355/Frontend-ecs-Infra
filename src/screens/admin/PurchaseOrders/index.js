import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Container, Grid } from '@material-ui/core';
import Fab from '../../../components/Fab';
import CreatePurchaseOrder from './CreatePurchaseOrder';
import EditPurchaseOrder from './EditPurchaseOrder';
import PurchaseOrderDetails from './PurchaseOrderDetails';
import PurchaseOrderList from './PurchaseOrderList';
import SimpleModal from '../../../components/Modal';
import Button from '../../../components/Button';
import roles from '../../../constants/roles';
import { getAllPurchaseOrders } from '../../../apis';
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import _ from 'lodash';
import { colors } from '../../../constants/colors';

import useToken from '../../../hooks/useToken';
const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        minWidth: '100%'
    },
    formControl: {
        margin: theme.spacing(1),
        marginTop: theme.spacing(2),
        minWidth: 120,
    },
    modal: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 'auto',
        top: "50%",
        right: "50%",
        transform: "translate(50%, -50%)",
        width: 500,
        backgroundColor: theme.palette.background.paper,
        border: '1px solid #fefefe',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

const formatToSelection = (data = [], key) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v.id || v[key] }))
    return formattedData;
}

const PurchaseOrders = (props) => {
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();
    const role = currentUserDetails.role;
    const currentUserId = currentUserDetails.id;
    const [state, setState] = useState('allpos');
    const [filter, setFilter] = useState(null);
    const classes = useStyles();
    const [purchases, setPurchases] = useState(null);
    const [showPurchaseDetails, setPurchaseDetails] = useState(false);
    // const [showSupplier, setPurchaseDetails] = useState(false);  
    const [showEditPurchaseDetails, setEditPurchaseDetails] = useState(false);
    const [showCreatePurchase, setCreatePurchase] = useState(false);
    const [purchaseId, setPurchaseId] = useState(-1);
    const [openCreate, setCreate] = useState(false);
    const [action, setAction] = useState(-1);
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);

    const createActionList = formatToSelection([
        { type: "Green Coffee", id: 1 },
        { type: "Packing", id: 2 },
        { type: "M & E", id: 3 },
        { type: "Canteen", id: 4 },
        { type: "Others", id: 5 },
        { type: "Capital", id: 6 },
        { type: "CSR", id: 7 }], "type", "id");

    const getData = async (filter, state) => {
        console.log("Val ", filter, state);

        let filterString = "";
        if (role !== roles.managingDirector) {
            filterString = filterString + `createdbyuserid = '${currentUserId}'`
        }
        if (state === "Shipped" || state === "In progress" ||
            state === "Closed" || state === "Pending with approval" ||
            state === "New"
        ) {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `status = '${state}'`
        }
        if (state === "GC" || state === "ORM") {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `pocat = '${state}'`
        }
        if (state === "Import" || state === "Domestic") {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `vendortype = '${state}'`
        }
        if (state === "specialgcpos") {
            if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
            filterString = filterString + `cat_type = 'speciality'`;
        }
        if (!_.isEmpty(filter)) {
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + `${filter}`
        }
        let data = { filter: filterString, loggedinuserid: currentUserId }
        let response = await getAllPurchaseOrders(data);
        console.log('Response is', response);
        setPurchases(response);
    };
    console.log("Ran");
    useEffect(() => {
        console.log('Came inside');
        getData(filter, state);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, state]);
    useEffect(() => {
        if (!showCreatePurchase && !showPurchaseDetails && !showEditPurchaseDetails) {
            setFilter(null);
            setState("allpos")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCreatePurchase, showPurchaseDetails, showEditPurchaseDetails]);
    const handleChange = (event) => {
        setState(event.target.value);
        setFilter(null);
    };

    const ShowCreateGCPurchaseHandler = () => {
        setCreatePurchase(true);
        setPurchaseDetails(false);
    };

    // write function 
    // setSupplier(true)

    const HideCreatePurchaseHandler = async () => {
        setState("allpos");
        setCreatePurchase(false);
        await getData(filter, 'allpos');
    };

    const ShowPurchaseDetailsHandler = (event, purchaseId) => {
        setPurchaseDetails(true);
        setPurchaseId(purchaseId);
    };

    const HidePurchaseDetailsHandler = (event, status) => {
        setState(status);
        setPurchaseDetails(false);
    };

    const ShowEditPurchaseDetailsHandler = (event, purchaseId) => {
        setEditPurchaseDetails(true);
        setPurchaseDetails(false);
        setPurchaseId(purchaseId);       
    };

    const HideEditPurchaseDetailsHandler = async(event, status) => {
        setState(status);
        setEditPurchaseDetails(false);
        await getData(filter, status);
    };

    const handleChange1 = (e, value) => {
        e.preventDefault();
        setAction(value);
    }

    const payload = [
        {
            label: 'Select creation type',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            value: action || '',
            options: createActionList || [],
            onChange: handleChange1,
            xs: 12,
            sm: 12
        }
    ];

    const ClearFormCancle = () => {
        setAction(-1);
        setCreate(!openCreate);
    }

    const createAction = () => (
        <Container className={classes.modal}>
            <h2 style={{ color: colors.orange, fontWeight: "700", alignSelf: 'center', margin:"0 0 1rem 0" }}>
                Select Purchase Order Type
            </h2>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} container spacing={100}>
                    <Template payload={payload}></Template>
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center" style={{ margin: "2rem 0 0 0" }}>
                <Grid item>
                    <Button label="Proceed" onClick={createRedirection} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={ClearFormCancle} />
                </Grid>
            </Grid>
        </Container>
    );

    const createRedirection = () => {
        setCreate(false);
        if (action.value === 1) {
            ShowCreateGCPurchaseHandler();
        } else if (action.value === 2) {
            ShowCreateGCPurchaseHandler();
        }
    };

    const exportExcel = () => {
        setShowDownloadExcel(true);
    }
    let component;
    if (showPurchaseDetails) {
        component = <PurchaseOrderDetails back={(e, status) => HidePurchaseDetailsHandler(e, status)} id={purchaseId} editPurchaseDetails={(event, purchaseId) => ShowEditPurchaseDetailsHandler(event, purchaseId)}></PurchaseOrderDetails>
    } else if (showCreatePurchase) {
        component = <CreatePurchaseOrder back={HideCreatePurchaseHandler}></CreatePurchaseOrder>
    } else if (showEditPurchaseDetails) {
        component = <EditPurchaseOrder back={(e, status) => HideEditPurchaseDetailsHandler(e, status)} id={purchaseId}></EditPurchaseOrder>
    } else {
        component = (
            <>
                <Grid container direction="row">
                    <Grid xs={6} item>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel htmlFor="outlined-age-native-simple">View</InputLabel>
                            <Select
                                native
                                value={state}
                                onChange={handleChange}
                                label="View"
                                inputProps={{
                                    name: 'view',
                                    id: 'outlined-view-native-simple',
                                }}
                            >
                                <option value="allpos">All GC Purchase Orders</option>
                                <option value="New">New GC Purchase Orders</option>
                                <option value="Pending with approval">Pending GC Purchase Orders</option>
                                <option value="In progress">In-Progress GC Purchase Orders</option>
                                <option value="Shipped">Shipped GC Purchase Orders</option>
                                <option value="Closed">Closed GC Purchase Orders</option>
                                <option value="GC">GC Purchase Orders</option>
                                <option value="ORM">ORM Purchase Orders</option>
                                <option value="Domestic">Domestic GC Purchase Orders</option>
                                <option value="Import">Import GC Purchase Orders</option>
                                <option value="specialgcpos">Special GC Purchase Orders</option>
                            </Select>
                        </FormControl>
                    </Grid>
                    {
                        currentUserDetails.role !== "GC Stores Executive" &&
                        <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                            {purchases !== null &&
                                <RoundButton
                                    onClick={() => exportExcel()}
                                    label='Export to excel'
                                // variant="extended"
                                />
                            }
                            <Fab onClick={() => setCreate(!openCreate)} label={"Create Purchase Order"} variant="extended" />
                        </Grid>
                    }
                </Grid>
                {showDownloadExcel === true &&
                    <DownloadExcel tableData={purchases} tableName='Purchase Orders' />
                }
                <PurchaseOrderList selectedAdvancedFilters={(val) => setFilter(val)}
                    clearAdvancedFilters={() => setFilter(null)} data={purchases} purchaseDetails={(event, purchaseId) => ShowPurchaseDetailsHandler(event, purchaseId)} />
            </>)
    }

    return (
        <Container className={classes.root}>
            {component}
            <SimpleModal open={openCreate} handleClose={() => setCreate(!openCreate)} body={createAction} />
        </Container>
    )
}

export default PurchaseOrders;