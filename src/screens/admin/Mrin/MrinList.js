import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { CheckBox } from '../../../components/CheckBox';
import EnhancedTableHead from '../../../components/EnhancedTableHead';

const columns = [  
    { id: 'mrinno', label: 'MRIN No', }, 
    { id: 'mrindate', label: 'MRIN Date'},
    { id: 'entityname', label: 'Delivery At'},        
    { id: 'pono', label: 'PO No'},   
    { id: 'podate', label: 'PO Date'}, 
    { id: 'vendorname', label: 'Vendor'}, 
    { id: 'invoiceno', label: 'Invoice No'},     
    { id: 'invoicedate', label: 'Invoice Date'},
    { id: 'status', label: 'Status'}, 
];

const formatDate = (datestr) => {
    let dateVal = datestr ? new Date(datestr): new Date();
    return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear(); 
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function createData(mrinno, mrindate, entityname, pono, podate, vendorname, invoiceno, invoicedate, status, mrinid) {
    return { mrinno, mrindate, entityname, pono, podate, vendorname, invoiceno, invoicedate, status, mrinid};
}  

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: 24,
  },
  container: {
    maxHeight: 440,
  },
  capsText: {
    textTransform: 'capitalize'
  }
});

const MrinList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('');
  const rows = [];

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  React.useEffect(() => {
    console.log("Props Data", props.data);
  }, [props.data]);
  // eslint-disable-next-line
  props.data && props.data.map(v => {
    rows.push(createData(v.mrinno, formatDate(v.mrindate), v.entityname, v.pono, formatDate(v.podate), v.vendorname, v.invoiceno, formatDate(v.invoicedate), v.status, v.mrinid))
  })
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const CellClickHandler = (e, sampleid) => {
    console.log(sampleid);
    props.mrinDetails("view_mrin", sampleid);
  };

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Tables stickyHeader aria-label="sticky table" size="small">
        <EnhancedTableHead
                classes={classes}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
                headCells={columns}
                selectedAdvancedFilters={props.selectedAdvancedFilters}
              clearAdvancedFilters={props.clearAdvancedFilters}
              />
          <TableBody>
            {rows.length > 0 ?  
            stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {columns.map((column, index) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {(column.id === 'mrinno') ? 
                          // eslint-disable-next-line
                          <a href="#" onClick={(e) => CellClickHandler(e, row.mrinid)}>{value}</a> : 
                          (column.id === 'req') ?  
                          <CheckBox checked={row.req === 'true' ? true : false} name={row.req} disabled={true}/>
                          : (column.id === 'status') ?
                          <p className={classes.capsText}>{value}</p>
                          : (column.id === 'pono') ?
                           // eslint-disable-next-line
                           <a href="#" onClick={(e) => props.viewPo('list_mrin', row.pono)}>{value}
                           </a>
                          : value
                        }
                      </TableCell>
                    )
                  })}
                </TableRow>
              );
            }): 'No records to display'}
          </TableBody>
        </Tables>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default MrinList;