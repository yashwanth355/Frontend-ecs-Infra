 // eslint-disable-next-line
import React, { useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
 // eslint-disable-next-line
import { Container, Grid } from '@material-ui/core';
 // eslint-disable-next-line
import Template from '../../../components/Template';
 // eslint-disable-next-line
import Button from '../../../components/Button';
import Fab from '../../../components/Fab';
 // eslint-disable-next-line
  // eslint-disable-next-line
import SimpleModal from '../../../components/Modal';
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
 // eslint-disable-next-line
import useToken from '../../../hooks/useToken';
 // eslint-disable-next-line
import { colors } from '../../../constants/colors';
 // eslint-disable-next-line
import _ from 'lodash';
import MasterSampleList from './MasterSampleList';

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

const MasterSampleRequest = (props) => {
    const classes = useStyles();
     // eslint-disable-next-line
    const [MasterSampleRequests, setMasterSampleRequests] = useState(null);
     // eslint-disable-next-line
    const [openCreate, setCreate] = useState(false);
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);
     // eslint-disable-next-line
    const [filter, setFilter] = useState(null);
    const [state, setState] = useState('all');
     // eslint-disable-next-line
    const [viewSampleData, setViewSampleData] = useState({});
     // eslint-disable-next-line
    const [showMasterSampleDetails, setMasterSampleDetails] = useState(false);
     // eslint-disable-next-line
    const [masterSampleId, setMasterSampleId] = useState(-1);

    const CreateMasterSample = () => {
        setCreate(true)
    }

    const exportExcel = () => {
        setShowDownloadExcel(true);
    }

    const ShowMasterSampleDetailsHandler = async (event, sampleId) => {
        // let response = await getviewGCDebitNoteDetail({ "debit_noteid": sampleId });
        // await setViewSampleData(response);
        setMasterSampleDetails(true);
        setMasterSampleId(sampleId);
    };

    const handleChange = async (event) => {
        setState(event.target.value);
        setFilter(null);
    };

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
                {MasterSampleRequests !== null &&
                    <RoundButton
                        onClick={() => exportExcel()}
                        label='Export to excel'
                    // variant="extended"
                    />
                }
                <Fab onClick={CreateMasterSample} label={"Master Sample Request"} variant="extended" />
            </Grid>
        </Grid>
        {showDownloadExcel === true &&
            <DownloadExcel tableData={MasterSampleRequests} tableName='Master Sample' />
        }
        <MasterSampleList selectedAdvancedFilters={(val) => setFilter(val)}
            clearAdvancedFilters={() => setFilter(null)} data={MasterSampleRequests} sampleDetails={(event, sampleId) => ShowMasterSampleDetailsHandler(event, sampleId)} />
        {/* <SimpleModal open={openCreate} handleClose={() => setCreate(!openCreate)} body={createAction} /> */}
    </>
    )
}

export default MasterSampleRequest;