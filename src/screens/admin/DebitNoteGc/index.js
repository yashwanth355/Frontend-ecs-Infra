import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import DebitNoteGcRequestList from './DebitNoteGcRequestList';
import EditDebitNoteGc from './EditDebitNoteGc';
import { Container, Grid } from '@material-ui/core';
import DebitNoteGcDetails from './DebitNoteGcDetails';
import Template from '../../../components/Template';
import { getlistGCDebitNoteDetails, getviewGCDebitNoteDetail } from "../../../apis";
import Button from '../../../components/Button';
import Fab from '../../../components/Fab';
import AddDebitNoteGc from './AddDebitNoteGc';
import SimpleModal from '../../../components/Modal';
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import useToken from '../../../hooks/useToken';
import { colors } from '../../../constants/colors';
// import roles from '../../../constants/roles';
import _ from 'lodash';

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

let sampleFilter = [
    { label: 'All', value: 'all' },
    { label: 'Pending Request', value: 'Pending request' },
    { label: 'Pending Approval', value: 'Pending approval' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Account Verified', value: 'Account verified' },
    { label: 'Released', value: 'Released' },
]

const formatToSelection = (data = [], key) => {
    console.log("key")
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v.id || v[key] }))
    return formattedData;
}

const DebitNoteGc = (props) => {
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    // const role = currentUserDetails.role;
    const currentUserId = currentUserDetails.id;
    const [state, setState] = useState('all');
    const [filter, setFilter] = useState(null);
    const classes = useStyles();
    const [debitNoteGcRequests, setDebitNoteGcRequests] = useState(null);
    const [showDebitNoteGcDetails, setDebitNoteGcDetails] = useState(false);
    const [showDebitNoteGcEdit, setDebitNoteGcEdit] = useState(false);
    const [showDebitNoteGcAdd, setDebitNoteGcAdd] = useState(false);
    const [openCreate, setCreate] = useState(false);
    const [viewGcData, setViewGcData] = useState({});
    const [sampleId, setDebitNoteGcId] = useState(-1);
    const [action, setAction] = useState(-1);
    const createActionList = formatToSelection([
        { type: "Green Coffee", id: 1 },
        { type: "Packing", id: 2 },
        { type: "M & E", id: 3 },
        { type: "Capital", id: 4 }
    ], "type", "id");
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);

    const getData = async (filter, state) => {
        console.log("Val ", filter, state);

        let filterString = "";
        // if (role !== roles.managingDirector) {
        //     filterString = filterString + `createdbyuserid = '${currentUserId}'`
        // }
        if (state !== "all") {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `status = '${state}'`
        }
        if (!_.isEmpty(filter)) {
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + `${filter}`
        }
        let data = { filter: filterString, loggedinuserid: currentUserId }
        let response = await getlistGCDebitNoteDetails(data);
        setDebitNoteGcRequests(response);
    };
    useEffect(() => {
        getData(filter, state);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, state]);
    useEffect(() => {
        if (!showDebitNoteGcAdd && !showDebitNoteGcDetails && !showDebitNoteGcEdit) {
            filter === null ? setFilter(undefined) : setFilter(null);
            setState("all");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDebitNoteGcDetails, showDebitNoteGcEdit, showDebitNoteGcAdd])
    const handleChange = async (event) => {
        setState(event.target.value);
        setFilter(null);
    };

    const ShowDebitNoteGcDetailsHandler = async (event, sampleId) => {
        let response = await getviewGCDebitNoteDetail({ "debit_noteid": sampleId });
        await setViewGcData(response);
        setDebitNoteGcDetails(true);
        setDebitNoteGcId(sampleId);
    };

    const HideDebitNoteGcDetailsHandler = () => {
        setAction(-1);
        setDebitNoteGcDetails(false);
    };

    const ShowDebitNoteGcEditHandler = (event, sampleId) => {
        setDebitNoteGcDetails(false);
        setDebitNoteGcAdd(false);
        setDebitNoteGcEdit(true);
        setDebitNoteGcId(sampleId);
    };

    const HideDebitNoteGcEditHandler = () => {
        setAction(-1);
        setDebitNoteGcEdit(false);
        setDebitNoteGcDetails(false);

    };

    const HideDebitNoteGcAddHandler = () => {
        setAction(-1);
        setDebitNoteGcAdd(false);
    };

    const CreatedDebitNoteGc = () => {
        setDebitNoteGcDetails(true);
        setDebitNoteGcAdd(false);
        setDebitNoteGcEdit(false);
    }

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
            sm: 12,
        }
    ]

    const createAction = () => (
        <Container className={classes.modal}>
            <h2 style={{ color: colors.orange, fontWeight: "700", alignSelf: 'center', margin: "0 0 1rem 0" }}>
                Select Debit Note Type
            </h2>
            <Grid id="top-row" container>
                <Grid id="top-row" item sm={12}>
                    <Template payload={payload} ></Template>
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center" style={{ margin: "2rem 0px 0px 0px" }}>
                <Grid item>
                    <Button label="Proceed" disabled={action?.value === 1 ? false : true} onClick={createRedirection} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={ClearFormCancle} />
                </Grid>
            </Grid>
        </Container>
    );

    const createRedirection = () => {
        setCreate(false);
        setDebitNoteGcAdd(true);
    };

    const ClearFormCancle = () => {
        setAction(-1);
        setCreate(false);
    }

    const CreateDebitNote = () => {
        setCreate(true)
    }

    const exportExcel = () => {
        setShowDownloadExcel(true);
    }

    let component;

    if (showDebitNoteGcDetails) {
        component = <DebitNoteGcDetails data={viewGcData} back={HideDebitNoteGcDetailsHandler} id={sampleId} editDebitNoteGc={(event, sampleId) => ShowDebitNoteGcEditHandler(event, sampleId)}></DebitNoteGcDetails>
    } else if (showDebitNoteGcEdit) {
        component = <EditDebitNoteGc data={viewGcData} back={HideDebitNoteGcEditHandler} id={sampleId}></EditDebitNoteGc>
    } else if (showDebitNoteGcAdd) {
        component = <AddDebitNoteGc back={HideDebitNoteGcAddHandler} CreatedDebitNoteGc={CreatedDebitNoteGc} />
    }

    else {
        return (
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
                                {sampleFilter.map((item, index) => {
                                    return (
                                        <option value={item.value}>{item.label}</option>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                        {debitNoteGcRequests !== null &&
                            <RoundButton
                                onClick={() => exportExcel()}
                                label='Export to excel'
                            // variant="extended"
                            />
                        }
                        <Fab onClick={CreateDebitNote} label={"Debit Note GC Request"} variant="extended" />
                    </Grid>
                </Grid>
                {showDownloadExcel === true &&
                    <DownloadExcel tableData={debitNoteGcRequests} tableName='Debit Note GC' />
                }
                <DebitNoteGcRequestList selectedAdvancedFilters={(val) => setFilter(val)}
                    clearAdvancedFilters={() => setFilter(null)} data={debitNoteGcRequests} sampleDetails={(event, sampleId) => ShowDebitNoteGcDetailsHandler(event, sampleId)} />
                <SimpleModal open={openCreate} handleClose={() => setCreate(!openCreate)} body={createAction} />
            </>
        )
    }

    return (
        <Container className={classes.root}>
            {component}
        </Container>
    )
}

export default DebitNoteGc;