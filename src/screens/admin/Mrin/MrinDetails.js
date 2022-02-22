import React, { useEffect, useState } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Grid,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { getMRINDetail, createOrUpdateMRINDetail } from "../../../apis";
import Button from "../../../components/Button";
import "../../common.css";
import SimpleModal from "../../../components/Modal";
import Snackbar from "../../../components/Snackbar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import useToken from "../../../hooks/useToken";
import _ from "lodash";
import BasicTable from "../../../components/BasicTable";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
    },
    "& .MuiFormControl-fullWidth": {
      width: "95%",
    },
    "& .page-header": {
      width: "100%",
      marginBottom: 15,
    },
    flexGrow: 1,
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  card: {
    boxShadow:
      "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
    marginBottom: 5,
  },
  modal: {
    position: "absolute",
    margin: "auto",
    top: "30%",
    left: "30%",
    width: 700,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  control: {
    marginTop: 3,
    marginBottom: 3,
  },
}));

const formatGCCompositions = (delivered_spec, dispatched_spec, expected_spec) => {
  return [
    {
      composition_name: "Density(Gm/Cc)",
      key: "del_density",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_density : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_density : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_density : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_density - delivered_spec[0].del_density) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_density : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_density : 0
    },
    {
      composition_name: "Moisture (%)",
      key: "del_moisture",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_moisture : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_moisture : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_moisture : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_moisture - delivered_spec[0].del_moisture) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_moisture : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_moisture : 0
    },
    {
      composition_name: "Browns (%)",
      key: "del_browns",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_browns : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_browns : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_browns : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_browns - delivered_spec[0].del_browns) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_browns : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_browns : 0
    },
    {
      composition_name: "Blacks (%)",
      key: "del_blacks",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_blacks : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_blacks : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_blacks : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_blacks - delivered_spec[0].del_blacks) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_blacks : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_blacks : 0
    },
    {
      composition_name: "Broken & Bits (%)",
      key: "del_brokenbits",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_brokenbits : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_brokenbits : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_brokenbits : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_brokenbits - delivered_spec[0].del_brokenbits) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_brokenbits : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_brokenbits : 0
    },
    {
      composition_name: "Insected beans (%)",
      key: "del_insectedbeans",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_insectedbeans : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_insectedbeans : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_insectedbeans : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_insectedbeans - delivered_spec[0].del_insectedbeans) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_insectedbeans : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_insectedbeans : 0
    },
    {
      composition_name: "Bleached (%)",
      key: "del_bleached",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_bleached : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_bleached : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_bleached : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_bleached - delivered_spec[0].del_bleached) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_bleached : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_bleached : 0
    },
    {
      composition_name: "Husk (%)",
      key: "del_husk",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_husk : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_husk : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_husk : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_husk - delivered_spec[0].del_husk) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_husk : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_husk : 0
    },
    {
      composition_name: "Sticks (%)",
      key: "del_sticks",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_sticks : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_sticks : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_sticks : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_sticks - delivered_spec[0].del_sticks) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_sticks : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_sticks : 0
    },
    {
      composition_name: "Stones (%)",
      key: "del_stones",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_stones : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_stones : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_stones : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_stones - delivered_spec[0].del_stones) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_stones : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_stones : 0
    },
    {
      composition_name: "Beans retained on 5mm mesh during sieve analysis",
      key: "del_beansretained",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_beansretained : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_beansretained : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_beansretained : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_beansretained - delivered_spec[0].del_beansretained) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_beansretained : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_beansretained : 0
    },
  ];
};

