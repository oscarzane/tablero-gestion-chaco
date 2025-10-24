import React, { useState, Fragment } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Tooltip, IconButton, Typography, useTheme } from '@mui/material';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import { EditImageDialog } from '../../modal/editImage';
import { TakePictureDialog } from '../../modal/takePicture';
import noPhoto from './img/no_photo.png';
import { useSnackbar } from 'notistack';
import { useMediaQuery } from 'react-responsive';

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

export function SingleImageInput(props) {
    const theme = useTheme();
    const prefersDarkMode = theme.palette.mode === "dark";
    const isDesktop = useMediaQuery({ minWidth: 992 });

    const { classes } = useStyles();
    const {
        label, value, onChange, error, helperText, disabled,
        resolution, ratio,
        canAdd = true, canEdit = false, canDelete = true
    } = props;

    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const [valueEditDialog, setValueEditDialog] = useState(null);
    const [valueTakePictureDialog, setValueTakePictureDialog] = useState(null);

    const [inputFileRef, setInputFileRef] = useState(false);

    const handleAddFileClick = () => {
        if(isDesktop){
            navigator.mediaDevices.getUserMedia({
                video: true,
                //audio: true,
            })
            .then((stream) => {
                setValueTakePictureDialog(stream);
            })
            .catch((reason) => {
                inputFileRef.value = null;
                inputFileRef.click();
            });
        }
        else{
            inputFileRef.value = null;
            inputFileRef.click();
        }
    };

    const handleAddFileChange = (input) => {
        if (input.target.files && input.target.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                setValueEditDialog(e.target.result);
            }
            reader.readAsDataURL(input.target.files[0]);
        }
        else {
            enqueueSnackbar("Tu navegador no es compatible. Por favor usa otro navegador (Ej. Chrome)", { variant: "error" });
        }
    };

    const handleEditClick = () => {
        setValueEditDialog(value);
    }

    const handleDeleteClick = () => {
        onChange("");
    }

    const onChangeTakePicture = (value) => {
        //si no devuelvo una imagen, llamo a abrir archivos
        if(value)
            setValueEditDialog(value);
        else{
            inputFileRef.value = null;
            inputFileRef.click();
        }
    };

    return (
        <Fragment>
            <input
                type="file" onChange={handleAddFileChange} style={{ display: "none" }}
                ref={(e) => e !== inputFileRef ? setInputFileRef(e) : false}
                accept="image/*"
            />

            <Typography variant="caption" component="legend" color="textSecondary"> {label} </Typography>

            <div
                className={classes.container}
                style={{
                    borderColor: (error ? theme.palette.error.main : theme.palette.text.secondary),
                    borderWidth: (error ? "2px" : "1px"),
                }}
            >
                <div className={classes.botonera}>
                    <Tooltip title="Elegir nueva" className={classes.boton}>
                        <span>
                            <IconButton
                                aria-label="new"
                                color="secondary"
                                onClick={handleAddFileClick}
                                disabled={disabled || !canAdd}
                                size="large">
                                <AddPhotoAlternateRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>

                    {canEdit &&
                        <Tooltip title="Editar" className={classes.boton}>
                            <span>
                                <IconButton
                                    aria-label="edit"
                                    color="secondary"
                                    onClick={handleEditClick}
                                    disabled={disabled || !value}
                                    size="large">
                                    <EditRoundedIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    }

                    <Tooltip title="Eliminar" className={classes.boton}>
                        <span>
                            <IconButton
                                aria-label="delete"
                                color="secondary"
                                onClick={handleDeleteClick}
                                disabled={disabled || !value || !canDelete}
                                size="large">
                                <DeleteForeverRoundedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </div>

                <div
                    className={classes.foto}
                    style={{
                        backgroundImage: "url(" + (value !== "" ? value : noPhoto) + ")",
                        backgroundColor: (prefersDarkMode && value === "" ? "#EEE2" : "#1112"),
                        filter: (prefersDarkMode && value === "" ? "invert(100%)" : ""),
                    }}
                >
                </div>
            </div>

            <Typography variant="caption" color="error"> {helperText} </Typography>

            <EditImageDialog
                value={valueEditDialog}
                setValue={setValueEditDialog}
                onChange={onChange}
                aspectRatio={ratio}
                resolution={resolution}
            />
            <TakePictureDialog
                value={valueTakePictureDialog}
                setValue={setValueTakePictureDialog}
                onChange={onChangeTakePicture}
            />
        </Fragment>
    );
}