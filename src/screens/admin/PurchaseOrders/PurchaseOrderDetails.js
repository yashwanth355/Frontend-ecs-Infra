import React, { useEffect, useState, useRef } from "react";
import Template from "../../../components/Template";
import { Grid } from "@material-ui/core";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SimpleStepper from "../../../components/SimpleStepper";
import SimplePopper from "../../../components/Popper";
import Button from "../../../components/Button";
import {
  getPODetails,
  getTopMrinDetails,
  poDocumentsUpload,
  updateGCPoStatus,
  getMrinListForPoDetails,
  getQuotesInfo
} from "../../../apis";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import "../../common.css";
import Snackbar from "../../../components/Snackbar";
import BasicTable from "../../../components/BasicTable";
import DispatchList from "./DispatchList";
import DispatchDetails from "./DispatchDetails";
import AuditLog from "./AuditLog";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
import useToken from '../../../hooks/useToken';
import Blob from "./PdfDownload/BlobProvider";

const useStyles = makeStyles((theme) => ({
  popover: {
    padding: theme.spacing(2, 4, 3),
  },
  labelheading: {
    marginTop: 20,
    display: "inline-block",
  },
}));

const formatGCCompositions = (compostion = {}) => {
  return [
    {
      composition_name: "Density(Gm/Cc)",
      composition_rate: compostion.density,
    },
    { composition_name: "Moisture (%)", composition_rate: compostion.moisture },
    { composition_name: "Browns (%)", composition_rate: compostion.browns },
    { composition_name: "Blacks (%)", composition_rate: compostion.blacks },
    {
      composition_name: "Broken & Bits (%)",
      composition_rate: compostion.brokenbits,
    },
    {
      composition_name: "Insected Beans (%)",
      composition_rate: compostion.insectedbeans,
    },
    { composition_name: "Bleached (%)", composition_rate: compostion.bleached },
    { composition_name: "Husk (%)", composition_rate: compostion.husk },
    { composition_name: "Sticks (%)", composition_rate: compostion.sticks },
    { composition_name: "Stones (%)", composition_rate: compostion.stones },
    {
      composition_name: "Beans retained on 5mm mesh during sieve analysis",
      composition_rate: compostion.beansretained,
    },
  ];
};
const PurchaseOrderDetails = (props) => {
  const classes = useStyles();
  const [purchaseDetails, setPurchaseDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [mrinTableData, setMrinTableData] = useState([]);
  const [mrinList, setMrinList] = useState([]);
  const [logData, setLogData] = useState([]);
  const [dispatchData, setDispatchData] = useState([]);
  const [dispatchDetails, setDispatchDetails] = useState({});
  const [compositions, setCompositions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currencyCodes, setCurrencyCodes] = useState([]);
  const dispatchInfoRef = useRef(null);
  const [showDispatchDetails, setShowDispatchDetails] = useState(false);
  const [activeStep, setActiveStep] = React.useState(-1);
  const [stepProgress, setStepProgress] = useState("100%");
  const [otherChargesList, setOtherChargesList] = useState([]);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });

  // const [isloadingPdf, setIsloadingPdf] = useState(false);
  const { getCurrentUserDetails } = useToken();
  let currentUserDetails = getCurrentUserDetails();
  const fetchData = async () => {
    let response = await getMrinListForPoDetails({
      type: "mrinsonponoforview",
      po_no: props.id?.toString(),
    });
    setMrinTableData(response);
    getQuotesInfo({ "type": "currencies" }).then(res => {
      var currencyCodes = {};
      res.forEach((cur, i) => {
        currencyCodes[cur.currencyid] = cur.currencycode;
      });
      setCurrencyCodes(currencyCodes);
    }
    );
    await getPODetails({
      po_no: props.id?.toString(),
    }).then((res) => {
      setPurchaseDetails(res);
      let other = [
        { id: "packing_forward_charges", label: "Packaging & Forwarding" },
        { id: "installation_charges", label: "Installation" },
        { id: "freight_charges", label: "Freight" },
        { id: "handling_charges", label: "Handling" },
        { id: "misc_charges", label: "Miscellaneous" },
        { id: "hamali_charges", label: "Hamali" },
        { id: "mandifee_charges", label: "Mandi Fee" },
        { id: "fulltax_charges", label: "Full Tax(Form Nill)" },
        { id: "insurance_charges", label: "Insurance" }
      ];
      let temp = [];
      // eslint-disable-next-line
      other?.map((item, index) => {
        if (res[item.id] !== '') {
          temp.push({ "name": item.id, "label": item.label, "rate": res[item.id] })
        }
      })
      setOtherChargesList(temp);
      setActiveStep(parseInt(res.status) - 1);
      setLogData(res.audit_log_gc_po);
      setCompositions(formatGCCompositions(res));
      setDispatchData(res.item_dispatch?.length > 0 ? res.item_dispatch : null);
      if (res.status === "4") {
        var delivered = res.item_dispatch
          ?.map((dispatch) => (dispatch.delivered_quantity ? parseInt(dispatch.delivered_quantity) : 0))
          .reduce((sum, i) => sum + i, 0);
        var qty = res.item_dispatch
          ?.map((dispatch) => parseInt(dispatch.dispatch_quantity))
          .reduce((sum, i) => sum + i, 0);
        setStepProgress(((delivered / qty) * 100) + "%");
      }
      getTopMrinDetails({
        type: "topmrinrecord",
        gcitem_id: res.item_id,
        po_date: new Date(res.po_date),
      }).then((res) => {
        if (res?.gcitem_id) {
          let data = {
            ...res,
            number: 1,
          };
          setMrinList([data]);
        } else {
          setMrinList(null);
        }
      });
      // let documentsEnum = {
      //   document1: "Invoice",
      //   document2: "Packing list",
      //   document3: "Bill of Lading",
      //   document4: "Phytosanitory Certificate",
      //   document5: "Fumigation Certificate",
      //   document6: "Certificate of Origin",
      //   document7: "ICO Certificate of Origin",
      //   document8: "Weight Certificate",
      //   document9: "Quality Certificate",
      //   document10: "Inspection and Stuffing Certificate",
      //   document11: "Bill of Entry",
      //   document12: 'Dispatch Note',
      // };
      let documents = [];
      poDocumentsUpload({
        type: "getDocumentsOnPo",
        po_id: res.poid,
      }).then((response) => {
        response?.map(doc => documents.push({
          upload: !!doc?.file_name,
          file_name: doc?.file_name,
          document_name: doc?.document_name,
          doc_kind: doc?.doc_kind,
          required: doc?.required,
          docid: doc?.docid,
        }))
        setDocuments(documents);
      });
    });
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const formatDate = (datestr) => {
    let dateVal = new Date(datestr);
    return (
      dateVal.getDate() +
      "/" +
      (dateVal.getMonth() + 1) +
      "/" +
      dateVal.getFullYear()
    );
  };

  const payload3 = [
    {
      type: "label",
      value: "Supplier",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.supplier_name,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Supplier Email",
      bold: true,
      className: classes.labelheading,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.supplier_email || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload4 = [
    {
      type: "label",
      value: "Supplier ID",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.supplier_id,
      sm: "12",
      md: "12",
    },
  ];

  const payload5 = [
    {
      type: "label",
      value: "Supplier Address",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.supplier_address,
      sm: "12",
      md: "12",
    },
  ];
  const payload50 = [
    {
      type: "label",
      value: "Comments",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.comments || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload6 = [
    {
      type: "label",
      value: "Taxes & Duties",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.taxes_duties || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Packaging & Forwarding",
      bold: true,
      sm: "12",
      md: "12",
      className: classes.labelheading,
    },
    {
      type: "label",
      value: purchaseDetails.packing_forwarding || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload7 = [
    {
      type: "label",
      value: "Mode of Transport",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.mode_of_transport || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload8 = [
    {
      type: "label",
      value: "Transit Insurance",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.transit_insurance || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload9 = [
    {
      type: "label",
      value: "Currency",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.currency_name,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "No of Days IOM can  be generated from date of invoice",
      bold: true,
      sm: "12",
      className: classes.labelheading,
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.payment_terms_days,
      sm: "12",
      md: "12",
    },
  ];

  const payload10 = [
    {
      type: "label",
      value: "Advance Type",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.advance_type,
      sm: "12",
      md: "12",
    },
  ];

  const payload11 = [
    {
      type: "label",
      value: "Advance",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: parseFloat(purchaseDetails.advance).toFixed(2),
      sm: "12",
      md: "12",
    },
  ];

  const payload12 = [
    {
      type: "label",
      value: "Incoterm",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.incoterms || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Mode of Transport",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.mode_of_transport || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Forwarding",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.forwarding || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Payment Terms",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.payment_terms || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "No of Containers",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.no_of_containers || "-",
      sm: "12",
      md: "12",
    },

  ];

  const payload13 = [
    {
      type: "label",
      value: "Origin",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.origin || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Insurance",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.insurance || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Currency",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.currency_name,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Comments",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.comments || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Container Type",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.container_type || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload14 = [
    {
      type: "label",
      value: "Port of Loading",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.ports || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Place of Destination",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.place_of_destination || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "No of Bags",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.no_of_bags || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Net Weight",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.net_weight || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload15 = [
    {
      type: "label",
      value: "Billing At",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.billing_at_name,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Billing Address",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.billing_at_addressline1,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: [purchaseDetails.billing_at_addressline2, purchaseDetails?.billing_zipcode].filter(Boolean).join(', '),
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: [purchaseDetails.billing_state, purchaseDetails?.billing_country].filter(Boolean).join(', '),
      sm: "12",
      md: "12",
    },
  ];

  const payload16 = [
    {
      type: "label",
      value: "Delivery At",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.delivery_at_name,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Delivery Address",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.delivery_at_addressline1,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: [purchaseDetails.delivery_at_addressline2, purchaseDetails?.delivery_zipcode].filter(Boolean).join(', '),
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: [purchaseDetails.delivery_state, purchaseDetails?.delivery_country].filter(Boolean).join(', '),
      sm: "12",
      md: "12",
    },

  ];

  const payload40 = [
    {
      type: "label",
      value: "Other charges",
      className: classes.labelheading,
      bold: true,
      sm: "3",
      md: "3",
    },
    {
      type: "label",
      value: purchaseDetails.otherCharges,
      sm: "3",
      md: "3",
    },
    {
      type: "label",
      value: purchaseDetails.supplier_type_id === '1002' ? 'Rate(INR)' : 'Rate',
      className: classes.labelheading,
      bold: true,
      sm: "3",
      md: "3",
    },
    {
      type: "label",
      value: purchaseDetails.rate,
      sm: "3",
      md: "3",
    },
  ]

  const payload18 = [
    {
      type: "label",
      value: "Green Coffee Type",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.item_name,
      sm: "12",
      md: "12",
    },
  ];

  const payload19 = [
    {
      type: "label",
      value: "Quotation No",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.quot_no,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Quotation Date",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.quot_date
        ? formatDate(purchaseDetails.quot_date)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Price",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.quot_price
        ? parseFloat(purchaseDetails.quot_price).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload20 = [
    {
      type: "label",
      value: "Quantity",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.total_quantity,
      sm: "12",
      md: "12",
    },
  ];

  const payload21 = [
    {
      type: "label",
      value: "Dispatch Type",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.item_dispatch?.length > 1 ? "Multiple" : "Single",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Dispatch Count",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.item_dispatch?.length,
      sm: "12",
      md: "12",
    },
  ];

  const payload30 = [
    {
      type: "label",
      value: "Purchase Type",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.purchase_type || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Terminal Month",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.terminal_month
        ? formatDate(purchaseDetails.terminal_month)
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload51 = [
    {
      type: "label",
      value: "Fixation Date",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.fixation_date
        ? formatDate(purchaseDetails.fixation_date)
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload22 = [
    {
      type: "label",
      value: "Booked Differential",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.booked_differential
        ? parseFloat(purchaseDetails.booked_differential).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Total Price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id] ? " (" + currencyCodes[purchaseDetails.currency_id] + "/MT)" : "") : ' (USD/MT)'),
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.totalPrice
        ? parseFloat(purchaseDetails.totalPrice).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload23 = [
    {
      type: "label",
      value: "Fixed Terminal Rate",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.fixed_terminal_rate
        ? parseFloat(purchaseDetails.fixed_terminal_rate).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Market Price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id] ? " (" + currencyCodes[purchaseDetails.currency_id] + "/MT)" : "") : ' (USD/MT)'),
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.market_price
        ? parseFloat(purchaseDetails.market_price).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Purchase Price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id] ? " (" + currencyCodes[purchaseDetails.currency_id] + "/MT)" : "") : ' (USD/MT)'),
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.purchase_price
        ? parseFloat(purchaseDetails.purchase_price).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload24 = [
    {
      type: "label",
      value: "Booked Terminal Rate",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.booked_terminal_rate
        ? parseFloat(purchaseDetails.booked_terminal_rate).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Fixed Differential",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.fixed_differential
        ? parseFloat(purchaseDetails.fixed_differential).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "PO Margin",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.po_margin
        ? parseFloat(purchaseDetails.po_margin).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload28 = [
    {
      type: "label",
      value: "Terminal Price(USD)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.terminalPrice
        ? purchaseDetails.terminalPrice
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Market Price (INR/KG)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.marketPriceInr
        ? parseFloat(purchaseDetails.marketPriceInr).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload29 = [
    {
      type: "label",
      value: "Purchase Price (INR/KG)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.purchasePriceInr
        ? parseFloat(purchaseDetails.purchasePriceInr).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Gross Price (INR)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.grossPrice
        ? parseFloat(purchaseDetails.grossPrice).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Total Price (INR)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.totalPrice
        ? parseFloat(purchaseDetails.totalPrice).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload25 = [
    {
      type: "label",
      value: "SGST (%)",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.sgst === '' ? 0 : parseFloat(purchaseDetails.sgst).toFixed(2),
      sm: "12",
      md: "12",
    },
  ];

  const payload26 = [
    {
      type: "label",
      value: "CGST (%)",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.cgst === '' ? 0 : parseFloat(purchaseDetails.cgst).toFixed(2),
      sm: "12",
      md: "12",
    },
  ];

  const payload27 = [
    {
      type: "label",
      value: "IGST (%)",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.igst === '' ? 0 : parseFloat(purchaseDetails.igst).toFixed(2),
      sm: "12",
      md: "12",
    },
  ];

  // const payload31 = [
  //   {
  //     type: "label",
  //     value: "Other Charges",
  //     bold: true,
  //     sm: "12",
  //     md: "12",
  //   },
  //   {
  //     type: "label",
  //     value: purchaseDetails.otherCharges,
  //     sm: "12",
  //     md: "12",
  //   },
  // ];

  // const payload32 = [
  //   {
  //     type: "label",
  //     value: purchaseDetails.supplier_type_id === '1002' ? 'Rate(INR)' : 'Rate',
  //     bold: true,
  //     sm: "12",
  //     md: "12",
  //   },
  //   {
  //     type: "label",
  //     value: purchaseDetails.rate
  //       ? parseFloat(purchaseDetails.rate).toFixed(2)
  //       : "-",
  //     sm: "12",
  //     md: "12",
  //   },
  // ];

  const payload33 = [
    {
      type: "label",
      value: "AP Status",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.apStatus ? purchaseDetails.apStatus : "Backlog",
      sm: "12",
      md: "12",
    },
  ];

  const payload34 = [
    {
      type: "label",
      value: "QC Status",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.qcStatus ? purchaseDetails.qcStatus : "Backlog",
      sm: "12",
      md: "12",
    },
  ];

  const payload35 = [
    {
      type: "label",
      value: "AP(payable amount)",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.payable_amount ? purchaseDetails.payable_amount : "-",
      sm: "12",
      md: "12",
    },
  ];

  const purchaseSteps = [
    "Req Approval",
    "Approve",
    "In Progress",
    purchaseDetails.supplier_type_id === "1001" ? "Shipped" : "Dispatched",
    "Close Order",
  ];

  const dispatchInfo = () => (
    <Container className={classes.popover}>
      <Grid id="top-row" container>
        <Grid item md={12} xs={12} className="item">
          <Typography>Dispatch Information</Typography>
        </Grid>
      </Grid>
      <DispatchList
        data={dispatchData}
        mrin={mrinTableData}
        dispatchDetails={(event, data) =>
          ShowDispatchDetailsHandler(event, data)
        }
      />
    </Container>
  );



  const gcTableColumns = [
    { id: "composition_name", label: "Item" },
    { id: "composition_rate", label: "Composition" },
  ];

  const taxColumns = [
    { id: "number", label: "SNo" },
    { id: "mrin_date", label: "MRIN Date" },
    { id: "cgst_per", label: "Tax (%)" },
  ];

  const mrinTableColumns = [
    { id: "mrindate", label: "Date" },
    { id: "mrin_id", label: "MRIN" },
    { id: "dispatch_id", label: "Dispatch" },
    { id: "expected_quantity", label: "Expected(Kgs)" },
    { id: "delivered_quantity", label: "Delivered(Kgs)" },
    { id: "balance_quantity", label: "Balance Quantity(Kgs)" },
    { id: "related_detid", label: "Parent Dispatch" },
    { id: "apStatus", label: "AP Status" },
    { id: "qcStatus", label: "QC Status" },
  ];

  const otherCharges = [
    { id: "label", label: "Other Charges" },
    { id: "rate", label: "Rate" },
  ];

  const approvePo = async (e) => {
    //changeToPendingStatus
    setLoading(true);
    try {
      let status =
        parseInt(purchaseDetails.status) === 1
          ? "changeToPendingStatus"
          : parseInt(purchaseDetails.status) === 3
            ? "changeToclosedStatus"
            : "changeToInprogessStatus";
      let response = await updateGCPoStatus({
        emailid: JSON.parse(localStorage.getItem('preference')).name,
        type: status,
        po_id: purchaseDetails.poid,
      });
      if (response) {
        setSnack({
          open: true,
          message:
            parseInt(purchaseDetails.status) === 1
              ? "PO sent for request approval"
              : parseInt(purchaseDetails.status) === 3
                ? "PO closed successfully"
                : "PO approved successfully",
        });
        setTimeout(() => {
          props.back(
            "purchase_details",
            parseInt(purchaseDetails.status) === 1
              ? "pendingwithapprovalpos"
              : parseInt(purchaseDetails.status) === 3
                ? "closedpos"
                : "inprogresspos"
          );
        }, 2000);
      }
    } catch (e) {
      setSnack({
        open: true,
        message: e.message,
        severity: "error",
      });
    }
    finally {
      setLoading(false);
    }
  };

  const closePo = async (e) => {
    try {
      let response = await updateGCPoStatus({
        "type": "close",
        "emailid": JSON.parse(localStorage.getItem('preference')).name,
        "po_id": purchaseDetails.poid,
        "createduserid": localStorage.getItem('currentUserId'),
      });
      if (response) {
        setSnack({
          open: true,
          message: "PO closed successfully"
        });
        setTimeout(() => {
          props.back(
            "purchase_details", "closedpos"
          );
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

  const sendEmail = async (e) => {
    setLoading(true);
    try {
      let response = await updateGCPoStatus({
        "notify_email": true,
        "vendor_email": JSON.parse(localStorage.getItem('preference')).name,
        po_id: purchaseDetails.poid,
      });
      if (response) {
        setSnack({
          open: true,
          message: "Email Sent Successfully"
        });
      }
    } catch (e) {
      setSnack({
        open: true,
        message: e.message,
        severity: "error",
      });
    }
    finally {
      setLoading(false);
    }
  };

  const ShowDispatchDetailsHandler = (event, data) => {
    setShowDispatchDetails(true);
    setDispatchDetails(data);
  };

  const HideDispatchDetailsHandler = (event, data) => {
    setShowDispatchDetails(false);
  };




  let component;
  if (showDispatchDetails) {
    component = (
      <DispatchDetails
        purchaseDetails={purchaseDetails}
        activeStep={activeStep}

        details={dispatchDetails}
        expComposition={compositions}
        back={HideDispatchDetailsHandler}
      ></DispatchDetails>
    );
  } else {
    component = (
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
          <CardHeader title=" Purchase Order Details" className="cardHeader" />
          <CardContent>
            <Grid container md={12}>
              <Grid container md={6}>
                <Grid item md={4} xs={12}>
                  <Typography variant="h7">PO No</Typography>
                  <Typography>{props.id}</Typography>
                </Grid>
                <Grid item md={2} xs={12}>
                  <Typography variant="h7">PO Date</Typography>
                  <Typography>
                    {formatDate(purchaseDetails?.po_date)}
                  </Typography>
                </Grid>
                <Grid item md={3} xs={12}>
                  <Typography variant="h7">PO Category</Typography>
                  <Typography>{purchaseDetails?.po_category}</Typography>
                </Grid>
                <Grid item md={3} xs={12}>
                  <Typography variant="h7">PO Sub Category</Typography>
                  <Typography>{purchaseDetails?.supplier_type}</Typography>
                </Grid>
              </Grid>

              {parseInt(purchaseDetails.status) === 1 && (
                <Grid
                  container
                  md={2}
                  justify="flex-end"
                  style={{ display: "flex" }}
                >
                  <Grid item>
                    <Button label={loading ? "Loading..." : "Request Approval"} disabled={loading}
                      onClick={approvePo} />
                  </Grid>
                </Grid>
              )}
              {parseInt(purchaseDetails.status) === 2 && (
                <Grid
                  container
                  md={2}
                  justify="flex-end"
                  style={{ display: "flex" }}
                >
                  <Grid item>
                    <Button label={loading ? "Loading..." : "Approve"} disabled={loading} onClick={approvePo} />
                  </Grid>
                </Grid>
              )}
              {(parseInt(purchaseDetails.status) === 3 || parseInt(purchaseDetails.status) === 4) &&
                <Grid container md={2} justify="flex-end" style={{ display: 'flex' }}>
                  <Grid item>
                    <Button label={loading ? "Loading..." : "Send Email To Vendor"} onClick={sendEmail} disabled={loading} />
                  </Grid>
                </Grid>
              }
              {parseInt(purchaseDetails.status) === 4 && (
                <Grid
                  container
                  md={2}
                  justify="flex-end"
                  style={{ display: "flex" }}
                >
                  <Grid item>
                    <Button label="Close Order" onClick={closePo} />
                  </Grid>
                </Grid>
              )}
              <div id="myMm" style={{ height: "1mm" }} />
              <Grid
                container
                md={2}
                justify="flex-end"
                style={{ display: "flex" }}
              >
                <Grid item>
                  <Blob purchaseDetails={purchaseDetails} documents={documents} id={props.id} />
                </Grid>
              </Grid>
            </Grid>

            {purchaseDetails.supplier_type_id === "1001" && (
              <Grid container md={12}>
                <Grid item md={4} xs={12}>
                  <Typography variant="h7">Contract No</Typography>
                  <Typography>{purchaseDetails?.contract}</Typography>
                </Grid>
              </Grid>
            )}
            <Grid container md={12}>
              <Grid item md={3} xs={6}>
                <SimplePopper
                  linkLabel="Dispatch Information"
                  body={dispatchInfo}
                  linkRef={dispatchInfoRef}
                ></SimplePopper>
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
                    steps={purchaseSteps}
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
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Vendor/Supplier Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={3} container direction="column">
                <Template payload={payload3} />
              </Grid>
              <Grid id="top-row" xs={12} md={3} container direction="column">
                <Template payload={payload4} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload5} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        {
          purchaseDetails.supplier_type_id === "1002" && (
            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid id="top-row" container style={{ margin: 6 }}>
                  <Grid item md={12} xs={12} className="item">
                    <Typography>Currency & Advance Information</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid id="top-row" container>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload9} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload10} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload11} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        }
        {
          purchaseDetails.supplier_type_id === "1001" && (
            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid id="top-row" container style={{ margin: 6 }}>
                  <Grid item md={12} xs={12} className="item">
                    <Typography>Currency & Incoterms</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid id="top-row" container>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload12} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload13} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload14} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        }
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Billing & Delivery Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload15} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload16} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Green Coffee Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid container xs={12} md={12}>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload18} />
                  {purchaseDetails.gc_type === "speciality" && (
                    <Template payload={payload19} />
                  )}
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload20} />
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload21} />
                </Grid>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        {
          purchaseDetails.gc_type && (
            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                  <Grid item md={12} xs={12} className='item'>
                    <Typography>Specification Information</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <BasicTable rows={compositions} columns={gcTableColumns} hasTotal={false}></BasicTable>
              </AccordionDetails>
            </Accordion>
          )
        }

        <Accordion defaultExpanded={true} ref={dispatchInfoRef}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>MRIN Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <BasicTable
              rows={mrinTableData}
              columns={mrinTableColumns}
            ></BasicTable>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Finance Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={4} container direction="column">
                <Template payload={payload33} />
              </Grid>
              <Grid id="top-row" xs={12} md={4} container direction="column">
                <Template payload={payload34} />
              </Grid>
              <Grid id="top-row" xs={12} md={4} container direction="column">
                <Template payload={payload35} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        {
          purchaseDetails.gc_type && purchaseDetails.supplier_type_id === "1002" && (
            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid id="top-row" container style={{ margin: 6 }}>
                  <Grid item md={12} xs={12} className="item">
                    <Typography>Previous Tax Information</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <BasicTable rows={mrinList} columns={taxColumns}></BasicTable>
              </AccordionDetails>
            </Accordion>
          )
        }
        {
          purchaseDetails.supplier_type_id === "1002" && (
            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid id="top-row" container style={{ margin: 6 }}>
                  <Grid item md={12} xs={12} className="item">
                    <Typography>Tax Information</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid id="top-row" container>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload25} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload26} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload27} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        }
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Other Charges</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              {/* {purchaseDetails.supplier_type_id === "1001" && (
              <>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload31} />
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload32} />
                </Grid>
              </>
            )} */}

              {purchaseDetails.supplier_type_id === "1002" && (
                <BasicTable
                  rows={otherChargesList}
                  columns={otherCharges}
                ></BasicTable>
              )}
              {purchaseDetails.supplier_type_id === "1001" && <Template payload={payload40} />}
              {purchaseDetails.supplier_type_id === "1002" && (
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload50} />
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Price Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={4} container direction="column">
                <Template payload={payload30} />
                {purchaseDetails.purchase_type === "Differential" && (
                  <Template payload={payload51} />
                )}

                {purchaseDetails.supplier_type_id === "1001" && (
                  <Template payload={payload22} />
                )}
              </Grid>
              <Grid id="top-row" xs={12} md={4} container direction="column">
                {purchaseDetails.supplier_type_id === "1001" && (
                  <Template payload={payload23} />
                )}
                {purchaseDetails.supplier_type_id === "1002" && (
                  <Template payload={payload28} />
                )}
              </Grid>
              <Grid id="top-row" xs={12} md={4} container direction="column">
                {purchaseDetails.supplier_type_id === "1001" && (
                  <Template payload={payload24} />
                )}
                {purchaseDetails.supplier_type_id === "1002" && (
                  <Template payload={payload29} />
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {
          purchaseDetails.supplier_type_id !== "1001" && (
            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid id="top-row" container style={{ margin: 6 }}>
                  <Grid item md={12} xs={12} className="item">
                    <Typography>Other Information</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid id="top-row" container>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload6} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload7} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={4} container direction="column">
                    <Template payload={payload8} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        }




        {/* {purchaseDetails.supplier_type_id === "1001" &&
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Document information</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <DocumentList data={documents} edit={true} uploadFile={(event, fileContent, docName, fileName) => uploadFileHandler(event, fileContent, docName, fileName)} downloadFile={(event, fileName, docName) => downloadFileHandler(event, fileName, docName)} deleteFile={(event, fileName) => deleteFileHandler(event, fileName)} />
                        </AccordionDetails>
                    </Accordion>
                } */}
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

        {/* </div> */}
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
          {
            currentUserDetails.role !== "GC Stores Executive" && parseInt(purchaseDetails.status) !== 6 &&
            <Grid item>
              <Button
                label="Edit"
                disabled={activeStep >= 2 ? true : false}
                onClick={(e) => props.editPurchaseDetails("edit_po", props.id)}
              />
            </Grid>
          }
          <Grid item>
            <Button label="Cancel" onClick={props.back} />
          </Grid>
        </Grid>
      </>
    );
  }

  return <>{component}</>;
};
export default PurchaseOrderDetails;