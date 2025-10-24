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

        const response = await postFiles("trabajo-social/revisar.php", {
            id_usuario: usuario.id_usuario,
            id_trabajo_social: data.id_trabajo_social,
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

            const response = await postFiles("trabajo-social/inconsistencias.php", {
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

            const response = await postData("trabajo-social/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_trabajo_social: globalsContext.idEdit,
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
            name: "Personas atendidas",
            fields: [
                {
                    dataName: "cantGenero", label: "No Binarias LGTBIQ+", controlType: "textField",
                    initialValue: data ? data.cantGenero : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cantOriginarios", label: "Pueblos Originarios", controlType: "textField",
                    initialValue: data ? data.cantOriginarios : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Otras prestaciones realizadas",
            fields: [
                {
                    dataName: "cantInformes", label: "Informes", controlType: "textField",
                    initialValue: data ? data.cantInformes : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cantDiagnosticos", label: "Diagnósticos Sociales", controlType: "textField",
                    initialValue: data ? data.cantDiagnosticos : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cantInvestigacion", label: "Proceso de Investigación", controlType: "textField",
                    initialValue: data ? data.cantInvestigacion : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "1 - Violencia de Género",
            fields: [
                {
                    dataName: "VioConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.VioConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "VioConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.VioConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "VioConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.VioConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "VioIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.VioIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "VioIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.VioIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "VioArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.VioArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "VioProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.VioProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "VioProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.VioProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "VioDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.VioDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "2 - Maltrato Infantil",
            fields: [
                {
                    dataName: "MalConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.MalConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MalConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.MalConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MalConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.MalConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MalIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.MalIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MalIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.MalIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MalArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.MalArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MalProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.MalProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MalProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.MalProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MalDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.MalDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "3 - Abuso sexual en niñas, niños y adolescentes",
            fields: [
                {
                    dataName: "AbuConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.AbuConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AbuConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.AbuConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AbuConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.AbuConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AbuIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.AbuIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AbuIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.AbuIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AbuArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.AbuArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AbuProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.AbuProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AbuProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.AbuProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AbuDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.AbuDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "4 - Embarazo adolescente",
            fields: [
                {
                    dataName: "EmbConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.EmbConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "EmbConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.EmbConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "EmbConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.EmbConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "EmbIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.EmbIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "EmbIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.EmbIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "EmbArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.EmbArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "EmbProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.EmbProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "EmbProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.EmbProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "EmbDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.EmbDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "5 - Salud sexual y (no) reproductiva",
            fields: [
                {
                    dataName: "SexConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.SexConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "SexConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.SexConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "SexConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.SexConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "SexIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.SexIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "SexIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.SexIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "SexArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.SexArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "SexProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.SexProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "SexProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.SexProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "SexDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.SexDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "6 - Situaciones fliares complejas",
            fields: [
                {
                    dataName: "FliConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.FliConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FliConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.FliConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FliConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.FliConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FliIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.FliIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FliIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.FliIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FliArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.FliArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FliProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.FliProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FliProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.FliProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FliDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.FliDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "7a - Personas en situación de vulnerabilidad - Niños/niñas",
            fields: [
                {
                    dataName: "NinVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.NinVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "NinVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.NinVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "NinVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.NinVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "NinVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.NinVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "NinVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.NinVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "NinVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.NinVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "NinVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.NinVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "NinVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.NinVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "NinVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.NinVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "7b - Personas en situación de vulnerabilidad - Adolescentes",
            fields: [
                {
                    dataName: "AdoVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.AdoVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AdoVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.AdoVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AdoVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.AdoVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AdoVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.AdoVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AdoVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.AdoVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AdoVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.AdoVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AdoVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.AdoVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AdoVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.AdoVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AdoVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.AdoVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "7c - Personas en situación de vulnerabilidad - Adultos mayores",
            fields: [
                {
                    dataName: "AduVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.AduVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AduVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.AduVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AduVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.AduVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AduVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.AduVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AduVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.AduVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AduVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.AduVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AduVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.AduVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AduVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.AduVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AduVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.AduVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "7d - Personas en situación de vulnerabilidad - LGTBIQ+",
            fields: [
                {
                    dataName: "LgtVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.LgtVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "LgtVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.LgtVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "LgtVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.LgtVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "LgtVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.LgtVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "LgtVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.LgtVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "LgtVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.LgtVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "LgtVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.LgtVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "LgtVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.LgtVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "LgtVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.LgtVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "7e - Personas en situación de vulnerabilidad - Con discapacidad física",
            fields: [
                {
                    dataName: "FisVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.FisVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FisVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.FisVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FisVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.FisVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FisVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.FisVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FisVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.FisVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FisVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.FisVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FisVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.FisVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FisVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.FisVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "FisVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.FisVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "7f - Personas en situación de vulnerabilidad - Con discapacidad mental",
            fields: [
                {
                    dataName: "MenVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.MenVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MenVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.MenVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MenVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.MenVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MenVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.MenVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MenVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.MenVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MenVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.MenVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MenVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.MenVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MenVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.MenVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "MenVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.MenVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "7g - Personas en situación de vulnerabilidad - En situación de calle",
            fields: [
                {
                    dataName: "CalVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.CalVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CalVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.CalVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CalVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.CalVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CalVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.CalVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CalVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.CalVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CalVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.CalVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CalVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.CalVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CalVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.CalVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CalVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.CalVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "7h - Personas en situación de vulnerabilidad - Con consumos problemáticos",
            fields: [
                {
                    dataName: "ConVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.ConVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ConVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.ConVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ConVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.ConVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ConVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.ConVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ConVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.ConVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ConVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.ConVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ConVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.ConVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ConVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.ConVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ConVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.ConVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "8a - Problemas de salud - Desnutrición / bajo peso",
            fields: [
                {
                    dataName: "DesSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.DesSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "DesSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.DesSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "DesSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.DesSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "DesSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.DesSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "DesSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.DesSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "DesSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.DesSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "DesSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.DesSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "DesSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.DesSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "DesSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.DesSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "8b - Problemas de salud - Obesidad",
            fields: [
                {
                    dataName: "ObeSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.ObeSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ObeSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.ObeSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ObeSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.ObeSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ObeSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.ObeSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ObeSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.ObeSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ObeSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.ObeSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ObeSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.ObeSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ObeSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.ObeSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ObeSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.ObeSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "8c - Problemas de salud - Enfermedades transmisibles",
            fields: [
                {
                    dataName: "TraSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.TraSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "TraSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.TraSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "TraSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.TraSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "TraSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.TraSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "TraSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.TraSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "TraSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.TraSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "TraSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.TraSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "TraSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.TraSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "TraSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.TraSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "8d - Problemas de salud - Enfermedades crónicas",
            fields: [
                {
                    dataName: "CroSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.CroSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CroSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.CroSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CroSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.CroSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CroSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.CroSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CroSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.CroSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CroSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.CroSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CroSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.CroSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CroSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.CroSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "CroSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.CroSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "8e - Problemas de salud - Enfermedades oncológicas",
            fields: [
                {
                    dataName: "OncSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.OncSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OncSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.OncSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OncSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.OncSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OncSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.OncSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OncSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.OncSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OncSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.OncSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OncSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.OncSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OncSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.OncSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OncSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.OncSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "9 - Salud bucal",
            fields: [
                {
                    dataName: "BucSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.BucSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "BucSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.BucSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "BucSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.BucSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "BucSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.BucSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "BucSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.BucSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "BucSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.BucSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "BucSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.BucSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "BucSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.BucSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "BucSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.BucSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "10 - Problemáticas medio ambiente",
            fields: [
                {
                    dataName: "AmbConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.AmbConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AmbConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.AmbConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AmbConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.AmbConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AmbIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.AmbIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AmbIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.AmbIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AmbArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.AmbArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AmbProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.AmbProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AmbProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.AmbProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "AmbDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.AmbDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "11 - Otros",
            fields: [
                {
                    dataName: "OtrConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.OtrConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OtrConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.OtrConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OtrConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.OtrConNex : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OtrIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.OtrIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OtrIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.OtrIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OtrArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.OtrArticu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OtrProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.OtrProSer : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OtrProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.OtrProCom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "OtrDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.OtrDeriva : '',
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
            <Layout nombrePagina={"Aprobar / Rechazar Trabajo Social"}>
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