import React from 'react';
import { Button } from '@material-ui/core';
import { BlobProvider } from '@react-pdf/renderer';
import MyDocument from './Domestic';
import ImportPDF from './Import';
import { colors } from '../../../../constants/colors';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
        backgroundColor: colors.orange,
        color: colors.white,
        minWidth: 150,
        textTransform: 'capitalize',

        '&:hover': {
            backgroundColor: colors.orange,
            opacity: 0.8,
        },
        '& $MuiButton-label': {
            margin: 0,
        }
    },
}));

const Blob = (props) => {
    const classes = useStyles();
    const { purchaseDetails, documents, id } = props;
    return <BlobProvider document={purchaseDetails?.supplier_type !== "Import" ?
        <MyDocument purchaseDetails={purchaseDetails} id={id} /> :
        <ImportPDF purchaseDetails={purchaseDetails} documents={documents} />}>
        {({ url }) => (
            <Button
                color="primary"
                className={classes.button}
                {...props}
            >
                <a href={url} target="_blank" rel="noopener noreferrer" style={{
                    color: 'white',
                    flex: 1, margin: 0
                }}>
                    Generate PDF
                </a>
            </Button>
        )}
    </BlobProvider>;
};

export default Blob;
