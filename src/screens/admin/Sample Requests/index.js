import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import SampleRequestList from './SampleRequestList';
import EditSample from './EditSample';
import { Container, Grid } from '@material-ui/core';
import SampleDetails from './SampleDetails';
import { getSampleRequests } from "../../../apis";
import Fab from '../../../components/Fab';
import AddSample from './AddSample';
import RoundButton from '../../../components/RoundButton';
import { DownloadExcel } from '../../../components/DownloadExcel';
import _ from 'lodash';
import useToken from "../../../hooks/useToken";
import roles from '../../../constants/roles';


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
}));

let sampleFilter = [
    { label: 'All sample requests', value: 'all' },
    { label: 'My sample requests', value: 'mysamples' },
    { label: 'New sample requests', value: 'New' },
    { label: 'Pending with QC sample requests', value: 'Pending with QC' },
    { label: 'Dispatched to HO sample requests', value: 'Samples Dispatched to HO' },
    { label: 'Dispatched to customer sample requests', value: 'Samples Dispatched to Customer' },
    { label: 'Approved sample requests', value: 'Approved' },
]

const SampleRequest = (props) => {
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const role = currentUserDetails?.role;
    const currentUserId = currentUserDetails?.id;
    const [filteredValue, setFilteredValue] = React.useState(role === roles.managingDirector ? 'all' : "mysamples");
    const [filter, setFilter] = useState("");
    const classes = useStyles();
    const [sampleRequests, setSampleRequests] = useState(null);
    const [showSampleDetails, setSampleDetails] = useState(false);
    const [showSampleEdit, setSampleEdit] = useState(false);
    const [showSampleAdd, setSampleAdd] = useState(false);
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);
    const [sampleId, setSampleId] = useState(-1);
    // async function fetchData() {
    //     let response = await getSampleRequests({});
    //     setSampleRequests(response);
    //     // let response1 = await getUserDetails();
    //     // setCurrentUser(response1);
    // }
    const getData = async (filter, state) => {
        let filterString = "";
        if (role !== roles.managingDirector || state === "mysamples") {
            filterString = filterString + `createdbyuserid = '${currentUserId}'`
        }
        if (state !== "all" && state !== "mysamples") {
            console.log("Filter ", filterString);
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + ` status = '${state}'`
        }
        if (!_.isEmpty(filter)) {
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + `${filter}`
        }
        console.log("Filter string is", filterString);
        let data = { filter: filterString, loggedinuserid: currentUserId }
        let response = await getSampleRequests(data);
        setSampleRequests(response);
    };
    useEffect(() => {
        console.log('Came inside this');
        if (!showSampleAdd || !showSampleEdit)
            getData(filter, filteredValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredValue, filter, showSampleAdd, showSampleEdit]);
    // useEffect(() => {

    // }, [filteredValue,])
    const ShowSampleDetailsHandler = (event, sampleId) => {
        setSampleDetails(true);
        setSampleId(sampleId);
    };

    const HideSampleDetailsHandler = () => {
        setSampleDetails(false);

    };

    const ShowSampleEditHandler = (event, sampleId) => {
        setSampleDetails(false);
        setSampleAdd(false);
        setSampleEdit(true);
        setSampleId(sampleId);
    };

    const HideSampleEditHandler = () => {
        setSampleEdit(false);
        setSampleDetails(false);
    };

    const HideSampleAddHandler = () => {
        setSampleAdd(false);
    };

    const CreatedSample = () => {
        setSampleDetails(true);
        setSampleAdd(false);
        setSampleEdit(false);
    }

    const exportExcel = () => {
        setShowDownloadExcel(true);
    }

    const clearAdvancedFilters = async () => {
        setFilter("");
    }

    // const selectedAdvancedFilters = async (val) => {
    //     var data = {};
    //     if (filteredValue !== 'all') {
    //         data = {
    //             getinfo: filteredValue,
    //             deep_filter: true,
    //             userid: localStorage.getItem('currentUserId'),
    //             deep_filter_args: val,
    //         };
    //     } else {
    //         data = {
    //             getinfo: filteredValue,
    //             deep_filter: true,
    //             deep_filter_args: val,
    //         };
    //     }
    //     let response = await getSampleRequests(data);
    //     setSampleRequests(response);
    // };

    let component;

    if (showSampleDetails) {
        component = <SampleDetails back={HideSampleDetailsHandler} id={sampleId} editSample={(event, sampleId) => ShowSampleEditHandler(event, sampleId)}></SampleDetails>
    } else if (showSampleEdit) {
        component = <EditSample back={HideSampleEditHandler} id={sampleId}></EditSample>
    } else if (showSampleAdd) {
        component = <AddSample back={HideSampleAddHandler} CreatedSample={CreatedSample} />
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
                                value={filteredValue}
                                onChange={(event) => { setFilteredValue(event.target.value); setFilter("") }}
                                label="View"
                                inputProps={{
                                    name: 'view',
                                    id: 'outlined-view-native-simple',
                                }}
                            >
                                {sampleFilter.map((item, index) => {
                                    if (item?.value === "all" && role !== roles.managingDirector) {
                                        return null
                                    }
                                    else return <option value={item.value}>{item.label}</option>
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                        {sampleRequests !== null &&
                            <RoundButton
                                onClick={() => exportExcel()}
                                label='Export to excel'
                            // variant="extended"
                            />
                        }
                        <Fab onClick={() => setSampleAdd(true)} label={"Sample Request"} variant="extended" />
                    </Grid>
                </Grid>

                {showDownloadExcel === true &&
                    <DownloadExcel tableData={sampleRequests} tableName='Sample Request' />
                }

                <SampleRequestList selectedAdvancedFilters={(val) => setFilter(val)}
                    clearAdvancedFilters={clearAdvancedFilters} data={sampleRequests} sampleDetails={(event, sampleId) => ShowSampleDetailsHandler(event, sampleId)} />
            </>)
    }

    return (
        <Container className={classes.root}>
            {component}
        </Container>
    )
}

export default SampleRequest;