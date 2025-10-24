import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { makeStyles } from 'tss-react/mui';
import { useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import RotateLeftRoundedIcon from '@mui/icons-material/RotateLeftRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';

const useStyles = makeStyles()((theme) => ({
    botonera: {
        display: "flex",
        justifyContent: "space-around",
    },
    image: {
        display: "block",
        maxWidth: "100%",
    },
}));

export function EditImageDialog(props) {
    const { classes } = useStyles();
    const {
        value, setValue,
        onChange,
        aspectRatio, resolution,
    } = props;

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const [imgRef, setImgRef] = useState(false);
    const [cropper, setCropper] = useState(false);

    const updateCropper = () => {
        setCropper(imgRef ? new Cropper(imgRef, {
            viewMode: 1,
            aspectRatio: aspectRatio,
            autoCropArea: 1.0,
        }) : false);
    }

    const handleCrop = async () => {
        onChange(cropper.getCroppedCanvas({
            maxWidth: resolution,
            maxHeight: resolution,
            fillColor: '#fff',
            imageSmoothingEnabled: false,
            imageSmoothingQuality: 'high',
        }).toDataURL());
        setValue(null);
    }

    const onCloseDialog = async () => {
        setValue(null);
    }

    return (
        <Dialog
            open={value !== null} onClose={() => onCloseDialog()} aria-labelledby="form-dialog-title"
            fullWidth maxWidth={isBigScreen ? "md" : "sm"}
        >
            <DialogTitle id="form-dialog-title">Editar</DialogTitle>

            <DialogContent>
                <div className={classes.botonera}>
                    <Tooltip title="Acercar" className={classes.boton}>
                        <span>
                            <IconButton
                                aria-label="zoomIn"
                                color="secondary"
                                onClick={() => cropper.zoom(0.1)}
                                disabled={cropper === false}
                                size="large">
                                <ZoomInRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Alejar" className={classes.boton}>
                        <span>
                            <IconButton
                                aria-label="zoomOut"
                                color="secondary"
                                onClick={() => cropper.zoom(-0.1)}
                                disabled={cropper === false}
                                size="large">
                                <ZoomOutRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Rotar izquierda" className={classes.boton}>
                        <span>
                            <IconButton
                                aria-label="rotateLeft"
                                color="secondary"
                                onClick={() => cropper.rotate(-90)}
                                disabled={cropper === false}
                                size="large">
                                <RotateLeftRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Rotar derecha" className={classes.boton}>
                        <span>
                            <IconButton
                                aria-label="rotateRight"
                                color="secondary"
                                onClick={() => cropper.rotate(90)}
                                disabled={cropper === false}
                                size="large">
                                <RotateRightRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Reflejar horizontal" className={classes.boton}>
                        <span>
                            <IconButton
                                aria-label="reflectHor"
                                color="secondary"
                                onClick={() => cropper.scaleX(cropper.getImageData().scaleX * -1)}
                                disabled={cropper === false}
                                size="large">
                                <SwapHorizRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Reflejar vertical" className={classes.boton}>
                        <span>
                            <IconButton
                                aria-label="reflecVert"
                                color="secondary"
                                onClick={() => cropper.scaleY(cropper.getImageData().scaleY * -1)}
                                disabled={cropper === false}
                                size="large">
                                <SwapVertRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </div>

                <div className={classes.container}>
                    <img className={classes.image} src={value ? value : ''} alt='' ref={(e) => e !== imgRef ? setImgRef(e) : false} onLoad={() => updateCropper()} />
                </div>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => onCloseDialog()}> Cancelar </Button>
                <Button onClick={() => handleCrop()} color="primary" disabled={cropper === false}> Aceptar </Button>
            </DialogActions>
        </Dialog>
    );
}