import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Grid } from "@material-ui/core";
import _ from "lodash";
import Fab from "../../../components/Fab";
import LeadsList from "./LeadsList";
import { getLeads } from "../../../apis";
import CreateLead from "./CreateLead";
import EditLead from "./EditLead";
import useToken from "../../../hooks/useToken";
import { DownloadExcel } from "../../../components/DownloadExcel";
import RoundButton from "../../../components/RoundButton";
import roles from "../../../constants/roles";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
}));

const Leads = () => {

  const { getCurrentUserDetails } = useToken();
  const currentUserDetails = getCurrentUserDetails();
  const userRole = currentUserDetails?.role;
  const currentUserId = currentUserDetails?.id;
  const [state, setState] = React.useState(userRole === roles.managingDirector ? "allleads" : "myleads");
  const classes = useStyles();
  const [leads, setLeads] = useState(null);
  const [route, setRoute] = useState("");
  const [leadId, setLeadId] = useState(-1);
  const [filter, setFilter] = useState("")
  const [showDownloadExcel, setShowDownloadExcel] = useState(false);

  const fetchData = async (filter, state) => {
    let filterString = "";
    if (currentUserDetails?.role !== roles.managingDirector || state === "myleads") {
      filterString = filterString + `createdbyuserid = '${currentUserDetails?.id}'`
    }
    if (state !== "allleads" && state !== "myleads") {
      if (!_.isEmpty(filterString))
        filterString = filterString + ' AND '
      filterString = filterString + ` masterstatus = '${state}'`
    }
    if (!_.isEmpty(filter)) {
      if (!_.isEmpty(filterString))
        filterString = filterString + ' AND '
      filterString = filterString + `${filter}`
    }
    let data = { filter: filterString, loggedinuserid: currentUserId }
    let response = await getLeads(data);
    setLeads(response);
  };
  useEffect(() => {
    fetchData(filter, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, filter]);
  useEffect(() => {
    if (route === "")
      fetchData("", "allleads")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route])

  const goBack = () => {
    setState("allleads");
    setRoute("");
  };

  const settingRoute = (event, leadId) => {
    console.log("Lead id", leadId);
    setLeadId(leadId);
    setRoute(event);
  };

  const exportExcel = () => {
    setShowDownloadExcel(true);
  };
  if (!_.isEmpty(route)) {
    if (route === "create_lead") return <CreateLead back={() => goBack()} />;
    else return <EditLead back={() => goBack()} leadId={leadId} />;
  }
  return (
    <>
      <Grid container direction="row">
        <Grid xs={6} item>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="outlined-age-native-simple">View</InputLabel>
            <Select
              native
              value={state}
              onChange={(event) => { setState(event.target.value); setFilter(null) }}
              label="View"
              inputProps={{
                name: "view",
                id: "outlined-view-native-simple",
              }}
            >
              {currentUserDetails?.role === roles.managingDirector ? <option value="allleads">All Leads</option> : null}
              <option value="myleads">My Leads</option>
              <option value="New">New</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Account Created">Account Created</option>

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
          {leads !== null && (
            <RoundButton
              onClick={() => exportExcel()}
              label="Export to excel"
            // variant="extended"
            />
          )}
          <Fab
            onClick={() => setRoute("create_lead")}
            label={"Create Lead"}
            variant="extended"
          />
        </Grid>
      </Grid>
      {showDownloadExcel === true && (
        <DownloadExcel tableData={leads} tableName="Lead" />
      )}
      <LeadsList
        selectedAdvancedFilters={(val) => setFilter(val)}
        clearAdvancedFilters={() => setFilter("")}
        data={leads}
        commonFilter={state}
        setRoute={(event, leadId) => settingRoute(event, leadId)}
      />
    </>
  );
};

export default Leads;
