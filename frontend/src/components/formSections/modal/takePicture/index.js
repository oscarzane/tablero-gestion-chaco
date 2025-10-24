import React, { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { makeStyles } from 'tss-react/mui';
import { useTheme, useMediaQuery } from '@mui/material';
import 'cropperjs/dist/cropper.css';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import FlipCameraAndroidRoundedIcon from '@mui/icons-material/FlipCameraAndroidRounded';
import FindInPageRoundedIcon from '@mui/icons-material/FindInPageRounded';

const useStyles = makeStyles()((theme) => ({
    botonera: {
        display: "flex",
        justifyContent: "space-around",
        paddingTop: "8px"
    },
    image: {
        display: "block",
        maxWidth: "100%",
    },
    video: {
        maxWidth: "100%"
    }
}));

export function TakePictureDialog(props) {
    const { classes } = useStyles();
    const {
        value, setValue,
        onChange,
    } = props;

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const videoRef = useRef(null);

    const [imgRef, setImgRef] = useState(false);

    const [capture, setCapture] = useState(false);

    useEffect(() => {
        if (videoRef.current){
            videoRef.current.srcObject = value;
        }
    }, [videoRef.current]);

    const handleCapture = async () => {
        var canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        var context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0);
        setCapture(canvas.toDataURL('image/jpeg'));
    };

    const handleRecapture = async () => {
        setCapture(false);
    };

    const handleFinish = async () => {
        onChange(capture);
        setCapture(false);
        setValue(null);
    }

    const handleElegirDesdeArchivo = async () => {
        onChange(false);
        setCapture(false);
        setValue(null);
    }

    const onCloseDialog = async () => {
        setCapture(false);
        setValue(null);
    }

    return (
        <Dialog
            open={value !== null} onClose={() => onCloseDialog()} aria-labelledby="form-dialog-title"
            fullWidth maxWidth={isBigScreen ? "md" : "sm"}
        >
            <DialogTitle id="form-dialog-title">Tomar Foto</DialogTitle>

            <DialogContent>
                <div className={classes.container}>
                    {capture ?
                        <img className={classes.image} src={capture ? capture : ''} alt='' ref={(e) => e !== imgRef ? setImgRef(e) : false}/> :
                        <video className={classes.video} playsInline autoPlay ref={videoRef}></video>
                    }
                </div>

                <div className={classes.botonera}>
                    <Button onClick={handleElegirDesdeArchivo} color="secondary" className={classes.boton} startIcon={<FindInPageRoundedIcon />}>
                        Elegir Archivo
                    </Button>

                    {capture ?
                        <Button onClick={handleRecapture} color="secondary" className={classes.boton} variant="contained" startIcon={<FlipCameraAndroidRoundedIcon />}>
                            Tomar Otra
                        </Button> : 
                        <Button onClick={handleCapture} color="secondary" className={classes.boton} variant="contained" startIcon={<PhotoCameraRoundedIcon />}>
                            Capturar
                        </Button>
                    }
                </div>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => onCloseDialog()}> Cancelar </Button>
                <Button onClick={() => handleFinish()} color="primary" disabled={!capture}> Aceptar </Button>
            </DialogActions>
        </Dialog>
    );
}