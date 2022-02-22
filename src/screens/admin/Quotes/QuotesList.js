import React,{useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import EnhancedTableHead from '../../../components/EnhancedTableHead';
const columns = [
  { id: 'quotenumber', label: 'Quote Number', },
  { id: 'accountname', label: 'Account Name'},
  { id: 'status', label: 'Status'},
  { id: 'pendingwith', label: 'Responsible Owner'},
  { id: 'createdby', label: 'Created By'},
  { id: 'createddate', label: 'Created Date'}
];

const formatDate = (datestr) => {
  let dateVal = datestr ? new Date(datestr): new Date();
  return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear(); 
}

const formatVal = (val) => { 
  return !val ? '-' : val; 
}

function createData(quoteid,quotenumber, accountname, status, createdby, createddate, pendingwith) {
  return { quoteid,quotenumber, accountname, status, createdby, createddate, pendingwith};
}

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: 24,
  },
  container: {
    maxHeight: 440,
  },
});

const QuotesList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  // const [enableUser, setEnableUser] = React.useState({});
  const [allData, setAllData] = useState([]);//change
  const [order, setOrder] = React.useState('asc');//change
  const [orderBy, setOrderBy] = React.useState('');//change
  const rows = [];
  React.useEffect(() => {
    console.log("Props Data", props.data);
  // }, [props.data]);
  // eslint-disable-next-line
  props.data && props.data.map(v => {
    rows.push(createData(v.quoteid, v.quotenumber, v.accountname, v.status, v.createdby, formatDate(v.createddate), formatVal(v.pendingwith)))
  })
  // eslint-disable-next-line
  setAllData(rows);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data]);
  // eslint-disable-next-line

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  //change
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
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const CellClickHandler = (e, id, quoteNumber, quoteStatus) => {
      console.log(id);
      if(id === 'quotenumber'){
        props.quoteDetails("view_quote", quoteNumber, quoteStatus);
      }
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
              rowCount={allData.length}
              headCells={columns}
              selectedAdvancedFilters={props.selectedAdvancedFilters}
              clearAdvancedFilters={props.clearAdvancedFilters}
            />
          {/* <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead> */}
          <TableBody>
            {allData.length > 0 ? 
            stableSort(allData, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {(column.id === 'quotenumber') ?
                          // eslint-disable-next-line
                          <a href='#' onClick={(e) => {CellClickHandler(e, column.id, row.quoteid, row.status)}}>{value}</a>
                         : value                        
                        }                       
                      </TableCell>
                    )
                  })}
                </TableRow>
              );
            }) : 'No records to display'}
          </TableBody>
        </Tables>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={allData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default QuotesList;