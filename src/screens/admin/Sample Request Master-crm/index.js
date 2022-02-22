import React, { useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MasterSampleRequestList from './MasterSampleRequestList';
import EditMasterSample from './EditMasterSample';
import { Container, Grid } from '@material-ui/core';
import { getSampleRequests } from "../../../apis";

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

const Contacts = (props) => {
    const [state, setState] = React.useState('My Sample Request');
    const classes = useStyles();
    const [sampleRequests, setSampleRequests] = useState([]); 
    const [showSampleEdit, setSampleEdit] = useState(false);
    const [sampleId, setSampleId ] = useState(-1);
    async function fetchData() {
        let response = await getSampleRequests({});
        setSampleRequests(response);
    }
    useEffect(() => {
        fetchData();
    }, [sampleRequests?.length]);
        
    const handleChange = (event) => {
        setState(event.target.value,);
    };
    
    const ShowEditMasterSampleHandler = (event, sampleId) => {
        setSampleEdit(true);
        setSampleId(sampleId);      
    };
    
    const HideMasterSampleEditHandler = () => {                     
        setSampleEdit(false);
    };

    let component;

    if(showSampleEdit){
        component = <EditMasterSample back={HideMasterSampleEditHandler} id={sampleId}></EditMasterSample>
    } else {
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
                            <option value="My Sample Request">My Sample Request</option>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                        {/* <Fab onClick={() => setSampleAdd(true)} label={"Sample Request"} variant="extended" /> */}
                    </Grid>
                </Grid>
                <MasterSampleRequestList 
                    data={sampleRequests}
                    masterSampleEditId={(event, sampleId) => ShowEditMasterSampleHandler(event, sampleId)}
                />
            </>
        )
    }

    return (
        <Container className={classes.root}>
            {component}
        </Container>
    )
}

export default Contacts;