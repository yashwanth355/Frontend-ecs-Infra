import React, { useEffect, useContext } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import TextField from "@material-ui/core/TextField";
import Tab from "@material-ui/core/Tab";
import Grid from '@material-ui/core/Grid'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import ExitToApp from "@material-ui/icons/ExitToApp";
import EditIcon from "@material-ui/icons/Edit";
import LockIcon from "@material-ui/icons/Lock";
import Typography from "@material-ui/core/Typography";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Container from "@material-ui/core/Container";
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { colors } from "../constants/colors";
import CustomMenu from "./Menu";
import SimpleModal from "./Modal";
import Button from "./Button";
import { changePassword, getNotifications } from "../apis";
import { changePasswordSchema } from "../utils/validations";
import useToken from "../hooks/useToken";
import NotificationsIcon from "@material-ui/icons/Notifications";
import Badge from "@material-ui/core/Badge";
import TablePagination from '@material-ui/core/TablePagination';
import Box from "@material-ui/core/Box";
import Popover from "@material-ui/core/Popover";
import Snackbar from '../components/Snackbar';
import {
  useNavigate,
  NavLink
} from 'react-router-dom';
import { AuthContext } from "../context/auth-context";

const StyledTabs = withStyles({
  indicator: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
    "& > span": {
      maxWidth: 40,
      width: "100%",
      backgroundColor: colors.orange,
    },
  },
})((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

const StyledTab = withStyles((theme) => ({
  root: {
    textTransform: "none",
    color: colors.orange,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    "&:focus": {
      opacity: 1,
      fontWeight: 800,
    },
    "& > span": {
      height: "100%",
    },
    opacity: 0.8,
    fontWeight: 600,
    padding: "unset",
    minWidth: "180px",
  }
}))((props) => <Tab disableRipple {...props} />);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  notification: {
    marginRight: '2em',
    cursor: 'pointer',
    position: 'relative',
  },
  notificationBox: {
    height: '350px',
    width: '300px',
    zIndex: '99',
    boxShadow: '0px 0px 4px 2px #0e0e0e38',
    // borderRadius: '10px',
    padding: '10px'
  },
  hyperspan: {
    color: '#337ab7',
    cursor: 'pointer',
  },
  semiNotiBox: {
    overflow: 'auto',
    border: '1px solid #0000008c',
    borderRadius: '10px',
    height: '290px',
    width: '100%',
  },
  mainNotiRow: {
    margin: '5px',
  },
  mainNotiRowP: {
    color: '#000',
  },
  markRead: {
    color: '#337ab7',
    margin: '0 0 5px 0',
    textAlign: 'right',
    cursor: 'pointer',
  },
  mainNotiRowH3: {
    color: '#000',
    margin: '0',
  },
  padding: {
    padding: theme.spacing(3),
  },
  demo2: {
    backgroundColor: theme.palette.background.paper,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    position: "absolute",
    margin: "auto",
    top: "40%",
    left: "40%",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  label: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: 700,
  },
}));

