import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './style.module.scss';
import logo_negro_color from '../../../images/logo_negro_color.png';
import logo_blanco_color from '../../../images/logo_blanco_color.png';
import { useTheme, useMediaQuery } from '@mui/material';

export const LoadingModalContext = React.createContext({});

export function LoadingModalContextProvider(props) {
    const [isOpen, setOpen] = useState(false);

    const theme = useTheme();
    const prefersDarkMode = theme.palette.mode === "dark";
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;
    
    return (
        <LoadingModalContext.Provider value={{ isOpen, setOpen }}>
            {props.children}

            <Dialog
                open={isOpen} aria-labelledby="loading-dialog-title" 
                className={styles.dialog}
                fullWidth maxWidth={isBigScreen ? "md" : "sm"}
            >
                <DialogContent className={styles.dialogContent}>
                    <img src={ prefersDarkMode ? logo_blanco_color : logo_negro_color } alt="logo"/>

                    <CircularProgress />
                </DialogContent>

                <DialogTitle className={styles.dialogTitle} id="loading-dialog-title">Cargando</DialogTitle>
            </Dialog>
        </LoadingModalContext.Provider>
    );
}