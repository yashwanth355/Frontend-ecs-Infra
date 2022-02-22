import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Container, Grid } from "@material-ui/core";
import Fab from "../../../components/Fab";
import CreateSupplier from "./CreateSupplier";
import SupplierDetails from "./SupplierDetails";
import SupplierOrderList from "./SupplierOrderList";
import EditSupplier from "./EditSupplier";
import { CreateOrEditSupplier, getSuppliersList } from "../../../apis";
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import _ from 'lodash';
// import roles from "../../../constants/roles";
import useToken from "../../../hooks/useToken";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    minWidth: "100%",
  },
  formControl: {
    margin: theme.spacing(1),
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
  modal: {
    position: "absolute",
    margin: "auto",
    top: "25%",
    left: "25%",
    width: 700,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const Supplier = (props) => {
  const { getCurrentUserDetails } = useToken();
  const currentUserDetails = getCurrentUserDetails();
  // const role = currentUserDetails.role;
  const currentUserId = currentUserDetails.id;
  const [state, setState] = useState("allsuppliers");
  const [filter, setFilter] = useState(null);
  const classes = useStyles();
  // eslint-disable-next-line no-unused-vars
  // const [supplier, setSupplier] = useState([]);
  const [showSupplierDetails, setSupplierDetails] = useState(false);
  // const [showSupplier, setPurchaseDetails] = useState(false);
  const [showEditSupplierDetails, setShowEditSupplierDetails] = useState(false);
  const [supplierId, setSupplierId] = useState(-1);
  const [supplier, setSupplier] = useState(null);
  const [supplierData, setSupplierData] = useState({});
  const [showCreateSupplier, setCreateSupplier] = useState(false);
  const [showDownloadExcel, setShowDownloadExcel] = useState(false);

  const getData = async (filter, state) => {
    console.log("Val ", filter, state);

    let filterString = "";
    // if (role !== roles.managingDirector) {
    //   filterString = filterString + `createdbyuserid = '${currentUserId}'`
    // }
    if (state !== "allsuppliers") {
      if (!_.isEmpty(filterString))
        filterString = filterString + " AND "
      filterString = filterString + `groupname = '${state}'`
    }
    if (!_.isEmpty(filter)) {
      if (!_.isEmpty(filterString))
        filterString = filterString + ' AND '
      filterString = filterString + `${filter}`
    }
    let data = { filter: filterString, loggedinuserid: currentUserId }
    let response = await getSuppliersList(data);
    setSupplier(response);
  };
  useEffect(() => {
    getData(filter, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, state]);

  useEffect(() => {
    if (!showCreateSupplier && !showEditSupplierDetails && !showSupplierDetails) {
      filter === null ? setFilter(undefined) : setFilter(null);
      setState("Instant Coffee Suppliers");
      setState("allsuppliers");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateSupplier, showEditSupplierDetails, showSupplierDetails])
  const handleChange = async (event) => {
    setState(event.target.value);
    setFilter(null);
  };

  const HideCreateSupplierHandler = () => {
    setCreateSupplier(false);
  };

  const ShowSupplierDetailsHandler = async (event, supplierId) => {
    setSupplierDetails(!showSupplierDetails)
    setSupplierId(supplierId);
    let response = await CreateOrEditSupplier({ "view": true, "vendor_id": supplierId });
    setSupplierData(response);
  };
  const CreateSupplierClick = () => {
    setCreateSupplier(!showCreateSupplier)
  };

  const HideEditSupplierHandler = () => {
    setShowEditSupplierDetails(!showEditSupplierDetails)
  };

  const HideSupplierDetailHandler = () => {
    setSupplierDetails(!showSupplierDetails)
  };

  const updateSupplierInfo = () => {
    setSupplierDetails(!showSupplierDetails)
    setShowEditSupplierDetails(true)
  };

  const exportExcel = () => {
    setShowDownloadExcel(true);
  }


  let component;

  // if(showSupplier){
  // component = <Supplier  />
  // }

  // if(showPurchaseDetails){
  //     //  component = <SupplierDetails back={(e, status) => HideSupplierDetailsHandler(e, status)} id={purchaseId} editPurchaseDetails={(event, purchaseId) => ShowEditSupplierDetailsHandler(event, purchaseId)}></SupplierDetails>
  //  }else
  if (showCreateSupplier) {
    component = (
      <CreateSupplier back={HideCreateSupplierHandler}></CreateSupplier>
    );
  } else if (showEditSupplierDetails) {
    component = (
      <EditSupplier back={() => HideEditSupplierHandler()} id={supplierId} supplierData={supplierData} ></EditSupplier>
    )
  } else if (showSupplierDetails) {
    component = (
      <SupplierDetails back={() => HideSupplierDetailHandler()} supplierData={supplierData} updateSupplierInfo={() => updateSupplierInfo()} id={supplierId}></SupplierDetails>
    )
  }
  else {
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
                  name: "view",
                  id: "outlined-view-native-simple",
                }}
              >
                <option value="allsuppliers">All Suppliers</option>
                <option value="Instant Coffee Suppliers">Instant Coffee Suppliers</option>
                <option value="Indegenious Green Coffee Supliers">Indigenous Green Coffee Suppliers</option>
                <option value="Imported Green Coffee Suppliers">Imported Green Coffee Suppliers</option>
                <option value="Indigenous Other Raw Material Suppliers">Indigenous Other Raw Material Suppliers</option>
                <option value="Imported Other Raw Material Suppliers">Imported Other Raw Material Suppliers</option>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            xs={6}
            item
            justify="flex-end"
            alignItems="center"
            style={{ display: "flex" }}
          >
            {supplier !== null &&
              <RoundButton
                onClick={() => exportExcel()}
                label='Export to excel'
              // variant="extended"
              />
            }
            <Fab
              onClick={() => CreateSupplierClick()}
              label={"Create Supplier"}
              variant="extended"
            />
          </Grid>
        </Grid>
        {showDownloadExcel === true &&
          <DownloadExcel tableData={supplier} tableName='Supplier' />
        }
        <SupplierOrderList
          data={supplier}
          selectedAdvancedFilters={(val) => setFilter(val)}
          clearAdvancedFilters={() => setFilter(null)}
          supplierDetails={(event, supplierId) =>
            ShowSupplierDetailsHandler(event, supplierId)
          }
        />
      </>
    );
  }

  return (
    <Container className={classes.root}>
      {component}
    </Container>
  );
};

export default Supplier;
