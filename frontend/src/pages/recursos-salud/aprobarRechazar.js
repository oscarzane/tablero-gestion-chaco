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

        const response = await postFiles("recursos-salud/revisar.php", {
            id_usuario: usuario.id_usuario,
            id_recursos_salud: data.id_recursos_salud,
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

            const response = await postFiles("recursos-salud/inconsistencias.php", {
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

            const response = await postData("recursos-salud/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_recursos_salud: globalsContext.idEdit,
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
            name: "Recursos Humanos (profesionales)",
            fields: [
                {
                    dataName: "prof_asistSoc", label: "Asistente social", controlType: "textField",
                    initialValue: data ? data.prof_asistSoc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_bioquim", label: "Bioquímico/a", controlType: "textField",
                    initialValue: data ? data.prof_bioquim : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_nutricion", label: "Dietista / Nutricionista", controlType: "textField",
                    initialValue: data ? data.prof_nutricion : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_farmaceu", label: "Farmacéutico/a", controlType: "textField",
                    initialValue: data ? data.prof_farmaceu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_fonoaudio", label: "Fonoaudiólogo/a", controlType: "textField",
                    initialValue: data ? data.prof_fonoaudio : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_kinesio", label: "Kinesiólogo/a", controlType: "textField",
                    initialValue: data ? data.prof_kinesio : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_enferme", label: "Lic. en enferm / Enf. univ.", controlType: "textField",
                    initialValue: data ? data.prof_enferme : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_medico", label: "Médico/a (inc. residentes)", controlType: "textField",
                    initialValue: data ? data.prof_medico : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_obstetri", label: "Obstétrico/a", controlType: "textField",
                    initialValue: data ? data.prof_obstetri : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_odonto", label: "Odontólogo/a", controlType: "textField",
                    initialValue: data ? data.prof_odonto : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_psicologo", label: "Psicólogo/a", controlType: "textField",
                    initialValue: data ? data.prof_psicologo : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "prof_otros", label: "Otros profesionales", controlType: "textField",
                    initialValue: data ? data.prof_otros : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Recursos Humanos (técnicos)",
            fields: [
                {
                    dataName: "tec_enferme", label: "Enferm. profesional", controlType: "textField",
                    initialValue: data ? data.tec_enferme : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "tec_otros", label: "Otros técnicos", controlType: "textField",
                    initialValue: data ? data.tec_otros : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Recursos Humanos (auxiliares)",
            fields: [
                {
                    dataName: "aux_agente", label: "Agente sanitario", controlType: "textField",
                    initialValue: data ? data.aux_agente : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "aux_enferme", label: "Aux. de enfermería", controlType: "textField",
                    initialValue: data ? data.aux_enferme : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "aux_otros", label: "Otros auxiliares", controlType: "textField",
                    initialValue: data ? data.aux_otros : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Recursos Humanos (otros)",
            fields: [
                {
                    dataName: "otros_enferme", label: "Ayud. de enferm.", controlType: "textField",
                    initialValue: data ? data.otros_enferme : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "otros_otros", label: "Otros recursos humanos", controlType: "textField",
                    initialValue: data ? data.otros_otros : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Detalle de los médicos por especialidades",
            description: `Ingresa la cantidad de médicos (incluyendo residentes) que hay por cada especialidad (generalistas, clínicos, pediatras, etc.). La suma de estos médicos deberá coincidir con la cantidad de médicos que se suministró más arriba.`,
            fields: [
                {
                    dataName: "med_alerg", label: "Alergia e inmunología", controlType: "textField",
                    initialValue: data ? data.med_alerg : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_alerg_ped", label: "Alergia e inmonología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_alerg_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_anato", label: "Anatomía patológica", controlType: "textField",
                    initialValue: data ? data.med_anato : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_anest", label: "Anesteniología", controlType: "textField",
                    initialValue: data ? data.med_anest : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_angio", label: "Angiología general y Hmodinamia", controlType: "textField",
                    initialValue: data ? data.med_angio : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_audit", label: "Auditoría de servicios de salud", controlType: "textField",
                    initialValue: data ? data.med_audit : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_cardi", label: "Cardiología", controlType: "textField",
                    initialValue: data ? data.med_cardi : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_cardi_inf", label: "Cardiología infantil", controlType: "textField",
                    initialValue: data ? data.med_cardi_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_cirug_car", label: "Cirugía cardiovascular", controlType: "textField",
                    initialValue: data ? data.med_cirug_car : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_cardi_ped", label: "Cirugía cardiovasular pediátrica", controlType: "textField",
                    initialValue: data ? data.med_cardi_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_cirug_cabe", label: "Cirugía de cabeza y cuello", controlType: "textField",
                    initialValue: data ? data.med_cirug_cabe : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_cirug_tor", label: "Cirugía de tórax", controlType: "textField",
                    initialValue: data ? data.med_cirug_tor : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_cirug_gen", label: "Cirugía general", controlType: "textField",
                    initialValue: data ? data.med_cirug_gen : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_cirug_ped", label: "Cirugía pediátrica", controlType: "textField",
                    initialValue: data ? data.med_cirug_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_cirug_rep", label: "Cirugía plástica y reparadora", controlType: "textField",
                    initialValue: data ? data.med_cirug_rep : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_cirug_vas", label: "Cirugía vascular periférica", controlType: "textField",
                    initialValue: data ? data.med_cirug_vas : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_clini", label: "Clínica médica", controlType: "textField",
                    initialValue: data ? data.med_clini : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_colop", label: "Coloproctología", controlType: "textField",
                    initialValue: data ? data.med_colop : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_derma", label: "Dermatología", controlType: "textField",
                    initialValue: data ? data.med_derma : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_derma_ped", label: "Dermatología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_derma_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_diagn", label: "Diagnóstico por imágenes", controlType: "textField",
                    initialValue: data ? data.med_diagn : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_elect", label: "Electro fisiología cardiaca", controlType: "textField",
                    initialValue: data ? data.med_elect : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_emerg", label: "Emergentología", controlType: "textField",
                    initialValue: data ? data.med_emerg : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_endoc", label: "Endocrinología", controlType: "textField",
                    initialValue: data ? data.med_endoc : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_endoc_inf", label: "Endocrinología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_endoc_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_epide", label: "Epidemiología", controlType: "textField",
                    initialValue: data ? data.med_epide : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_farma", label: "Farmacología clínica", controlType: "textField",
                    initialValue: data ? data.med_farma : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_fisia", label: "Fisiatría (medicina física y rehabilitación)", controlType: "textField",
                    initialValue: data ? data.med_fisia : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_gastr", label: "Gastroenterología", controlType: "textField",
                    initialValue: data ? data.med_gastr : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_gastr_inf", label: "Gastroenterología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_gastr_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_genet", label: "Genética médica", controlType: "textField",
                    initialValue: data ? data.med_genet : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_geria", label: "Geriatría", controlType: "textField",
                    initialValue: data ? data.med_geria : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_gesti", label: "Gestión de servicios de salud", controlType: "textField",
                    initialValue: data ? data.med_gesti : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_ginec", label: "Ginecología", controlType: "textField",
                    initialValue: data ? data.med_ginec : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_hemat", label: "Hematología", controlType: "textField",
                    initialValue: data ? data.med_hemat : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_hemat_ped", label: "Hemato-oncología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_hemat_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_hemot", label: "Hemoterapia e inmunohematología", controlType: "textField",
                    initialValue: data ? data.med_hemot : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_hepat", label: "Hepatología", controlType: "textField",
                    initialValue: data ? data.med_hepat : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_hepat_ped", label: "Hepatología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_hepat_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_infec", label: "Infectología", controlType: "textField",
                    initialValue: data ? data.med_infec : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_infec_inf", label: "Infectología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_infec_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_medic_dep", label: "Medicina del deporte", controlType: "textField",
                    initialValue: data ? data.med_medic_dep : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_medic_tra", label: "Medicina del trabajo", controlType: "textField",
                    initialValue: data ? data.med_medic_tra : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_medic_gen", label: "Medicina general / de faimilia", controlType: "textField",
                    initialValue: data ? data.med_medic_gen : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_medic_leg", label: "Medicina legal", controlType: "textField",
                    initialValue: data ? data.med_medic_leg : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_medic_nuc", label: "Medicina nuclear", controlType: "textField",
                    initialValue: data ? data.med_medic_nuc : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_medic_pal", label: "Medicina paliativa", controlType: "textField",
                    initialValue: data ? data.med_medic_pal : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_nefro", label: "Nefrología", controlType: "textField",
                    initialValue: data ? data.med_nefro : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_nefro_inf", label: "Nefrología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_nefro_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_neona", label: "Neonatología", controlType: "textField",
                    initialValue: data ? data.med_neona : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_neumo", label: "Neumonología", controlType: "textField",
                    initialValue: data ? data.med_neumo : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_neumo_inf", label: "Neumonología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_neumo_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_neuro_cir", label: "Neurocirugía", controlType: "textField",
                    initialValue: data ? data.med_neuro_cir : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_neuro", label: "Neurología", controlType: "textField",
                    initialValue: data ? data.med_neuro : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_neuro_inf", label: "Neurología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_neuro_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_nutri", label: "Nutrición", controlType: "textField",
                    initialValue: data ? data.med_nutri : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_obste", label: "Obstetricia", controlType: "textField",
                    initialValue: data ? data.med_obste : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_oftal", label: "Oftalmología", controlType: "textField",
                    initialValue: data ? data.med_oftal : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_oncol", label: "Oncología", controlType: "textField",
                    initialValue: data ? data.med_oncol : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_ortop", label: "Ortopedia y traumatología", controlType: "textField",
                    initialValue: data ? data.med_ortop : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_ortop_inf", label: "Ortopedia y traumatología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_ortop_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_otorr", label: "Otorrinolaringología", controlType: "textField",
                    initialValue: data ? data.med_otorr : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_pedia", label: "Pediatría", controlType: "textField",
                    initialValue: data ? data.med_pedia : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_psiqu", label: "Psiquiatría", controlType: "textField",
                    initialValue: data ? data.med_psiqu : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_psiqu_inf", label: "Psiquiatría infanto juvenil", controlType: "textField",
                    initialValue: data ? data.med_psiqu_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_radio", label: "Radioterapia o terapia radiante", controlType: "textField",
                    initialValue: data ? data.med_radio : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_reuma", label: "Reumatología", controlType: "textField",
                    initialValue: data ? data.med_reuma : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_reuma_inf", label: "Reumatología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_reuma_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_salud_men", label: "Salud mental comunitaria", controlType: "textField",
                    initialValue: data ? data.med_salud_men : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_salud_pub", label: "Salud pública", controlType: "textField",
                    initialValue: data ? data.med_salud_pub : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_terap", label: "Terapia intensiva", controlType: "textField",
                    initialValue: data ? data.med_terap : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_terap_inf", label: "Terapista intensivo infantil", controlType: "textField",
                    initialValue: data ? data.med_terap_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_tocog", label: "Tocofinecología", controlType: "textField",
                    initialValue: data ? data.med_tocog : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_toxic", label: "Toxicología", controlType: "textField",
                    initialValue: data ? data.med_toxic : "0",
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "med_urolo", label: "Urología", controlType: "textField",
                    initialValue: data ? data.med_urolo : "0",
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
            <Layout nombrePagina={"Aprobar / Rechazar Recursos de salud"}>
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