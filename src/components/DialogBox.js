import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function DialogBox(props) {
  return (
    <Dialog
      open={props.dialog.open}
      onClose={props.onClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>{props.dialog.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          {props.dialog.description}
        </DialogContentText>
      </DialogContent>
      {props.onOk ? (
        <DialogActions>
          <Button onClick={props.onClose} color='secondary' autoFocus>
            Cancel
          </Button>
          <Button onClick={props.onOk} color='primary' autoFocus>
            Ok
          </Button>
        </DialogActions>
      ) : (
        <DialogActions>
          <Button onClick={props.onClose} color='primary' autoFocus>
            Ok
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

export default DialogBox;