export default function CustomizedTabs(props) {
  const classes = useStyles();
  const auth = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openChangePass, setChangePass] = React.useState(false);
  const [oldPass, setOldPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [allNotificationData, setAllNotificationData] = React.useState(null);
  const [countNotification, setCountNotification] = React.useState(-1);
  const [anchorElN, setAnchorElN] = React.useState(null);
  const [showSnack, setSnack] = React.useState({ open: false, message: '', severity: '' });
  const [showPassword, setShowPassword] = React.useState({
    old: false, new: false
  })
  const [passwordError, setPasswordError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { getCurrentUserDetails, getPreference } = useToken();
  let currentUserDetails = getCurrentUserDetails();
  const email = getPreference()?.name;
  const navigate = useNavigate();
  const profileMenuOptions = [
    {
      name: "Edit Profile",
      icon: <EditIcon />,
      action: () => void 0,
    },
    {
      name: "Change Password",
      icon: <LockIcon />,
      action: () => setChangePass(!openChangePass),
    },
    {
      name: "Logout",
      icon: <ExitToApp />,
      action: () => getLogout(),
    },
  ];
  const vendorProfileMenuOptions = [
    {
      name: "Logout",
      icon: <ExitToApp />,
      action: () => getVendorLogout(),
    },
  ];

  const open = Boolean(anchorElN);
  const id = open ? "simple-popover" : undefined;

  const getLogout = () => {
    auth.removeToken().then(() => {
      navigate('/login')
    })
  }
  const getVendorLogout = () => {
    auth.removeToken().then(() => {
      navigate('/login/vendor')
    })
  }
  // eslint-disable-next-line
  useEffect(async () => {
    async function fetchData() {
      let response = await getNotifications({ "userid": localStorage.getItem('currentUserId'), "get_count": true });
      setCountNotification(parseInt(response.notify_count));
    }
    fetchData();
  }, []);

  const interval = setInterval(async function () {
    let response = await getNotifications({ "userid": localStorage.getItem('currentUserId'), "get_count": true });
    setCountNotification(parseInt(response.notify_count));
  }, 3000);

  clearInterval(interval);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  // const handleChange = (event) => {
  //   localStorage.setItem(
  //     "currentActivePage",
  //     event.target.parentElement.tabIndex
  //   );
  //   // localStorage.setItem("currentActivePageRoute", to);
  //   setValue(event.target.parentElement.tabIndex);
  // };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCloseN = () => {
    setAnchorElN(null);
  };

  const getTabs = () => {
    const tabArray = [];
    props?.routes?.map((route, index) => {
      if (route?.roles === undefined ||
        route?.roles?.indexOf(currentUserDetails?.role) > -1) {
        tabArray.push(<NavLink to={route?.to}
          style={({ isActive }) => ({
            borderBottom: isActive && `2px solid ${colors.orange}`,
            textDecoration: 'none'
          })
          }>
          <StyledTab tabIndex={index} label={route?.label} />
        </NavLink >)
      }
      return null
    })
    return tabArray;
  }
  const handlePassChange = (event, key) => {
    if (key === "oldPass") {
      setOldPass(event.target.value);
    } else {
      setNewPass(event.target.value);
    }
  };

  const onChangePass = async (event) => {
    event.preventDefault();
    const value = changePasswordSchema.validate({ password: newPass });
    if (value?.error?.details.length) {
      if (value.error.details[0].path.includes("password")) {
        setPasswordError("Password must be minimum 8 character long along with uppercase, lowercase, special character and numbers");
        setTimeout(() => setPasswordError(''), 5000)
      }
    } else {
      setLoading(true);
      try {
        const response = await changePassword({
          username: email,
          previouspassword: oldPass,
          newpassword: newPass,
        });
        if (response) {
          setSnack({
            open: true,
            message: "Password updated successfully",
          });
          setTimeout(() => {
            cancelChangePassword();
            setSnack({
              open: false,
              message: ""
            })
          }, 2000)
        }
      } catch (e) {
        console.log("Error here", e);
        setSnack({
          open: true,
          message: e.response.data,
          severity: 'error'
        })
        console.log("Error in changing pass", e.message);
      }
      finally {
        setLoading(false);
      }
    }
  };
  const togglePassword = (key) => {
    setShowPassword({ ...showPassword, [key]: !showPassword[key] })
  }
  const cancelChangePassword = () => {
    setNewPass("");
    setOldPass("");
    setShowPassword({ old: false, new: false })
    setChangePass(false);
  }
  const changePass = () => (
    <Container className={classes.paper}>
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-end">
        <Grid item sm={10}>
          <TextField
            label="Old Password"
            value={oldPass}
            onChange={(e) => handlePassChange(e, "oldPass")}
            required
            type={showPassword?.old ? "text" : "password"}
            fullWidth
          />
        </Grid>
        <Grid item sm={1}>
          {showPassword?.old ? <VisibilityOffIcon onClick={() => togglePassword("old")} color="disabled" /> :
            <VisibilityIcon onClick={() => togglePassword("old")} color="disabled" />}
        </Grid>
      </Grid>
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-end">
        <Grid item sm={10}>
          <TextField
            label="New Password"
            value={newPass}
            onChange={(e) => handlePassChange(e, "newPass")}
            required
            error={Boolean(passwordError.length)}
            helperText={passwordError}
            type={showPassword?.new ? "text" : "password"}
            fullWidth
          />
        </Grid>
        <Grid item sm={1}>
          {showPassword?.new ?
            <VisibilityOffIcon onClick={() => togglePassword("new")} color="disabled" />
            : <VisibilityIcon onClick={() => togglePassword("new")} color="disabled" />}
        </Grid>
      </Grid>
      <Grid container direction="column"
        xs={12} md={12} justifyContent="center"
        alignItems="center"
      >
        <Grid item>
          <Button disabled={loading} label={loading ? "Loading..." : "Change Password"} onClick={onChangePass} />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={cancelChangePassword} />
        </Grid>
      </Grid>
    </Container >
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const getAllRead = async () => {
    setAllNotificationData([]);
    getNotifications({ "userid": localStorage.getItem('currentUserId'), "read_all": true });
    setAnchorElN(null);
  }

  const openNotification = async (event) => {
    setAnchorElN(event.currentTarget)
    let response1 = await getNotifications({ "userid": localStorage.getItem('currentUserId'), "view": true });
    setAllNotificationData(response1.notifications_feed);
  }

  // let getAllTabs = [
  //   {
  //     id: 0,
  //     name: 'Home'
  //   },
  //   {
  //     id: 1,
  //     name: 'Lead'
  //   },
  //   {
  //     id: 2,
  //     name: 'Account'
  //   },
  //   {
  //     id: 3,
  //     name: 'Contact'
  //   },
  //   {
  //     id: 4,
  //     name: 'Sample Req'
  //   },
  //   {
  //     id: 5,
  //     name: 'Sample Req Master'
  //   },
  //   {
  //     id: 6,
  //     name: 'Quote'
  //   },
  //   {
  //     id: 7,
  //     name: 'User'
  //   },
  //   {
  //     id: 8,
  //     name: 'Purchase Order'
  //   },
  //   {
  //     id: 9,
  //     name: 'Debit Note'
  //   },
  //   {
  //     id: 10,
  //     name: 'MRIN'
  //   },
  //   {
  //     id: 11,
  //     name: 'GC'
  //   },
  //   {
  //     id: 12,
  //     name: 'Supplier'
  //   },
  // ]

  // const feedItemClick = (item) => {
  //   var temp = getAllTabs.find(val => val.name === item.feature_category)
  //   setValue(temp.id);
  //   setAnchorElN(null);
  // }

  return (
    <div className={classes.root}>

      {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
      <AppBar position="static" style={{ backgroundColor: colors.orange }}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
          >
            {/* <MenuIcon /> */}
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {/* CCL CMS */}
          </Typography>

          <div className={classes.notification} onClick={(event) => openNotification(event)}>
            <Badge badgeContent={countNotification} showZero>
              <NotificationsIcon />
            </Badge>
          </div>

          <Popover
            id={id}
            open={open}
            anchorEl={anchorElN}
            onClose={handleCloseN}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Box
              component="div"
              noValidate
              className={classes.notificationBox}
              autoComplete="off"
            >
              <div>
                <h3 className={classes.mainNotiRowH3}>Notification</h3>
                <p className={classes.markRead} onClick={() => getAllRead()}>Mark all as read</p>
                {allNotificationData != null &&
                  <div className={classes.semiNotiBox}>
                    {allNotificationData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => {
                      return (
                        <div className={classes.mainNotiRow}>
                          <p className={classes.mainNotiRowP}>
                            {/* {item.feature_category} &nbsp;<span onClick={() => feedItemClick(item)} className={classes.hyperspan}>{item.notification_id}</span>&nbsp;   */}
                            {item.status}</p>
                        </div>
                      )
                    })}
                    <TablePagination
                      rowsPerPageOptions={[10, 25, 100]}
                      component="div"
                      count={allNotificationData.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onChangePage={handleChangePage}
                      onChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                  </div>
                }
              </div>
            </Box>
          </Popover>


          <div id="user-details">
            <div className={classes.label}>{currentUserDetails.name}</div>
            <div>{currentUserDetails.role}</div>
          </div>
          <CustomMenu
            handleClose={handleClose}
            anchorEl={anchorEl}
            options={
              currentUserDetails.role === "Vendor"
                ? vendorProfileMenuOptions
                : profileMenuOptions
            }
          >
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={handleClick}
            >
              <AccountCircle />
            </IconButton>
          </CustomMenu>
        </Toolbar>
      </AppBar>
      <AppBar position="static" color="default">
        <div className={classes.demo2}>
          <StyledTabs
            aria-label="tabs"
            variant="scrollable"
            scrollButtons="auto"
          // onChange={handleChange}
          >
            {getTabs()}
          </StyledTabs>
        </div>
      </AppBar>
      <SimpleModal
        open={openChangePass}
        handleClose={() => setChangePass(!openChangePass)}
        body={changePass}
      />
      {/* <Container maxWidth="xl">
        {props.children}
      </Container> */}
      <div style={{ flex: 1, maxHeight: "calc(100vh - 130px)", overflow: 'scroll', margin:'1rem' }}>
        {props.children}
      </div>
    </div>
  );
}

CustomizedTabs.defaultProps = {
  routes: [],
  component: () => <div />,
};