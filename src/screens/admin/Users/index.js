import React, { useEffect, useState } from 'react';
import CreateUser from './CreateUser';
import _ from 'lodash';
import { Container, Grid } from '@material-ui/core';
import Fab from '../../../components/Fab';
import { makeStyles } from '@material-ui/core/styles';
import UserDetails from './UserDetails';
import EditUser from './EditUser';
import Table from '../../../components/Table';
import { changeUserStatus, changeUserStatusDisable, getUserDetails } from "../../../apis";
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import useToken from '../../../hooks/useToken';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        minWidth: '100%'
    },
    excelExport: {
        margin: '0 10px 0 0 !important',
        color: '#ffffff',
        textTransform: 'capitalize',
        backgroundColor: '#F05A30',
        width: 'auto',
        height: '48px',
        padding: '0 20px',
        minWidth: '48px',
        minHeight: 'auto',
        borderRadius: '24px',
        boxShadow: '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%)',
    }
}));

const User = (props) => {
    const classes = useStyles();
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const currentUserId = currentUserDetails?.id;

    const [users, setUsers] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [editUserDetails, setEditUserDetails] = useState(false);
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);
    const [emailId, setEmailId] = useState();
    const [filter, setFilter] = useState("");
    const [userRoute, setRoute] = useState('');
    const fetchData = async (filter) => {
        let data = { filter, loggedinuserid: currentUserId }
        let response = await getUserDetails(data);
        setUsers(response ?? []);
    };
    useEffect(() => {
        if (userRoute === "")
            fetchData(filter);
             // eslint-disable-next-line
    }, [filter, userRoute]);
    let component;

    const ShowUserDetailsHandler = (event, emailId) => {
        setShowUserDetails(true);
        setEditUserDetails(false);
        setEmailId(emailId);
        setRoute("viewUserDetails")
    };

    const EditUserDetailHandler = (event, emailId) => {
        setEditUserDetails(true);
        setEmailId(emailId);
        setShowUserDetails(false);
        setRoute("editUserDetails")
    };

    // const UpdateInfo = () => {
    //     fetchData();
    // };

    // const UpdateCreateUserInfo = () => {
    //     fetchData();
    // };

    const exportExcel = () => {
        setShowDownloadExcel(true);
    }

    const userStatus = async (username, status) => {
        try {
            let response;
            let payload = {
                "username": username.trim(),
            }
            console.log("status", status)
            if (status === 'disable') {
                response = await changeUserStatusDisable(payload)
            } else {
                response = await changeUserStatus(payload)
            }
            let active = status === 'disable' ? false : true;
            let payload1 = {
                "type": "changestatus",
                "emailid": username.trim(),
                "active": active,
                "loggedinuserid": currentUserId
            }
            response = await getUserDetails(payload1)
            console.log("response", response);
            if (response) {
                fetchData();
            }
        } catch (e) {
            console.log("Error changeing user status", e.message);
        }
    }

    // const clearAdvancedFilters = async () => {
    //     let response = await getUserDetails();
    //     setUsers(response);
    // }

    // const selectedAdvancedFilters = async (val) => {
    //     var data = {};
    //     // if(state !== 'All Quotes') {
    //     //   data = {
    //     //     getinfo: '',
    //     //     deep_filter: true,
    //     //     userid: localStorage.getItem('currentUserId'),
    //     //     deep_filter_args: val,
    //     //   };
    //     // } else {
    //     data = {
    //         getinfo: '',
    //         deep_filter: true,
    //         deep_filter_args: val,
    //     };
    //     // }
    //     let response = await getUserDetails(data);
    //     setUsers(response);
    // };

    if (_.isEmpty(userRoute)) {
        component = (
            <>
                <Grid container direction="column">
                    <Grid item justify="flex-end" style={{ display: 'flex' }}>
                        {users !== null &&
                            <RoundButton
                                onClick={() => exportExcel()}
                                label='Export to excel'
                                className={classes.excelExport}
                            // variant="extended"
                            />
                        }
                        <Fab onClick={() => setRoute('createuser')} label={"Create User"} variant="extended" />
                    </Grid>
                    {showDownloadExcel === true &&
                        <DownloadExcel tableData={users} tableName='Users' />
                    }
                    <Grid item style={{ marginTop: 25, maxWidth: '100%' }}>
                        <Table selectedAdvancedFilters={(val) => setFilter(val)}
                            clearAdvancedFilters={() => setFilter("")} data={users} userStatus={userStatus} viewUserDetails={(event, emailId) => ShowUserDetailsHandler(event, emailId)} />
                    </Grid>
                </Grid>
            </>
        )
    } else if (showUserDetails && !_.isEmpty(userRoute) && userRoute === "viewUserDetails") {
        component = <UserDetails emailId={emailId} back={() => setRoute("")} edit={(event, emailId) => EditUserDetailHandler(event, emailId)} />
    } else if (editUserDetails && !_.isEmpty(userRoute) && userRoute === "editUserDetails") {
        component = <EditUser emailId={emailId} back={() => setRoute("")} update={() => { }} />
    } else {
        component = <CreateUser back={() => setRoute("")} updateCreationInfo={() => { }} />
    }
    return (
        <Container className={classes.root}>
            {component}
        </Container>
    )
}

export default User;