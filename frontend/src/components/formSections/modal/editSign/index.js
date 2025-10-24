import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { makeStyles } from 'tss-react/mui';
import { useTheme, useMediaQuery, Typography } from '@mui/material';
import 'cropperjs/dist/cropper.css';
import MobileScreenShareRoundedIcon from '@mui/icons-material/MobileScreenShareRounded';
import SignaturePad from 'signature_pad';
import { FirmarConQrDialog } from '../firmarConQr';

const useStyles = makeStyles()((theme) => ({
    botonera: {
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: "16px",
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
    canvas: {
        display: "block",
        touchAction: "none",
        filter: theme.palette.mode === "dark" ? "invert(100%)" : "",
        marginLeft: "auto",
        marginRight: "auto",
        border: "solid 1px #0003",
        borderRadius: "8px",
    },
    buttonLeft: {
        marginRight: "auto",
    },
}));

const cropSignatureCanvas = (canvas) => {
    // First duplicate the canvas to not alter the original
    var croppedCanvas = document.createElement('canvas'), croppedCtx = croppedCanvas.getContext('2d');

    croppedCanvas.width = canvas.width;
    croppedCanvas.height = canvas.height;
    croppedCtx.drawImage(canvas, 0, 0);

    // Next do the actual cropping
    var w = croppedCanvas.width,
        h = croppedCanvas.height,
        pix = { x: [], y: [] },
        imageData = croppedCtx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height),
        x, y, index;

    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            index = (y * w + x) * 4;
            if (imageData.data[index + 3] > 0) {
                pix.x.push(x);
                pix.y.push(y);
            }
        }
    }
    pix.x.sort(function (a, b) { return a - b });
    pix.y.sort(function (a, b) { return a - b });
    var n = pix.x.length - 1;

    w = pix.x[n] - pix.x[0];
    h = pix.y[n] - pix.y[0];
    var cut = croppedCtx.getImageData(pix.x[0], pix.y[0], w, h);

    croppedCanvas.width = w;
    croppedCanvas.height = h;
    croppedCtx.putImageData(cut, 0, 0);

    return croppedCanvas.toDataURL();
};

export function EditSignDialog(props) {
    const { classes } = useStyles();
    const {
        value, setValue,/* value==null es open=false, value!=null es open=true*/
        onChange,
        conQr = true,
    } = props;

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const [canvasRef, setCanvasRef] = useState(false);
    const [signaturePad, setSignaturePad] = useState(false);

    const [firmaQrOpen, setFirmaQrOpen] = useState(false);

    useEffect(() => {
        if (signaturePad === false && canvasRef && value !== null)
            setSignaturePad(new SignaturePad(canvasRef, {
                dotSize: 3,
                minWidth: 2,
                maxWidth: 4,
                //throttle: 8,
                minDistance: 3,
            }));
    }, [canvasRef, signaturePad, value]);

    const handleAceptNormal = async () => {
        //onChange(signaturePad.toDataURL());
        onChange(cropSignatureCanvas(canvasRef));
        setValue(null);
        setSignaturePad(false);
    }
    const handleAceptQr = async (data) => {
        onChange(data);
        setValue(null);
        setSignaturePad(false);
    }

    const handleCleanSign = async () => {
        signaturePad.clear();
        setSignaturePad(signaturePad);
    }

    const handleOpenFirmarQr = async () => {
        setFirmaQrOpen(true);
    }

    const onCloseDialog = async () => {
        setValue(null);
        setSignaturePad(false);
    }
    
    return (
        <Dialog
            open={value !== null} onClose={() => onCloseDialog()} aria-labelledby="form-dialog-title"
            fullWidth maxWidth={isBigScreen ? "md" : "sm"}
        >
            <DialogTitle id="form-dialog-title">Firmar</DialogTitle>

            <DialogContent>
                <div className={classes.botonera}>
                    <Typography variant="body1" className={classes.textoBotonera}>
                        Firma debajo en la pantalla.
                        {conQr && "Si no tienes mouse o pantalla táctil puedes usar la firma con QR."}
                    </Typography>

                    {conQr &&
                        <Button
                            variant="contained"
                            color="secondary"
                            className={classes.button}
                            startIcon={<MobileScreenShareRoundedIcon />}
                            onClick={() => handleOpenFirmarQr()}
                        >
                            Firmar con QR
                        </Button>
                    }
                </div>
            </DialogContent>

            <div className={classes.container}>
                <canvas
                    className={classes.canvas}
                    width="256px"
                    height="256px"
                    ref={(c) => c !== canvasRef ? setCanvasRef(c) : false}
                >
                </canvas>
            </div>

            <DialogActions>
                <Button
                    onClick={() => handleCleanSign()}
                    className={classes.buttonLeft}
                    disabled={signaturePad === false}>
                    Limpiar
                </Button>
                <Button onClick={() => onCloseDialog()}>
                    Cancelar
                </Button>
                <Button onClick={() => handleAceptNormal()} color="primary" disabled={!(signaturePad !== false && !signaturePad.isEmpty())}>
                    Aceptar
                </Button>
            </DialogActions>

            <FirmarConQrDialog
                open={firmaQrOpen}
                setOpen={setFirmaQrOpen}
                onChange={handleAceptQr}
            />
        </Dialog>
    );
}