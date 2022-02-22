import React, { useContext, useEffect } from 'react';
import Login from './screens/Login';
import VendorLogin from './screens/VendorLogin';
import ForgetPassword from './screens/ForgetPassword';
import { makeStyles } from '@material-ui/core/styles';
import {
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import CustomizedTabs from './components/Tabs';
import { mainRoutes, vendorRoutes } from './config/routes';
import UserProfile from './screens/UserProfile';
import { Grid, Container, Card, CardContent, } from '@material-ui/core';
import Background from "./assets/images/background.jpg";
// import Iframe from './components/IFrame';
import SwipeableTextMobileStepper from './components/Stepper';
import useToken from './hooks/useToken';
import VendorPurchaseForm from './screens/admin/PurchaseOrders/VendorPurchaseForm';
import Home from './screens/admin/Users/Home/home';
import Leads from './screens/admin/Leads';
import Accounts from './screens/admin/Accounts';
import Contacts from './screens/admin/Contacts';
import SampleRequests from './screens/admin/Sample Requests';
// eslint-disable-next-line
import MasterSampleRequests from './screens/admin/Sample Request Master';
import PurchaseOrders from "./screens/admin/PurchaseOrders";
import DebitNoteGC from './screens/admin/DebitNoteGc';
import Quotes from './screens/admin/Quotes';
import GC from './screens/admin/Gc';
import MRIN from './screens/admin/Mrin';
import Supplier from './screens/admin/Supplier';
import Users from './screens/admin/Users'
import { AuthContext } from './context/auth-context';
import roles from './constants/roles';
import PackingType from './screens/admin/PackingType';
// import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
// import MyDocument from './screens/admin/PurchaseOrders/PdfDownload/POViewPDF2';
// import MyDocument1 from './screens/admin/PurchaseOrders/PdfDownload/POViewPDF3';

// window.innerWidth
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    position: 'relative',
    maxWidth: '100%',
    margin: 0,
    backgroundImage: `url(${Background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    paddingRight: 0,
    paddingLeft: 0
  },
}));

const WithBackground = (props) => {
  const classes = useStyles();
  return (
    <Container component="main" maxWidth="xs" className={classes.root}>
      {
        !props.iframe ?
          <Grid container spacing={0} direction="column" alignItems="center" justify="center"
            style={{ minHeight: '100vh' }}>
            <Grid item xs={12} sm={12}>
              <Card>
                <CardContent>
                  {props.children}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          :
          <Grid container spacing={0} direction="row" style={{ height: '100vh' }}>
            <Grid item xs={12} sm={6} justify="center" alignItems="center" style={{ display: 'flex' }}>
              <Card>
                <CardContent>
                  {props.children}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <SwipeableTextMobileStepper />
            </Grid>
          </Grid>
      }
    </Container>
  )
}


function RequireAuth(props) {
  let auth = useContext(AuthContext);
  let location = useLocation();
  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  if (auth.role === roles.vendor && props.path !== "/vendor")
    return <Navigate to="/vendor" />
  const permittedRoles = mainRoutes.find(route => route?.to === location.pathname)?.roles;
  if (auth.role !== roles.vendor && props.path === "/vendor")
    return <Navigate to="/home" />
  if (permittedRoles !== undefined &&
    permittedRoles?.indexOf(auth?.role) === -1) {
    return <Navigate to="/home" />
  }
  return props.children;
}
function CheckAuth(props) {
  let auth = useContext(AuthContext);
  const location = useLocation();
  if (!!auth.token && auth.role === roles.vendor)
    return <Navigate to="/vendor" />
  if (!!auth.token) {
    return <Navigate to={location?.state?.from?.pathname || "/home"} />;
  }
  return props.children;
}
function AuthWrapperWithTab(props) {
  return <RequireAuth routes={mainRoutes}>
    <CustomizedTabs routes={mainRoutes}>
      {props.children}
    </CustomizedTabs>
  </RequireAuth>
}
function App() {
  const { storeToken, setPreference, getPreference, token, role, removeToken, refreshToken } = useToken();

  useEffect(() => {
    refreshToken();
    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 1200000)
    return () => {
      clearInterval(refreshInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      {/* <PDFDownloadLink document={<MyDocument />} fileName="somename.pdf">
        {({ blob, url, loading, error }) =>
          loading ? 'Loading document...' : 'Download now!'
        }
      </PDFDownloadLink> */}
      {/* <PDFViewer width="100%" height="1000">
        <MyDocument purchaseDetails={{}} />
      </PDFViewer> */}

      <AuthContext.Provider value={{
        token: token,
        role: role,
        storeToken: storeToken,
        setPreference: setPreference,
        getPreference: getPreference,
        removeToken: removeToken,
      }}>
        <Routes>
          <Route path="/vendor" element={<RequireAuth path="/vendor">
            <CustomizedTabs routes={vendorRoutes}>
              <VendorPurchaseForm />
            </CustomizedTabs>
          </RequireAuth>}
          />
          <Route path="/home" exact element={<AuthWrapperWithTab><Home /></AuthWrapperWithTab>} />
          <Route path="/leads" exact element={
            <AuthWrapperWithTab>
              <Leads />
            </AuthWrapperWithTab>} />
          <Route path="/home" exact element={
            <AuthWrapperWithTab>
              <Home />
            </AuthWrapperWithTab>} />
          <Route path="/accounts" exact element={
            <AuthWrapperWithTab>
              <Accounts />
            </AuthWrapperWithTab>} />
          <Route path="/contacts" exact element={
            <AuthWrapperWithTab>
              <Contacts />
            </AuthWrapperWithTab>} />
          <Route path="/sample-request" exact element={
            <AuthWrapperWithTab>
              <SampleRequests />
            </AuthWrapperWithTab>} />
          {/* <Route path="/master-sample-request" exact element={
            <AuthWrapperWithTab>
              <MasterSampleRequests />
            </AuthWrapperWithTab>} />             */}
          <Route path="/quotes" exact element={
            <AuthWrapperWithTab>
              <Quotes />
            </AuthWrapperWithTab>} />
          <Route path="/users" exact element={
            <AuthWrapperWithTab>
              <Users />
            </AuthWrapperWithTab>} />
          <Route path="/purchase-orders" exact element={
            <AuthWrapperWithTab>
              <PurchaseOrders />
            </AuthWrapperWithTab>} />
          <Route path="/debit-note-gc" exact element={
            <AuthWrapperWithTab>
              <DebitNoteGC />
            </AuthWrapperWithTab>} />
          <Route path="/mrin" exact element={
            <AuthWrapperWithTab>
              <MRIN />
            </AuthWrapperWithTab>} />
          <Route path="/gc" exact element={
            <AuthWrapperWithTab>
              <GC />
            </AuthWrapperWithTab>} />
            <Route path="/packing-type" exact element={
            <AuthWrapperWithTab>
              <PackingType />
            </AuthWrapperWithTab>} />
          <Route path="/supplier" exact element={
            <AuthWrapperWithTab>
              <Supplier />
            </AuthWrapperWithTab>} />
          <Route path="/login" element={<CheckAuth>
            <WithBackground>
              <Login />
            </WithBackground>
          </CheckAuth>} />
          <Route path="/forget" element={<WithBackground>
            <ForgetPassword />
          </WithBackground>} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/login/vendor" element={
            <CheckAuth>
              <WithBackground>
                <VendorLogin />
              </WithBackground>
            </CheckAuth>} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </AuthContext.Provider>
    </>
  );
}

export default App;
