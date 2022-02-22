import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '../../../components/Button';
import { CheckBox } from '../../../components/CheckBox';
import { TextField } from '../../../components/TextField';

const detailscolumns = [
  { id: 'doc_kind', label: 'Document Name', },
  { id: 'document_name', label: 'File Name' },
];

const editcolumns = [
  { id: 'doc_kind', label: 'Document Name', },
];

function createData(doc_kind, document_name, file_name, upload, required, docid, dispatchid) {
  return { doc_kind, document_name, file_name, upload, required, docid, dispatchid };
}

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: 24,
  }
});

const DocumentList = (props) => {
  const classes = useStyles();
  const rows = [];
  const columns = props.details === true ? detailscolumns : editcolumns;

  React.useEffect(() => {
    console.log("Props Data", props.data);
  }, [props.data]);
  // eslint-disable-next-line

  for (const v in props.data) {
    rows.push(createData(props.data[v].doc_kind, props.data[v].document_name, props.data[v].file_name, props.data[v].upload, props.data[v].required, props.data[v]?.docid, props?.data[v]?.dispatchid))
  }

  const downloadAction = (e, fileName, docName, docid, dispatchid) => {
    props.downloadFile("download_file", fileName, docName, docid, dispatchid);
  };

  const deleteAction = (e, fileName, docid, dispatchid) => {
    props.deleteFile("delete_file", fileName, docid, dispatchid);
  };

  const uploadAction = (e, fileContent, docName, fileName, docid, dispatchid) => {
    props.uploadFile("upload_file", fileContent, docName, fileName, docid, dispatchid);
  }

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const fileUploadHandle = async (e, row) => {
    console.log("Came isndie this");
    console.log(e.target.files[0]);
    row.file = await toBase64(e.target.files[0]);
    row.file = row.file.replace(/^data:application\/(pdf);base64,/, "")
    row.fileName = e.target.files[0].name;
    console.log("Row is", row);
  }


  return (
    <Paper className={classes.root}>
      <TableContainer>
        <Tables stickyHeader aria-label="sticky table" size="small">
          {
            props.details === true &&
            <TableHead>
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
                <TableCell>
                  Documents Required
                </TableCell>
                <TableCell>
                  Upload
                </TableCell>
                <TableCell>
                </TableCell>
              </TableRow>
            </TableHead>
          }
          {
            props.edit === true &&
            <TableHead>
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
                <TableCell>
                  File
                </TableCell>
                <TableCell>
                  Documents Required
                </TableCell>
                <TableCell>
                  Upload
                </TableCell>
                <TableCell>
                </TableCell>
                <TableCell>
                </TableCell>
                <TableCell>
                </TableCell>
              </TableRow>
            </TableHead>
          }
          <TableBody>

            {rows.map((row, i) => {
              console.log('Row is', row);
              if (props.details === true) {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column, index) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {value}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      <CheckBox checked={row.required} name={row.required} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <CheckBox checked={row.upload ? true : false} name={row.upload} disabled={true} />
                    </TableCell>
                    <TableCell>
                      {row.file_name && <Button label="Download"
                        onClick={(e) => { downloadAction(e, row.file_name, row.document_name, row?.docid, row?.dispatchid) }}></Button>}
                    </TableCell>
                  </TableRow>
                );
              } else {
                return (

                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column, index) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {value}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      {!row.file_name && <TextField type="file" onChange={(e) => { fileUploadHandle(e, row) }}></TextField>}
                      {row.document_name}
                    </TableCell>
                    <TableCell>
                      <CheckBox checked={row?.required} name={row?.required} />
                    </TableCell>
                    <TableCell>
                      <CheckBox checked={row.upload ? true : false} name={row.upload} />
                    </TableCell>
                    <TableCell>
                      {!row.file_name && <Button label="Upload" onClick={(e) => {
                        uploadAction(e, row.file, row.doc_kind, row.fileName, row?.docid, row?.dispatchid)
                      }}></Button>}
                    </TableCell>
                    <TableCell>
                      {row.file_name && <Button label="Download"
                        onClick={(e) => { downloadAction(e, row.file_name, row.document_name, row?.docid, row?.dispatchid) }}></Button>}
                    </TableCell>
                    <TableCell>
                      {row.file_name && <Button label="Delete"
                        onClick={(e) => {
                          deleteAction(e, row.file_name, row?.docid, row?.dispatchid)
                        }}></Button>}
                    </TableCell>
                  </TableRow>
                );
              }
            })}
          </TableBody>
        </Tables>
      </TableContainer>
    </Paper >
  );
}

export default DocumentList;