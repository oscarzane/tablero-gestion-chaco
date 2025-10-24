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

        const response = await postFiles("produccion-mensual/revisar.php", {
            id_usuario: usuario.id_usuario,
            id_produccion_mensual: data.id_produccion_mensual,
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

            const response = await postFiles("produccion-mensual/inconsistencias.php", {
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

            const response = await postData("produccion-mensual/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_produccion_mensual: globalsContext.idEdit,
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
            name: "Diagnósticos por imágenes (en Consultorio Exterior)",
            fields: [
                {
                    dataName: "placasCE", label: "N° placas radiología", controlType: "textField",
                    initialValue: data ? data.placasCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "pacienCE", label: "Pacientes atendidos radiología", controlType: "textField",
                    initialValue: data ? data.pacienCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ecografCE", label: "Ecografías", controlType: "textField",
                    initialValue: data ? data.ecografCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "endoscoCE", label: "Endoscopías", controlType: "textField",
                    initialValue: data ? data.endoscoCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "tomografCE", label: "Tomografías", controlType: "textField",
                    initialValue: data ? data.tomografCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "colongiCE", label: "Colongiografías retrógradas", controlType: "textField",
                    initialValue: data ? data.colongiCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        ...(() => { return !Formatter.tieneInternacion(usuario.establecimiento_tipo) ? [] : [{
            name: "Diagnósticos por imágenes (en Internación)",
            fields: [
                {
                    dataName: "placasIN", label: "N° placas radiología", controlType: "textField",
                    initialValue: data ? data.placasIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "pacienIN", label: "Pacientes atendidos radiología", controlType: "textField",
                    initialValue: data ? data.pacienIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ecografIN", label: "Ecografías", controlType: "textField",
                    initialValue: data ? data.ecografIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "endoscoIN", label: "Endoscopías", controlType: "textField",
                    initialValue: data ? data.endoscoIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "tomografIN", label: "Tomografías", controlType: "textField",
                    initialValue: data ? data.tomografIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "colongiIN", label: "Colongiografías retrógradas", controlType: "textField",
                    initialValue: data ? data.colongiIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        }]})(),
        {
            name: "Otras prestaciones y estudios especiales (en Consultorio Exterior)",
            fields: [
                {
                    dataName: "electroenceCE", label: "Electroencefalogramas", controlType: "textField",
                    initialValue: data ? data.electroenceCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ergonoCE", label: "Ergonometría", controlType: "textField",
                    initialValue: data ? data.ergonoCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "papCE", label: "P.A.P.", controlType: "textField",
                    initialValue: data ? data.papCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "espiromeCE", label: "Espirometría", controlType: "textField",
                    initialValue: data ? data.espiromeCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "electromioCE", label: "Electromiografía", controlType: "textField",
                    initialValue: data ? data.electromioCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        ...(() => { return !Formatter.tieneInternacion(usuario.establecimiento_tipo) ? [] : [{
            name: "Otras prestaciones y estudios especiales (en Internación)",
            fields: [
                {
                    dataName: "electroenceIN", label: "Electroencefalogramas", controlType: "textField",
                    initialValue: data ? data.electroenceIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ergonoIN", label: "Ergonometría", controlType: "textField",
                    initialValue: data ? data.ergonoIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "papIN", label: "P.A.P.", controlType: "textField",
                    initialValue: data ? data.papIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "espiromeIN", label: "Espirometría", controlType: "textField",
                    initialValue: data ? data.espiromeIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "electromioIN", label: "Electromiografía", controlType: "textField",
                    initialValue: data ? data.electromioIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        }]})(),
        {
            name: "Rehabilitación (en Consultorio Exterior)",
            fields: [
                {
                    dataName: "kinesioCE", label: "Ses. de Kinesiología", controlType: "textField",
                    initialValue: data ? data.kinesioCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "fonoauCE", label: "Serv. de Fonoaudiología", controlType: "textField",
                    initialValue: data ? data.fonoauCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "psicoloCE", label: "Serv. de Psicología", controlType: "textField",
                    initialValue: data ? data.psicoloCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "fisioteraCE", label: "Serv. de Fisioterapia", controlType: "textField",
                    initialValue: data ? data.fisioteraCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "estimuTemCE", label: "Serv. de Estim. Temprana", controlType: "textField",
                    initialValue: data ? data.estimuTemCE : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        ...(() => { return !Formatter.tieneInternacion(usuario.establecimiento_tipo) ? [] : [{
            name: "Rehabilitación (en Internación)",
            fields: [
                {
                    dataName: "kinesioIN", label: "Ses. de Kinesiología", controlType: "textField",
                    initialValue: data ? data.kinesioIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "fonoauIN", label: "Serv. de Fonoaudiología", controlType: "textField",
                    initialValue: data ? data.fonoauIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "psicoloIN", label: "Serv. de Psicología", controlType: "textField",
                    initialValue: data ? data.psicoloIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "fisoteraIN", label: "Serv. de Fisioterapia", controlType: "textField",
                    initialValue: data ? data.fisoteraIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "estimuTemIN", label: "Serv. de Estim. Temprana", controlType: "textField",
                    initialValue: data ? data.estimuTemIN : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        }]})(),
        {
            name: "Cirugías",
            fields: [
                {
                    dataName: "cirugiaAmb", label: "Ambulatorias", controlType: "textField",
                    initialValue: data ? data.cirugiaAmb : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                ...(() => { return !Formatter.tieneInternacion(usuario.establecimiento_tipo) ? [] : [{
                    dataName: "cirugiaInter", label: "De Internación", controlType: "textField",
                    initialValue: data ? data.cirugiaInter : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                }]})(),
            ],
        },
        {
            name: "Tipo de Parto",
            fields: [
                {
                    dataName: "partoVag", label: "Parto vaginal", controlType: "textField",
                    initialValue: data ? data.partoVag : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "partoCes", label: "Parto por cesárea", controlType: "textField",
                    initialValue: data ? data.partoCes : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Producto del parto",
            fields: [
                {
                    dataName: "nacVivos", label: "Nacidos vivos", controlType: "textField",
                    initialValue: data ? data.nacVivos : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "nacMuert", label: "Nacidos muertos", controlType: "textField",
                    initialValue: data ? data.nacMuert : '',
                    validationSchema: yup.number().min(0).required(),
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
            <Layout nombrePagina={"Aprobar / Rechazar Producción Mensual"}>
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