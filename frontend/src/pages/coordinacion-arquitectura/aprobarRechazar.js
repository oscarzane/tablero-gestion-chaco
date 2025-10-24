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

        const response = await postFiles("act-agente-sanitario/revisar.php", {
            id_usuario: usuario.id_usuario,
            id_act_agente_sanitario: data.id_act_agente_sanitario,
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

            const response = await postFiles("act-agente-sanitario/inconsistencias.php", {
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

            const response = await postData("act-agente-sanitario/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_act_agente_sanitario: globalsContext.idEdit,
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
        {
            name: "Total de días y personas atendidas",
            fields: [
                {
                    dataName: "totDias", label: "Días de atención", controlType: "textField",
                    initialValue: data ? data.totDias : '',
                    validationSchema: yup.number().required(),
                    disabled: true,
                },
                {
                    dataName: "totPersonas", label: "Total de personas atendidas", controlType: "textField",
                    initialValue: data ? data.totPersonas : '',
                    validationSchema: yup.number().required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Consultas y atenciones generales",
            fields: [
                {
                    dataName: "consulSintomas", label: "Consultas por síntomas", controlType: "textField",//Consultas por síntomas de enfermedad
                    initialValue: data ? data.consulSintomas : '',
                    validationSchema: yup.number().required(),
                    disabled: true,
                },
                {
                    dataName: "atenEnfermeria", label: "Atención de enfermería", controlType: "textField",
                    initialValue: data ? data.atenEnfermeria : '',
                    validationSchema: yup.number().required(),
                    disabled: true,
                },
                {
                    dataName: "accionPreventiva", label: "Visita por acción preventiva", controlType: "textField",
                    initialValue: data ? data.accionPreventiva : '',
                    validationSchema: yup.number().required(),
                    disabled: true,
                },
                {
                    dataName: "tratamientoEnfer", label: "Visita para tratamiento enfermedad", controlType: "textField",//Visita para tratamiento contra enfermedades
                    initialValue: data ? data.tratamientoEnfer : '',
                    validationSchema: yup.number().required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Controles de embarazos y a niños menores de 5 años (en puesto y visita)",
            fields: [
                {
                    dataName: "controlEmbarazos", label: "Control de embarazo", controlType: "textField",//Control de embarazo en puesto o visita
                    initialValue: data ? data.controlEmbarazos : '',
                    validationSchema: yup.number().required(),
                    disabled: true,
                },
                {
                    dataName: "controlNinos", label: "Control niño sano menor de 5 años", controlType: "textField",//Control niño sano menor de 5 años en puesto o visita
                    initialValue: data ? data.controlNinos : '',
                    validationSchema: yup.number().required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Derivaciones",
            fields: [
                {
                    dataName: "derivacion", label: "Derivación", controlType: "textField",
                    initialValue: data ? data.derivacion : '',
                    validationSchema: yup.number().required(),
                    disabled: true,
                },
            ],
        },
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
            <Layout nombrePagina={"Aprobar / Rechazar Act. de Agentes Sanitarios"}>
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

                                <div className={classes.textWithIcon} key={data.detInconsistencias.id}>
                                    <WarningRoundedIcon color="warning" className={classes.icon}/>
                                    <h3>
                                        {data.detInconsistencias.title}:  {data.detInconsistencias.detInconsistencias.map((inconDet) => (" " + inconDet + " "))}
                                    </h3>
                                </div>
                            </div>
                            : ""}

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