import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { makeStyles } from 'tss-react/mui';
import { useTheme, useMediaQuery } from '@mui/material';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from '@mui/material';

export const AlertModalContext = React.createContext({});

export function ControlTotalesModal(props) {
    const {
        open, setOpen,
        data,
        headers,
        action,
    } = props;

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    // TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
    const useStyles = makeStyles()((theme) => ({
        horizontal: {
        },
        vertical: {
            writingMode: "vertical-rl",
            /*textOrientation: "upright"*/
        },
    }));
    const { classes } = useStyles();

    const handleClose = () => {
        setOpen(false);
    };
    const handleAcept = () => {
        handleClose();
        if (action)
            action();
    }

    return (
        <Dialog
            open={open} onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            fullWidth maxWidth={isBigScreen ? "md" : "sm"}
        >
            <DialogTitle id="alert-dialog-title">
                Control de totales
            </DialogTitle>

            <DialogContent>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: "100%" }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {headers.map((header) => (
                                    <TableCell key={header.text} className={classes[header.orientation]}>
                                        {header.text}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={row.id}>
                                    <TableCell component="th" scope="row" align="right">
                                        {row.title}
                                    </TableCell>
                                    {row.data.map((cell) => (
                                        <TableCell align="center" key={cell.id}>{cell.data}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            <DialogActions>
                {action && <Button onClick={handleClose}>Cancelar</Button>}

                <Button onClick={handleAcept} color="primary">Confirmar</Button>
            </DialogActions>
        </Dialog>
    );
}