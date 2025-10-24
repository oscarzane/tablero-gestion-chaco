import React, { useState, useEffect, Fragment, useCallback } from 'react';
import Layout from '../../components/layout/qr';
import { makeStyles } from 'tss-react/mui';
import { Grid, Fade, Typography, CircularProgress, Button } from '@mui/material';
import { postData } from '../../services/ajax';
import { Skeleton } from '@mui/material';
import { useParams } from 'react-router-dom';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { EditSignDialog } from '../../components/formSections/modal/editSign';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles()((theme) => ({
    botonera: {
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: "8px",
        flexWrap: "wrap",
    },
    textoBotonera: {
        flexShrink: 2,
        marginBottom: "8px",
    },
    button: {
        flexShrink: 1,
        marginBottom: "8px",
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

function Page() {
    const { classes } = useStyles();
    let { qr } = useParams();

    const [value, setValue] = useState(null);
    const [signData, setSigndata] = useState("");
    const [isValid, setIsValid] = useState(null);
    const [uploadOk, setUploadOk] = useState(false);

    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const loadData = useCallback(async () => {
        const response = await postData("qr-upload/is_valid.php", {
            qr: qr,
        });

        if (response.error === "") {
            setIsValid(true);

            if(response.data.subido * 1 === 1){
                setUploadOk(true);
                setValue(null);
            }
            else{
                setUploadOk(false);
                //setValue(" ");
                setValue("");
            }
        }
        else {
            setIsValid(false);
            enqueueSnackbar(response.error, { variant: "error" });
        }
    }, [enqueueSnackbar, qr]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onChange = async (value) => {
        setSigndata(value);
    
        const response = await postData("qr-upload/subir_firma.php", {
            sign: value,
            qr: qr,
        });

        if (response.error === "") {
            setUploadOk(true);
            
            enqueueSnackbar('Firma ok', { variant: "success" });
        }
        else {
            setSigndata("");
            setUploadOk(false);

            enqueueSnackbar(response.error, { variant: "error" });
        }
    }

    const handleEditClick = () => {
        setValue("");
    }

    return (
        <Layout>
            <Grid container direction="column">
                <Typography variant="h6" >Firma con código QR</Typography>

                <div className={classes.botonera}>
                    {isValid === null &&
                        <Fade in={isValid === null} timeout={900}>
                            <Fragment>
                                <Skeleton variant="text" width="100%" />
                                <Skeleton variant="text" width="100%" />
                            </Fragment>
                        </Fade>
                    }

                    {isValid === false &&
                        <Fade in={isValid === false} timeout={900}>
                            <Typography variant="body1" className={classes.textoBotonera}>
                                El código leído no es válido. Por favor intenta nuevamente.
                            </Typography>
                        </Fade>
                    }

                    {isValid && signData === "" && !uploadOk &&
                        <Fade in={isValid && signData === "" && !uploadOk} timeout={900}>
                            <Fragment>
                                <Typography variant="body1" className={classes.textoBotonera}>
                                    Presiona el siguiente botón para realizar la firma
                                </Typography>

                                <Button
                                    variant="contained"
                                    color="secondary"
                                    className={classes.button}
                                    startIcon={<EditRoundedIcon />}
                                    onClick={() => handleEditClick()}
                                >
                                    Firmar
                                </Button>
                            </Fragment>
                        </Fade>
                    }

                    {isValid && signData !== "" && !uploadOk &&
                        <Fade in={isValid && signData !== "" && !uploadOk} timeout={900}>
                            <Fragment>
                                <Typography variant="body1" className={classes.textoBotonera}>
                                    Estamos subiendo la firma. Por favor aguarda unos instantes.
                                </Typography>

                                <CircularProgress color="secondary" />
                            </Fragment>
                        </Fade>
                    }

                    {isValid && uploadOk &&
                        <Fade in={isValid && uploadOk} timeout={900}>
                            <Typography variant="body1" className={classes.textoBotonera}>
                                Firma realizada correctamente. Ya puedes cerrar esta ventana.
                            </Typography>
                        </Fade>
                    }
                </div>
            </Grid>

            <EditSignDialog
                value={value}
                setValue={setValue}
                onChange={onChange}
                conQr={false}
            />
        </Layout>
    );
}

export default Page;