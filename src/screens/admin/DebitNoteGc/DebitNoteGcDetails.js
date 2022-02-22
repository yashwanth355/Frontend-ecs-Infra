import React, { useEffect, useState } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import SimpleStepper from "../../../components/SimpleStepper";
import Button from "../../../components/Button";
import "../../common.css";
import SimpleModal from "../../../components/Modal";
import Snackbar from "../../../components/Snackbar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AuditLog from "./AuditLog";
import BasicTable from "../../../components/BasicTable";
import { getupdateGcDebitNoteStatus, getviewGCDebitNoteDetail, releaseDebitNoteGC } from "../../../apis";
import VendorPDF from "./PdfDownload/VendorPDF";
import AccountPDF from "./PdfDownload/AccountPDF";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
}));

const formatDate = (datestr) => {
  let dateVal = datestr ? new Date(datestr) : new Date();
  return (
    dateVal.getDate() +
    "/" +
    (dateVal.getMonth() + 1) +
    "/" +
    dateVal.getFullYear()
  );
};

const DebitNoteGcDetails = (props) => {
  const classes = useStyles();
  const [debitNoteGcDetails, setDebitNoteGcDetails] = useState(null);
  const [submitDebitNoteGc, setSubmitDebitNoteGc] = useState(false);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [logData, setLogData] = useState([]);
  const [pdfData, setPdfData] = useState([]);  
  const [activeStep, setActiveStep] = React.useState(-1);
  // eslint-disable-next-line
  const [stepProgress, setStepProgress] = useState("100%");
  const [statusLabel, setStatusLabel] = useState("");
  const [isloadingPdf, setIsloadingPdf] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const debitSteps = [
    "Pending request",
    "Pending approval",
    "Approved",
    "Account verified",
  ];

  useEffect(() => {
    if (props.data) {
      setDebitNoteGcDetails(props.data);
      setActiveStep(debitSteps.indexOf(props.data.status));
      setStatusLabel(debitSteps[debitSteps.indexOf(props.data.status) + 1]);
      setLogData(props.data.audit_log_gc);
      let temp = [];
       // eslint-disable-next-line
      props.data?.released_debitnotes?.map((item, index) => {
        temp.push({ "label": 'Debit Note Release CCL Account', "download": <Button label='Download' onClick={() => accountsdoc(item)} /> })
      })
      setPdfData(temp);
      // setPdfData(
      //   [{ "label": 'Debit Note Release CCL Account', "download": <Button label='Download' onClick={accountsdoc} />, "delete": <Button label='Delete' /> }, { "label": 'Debit Note Release CCL Vendor', "download": <Button label='Download' />, "delete": <Button label='Delete' /> }]);
    }
    // eslint-disable-next-line
  }, [props.data]);

  const accountsdoc = async() => {
    await getviewGCDebitNoteDetail({type:'downloadDebitNote', file_name:'accountsdoc.pdf'});
    // await setViewGcData(response);
  }

  const payload = [
    {
      type: "label",
      value: "Debit Note GC id",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: "Debit Note GC Number",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: "Debit Note GC Date",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: "Entity",
      bold: true,
      sm: "3",
    },
  ];

  const payload4 = [
    {
      type: "label",
      value: debitNoteGcDetails?.debit_noteid,
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.debit_noteno,
      sm: "3",
    },

    {
      type: "label",
      value: formatDate(debitNoteGcDetails?.debit_notedate),
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.entity_name,
      sm: "3",
    },
  ];

  const payload1 = [
    {
      type: "label",
      value: "Vendor id",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.vendor_id,
      sm: "3",
    },
    {
      type: "label",
      value: "Vendor Name",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.vendor_name,
      sm: "3",
    },
  ];

  const payload2 = [
    {
      type: "label",
      value: "MRIN id",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.mrin_id,
      sm: "3",
    },
    {
      type: "label",
      value: "MRIN Number",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.mrin_no,
      sm: "3",
    },
    {
      type: "label",
      value: "Invoice Number",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.invoice_no,
      sm: "3",
    },
    {
      type: "label",
      value: "MRIN Quantity",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value:
        debitNoteGcDetails?.invoice_qty === ""
          ? "-"
          : debitNoteGcDetails?.invoice_qty,
      sm: "3",
    },
    {
      type: "label",
      value: "Husk",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.husk === "" ? "-" : debitNoteGcDetails?.husk,
      sm: "3",
    },
    {
      type: "label",
      value: "Moisture",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value:
        debitNoteGcDetails?.moisture === ""
          ? "-"
          : debitNoteGcDetails?.moisture,
      sm: "3",
    },
    {
      type: "label",
      value: "Stones",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value:
        debitNoteGcDetails?.stones === "" ? "-" : debitNoteGcDetails?.stones,
      sm: "3",
    },
    {
      type: "label",
      value: "Item Id",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.item_id,
      sm: "3",
    },
    {
      type: "label",
      value: "H S Code",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value:
        debitNoteGcDetails?.hsc_code === ""
          ? "-"
          : debitNoteGcDetails?.hsc_code,
      sm: "3",
    },
    {
      type: "label",
      value: "Net WT RECD",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value:
        debitNoteGcDetails?.netrecd === "" ? "-" : debitNoteGcDetails?.netrecd,
      sm: "3",
    },
    {
      type: "label",
      value: "Debit Amount",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.debit_amount,
      sm: "3",
    },
  ];

  const payload3 = [
    {
      type: "label",
      value: "Remarks",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value:
        debitNoteGcDetails?.remarks === "" ? "-" : debitNoteGcDetails?.remarks,
      sm: "3",
    },
    {
      type: "label",
      value: "Others",
      bold: true,
      sm: "3",
    },
    {
      type: "label",
      value: debitNoteGcDetails?.others,
      sm: "3",
    },
  ];

  const handleClose = () => {
    setSubmitDebitNoteGc(false);
    props.back();
  };

  const requestDebitNoteGcSuccess = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Success</h2>
      <p>DebitNoteGc request submitted and email sent successfully</p>
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

  const warningConfirmModal = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Warning</h2>
      <p>Debit Note for this MRIN was already generated and released.Do you want to release it again?</p>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Yes" onClick={exportPDF} />
        </Grid>
        <Grid item>
          <Button label="No" onClick={() => setShowWarningModal(false)} />
        </Grid>
      </Grid>
    </Container>
  );  

  const StatusChange = async () => {
    try {
      let status =
        debitNoteGcDetails?.status === "Pending request"
          ? "changeToPendingStatus"
          : debitNoteGcDetails?.status === "Pending approval"
          ? "changeToApprovedStatus"
          : debitNoteGcDetails?.status === "Approved"
          ? "changeToAccountVerifiedStatus"
          : "";

      let response = await getupdateGcDebitNoteStatus({
        type: status,
        debit_noteid: props.id,
        updated_by: localStorage.getItem("currentUserId"),
      });
      if (response) {
        setSnack({
          open: true,
          message:
            debitNoteGcDetails?.status === "Pending request"
              ? "Debit note sent for pending approval"
              : debitNoteGcDetails?.status === "Pending approval"
              ? "Debit note sent for approved"
              : "Debit note sent for account verified",
        });
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

  const exportPDF = async () => {
    setShowWarningModal(false)
    const showVendor = document.getElementById("vendor");
    const showAccount = document.getElementById("account");
    showVendor.style.display = "block";
    showAccount.style.display = "block";

    setIsloadingPdf(true);
    const input = document.getElementById("po_view_main");

    // vendor
    html2canvas(input).then(async (canvas) => {
      var vendor = "";
      var account = "";

      var imgData = canvas.toDataURL("image/jpeg", 1.0);

      var imgHeight = 0;
      var imgWidth = 210;
      var pageHeight = 295;
      imgHeight = (canvas.height * imgWidth) / canvas.width;
      var heightLeft = imgHeight;

      var totalPages = Math.ceil(imgHeight / pageHeight) - 1;
      var doc = new jsPDF("p", "mm", [pageHeight, imgWidth]);
      var position = 0;

      doc.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      for (var i = 1; i <= totalPages; i++) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "JPG", 0, position * i, imgWidth, imgHeight);
      }

      var out = doc.output();//"data:application/pdf;base64," + 
      vendor = btoa(out);

      var blobURL = doc.output("bloburl");
      window.open(blobURL);

      setIsloadingPdf(false);
      showVendor.style.display = "none";
      // account
      const input1 = document.getElementById("po_view_main_acc");
      html2canvas(input1).then(async (canvas) => {
        var imgData = canvas.toDataURL("image/jpeg", 1.0);

        var imgHeight = 0;
        var imgWidth = 210;
        var pageHeight = 295;
        imgHeight = (canvas.height * imgWidth) / canvas.width;
        var heightLeft = imgHeight;

        var totalPages = Math.ceil(imgHeight / pageHeight) - 1;
        var doc1 = new jsPDF("p", "mm", [pageHeight, imgWidth]);
        var position = 0;

        doc1.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        for (var i = 1; i <= totalPages; i++) {
          position = heightLeft - imgHeight;
          doc1.addPage();
          doc1.addImage(imgData, "JPG", 0, position * i, imgWidth, imgHeight);
        }

        var out = doc1.output();//"data:application/pdf;base64," + 
        account = btoa(out);

        var blobURL1 = doc1.output("bloburl");
        window.open(blobURL1);

        setIsloadingPdf(false);
        showAccount.style.display = "none";

        let payloadData = {
          debit_noteid: debitNoteGcDetails?.debit_noteid,
          debit_notedate: debitNoteGcDetails?.debit_notedate,
          vendor_id: debitNoteGcDetails?.vendor_id,
          mrin_id: debitNoteGcDetails?.mrin_id,
          generated_by: localStorage.getItem("currentUserId"),
          doc_kind_account: "Debit_Note_Release_CCL_Accounts",
          docid_accounts:
            "Debit_Note_Release_CCL_Accounts-" +
            debitNoteGcDetails?.debit_noteid,
          document_content_accounts: account,
          document_name_accounts: "Debit_Note_Release_CCL_Accounts.pdf",
          doc_kind_vendor: "Debit_Note_Release_Vendor",
          docid_vendor:
            "Debit_Note_Release_Vendor-" + debitNoteGcDetails?.debit_noteid,
          document_content_vendor: vendor,
          document_name_vendor: "Debit_Note_Release_Vendor.pdf",
        };
        let response = await releaseDebitNoteGC(payloadData);
        if (response) {
          console.log("fd::", payloadData, response);
        }
      });
    });
  };

  const allpdfsColumns = [
    { id: "label", label: "File Name" },
    { id: "download", label: "Download" },
    // { id: "delete", label: "Delete" },
  ];

  const confirmExport = () => {
    debitNoteGcDetails?.released_debitnotes === null ? exportPDF() : setShowWarningModal(true);
  }

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
      <Card className="page-header">
        <CardHeader title="Debit Note GC details" className="cardHeader" />
        <CardContent>
          <Grid id="top-row" container>
            <Grid id="top-row" xs={8} md={8} container direction="column">
              <Template payload={payload} />
            </Grid>
            <Grid
              id="top-row"
              xs={4}
              md={2}
              container
              direction="column"
            ></Grid>
            <Grid id="top-row" xs={8} md={8} container direction="column">
              <Template payload={payload4} />
            </Grid>
            <Grid id="top-row" xs={2} md={2} container direction="column">
              {statusLabel !== undefined && (
                <Grid item>
                  <Button label={statusLabel} onClick={StatusChange} />
                </Grid>
              )}
            </Grid>
            <Grid id="top-row" xs={2} md={2} container direction="column">
              <Grid item>
                <Button
                  disabled={isloadingPdf}
                  label={`${
                    isloadingPdf ? "Releasing ..." : "Release Debit Note"
                  }`}
                  onClick={confirmExport}
                />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card className="page-header">
        <CardContent>
          <Grid container md={12}>
            <Grid item md={12} xs={12}>
              {activeStep !== -1 ? (
                <SimpleStepper
                  activeStep={activeStep}
                  completeStep={activeStep}
                  steps={debitSteps}
                  activeStepProgress={stepProgress}
                ></SimpleStepper>
              ) : (
                "Loading ..."
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Vendor Details</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Template payload={payload1} />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>MRIN Details</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Template payload={payload2} />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>File Information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <BasicTable rows={pdfData} columns={allpdfsColumns}></BasicTable>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Other Information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Template payload={payload3} />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className="item">
              <Typography>Audit log information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <AuditLog data={logData} />
        </AccordionDetails>
      </Accordion>

      <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
        <Grid item>
          <Button
            label="Edit"
            onClick={(e) => props.editDebitNoteGc("edit_sample", props.id)}
          />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={props.back} />
        </Grid>
      </Grid>
      <SimpleModal
        open={submitDebitNoteGc}
        handleClose={handleClose}
        body={requestDebitNoteGcSuccess}
      />
      <SimpleModal
        open={showWarningModal}
        handleClose={() => setShowWarningModal(false)}
        body={warningConfirmModal}
      />
      {debitNoteGcDetails !== null && (
        <>
          <div id="vendor" style={{ display: "none" }}>
            <VendorPDF id={props.id} debitNoteGcDetails={debitNoteGcDetails} />
          </div>
          <div id="account" style={{ display: "none" }}>
            <AccountPDF id={props.id} debitNoteGcDetails={debitNoteGcDetails} />
          </div>
        </>
      )}
    </>
  );
};
export default DebitNoteGcDetails;
