import React, { useState, Fragment } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Tooltip, IconButton, Typography, useTheme } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import { EditSignDialog } from '../../modal/editSign';
import noSign from './img/no_sign.png';

const useStyles = makeStyles()((theme) => ({
    container: {
        border: "solid 1px " + theme.palette.text.primary,
        borderRadius: "8px",
        margin: "6px 0 3px 0",
        display: "flex",
        overflow: "hidden",
    },
    botonera: {
        display: "flex",
        flexDirection: "column",
    },
    boton: {
        flexGrow: 1,
        width: "48px",
    },
    foto: {
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        width: "100%",
    },
}));

export function SignatureInput(props) {
    const theme = useTheme();
    const prefersDarkMode = theme.palette.mode === "dark";

    const { classes } = useStyles();
    const {
        label, value, onChange, error, helperText, disabled,
    } = props;

    const [valueEditDialog, setValueEditDialog] = useState(null);


    const handleEditClick = () => {
        setValueEditDialog(value);
    }

    const handleDeleteClick = () => {
        onChange("");
    }

    return (
        <Fragment>
            <Typography variant="caption" component="legend" color="textSecondary"> {label} </Typography>

            <div
                className={classes.container}
                style={{
                    borderColor: (error ? theme.palette.error.main : theme.palette.text.secondary),
                    borderWidth: (error ? "2px" : "1px"),
                }}
            >
                <div className={classes.botonera}>
                    <Tooltip title="Editar" className={classes.boton}>
                        <span>
                            <IconButton
                                aria-label="edit"
                                color="secondary"
                                onClick={handleEditClick}
                                disabled={disabled}
                                size="large">
                                <EditRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Eliminar" className={classes.boton}>
                        <span>
                            <IconButton
                                aria-label="delete"
                                color="secondary"
                                onClick={handleDeleteClick}
                                disabled={disabled || value===""}
                                size="large">
                                <DeleteForeverRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </div>

                <div
                    className={classes.foto}
                    style={{
                        backgroundImage: "url(" + (value!=="" ? value : noSign) + ")",
                        backgroundColor: (prefersDarkMode ? "#EEE2" : "#1112"),
                        filter: (prefersDarkMode ? "invert(100%)" : ""),
                    }}
                >
                </div>
            </div>

            <Typography variant="caption" color="error"> {helperText} </Typography>

            <EditSignDialog
                value={valueEditDialog}
                setValue={setValueEditDialog}
                onChange={onChange}
            />
        </Fragment>
    );
}