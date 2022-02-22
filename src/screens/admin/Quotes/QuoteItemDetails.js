import React, { useEffect, useState } from 'react';
import Template from '../../../components/Template';
import { Grid } from '@material-ui/core';
import { Typography, Card, CardContent, CardHeader } from '@material-ui/core';
import Button from '../../../components/Button';
import { getQuoteItemsInfo } from '../../../apis';
import AuditLog from "./AuditLog";
import '../../common.css'
import _ from 'lodash';
import SimpleStepper from '../../../components/SimpleStepper';

const QuoteItemDetails = (props) => {
    const [quoteItemDetails, setQuoteItemDetails] = useState({});

    const sampleSteps = [
        'Customer Approved',
        'Customer Rejected',
        'GMC Approved',
        'GMC Rejected',
    ];

    useEffect(() => {
        getQuoteItemsInfo({
            "type": "Viewquotelineitem",
            "quotelineitem_id": parseInt(props.id)
        }).then(res => {
            setQuoteItemDetails(res);
        });
        // eslint-disable-next-line 
    }, []);

    const payload = [
        {
            type: 'label',
            value: "Quote Number",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.quote_number,
            sm: '6'
        },
        {
            type: 'label',
            value: "Destination",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.destination,
            sm: '6'
        },
        {
            type: 'label',
            value: "Sample Code",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.sample_code,
            sm: '6'
        }];

    const payload1 = [
        {
            type: 'label',
            value: "Incoterms",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.incoterms,
            sm: '6'
        },
        {
            type: 'label',
            value: "Coffee Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.coffee_type,
            sm: '6'
        },
        {
            type: 'label',
            value: "Customer Brand Name",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.customerbrand_name,
            sm: '6'
        }
    ];

    const payload2 = [
        {
            type: 'label',
            value: "Is Packaging New Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.isreqnew_packing === 1 ? "Yes" : "No",
            sm: '6'
        }
    ];

    const payload3 = [
        {
            type: 'label',
            value: "New Packaging Type Requirement",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.taskdesc,
            sm: '6'
        },
        {
            type: 'label',
            value: "Task Status (New Packing Type)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.new_packtype_status,
            sm: '6'
        },
    ];

    const payload4 = [
        {
            type: 'label',
            value: "Packing Category",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.category_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Weight",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.weight_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "No of Secondary Packs/Master Carton",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.noofsecondary_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Carton Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.cartontype_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Is Palletization Required?",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.palletizationrequire_id === 1 ? "Yes" : "No",
            sm: '6'
        },
        {
            type: 'label',
            value: "Description of Packing Type available in ERP",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.currencyname,
            sm: '6'
        }

    ];

    const payload5 = [
        {
            type: 'label',
            value: "Packing Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.categorytype_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Secondary Packing",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.secondary_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "UPC",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.upc_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Cap Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.captype_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Additional Requirements",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.additional_req,
            sm: '6'
        },
    ];

    const payload6 = [
        {
            type: 'label',
            value: "Expected Order Quantity(Kgs)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.expectedorder_kgs,
            sm: '6'
        },
    ];

    const payload7 = [
        {
            type: 'label',
            value: "Base Price (Per KG)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.baseprice,
            sm: '6'
        },
        {
            type: 'label',
            value: "Margin Value",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.margin,
            sm: '6'
        },
        {
            type: 'label',
            value: "Margin (%)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.margin_percentage,
            sm: '6'
        },
        {
            type: 'label',
            value: "Final Price (Per KG)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.final_price,
            sm: '6'
        },
    ];

    const payload8 = [
        {
            type: 'label',
            value: "Negative Margin Status",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.negativemargin_status,
            sm: '6'
        },
        {
            type: 'label',
            value: "Negative Margin Remarks",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.negativemargin_remarks,
            sm: '6'
        },
        {
            type: 'label',
            value: "Negative Margin Reason",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.negativemargin_reason,
            sm: '6'
        }
    ];

    const payload9 = [
        {
            type: 'label',
            value: "Customer Approval Status",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: !_.isEmpty(quoteItemDetails?.customer_approval) ?
                Boolean(parseInt(quoteItemDetails?.customer_approval)) ? "Approved" : "Rejected" : null,
            sm: '6'
        },
        {
            type: 'label',
            value: "Confirmed Order Quantity (Kgs)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.confirmed_orderquantity,
            sm: '6'
        }
    ];

    const payload0 = [
        {
            type: 'label',
            value: "Customer Rejection Remarks",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.customer_rejectionremarks,
            sm: '6'
        },
    ];

    const payload11 = [
        {
            type: 'label',
            value: "GMC Approval Status",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.gms_approvalstatus,
            sm: '6'
        }];

    const payload12 = [
        {
            type: 'label',
            value: "GMS Rejection Remarks",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.gms_rejectionremarks,
            sm: '6'
        },
    ];

    const payload13 = [
        {
            type: 'label',
            value: "General Remark",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.gms_rejectionremarks,
            sm: '6'
        }
    ];

    const getActiveStep = () => {
        if(quoteItemDetails?.gms_approvalstatus === 'Rejected') {
            return 4;
        } else if(quoteItemDetails?.gms_approvalstatus === 'Approved') {
            return 3;
        } else if(quoteItemDetails?.customer_approval === '0') {
            return 2;
        } else if(quoteItemDetails?.customer_approval === '1') {
            return 1;
        } else {
            return 0;
        }
    };

    return (<>
        <Card className="page-header">
            <CardHeader
                title=" Quotation Item Details"
                className='cardHeader'
            />
            <CardContent>
                <Grid container md={6}>
                    <Grid item md={3} xs={12} >
                        <Typography variant="h7">Quote Number</Typography>
                        <Typography>{quoteItemDetails.quote_number}</Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h7">Quote Item Id</Typography>
                        <Typography>{quoteItemDetails.quotelineitem_number}</Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h7">Sample Code</Typography>
                        <Typography>{(quoteItemDetails.sample_code)}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        <Card className="page-header">
          <CardContent>
            <Grid container md={12}>
              <Grid item md={12} xs={12}>
                  {/* {getActiveStep() !== false &&                   */}
                <SimpleStepper
                  activeStep={getActiveStep()}
                  steps={sampleSteps}
                  stepClick={(e) => {
                    console.log("e::", e);
                  }}
                ></SimpleStepper>
    {/* } */}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Quotation & Sample Information</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload1} />
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>New Packaging Type Request Details</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload2} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload3} />
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Packaging Type Details</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload4} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload5} />
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Expected Order Quantity</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload6} />
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Price Information</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload7} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload8} />
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Customer Approval & Confirmed Order Quantity</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload9} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload0} />
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>GMC Approval</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload11} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload12} />
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>General Remarks</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload13} />
            </Grid>
        </Grid>

        <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className="item">
                <Typography>Audit log information</Typography>
            </Grid>
        </Grid>
        <AuditLog data={quoteItemDetails.audit_log} />

        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                <Button label="Edit" onClick={(e) => props.edit("edit_quoteItem", props.id)} />
            </Grid>
            <Grid item>
                <Button label="Cancel" onClick={props.back} />
            </Grid>
        </Grid>
    </>);
}
export default QuoteItemDetails;