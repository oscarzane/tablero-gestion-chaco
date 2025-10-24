import React, { useState, Fragment } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { makeStyles } from 'tss-react/mui';
import { useTheme, useMediaQuery, Typography, Fade } from '@mui/material';
import 'cropperjs/dist/cropper.css';
import { Skeleton } from '@mui/material';
import { postData } from '../../../../services/ajax';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles()((theme) => ({
    botonera: {
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: "16px",
        flexWrap: "wrap",
    },
    textoBotonera: {
        flexShrink: 2,
    },
    button: {
        flexShrink: 1,
    },
    container: {
        marginBottom: "16px",
    },
    image: {
        display: "block",
        width: "256px",
        maxWidth: "100%",
        borderRadius: "8px",
        margin: "0 auto",
    },
    sign: {
        display: "block",
        width: "256px",
        maxWidth: "100%",
        borderRadius: "8px",
        margin: "0 auto",
        filter: theme.palette.mode === "dark" ? "invert(100%)" : "",
    }
}));

export function FirmarConQrDialog(props) {
    const { classes } = useStyles();
    const {
        open, setOpen,
        onChange,
    } = props;

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const [value, setValue] = useState(false);
    const [qr, setQr] = useState(false);
    const [qrData, setQrData] = useState("");
    const [readSignTimeoutVal, setReadSignTimeoutVal] = useState(false);

    const loadData = async () => {
        setValue("");

        const response = await postData("qr-upload/nuevo.php", {
            validation: "QzdEVUdyTGVTTXZMUWVSdkhkb0REUT09",
        });

        if (response.error === "") {
            setQr(response.data.qrCode);
            setQrData(response.data.qrImgSrc);
            readSign(response.data.qrCode);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
    }

    if (open && value === false)
        loadData();

    const readSign = async (p_qr) => {
        var t_timeoutVal = window.setTimeout(async () => {
            const response = await postData("qr-upload/leer.php", {
                validation: "QzdEVUdyTGVTTXZMUWVSdkhkb0REUT09",
                qr: p_qr,
            });

            if (response.error === "") {
                if (response.data.signImgSrc === ""){
                    readSign(p_qr);
                }
                else{
                    setValue(response.data.signImgSrc);
                    enqueueSnackbar('Fima leída ok', { variant: "success" });
                }
            }
            else {
                enqueueSnackbar(response.error, { variant: "error" });
            }
        }, 4 * 1000);

        setReadSignTimeoutVal(t_timeoutVal);
    }

    const handleAcept = async () => {
        onChange(value);
        onCloseDialog();
    }

    const onCloseDialog = async () => {
        if (readSignTimeoutVal)
            window.clearTimeout(readSignTimeoutVal);

        setQr(false);
        setValue(false);
        setOpen(false);
    }

    return (
        <Dialog
            open={open} onClose={() => onCloseDialog()} aria-labelledby="form-dialog-title"
            fullWidth maxWidth={isBigScreen ? "md" : "sm"}
        >
            <DialogTitle id="form-dialog-title">Firmar</DialogTitle>

            <DialogContent>
                <div className={classes.botonera}>
                    {qr === false &&
                        <Fade in={qr === false} timeout={900}>
                            <Fragment>
                                <Skeleton variant="text" width="100%" />
                                <Skeleton variant="text" width="100%" />
                            </Fragment>
                        </Fade>
                    }
                    {qr !== false && value === "" &&
                        <Fade in={qr !== false && value === ""} timeout={900}>
                            <Typography variant="body1" className={classes.textoBotonera}>
                                Lee el código QR con un celular o tablet. No cierres esta pantalla, la firma será leída de forma automática.
                            </Typography>
                        </Fade>
                    }
                    {qr !== false && value !== "" &&
                        <Fade in={qr !== false && value !== ""} timeout={900}>
                            <Typography variant="body1" className={classes.textoBotonera}>
                                Firma leída con éxito. Presiona aceptar para continuar.
                            </Typography>
                        </Fade>
                    }
                </div>

                <div className={classes.container}>
                    {qr === false &&
                        <Fade in={qr === false} timeout={900}>
                            <Skeleton className={classes.image} variant="rectangular" width={256} height={256} />
                        </Fade>
                    }
                    {qr !== false && value === "" &&
                        <Fade in={qr !== false && value === ""} timeout={900}>
                            <img className={classes.image} src={qrData} alt='qr' />
                        </Fade>
                    }
                    {qr !== false && value !== "" &&
                        <Fade in={qr !== false && value !== ""} timeout={900}>
                            <img className={classes.sign} src={value} alt='qr' />
                        </Fade>
                    }
                </div>
            </DialogContent >

            <DialogActions>
                <Button onClick={() => onCloseDialog()}> Cancelar </Button>
                <Button onClick={() => handleAcept()}  color="primary" disabled={value===""}> Aceptar </Button>
            </DialogActions>
        </Dialog >
    );
}