const MrinDetails = (props) => {
  const classes = useStyles();
  const [mrinDetails, setMrinDetails] = useState({});
  const [submitSample, setSubmitSample] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState("");
  const [openApprove, setApprove] = useState(false);
  const [openPaid, setPaid] = useState(false);
  const [validationError, setValidationError] = useState({});
  const [compositions, setCompositions] = useState([]);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const { getCurrentUserDetails } = useToken();
  let currentUserDetails = getCurrentUserDetails();

  const gcTableColumns = [
    { id: "composition_name", label: "Item" },
    { id: "expected_spec", label: "Expected" },
    { id: "dispatched_spec", label: "Dispatched" },
    { id: "delivered_spec", label: "Delivered" },
    { id: "difference", label: "Difference" },
  ];

  useEffect(() => {
    getMRINDetail({ type: "viewmrin", mrinid: props.id }).then((res) => {
      if (res !== null) {
        setMrinDetails(res);
        setCompositions(formatGCCompositions(res.delivered_spec, res.dispatched_spec, res.expected_spec));
      }
    });

    getMRINDetail({ type: "getDocumentsOnMRIN", mrinid: props.id }).then(
      (res) => {
        if (res) {
          setInvoiceFile(res[res.length - 1]);
        }
      }
    );

    // eslint-disable-next-line
  }, [props.id]);

  const handleClickPo = (e) => {
    props.viewPo("detail_mrin", mrinDetails.pono);
  };

  const payload = [
    {
      type: "label",
      value: "PO number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      // eslint-disable-next-line
      value: <a href="#">{mrinDetails.pono}</a>,
      onClick: (e) => handleClickPo(e),
      sm: "6",
    },
    {
      type: "label",
      value: "Expected quantity(Kgs)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.expected_quantity
        ? parseFloat(mrinDetails.expected_quantity).toFixed(4)
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Vehicle number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        !mrinDetails.vehicle_no || mrinDetails.vehicle_no === ""
          ? "-"
          : mrinDetails.vehicle_no,
      sm: "6",
    },
    {
      type: "label",
      value: "Invoice date",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.invoice_date === "" ? "-" : mrinDetails.invoice_date,
      sm: "6",
    },
    {
      type: "label",
      value: "Invoice quantity(Kgs)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.invoice_quantity
        ? parseFloat(mrinDetails.invoice_quantity).toFixed(4)
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Delivery date",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.delivery_date,
      sm: "6",
    },
    {
      type: "label",
      value: "Weighment shortage",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.wayment_shortage
        ? parseFloat(mrinDetails.wayment_shortage).toFixed(4)
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Way bill number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.wayBillNumber ? mrinDetails.wayBillNumber : "-",
      sm: "6",
    },
  ];

  const months = [
    "Jan",
    "Feb",
    "March",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatDate = (datestr) => {
    let dateVal = new Date(datestr);
    return datestr
      ? dateVal.getDate() +
      "-" +
      months[dateVal.getMonth()] +
      "-" +
      dateVal.getFullYear()
      : "";
  };

  const payload1 = [
    {
      type: "label",
      value: "Parent dispatch",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.related_detid === "" ? "-" : mrinDetails.related_detid,
      sm: "6",
    },
    {
      type: "label",
      value: "Dispatch number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.detid === "" ? "-" : mrinDetails.detid,
      sm: "6",
    },
    {
      type: "label",
      value: "Invoice number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.invoiceno ? mrinDetails.invoiceno : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Delivered quantity(Kgs)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.delivered_quantity
        ? parseFloat(mrinDetails.delivered_quantity).toFixed(4)
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Balance quantity(Kgs)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.balance_quantity
        ? parseFloat(mrinDetails.balance_quantity).toFixed(4)
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Total balance quantity(Kgs)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.total_balance_quantity
        ? parseFloat(mrinDetails.total_balance_quantity).toFixed(4)
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Way bill date",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.wayBillDate
        ? formatDate(mrinDetails.wayBillDate)
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Location",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.location ? mrinDetails.location : "-",
      sm: "6",
    },
  ];

  const payload2 = [
    {
      type: "label",
      value: "Bill of entry number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        mrinDetails.billOfEntryNumber === ""
          ? "-"
          : mrinDetails.billOfEntryNumber,
      sm: "6",
    },
  ];

  const payload3 = [
    {
      type: "label",
      value: "Bill of entry date",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        mrinDetails.billOfEntryDate === "" ? "-" : mrinDetails.billOfEntryDate,
      sm: "6",
    },
  ];

  // const sampleItemInfo = () => (
  //   <Container className={classes.popover}>
  //     <Grid id="top-row" container ref={sampleItemInfoRef}>
  //       <Grid item md={12} xs={12} className="item">
  //         <Typography>Sample Line Item Information</Typography>
  //       </Grid>
  //     </Grid>
  //     <MrinList
  //       data={sampleItems}
  //       sampleItemDetails={(event, sampleItemId) =>
  //         ShowSampleItemDetailsHandler(event, sampleItemId)
  //       }
  //     />
  //     {/* )} */}
  //   </Container>
  // );

  const payload4 = [
    {
      type: "label",
      value: "AP status",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.apStatus ? mrinDetails.apStatus : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Invoice amount",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.invoiceAmount ? mrinDetails.invoiceAmount : "-",
      sm: "6",
    },
  ];

  const payload5 = [
    {
      type: "label",
      value: "AP details",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.apDetails === "" ? "-" : mrinDetails.apDetails,
      sm: "6",
    },
  ];

  const payload6 = [
    {
      type: "label",
      value: "QC status",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.qcStatus === "" ? "-" : mrinDetails.qcStatus,
      sm: "6",
    },
  ];

  const downloadFileHandler = async (e) => {
    try {
      let response = await getMRINDetail({
        type: "downloadMRINDocument",
        file_name: invoiceFile.file_name,
      });
      console.log("Response", response);
      if (response) {
        const linkSource = `data:application/pdf;base64,${response.fileData}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = invoiceFile.file_name;
        downloadLink.click();
        setSnack({
          open: true,
          message: "File downloaded successfully",
        });
      }
    } catch (e) {
      setSnack({
        open: true,
        message: e.message,
        severity: "error",
      });
    }
  };

  const payload7 = [
    {
      type: "label",
      value: "Invoice file",
      bold: true,
      sm: 2,
    },
    {
      type: "label",
      value: invoiceFile.document_name,
      sm: "6",
    },
    {
      label: "Download attachment",
      type: "button",
      sm: 12,
      onClick: (e) => downloadFileHandler(e, "invoiceAttachment"),
    },
  ];

  const payload9 = [
    {
      label: "Invoice status",
      type: "checkbox",
      checked: mrinDetails.invoiceStatus,
      sm: 12,
      disabled: true,
    },
  ];

  const handleChange = (event, key) => {
    let data = {
      ...mrinDetails,
      [key]: event.target.value,
    };
    setMrinDetails(data);
  };

  const payload8 = [
    {
      label: "AP details",
      type: "input",
      value: mrinDetails.apDetails || "",
      onChange: (e) => handleChange(e, "apDetails"),
      className: classes.control,
      sm: 12,
    },
    {
      label: "Invoice amount",
      type: "number",
      value: mrinDetails.invoiceAmount || "",
      className: classes.control,
      error: validationError?.invoiceAmount,
      helperText: validationError?.invoiceAmount,
      onChange: (e) => handleChange(e, "invoiceAmount"),
      sm: 12,
    },
  ];

  const handleClose = () => {
    setSubmitSample(false);
    props.back();
  };

  const requestSampleSuccess = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Success</h2>
      <p>Sample Request Submitted and email sent successfully</p>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Close" onClick={handleClose} />
        </Grid>
      </Grid>
    </Container>
  );

  const paidAction = async (e) => {
    // const message = 'Please enter valid details';
    let errorObj = {};
    // if (_.isEmpty(mrinDetails.invoiceAmount)) {
    //   errorObj = { ...errorObj, invoiceAmount: message };
    // }
    if (
      !_.isEmpty(mrinDetails.invoiceAmount) &&
      parseFloat(mrinDetails.invoiceAmount) > parseInt(mrinDetails.totalPrice)
    ) {
      errorObj = {
        ...errorObj,
        invoiceAmount: "Cannot enter Invoice Amount more than PO Total Amount.",
      };
    }
    if (!_.isEmpty(errorObj)) {
      setValidationError(errorObj);
    } else {
      try {
        let response = await createOrUpdateMRINDetail({
          apStatus: "Paid",
          apDetails: mrinDetails.apDetails,
          "emailid": JSON.parse(localStorage.getItem('preference')).name,
          invoiceAmount: mrinDetails.invoiceAmount,
          type: "Paid",
          role: currentUserDetails.role,
          createduserid: currentUserDetails.id,
          mrinid: props.id,
        });
        if (response) {
          setSnack({
            open: true,
            message: "MRIN paid successfully",
          });
          setPaid(!openPaid);
          setTimeout(() => {
            props.back();
          }, 2000);
        }
      } catch (e) {
        setSnack({
          open: true,
          message: e.message,
          severity: "error",
        });
      }
    }
  };

  const approveAction = async (e) => {
    try {
      let response = await createOrUpdateMRINDetail({
        qcStatus: "Approved",
        "emailid": JSON.parse(localStorage.getItem('preference')).name,
        type: "Approve",
        role: currentUserDetails.role,
        createduserid: currentUserDetails.id,
        mrinid: props.id,
      });
      if (response) {
        setSnack({
          open: true,
          message: "MRIN approved successfully",
        });
        setApprove(!openApprove);
        setTimeout(() => {
          props.back();
        }, 2000);
      }
    } catch (e) {
      setSnack({
        open: true,
        message: e.message,
        severity: "error",
      });
    }
  };

  const paidHandler = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Paid</h2>
      <Grid id="top-row" container>
        <Grid id="top-row" xs={6} md={12} container direction="column">
          <Template payload={payload8} />
        </Grid>
      </Grid>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Yes" onClick={paidAction} />
        </Grid>
        <Grid item>
          <Button label="No" onClick={() => setPaid(!openPaid)} />
        </Grid>
      </Grid>
    </Container>
  );

  const approveHandler = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Approve</h2>
      <p>
        You are approving the Quality and invoice attachment. Are you sure you
        want to approve both?
      </p>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Yes" onClick={approveAction} />
        </Grid>
        <Grid item>
          <Button label="No" onClick={() => setApprove(!openApprove)} />
        </Grid>
      </Grid>
    </Container>
  );



  return (
    <>
      {showSnack.open && (
        <Snackbar
          {...showSnack}
          handleClose={() =>
            setSnack({ open: false, message: "", severity: "" })
          }
        />
      )}
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>MRIN information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid id="top-row" container>
            <Grid item md={6} xs={6}>
              <Template payload={payload} />
              {mrinDetails.subCategory === "1001" && (
                <Template payload={payload2} />
              )}
            </Grid>
            <Grid item md={6} xs={6}>
              <Template payload={payload1} />
              {mrinDetails.subCategory === "1001" && (
                <Template payload={payload3} />
              )}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      {(currentUserDetails.role === "Accounts Executive" ||
        currentUserDetails.role === "Accounts Manager" ||
        currentUserDetails.role === "Managing Director") && (
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Finance information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid id="top-row" container>
                <Grid item md={6} xs={6}>
                  <Template payload={payload4} />
                </Grid>
                <Grid item md={6} xs={6}>
                  <Template payload={payload5} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
      {(currentUserDetails.role === "QC Manager" ||
        currentUserDetails.role === "Managing Director") && (
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Quality information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container md={12} xs={12}>
                <Template payload={payload6} />
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Order specification information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container md={12} xs={12}>
            <BasicTable
              rows={compositions}
              columns={gcTableColumns}
              hasTotal={false}
            ></BasicTable>
          </Grid>
        </AccordionDetails>
      </Accordion>
      {(currentUserDetails.role === "QC Manager" ||
        currentUserDetails.role === "Managing Director" ||
        currentUserDetails.role === "GC Stores Executive") && (
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Invoice information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container md={12} xs={12}>
                {invoiceFile && (
                  <>
                    <Grid item md={12} xs={12}>
                      <Template payload={payload7} />
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid container md={12} xs={12}>
                <Template payload={payload9} />
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
      <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
        {currentUserDetails.role !== "QC Manager" && 
        currentUserDetails.role !== "Accounts Manager" && 
        currentUserDetails.role !== "Accounts Executive" &&
          mrinDetails.status !== "Closed" && (
            <Grid item>
              <Button
                label="Edit"
                onClick={(e) => props.editMrin("edit_mrin", mrinDetails)}
              />
            </Grid>
          )}
        <Grid item>
          <Button label="Cancel" onClick={props.back} />
        </Grid>
        {mrinDetails.status === "Pending with QC Approval" &&
          (currentUserDetails.role === "QC Manager" ||
            currentUserDetails.role === "Managing Director") && (
            <Grid item>
              <Button
                label="Approve"
                onClick={() => setApprove(!openApprove)}
              />
            </Grid>
          )}
        {mrinDetails.status === "Pending with Finance" &&
          (currentUserDetails.role === "Accounts Executive" ||
            currentUserDetails.role === "Accounts Manager" ||
            currentUserDetails.role === "Managing Director") && (
            <Grid item>
              <Button label="Paid" onClick={() => setPaid(!openPaid)} />
            </Grid>
          )}
      </Grid>
      <SimpleModal
        open={submitSample}
        handleClose={handleClose}
        body={requestSampleSuccess}
      />
      <SimpleModal
        open={openApprove}
        handleClose={() => setApprove(!openApprove)}
        body={approveHandler}
      />
      <SimpleModal
        open={openPaid}
        handleClose={() => setPaid(!openPaid)}
        body={paidHandler}
      />
    </>
  );
};
export default MrinDetails;
