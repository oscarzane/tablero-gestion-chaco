import React, { useContext, useState, useEffect, Fragment, useCallback, useMemo } from 'react';
import Layout from '../../components/layout/main';
import { makeStyles } from 'tss-react/mui';
import { Fade, Grid, Paper } from '@mui/material';
import * as yup from 'yup';
import { postData, postFiles } from '../../services/ajax';
import { AuthContext } from '../../context/auth';
import { LoadingModalContext } from '../../components/modal/loading';
import { AlertModalContext } from '../../components/modal/alert';
import { setYupLocaleES } from '../../const/yup';
import { useNavigate } from 'react-router-dom';
import { Formatter } from '../../const/formatter';
import { CustomForm } from '../../components/formSections';
import { GlobalsContext } from '../../context/globals';
import { useSnackbar } from 'notistack';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { ControlTotalesModal } from '../../components/modal/controlTotales';
import { InconsistenciasModal } from '../../components/modal/inconsistencias';
import { headersControlTotalesModal, calculateDataControlTotales } from './editar';

setYupLocaleES();

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(4),
        paddingBottom: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    textWithIcon: {
        display: 'flex',
        alignItems: "center",
    },
    icon: {
        marginRight: theme.spacing(1),
    }
}));

function Page() {
    const { classes } = useStyles();
    //Auxiliar data
    const { usuario } = useContext(AuthContext);
    const navigate = useNavigate();

    const globalsContext = useContext(GlobalsContext);
    const [data, setData] = useState(false);
    const [formValues, setFormValues] = useState(false);
    /*const [idSolicitudLicencia, setIdSolicitudLicencia] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState(false);
    const [nuevoEstadoBd, setNuevoEstadoBd] = useState(false);*/

    //Modals
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const [openControlTotalesModal, setOpenControlTotalesModal] = useState(false);
    const [dataControlTotalesModal, setDataControlTotalesModal] = useState([]);

    const [openInconsistenciasModal, setOpenInconsistenciasModal] = useState(false);
    const [dataInconsistenciasModal, setDataInconsistenciasModal] = useState([]);
    

    const onSubmitFinal = async () => {
        loadingModal.setOpen(true);

        const response = await postFiles("consultorio-externo/revisar.php", {
            id_usuario: usuario.id_usuario,
            id_consultorio_externo: data.id_consultorio_externo,
            ...formValues
        });
        if (response.error === "") {
            enqueueSnackbar('Informe subido ok', { variant: "success" });

            onClose();
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }

        loadingModal.setOpen(false);
    }

    const onSubmitControlTotalesModal = async () => {
        if (formValues.resultado_revision * 1 == 1){//si es aprobada, realizo comprobacion de inconsistencias
            loadingModal.setOpen(true);

            const response = await postFiles("consultorio-externo/inconsistencias.php", {
                id_usuario: usuario.id_usuario,
                ...formValues
            });
            if (response.error === "") {
                if(response.data.length == 0)//no hay inconsistencias
                    onSubmitFinal();
                else{ //hay inconsistencias
                    setDataInconsistenciasModal(response.data);
                    setOpenInconsistenciasModal(true);
                }
            }
            else {
                enqueueSnackbar(response.error, { variant: "error" });
            }

            loadingModal.setOpen(false);
        }
        else //si no es aprobada, omito comprobacion de inconsistencias
            onSubmitFinal();
    }

    const onSubmit = async (values, { resetForm }) => {
        if (values.resultado_revision * 1 !== 1 && values.comentario === "")//si no es aprobada, el comentario es obligatorio
            enqueueSnackbar("Debes ingresar el comentario con el detalle del rechazo/corrección.", { variant: "error" });
        else{
            setFormValues(values);
            setDataControlTotalesModal(calculateDataControlTotales(values, data.detalle));
            setOpenControlTotalesModal(true);
        }
    }

    const onClose = useCallback(async () => {
        /*if (idSolicitudLicencia && nuevoEstadoBd*1 === 105)
            globalsContext.setIdBoletaPago(idSolicitudLicencia);

        if (nuevoEstado)
            alertModal.showModal("Nuevo estado de la solicitud", nuevoEstado);*/

        navigate(-1);
    }, [alertModal, globalsContext, navigate/*, idSolicitudLicencia, nuevoEstado, nuevoEstadoBd*/]);
    const onCancel = () => {
        alertModal.showModal(
            "Cancelar",
            "Se perderán todos los cambios. ¿Deseas continuar?",
            function () {
                onClose();
            });
    }
    
    const loadData = useCallback(async () => {
        //si tengo un id a editar, leo los datos desde el servidor
        if (globalsContext.idEdit) {
            loadingModal.setOpen(true);

            const response = await postData("consultorio-externo/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_consultorio_externo: globalsContext.idEdit,
            });

            if (response.error === "") {
                setData(response.data);
            }
            else {
                enqueueSnackbar(response.error, { variant: "error" });
            }

            loadingModal.setOpen(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalsContext.idEdit, usuario.id_usuario]);
    
    useEffect(() => {
        loadData();
        //readTurnosDisponibles();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalsContext.idEdit]);

    const formSections = useMemo(() => [
        {
            name: "Establecimiento, Fecha y Observaciones",
            fields: [
                {
                    dataName: "establecimiento_str", label: "Establecimiento", controlType: "textField",
                    initialValue: data ? data.establecimiento_str : '',
                    validationSchema: yup.string(),
                    disabled: true,
                },
                {
                    dataName: "fecham", label: "Mes", controlType: "textField",
                    initialValue: data ? data.fecham : '',
                    validationSchema: yup.string(),
                    disabled: true,
                },
                {
                    dataName: "fechaa", label: "Año", controlType: "textField",
                    initialValue: data ? data.fechaa : '',
                    validationSchema: yup.string(),
                    disabled: true,
                },
                {
                    dataName: "observaciones", label: "Observaciones", controlType: "textFieldXL",
                    initialValue: data ? data.observaciones : '',
                    validationSchema: yup.string().max(5000),
                    disabled: true,
                },
            ],
        },
        ...(() => {
            const t_unidades = [];
            if(data) data.detalle.forEach(data => {
                t_unidades.push({
                    name: data.nombre_str,
                    fields: [
                        {
                            dataName: data.id_uo_por_establecimiento+"_dias", label: "Días de atención", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_dias"] : '',
                            validationSchema: yup.number().required(),
                            disabled: true,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_horas", label: "Horas de atención", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_horas"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_men1m", label: "Menor de 1 año - M", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_men1m"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_men1f", label: "Menor de 1 año - F", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_men1f"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_1m", label: "1 año - M", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_1m"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_1f", label: "1 año - F", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_1f"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_2a5m", label: "2 a 5 años - M", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_2a5m"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_2a5f", label: "2 a 5 años - F", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_2a5f"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_6a9m", label: "6 a 9 años - M", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_6a9m"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_6a9f", label: "6 a 9 años - F", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_6a9f"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_10a14m", label: "10 a 14 años - M", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_10a14m"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_10a14f", label: "10 a 14 años - F", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_10a14f"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_15a19m", label: "15 a 19 años - M", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_15a19m"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_15a19f", label: "15 a 19 años - F", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_15a19f"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_20a49m", label: "20 a 49 años - M", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_20a49m"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_20a49f", label: "20 a 49 años - F", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_20a49f"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_50m", label: "50 años y más - M", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_50m"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_50f", label: "50 años y más - F", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_50f"] : '',
                            validationSchema: yup.number().required(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_ce_1t", label: "Cont. Emb. 1° Trim.", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_ce_1t"] : '',
                            validationSchema: yup.number(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_ce_2t", label: "Cont. Emb. 2° Trim.", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_ce_2t"] : '',
                            validationSchema: yup.number(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_ce_3t", label: "Cont. Emb. 3° Trim.", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_ce_3t"] : '',
                            validationSchema: yup.number(),
                            disabled: data ? true : false,
                        },
                        {
                            dataName: data.id_uo_por_establecimiento+"_ce_ulterior", label: "Cont. Emb. 1° Ulterior", controlType: "textField",
                            initialValue: data ? data[data.id_uo_por_establecimiento+"_ce_ulterior"] : '',
                            validationSchema: yup.number(),
                            disabled: data ? true : false,
                        },
                    ],
                });
            });
            return t_unidades;
        })(),
        {
            name: "Resultado de la revisión",
            fields: [
                {
                    dataName: "resultado_revision", label: "Resultado", controlType: "select", items: Formatter.resultados_revision,
                    initialValue: '',
                    validationSchema: yup.string().required(),
                },
                {
                    dataName: "comentario", label: "Comentario", controlType: "textFieldXL",
                    initialValue: '',
                    validationSchema: yup.string().max(5000),
                },
            ],
        },
    ], [data]);
    
    return (
        <Fragment>
            <Layout nombrePagina={"Aprobar / Rechazar Consultorio Externo"}>
                <Fade in={true} timeout={900}>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            {data.inconsistencias > 0 ? 
                            <div>
                                <div className={classes.textWithIcon}>
                                    <WarningRoundedIcon color="warning" className={classes.icon}/>
                                    <h2>Inconsistencias</h2>
                                </div>
                                <p>Se han detectado inconsistencias en los datos cargados de este informe. Puedes solicitar la corrección del informe o aprobarlo con las inconsistencias. En caso de aprobarlo se te pedirá el consentimiento expreso de lo aquí detectado.</p>
                            </div> : ""}
                            {data ? data.detalle.map((det) => (
                                    det.detInconsistencias != "" ?
                                    <div className={classes.textWithIcon} key={det.detInconsistencias.id}>
                                        <WarningRoundedIcon color="warning" className={classes.icon}/>
                                        <h3>
                                            { det.detInconsistencias.title }: {det.detInconsistencias.detInconsistencias.map((inconDet) => ( " " + inconDet + " " ))}
                                        </h3>
                                    </div>
                                    : ""
                                )
                            ) : ""}

                            <CustomForm
                                formSections = {formSections}
                                onSubmit = {onSubmit}
                                onCancel = {onCancel}
                                submitButtonText = {"Completar Revisión"}
                                cancelButtonText = "Cancelar"
                                stepperType = {"vertical"}
                                isModal={false}
                            />
                        </Paper>
                    </Grid>
                </Fade>
            </Layout>

            <ControlTotalesModal
                open={openControlTotalesModal}
                setOpen={setOpenControlTotalesModal}
                headers={headersControlTotalesModal}
                data={dataControlTotalesModal}
                action={onSubmitControlTotalesModal}
            />

            <InconsistenciasModal
                open={openInconsistenciasModal}
                setOpen={setOpenInconsistenciasModal}
                data={dataInconsistenciasModal}
                action={onSubmitFinal}
            />

        </Fragment>
    );
}

export default Page;