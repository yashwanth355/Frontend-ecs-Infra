import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Grid, InputLabel } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Fab from "../../../components/Fab";
import CreateGc from "./CreateGc";
import EditGc from "./EditGc";
import GcDetails from "./GcDetails";
import GcList from "./GcList";
import { getGCs, getGcCreationInfo } from "../../../apis";
import { DownloadExcel } from "../../../components/DownloadExcel";
import RoundButton from "../../../components/RoundButton";
import useToken from "../../../hooks/useToken";
import _ from "lodash";
import roles from "../../../constants/roles";

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

export const formatToSelection = (data = [], key, id) => {
  let formattedData = [];
  data.map((v) => formattedData.push({ label: v[key], value: v[id] }));
  return formattedData;
};

const Gc = (props) => {
  const { getCurrentUserDetails } = useToken();
  const currentUserDetails = getCurrentUserDetails();
  const role = currentUserDetails.role;
  const currentUserId = currentUserDetails.id;
  const classes = useStyles();
  const [state, setState] = useState("allgcs");
  const [filter, setFilter] = useState(null);
  const [gc, setGc] = useState(null);
  const [showGcDetails, setGcDetails] = useState(false);
  const [showEditGc, setEditGc] = useState(false);
  const [showCreateGc, setCreateGc] = useState(false);
  const [gcId, setGcId] = useState(-1);
  const [viewGCData, setViewGCData] = useState({});
  const [itemGroup, setItemGroup] = useState([]);
  const [showDownloadExcel, setShowDownloadExcel] = useState(false);

  const getItemGroups = async () => {
    getGcCreationInfo({
      type: "itemgroups",
    }).then((res) => {
      console.log("Response fetched is", res);
      setItemGroup(formatToSelection(res, "group_name", "group_id"));
    });
  };
  const getData = async (filter, state) => {
    let filterString = "";
    if (role !== roles.managingDirector) {
      filterString = filterString + `createdbyuserid = '${currentUserId}'`;
    }
    console.log("state is", state, filterString);
    if (state === "specialgcs") {
      if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
      filterString = filterString + `cat_type = 'speciality'`;
    } else if (state !== "allgcs") {
      if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
      filterString = filterString + `groupname = '${state}'`;
    }
    if (!_.isEmpty(filter)) {
      if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
      filterString = filterString + `${filter}`;
    }

    let data = { filter: filterString, loggedinuserid: currentUserId };
    let response = await getGCs(data);
    setGc(response);
  };
  useEffect(() => {
    getData(filter, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, state]);
  useEffect(() => {
    if (!showCreateGc && !showEditGc && !showGcDetails) {
      filter === null ? setFilter(undefined) : setFilter(null);
      setState("allgcs");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateGc, showEditGc, showGcDetails]);
  useEffect(() => {
    getItemGroups();
  }, []);

  const handleChange = async (event) => {
    setState(event.target.value);
    setFilter(null);
  };

  const ShowCreateGcHandler = () => {
    setCreateGc(true);
    setGcDetails(false);
  };

  const HideCreateGcHandler = () => {
    setCreateGc(false);
  };

  const ShowGcDetailsHandler = (event, gcId) => {
    setGcDetails(true);
    setGcId(gcId);
  };

  const HideGcDetailsHandler = (event) => {
    setGcDetails(false);
  };

  // const ShowEditGcHandler = (event, gcId) => {
  //     setEditGc(true);
  //     setGcDetails(false);
  //     setGcId(gcId);
  // };

  const HideEditGcHandler = (event) => {
    setEditGc(false);
  };
  const updateGcActionInfo = (data) => {
    setGcDetails(!showGcDetails);
    setViewGCData(data);
    setEditGc(true);
  };

  const exportExcel = () => {
    setShowDownloadExcel(true);
  };

  let component;
  if (showCreateGc) {
    component = <CreateGc back={HideCreateGcHandler}></CreateGc>;
  } else if (showEditGc) {
    component = (
      <EditGc back={() => HideEditGcHandler()} id={gcId} data={viewGCData} />
    );
  } else if (showGcDetails) {
    component = (
      <GcDetails
        back={() => HideGcDetailsHandler()}
        updateGcActionInfo={(data) => updateGcActionInfo(data)}
        id={gcId}
      />
    );
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
                  name: "view",
                  id: "outlined-view-native-simple",
                }}
              >
                <option value="allgcs">All GCs</option>
                <option value="specialgcs">Special Coffee</option>
                {/* eslint-disable-next-line */}
                {itemGroup.map((item, index) => {
                  return <option value={item.label}>{item.label}</option>;
                })}
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
            {gc !== null && (
              <RoundButton
                onClick={() => exportExcel()}
                label="Export to excel"
              // variant="extended"
              />
            )}
            <Fab
              onClick={ShowCreateGcHandler}
              label={"Create GC"}
              variant="extended"
            />
          </Grid>
        </Grid>
        {showDownloadExcel === true && (
          <DownloadExcel tableData={gc} tableName="GC" />
        )}
        <GcList
          selectedAdvancedFilters={(val) => setFilter(val)}
          clearAdvancedFilters={() => setFilter(null)}
          data={gc}
          gcDetails={(event, gcId) => ShowGcDetailsHandler(event, gcId)}
        />
      </>
    );
  }

  return <Container className={classes.root}>{component}</Container>;
};

export default Gc;
