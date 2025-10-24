import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { makeStyles } from 'tss-react/mui';
import { useTheme, useMediaQuery } from '@mui/material';
import { List, ListItem, ListItemText, ListSubheader, ListItemIcon, Checkbox, FormControlLabel } from '@mui/material';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

export const AlertModalContext = React.createContext({});

export function InconsistenciasModal(props) {
    const {
        open, setOpen,
        data,
        action
    } = props;

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const [legalChecked, setLegalChecked] = useState(false);

    // TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
    const useStyles = makeStyles()((theme) => ({
        list: {
            width: '100%',
            position: 'relative',
            overflow: 'auto',
            maxHeight: 250,
            marginBottom: theme.spacing(3),
            '& ul': { padding: 0 },
        },
        listContainer: {
            padding: 0,
        },
        listHeader: {
            backgroundColor: 'unset',
            padding: 0,
        },
        listItem: {
            paddingLeft: theme.spacing(2),
        },
        listIcon: {
            minWidth: "auto",
        }
    }));
    const { classes } = useStyles();

    const handleClose = () => {
        setLegalChecked(false);
        setOpen(false);
    };
    const handleAcept = () => {
        handleClose();
        if (action)
            action();
    }

    const onLegalChecked = (v) => {
        setLegalChecked(v.target.checked);
    }

    return (
        <Dialog
            open={open} onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            fullWidth maxWidth={isBigScreen ? "md" : "sm"}
        >
            <DialogTitle id="alert-dialog-title">
                Control de inconsistencias
            </DialogTitle>

            <DialogContent>
                <p>Se han detectado inconsistencias en los datos consignados de este informe:</p>

                <List
                    className={classes.list}
                    subheader={<li />}
                    >
                    {data.map((inconGroup) => (
                        <li key={`section-${inconGroup.id}`}>
                            <ul className={classes.listContainer}>
                                <ListSubheader className={classes.listHeader}>
                                    { inconGroup.title }
                                </ListSubheader>
                                {inconGroup.detInconsistencias.map((inconDet) => (
                                    <ListItem key={`item-${inconGroup.id}-${inconDet}`} className={classes.listContainer}>
                                        <ListItemIcon className={classes.listIcon}> <WarningRoundedIcon color="warning" /> </ListItemIcon>
                                        <ListItemText className={classes.listItem} primary={inconDet} />
                                    </ListItem>
                                ))}
                            </ul>
                        </li>
                    ))}
                </List>

                <FormControlLabel
                    control={<Checkbox checked={legalChecked} onChange={(v) => onLegalChecked(v)} />}
                    label="Declaro que los datos consignados en este informe son correctos y completos. No se ha omitido ni falseado información, siendo fiel expresión de la verdad."
                />
            </DialogContent>

            <DialogActions>
                {action && <Button onClick={handleClose}>Cancelar</Button>}

                <Button onClick={handleAcept} color="primary" disabled={!legalChecked}>Confirmar</Button>
            </DialogActions>
        </Dialog>
    );
}