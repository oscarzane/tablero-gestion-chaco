import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import styles from './style.module.scss';
import { useTheme, useMediaQuery } from '@mui/material';

export const AlertModalContext = React.createContext({});

export function AlertModalContextProvider(props) {
    const [isOpen, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState([""]);
    const [action, setAction] = useState(null);
    const [actionName, setActionName] = useState("Aceptar");
    const [cancelAction, setCancelAction] = useState(null);
    const [cancelActionName, setCancelActionName] = useState("Cancelar");

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const showModal = (
        title, message, action = null, actionName = "Aceptar",
        cancelAction = null, cancelActionName = "Cancelar"
    ) => {
        setTitle(title ? title : "");
        setMessage(message ? typeof message == "string" ? [message] : message : [""]);
        setAction(action ? () => action : null);
        setActionName(actionName ? actionName : "Aceptar");
        setCancelAction(cancelAction ? () => cancelAction : null);
        setCancelActionName(cancelActionName ? cancelActionName : "Cancelar");
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
        if (cancelAction)
            cancelAction();
    };
    const handleAcept = () => {
        setOpen(false);
        if (action)
            action();
    }

    return (
        <AlertModalContext.Provider value={{ isOpen, showModal }}>
            {props.children}

            <Dialog
                open={isOpen} onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                className={styles.dialog}
                fullWidth maxWidth={isBigScreen ? "md" : "sm"}
            >
                {title && <DialogTitle id="alert-dialog-title">{title}</DialogTitle>}

                <DialogContent>
                    {message.map((val, i) => (
                        <span key={i}>
                            {i > 0 ? <br></br> : null}
                            <DialogContentText>{val}</DialogContentText>
                        </span>
                    ))}
                </DialogContent>

                <DialogActions>
                    {action && <Button onClick={handleClose}>{cancelActionName}</Button>}

                    <Button onClick={handleAcept} color="primary">{actionName}</Button>
                </DialogActions>
            </Dialog>
        </AlertModalContext.Provider>
    );
}