import React, {  useEffect, useState} from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import  Button  from './Button';
import { DatePicker } from './DatePicker';
import { TextField } from './TextField';
const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: '#feecda',      
    },
    body: {
      fontSize: 14,       
    },
  }))(TableCell);
  
  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(even)': {
     //   backgroundColor: theme.palette.action.hover,
      },   
      '& .MuiOutlinedInput-input':{
        padding: '10px 14px'
      },
         
    },
  }))(TableRow);

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    container:{
      width: '95%'
    }
});



export default function BasicTable(props) {
    const classes = useStyles();
   
    const total = () => {
      return props.rows?.map(row => parseInt(row[props.totalColId] ? row[props.totalColId] : 0)).reduce((sum, i) => sum + i, 0);                       
    } 
    
    const totalIndex = () => {
      return props.columns.findIndex(item => item.id === props.totalColId);    
    }  

    const [totalValue, setTotalValue] = useState(total())

    const EditableCell = (props) => {
        // We need to keep and update the state of the cell normally
        const [value, setValue] = useState(props.initialValue)
      
        const onChange = e => {
          if(props.type === "date"){
            setValue(e)
            updateMyData(props.index, props.id, e)
          }else{
            if(props.id && props.id === 'dispatch_quantity'){
              if(e.target.value >= 0){              
                setValue(e.target.value)
              } 
            }else {
                setValue(e.target.value)
              }
          }          
        }

        const onClick = e => {
          props.handler.handleClick(props.index);                               
        }
      
        // We'll only update the external data when the input is blurred
        const onBlur = () => {
          updateMyData(props.index, props.id, value)
        }
      
        // If the initialValue is changed external, sync it up with our state
        useEffect(() => {
          setValue(props.initialValue)  
          const totalVal = total();
          setTotalValue(totalVal);                  
        }, [props.initialValue])

        if(props.type === "date"){
          return <DatePicker value={value === '-' ? new Date() : value} onChange={onChange} onBlur={onBlur}></DatePicker>
        } else if(props.type === "button"){
          return <Button onClick={onClick} label={props.label}></Button>
        } else{
          return <TextField value={value} onChange={onChange} onBlur={onBlur} type={props.type} />
        }     
      }
    
      const updateMyData = (rowIndex, columnId, value) => {         
          props.rows.forEach((row, index) => {
            if (index === rowIndex) {
              row[columnId] = value;              
            }           
          })
          const totalVal = total();
          setTotalValue(totalVal);     
          props.onUpdate && props.onUpdate(totalVal);          
      }
    
    return (
        <TableContainer component={Paper} className={classes.container}>
            <Table className={classes.table} aria-label="simple table">
              {
                !props.hideHeader && 
                <TableHead>
                    <StyledTableRow>
                        {props.columns.map((column) => (
                            <StyledTableCell
                                key={column.id}
                                align={column.align}
                                style={{ minWidth: column.minWidth }}
                            >
                                {column.label}
                            </StyledTableCell>
                        ))}
                    </StyledTableRow>
                </TableHead>
              }                
                <TableBody style={{backgroundColor: '#fff'}}>
                    {(props.rows === undefined || props.rows === null || props.rows.length === 0) ? <p>No records to display</p> : props.rows?.map((row, index) => (
                        <StyledTableRow key={row.name}>
                            {props.columns.map((column) => {
                                const value = row[column.id] !== '' ? row[column.id] : '-';                                
                                return (
                                    <StyledTableCell key={column.id} align={column.align}>                                        
                                        {column.isEditable === true ? <EditableCell initialValue={value} index={index} id={column.id} type={column.type} label={column.label} handler={column.handler} />  : value  }                                                                                                                       
                                    </StyledTableCell>
                                )                                
                            })}
                        </StyledTableRow>
                    ))}
                </TableBody>
                {                  
                    props.rows !== null && props.rows.length > 0 && props.hasTotal && 
                    <StyledTableRow>                    
                    <StyledTableCell colSpan={totalIndex() - 1}></StyledTableCell>
                    <StyledTableCell>{totalValue}</StyledTableCell>
                  </StyledTableRow>
                }
            </Table>
        </TableContainer>
    );
}
