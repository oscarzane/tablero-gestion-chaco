import React, { useState, Fragment } from 'react';
import { makeStyles } from 'tss-react/mui';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { postData } from '../../../services/ajax';
import { List, ListItem, ListItemText, Fade, useMediaQuery, useTheme } from '@mui/material';
import { Formatter } from '../../../const/formatter';
import { Skeleton } from '@mui/material';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles()((theme) => ({
    listItem: {
        "> .MuiListItemText-primary":{
            color: theme.palette.text.secondary,
        },
        "> .MuiListItemText-secondary":{
            color: theme.palette.text.primary,
        },
    },
}));


export default function VerLogDialog(props) {
    const {
        referencia, setReferencia,
        id_referencia,
        id_usuario,
    } = props;
    const { classes } = useStyles();
    const [rows, setRows] = useState(null);
    const [localReferencia, setLocalReferencia] = useState(null);
    const [localIdReferencia, setLocalIdReferencia] = useState(null);

    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const loadData = async (p_referencia, p_id_referencia) => {
        setRows(null);

        const response = await postData("log/leer-id-referencia.php", {
            id_usuario: id_usuario,
            referencia: p_referencia,
            id_referencia: p_id_referencia
        });

        if (response.error === "") {
            setRows(response.data);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
    }

    if (localReferencia !== referencia || localIdReferencia !== id_referencia) {
        setLocalReferencia(referencia);
        setLocalIdReferencia(id_referencia);
        if (referencia)
            loadData(referencia, id_referencia);
    }

    const onCloseDialog = () => {
        setReferencia(null);
    }

    return (
        <Fragment>
            <Dialog
                open={referencia !== null} onClose={onCloseDialog} aria-labelledby="form-dialog-title"
                fullWidth maxWidth={isBigScreen ? "md" : "sm"}
            >
                <DialogTitle id="form-dialog-title">Historial</DialogTitle>
                <DialogContent>
                    <Fade in={rows !== null} timeout={900}>
                        <List dense>
                            {rows && rows.map((log) => (
                                <ListItem key={log.id_log}>
                                    <ListItemText
                                        className={classes.listItem}
                                        primary={Formatter.dateBdToUi(log.fecha) + " " + log.accion_str + " (" + log.nombre + ")"}
                                        secondary={
                                            log.comentario ? 
                                                (log.area_str ? " (" + log.area_str + "): " : "") + log.comentario
                                                : ""
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Fade>

                    <Fade in={rows === null} timeout={900}>
                        <List dense>
                            {rows === null ?
                                <Fragment>
                                    <ListItem><Skeleton variant="text" width="100%" /> </ListItem>
                                    <ListItem><Skeleton variant="text" width="100%" /> </ListItem>
                                    <ListItem><Skeleton variant="text" width="100%" /> </ListItem>
                                </Fragment> : null
                            }
                        </List>
                    </Fade>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onCloseDialog}> Cerrar </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}