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

export const headersControlTotalesModal = [
    { text: "", orientation: "horizontal" },
    { text: "Total", orientation: "horizontal" },
];
export const calculateDataControlTotales = (p_formValues) => {
    var t_return = [
        {
            id: 0,
            title: "Profesionales",
            data: [
                {
                    id: "0totProfesionales",
                    data: parseInt(p_formValues["prof_asistSoc"]) + parseInt(p_formValues["prof_bioquim"])
                        + parseInt(p_formValues["prof_nutricion"]) + parseInt(p_formValues["prof_farmaceu"])
                        + parseInt(p_formValues["prof_fonoaudio"]) + parseInt(p_formValues["prof_kinesio"])
                        + parseInt(p_formValues["prof_enferme"]) + parseInt(p_formValues["prof_medico"])
                        + parseInt(p_formValues["prof_obstetri"]) + parseInt(p_formValues["prof_odonto"])
                        + parseInt(p_formValues["prof_psicologo"]) + parseInt(p_formValues["prof_otros"]),
                },
            ]
        },
        {
            id: 1,
            title: "Técnicos",
            data: [
                {
                    id: "0totTecnicos",
                    data: parseInt(p_formValues["tec_enferme"]) + parseInt(p_formValues["tec_otros"]),
                },
            ]
        },
        {
            id: 2,
            title: "Auxiliares",
            data: [
                {
                    id: "0totAuxiliares",
                    data: parseInt(p_formValues["aux_agente"]) + parseInt(p_formValues["aux_enferme"]) + parseInt(p_formValues["aux_otros"]),
                },
            ]
        },
        {
            id: 3,
            title: "Otros recursos humanos",
            data: [
                {
                    id: "0totOtros",
                    data: parseInt(p_formValues["otros_enferme"]) + parseInt(p_formValues["otros_otros"]),
                },
            ]
        },
    ];

    return t_return;
};

function Page() {
    const { classes } = useStyles();
    //Auxiliar data
    const { usuario } = useContext(AuthContext);
    const navigate = useNavigate();

    const globalsContext = useContext(GlobalsContext);
    const [data, setData] = useState(false);
    const [formValues, setFormValues] = useState(false);

    const [establecimientos, setEstablecimientos] = useState([]);

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
        var t_esCorreccion = data ? "1" : "0";

        var totMedicosPorEsp = parseInt(formValues.med_alerg_ped) + parseInt(formValues.med_alerg) + parseInt(formValues.med_anato) + parseInt(formValues.med_anest)
            + parseInt(formValues.med_angio) + parseInt(formValues.med_audit) + parseInt(formValues.med_cardi) + parseInt(formValues.med_cardi_inf)
            + parseInt(formValues.med_cirug_car) + parseInt(formValues.med_cardi_ped) + parseInt(formValues.med_cirug_cabe) + parseInt(formValues.med_cirug_tor)
            + parseInt(formValues.med_cirug_gen) + parseInt(formValues.med_cirug_ped) + parseInt(formValues.med_cirug_rep) + parseInt(formValues.med_cirug_vas)
            + parseInt(formValues.med_clini) + parseInt(formValues.med_colop) + parseInt(formValues.med_derma) + parseInt(formValues.med_derma_ped)
            + parseInt(formValues.med_diagn) + parseInt(formValues.med_elect) + parseInt(formValues.med_emerg) + parseInt(formValues.med_endoc)
            + parseInt(formValues.med_endoc_inf) + parseInt(formValues.med_epide) + parseInt(formValues.med_farma) + parseInt(formValues.med_fisia)
            + parseInt(formValues.med_gastr) + parseInt(formValues.med_gastr_inf) + parseInt(formValues.med_genet) + parseInt(formValues.med_geria)
            + parseInt(formValues.med_gesti) + parseInt(formValues.med_ginec) + parseInt(formValues.med_hemat) + parseInt(formValues.med_hemat_ped)
            + parseInt(formValues.med_hemot) + parseInt(formValues.med_hepat) + parseInt(formValues.med_hepat_ped) + parseInt(formValues.med_infec)
            + parseInt(formValues.med_infec_inf) + parseInt(formValues.med_medic_dep) + parseInt(formValues.med_medic_tra)
            + parseInt(formValues.med_medic_gen) + parseInt(formValues.med_medic_leg) + parseInt(formValues.med_medic_nuc)
            + parseInt(formValues.med_medic_pal) + parseInt(formValues.med_nefro) + parseInt(formValues.med_nefro_inf)
            + parseInt(formValues.med_neona) + parseInt(formValues.med_neumo) + parseInt(formValues.med_neumo_inf)
            + parseInt(formValues.med_neuro_cir) + parseInt(formValues.med_neuro) + parseInt(formValues.med_neuro_inf) + parseInt(formValues.med_nutri)
            + parseInt(formValues.med_obste) + parseInt(formValues.med_oftal) + parseInt(formValues.med_oncol) + parseInt(formValues.med_ortop)
            + parseInt(formValues.med_ortop_inf) + parseInt(formValues.med_otorr) + parseInt(formValues.med_pedia) + parseInt(formValues.med_psiqu)
            + parseInt(formValues.med_psiqu_inf) + parseInt(formValues.med_radio) + parseInt(formValues.med_reuma) + parseInt(formValues.med_reuma_inf)
            + parseInt(formValues.med_salud_men) + parseInt(formValues.med_salud_pub) + parseInt(formValues.med_terap) + parseInt(formValues.med_terap_inf)
            + parseInt(formValues.med_tocog) + parseInt(formValues.med_toxic) + parseInt(formValues.med_urolo);

        if (totMedicosPorEsp != formValues.prof_medico) {
            alertModal.showModal(
                "Cantidad de médicos",
                "Se han informado " + formValues.prof_medico + " médicos (incluyendo residentes) pero la suma de médicos por especialidad da " + totMedicosPorEsp + " y no coinciden. Por favor revise la cantidad de médicos informada o las cantidades de médicos por cada especialidad."
            );
        }
        else {
            const response = await postFiles(data ? "recursos-salud/editar.php" : "recursos-salud/nuevo.php", {
                id_usuario: usuario.id_usuario,
                id_recursos_salud: data ? data.id_recursos_salud : false,
                esCorreccion: t_esCorreccion,
                ...formValues
            });
            if (response.error === "") {
                enqueueSnackbar(data ? "Correcciones subidas ok" : 'Nuevo informe subido ok', { variant: "success" });

                onClose();
            }
            else {
                enqueueSnackbar(response.error, { variant: "error" });
            }
        }
        loadingModal.setOpen(false);
    }

    const onSubmitControlTotalesModal = async () => {
        loadingModal.setOpen(true);

        const response = await postFiles("recursos-salud/inconsistencias.php", {
            id_usuario: usuario.id_usuario,
            ...formValues
        });
        if (response.error === "") {
            if (response.data.length == 0)//no hay inconsistencias
                onSubmitFinal();
            else { //hay inconsistencias
                setDataInconsistenciasModal(response.data);
                setOpenInconsistenciasModal(true);
            }
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }

        loadingModal.setOpen(false);
    }

    const onSubmit = async (values, { resetForm }) => {
        setFormValues(values);
        setDataControlTotalesModal(calculateDataControlTotales(values));
        setOpenControlTotalesModal(true);
    }

    const onClose = useCallback(async () => {
        navigate(-1);
    }, [alertModal, globalsContext, navigate]);
    const onCancel = () => {
        alertModal.showModal(
            "Cancelar",
            "Se perderán todos los cambios. ¿Deseas continuar?",
            function () {
                onClose();
            });
    }

    const readEstablecimientos = useCallback(async () => {
        setEstablecimientos([]);

        const response = await postData("establecimiento/leerSimple.php", {
            id_usuario: usuario.id_usuario,
            publicos: 1,//1 solo pub, 2 solo priv, 3 todos
        });

        if (response.error === "") {
            setEstablecimientos(response.data);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

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
    }, [globalsContext.idEdit, usuario.id_usuario]);

    useEffect(() => {
        const loadDefaultValues = async () => {
            loadingModal.setOpen(true);

            await loadData();
            await readEstablecimientos();

            loadingModal.setOpen(false);
        }

        loadDefaultValues();
    }, []);

    const formSections = useMemo(() => [
        {
            name: "Establecimiento y Fecha",
            fields: [
                {
                    dataName: "id_establecimiento", label: "Establecimiento", controlType: "select",
                    items: establecimientos,
                    initialValue: establecimientos.length > 0 ? (data ? data.id_establecimiento : usuario.id_establecimiento) : "",
                    validationSchema: yup.string().required(),
                    disabled: true,
                },
                {
                    dataName: "fecham", label: "Mes", controlType: "textField",
                    initialValue: data ? data.fecham : '',
                    validationSchema: yup.number().required().positive().min(1).max(12),
                    autoFocus: true,
                },
                {
                    dataName: "fechaa", label: "Año", controlType: "textField",
                    initialValue: data ? data.fechaa : '',
                    validationSchema: yup.number().required().positive().min(2021).max(2030),
                },
            ],
        },
        {
            name: "Recursos Humanos (profesionales)",
            description: `Ingresa la cantidad de profesionales (incluyendo residentes) con los que cuenta el establecimiento. Se debe contar según el título que tiene el recurso humano, y no así por la función que está cumpliendo. Ej. un médico aunque esté cumpliento tareas administrativas cuenta como médico. Más adelante en esta misma planilla se te solicitará el detalle de la especialidad de cada médico aquí ingresado (si los tuviera)`,
            fields: [
                {
                    dataName: "prof_asistSoc", label: "Asistente social", controlType: "textField",
                    initialValue: data ? data.prof_asistSoc : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "prof_bioquim", label: "Bioquímico/a", controlType: "textField",
                    initialValue: data ? data.prof_bioquim : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "prof_nutricion", label: "Dietista / Nutricionista", controlType: "textField",
                    initialValue: data ? data.prof_nutricion : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "prof_farmaceu", label: "Farmacéutico/a", controlType: "textField",
                    initialValue: data ? data.prof_farmaceu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "prof_fonoaudio", label: "Fonoaudiólogo/a", controlType: "textField",
                    initialValue: data ? data.prof_fonoaudio : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "prof_kinesio", label: "Kinesiólogo/a", controlType: "textField",
                    initialValue: data ? data.prof_kinesio : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "prof_enferme", label: "Lic. en enferm / Enf. univ.", controlType: "textField",
                    initialValue: data ? data.prof_enferme : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "prof_medico", label: "Médico/a (inc. residentes)", controlType: "textField",
                    initialValue: data ? data.prof_medico : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "prof_obstetri", label: "Obstétrico/a", controlType: "textField",
                    initialValue: data ? data.prof_obstetri : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "prof_odonto", label: "Odontólogo/a", controlType: "textField",
                    initialValue: data ? data.prof_odonto : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "prof_psicologo", label: "Psicólogo/a", controlType: "textField",
                    initialValue: data ? data.prof_psicologo : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "prof_otros", label: "Otros profesionales", controlType: "textField",
                    initialValue: data ? data.prof_otros : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Recursos Humanos (técnicos)",
            description: `Ingresa la cantidad de técnicos con los que cuenta el establecimiento. Se debe contar según el título que tiene el recurso humano, y no así por la función o tarea que está realizando.`,
            fields: [
                {
                    dataName: "tec_enferme", label: "Enferm. profesional", controlType: "textField",
                    initialValue: data ? data.tec_enferme : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "tec_otros", label: "Otros técnicos", controlType: "textField",
                    initialValue: data ? data.tec_otros : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Recursos Humanos (auxiliares)",
            description: `Ingresa la cantidad de auxiliares con los que cuenta el establecimiento. Se debe contar según el título que tiene el recurso humano, y no así por la función o tarea que está realizando.`,
            fields: [
                {
                    dataName: "aux_agente", label: "Agente sanitario", controlType: "textField",
                    initialValue: data ? data.aux_agente : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "aux_enferme", label: "Aux. de enfermería", controlType: "textField",
                    initialValue: data ? data.aux_enferme : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "aux_otros", label: "Otros auxiliares", controlType: "textField",
                    initialValue: data ? data.aux_otros : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Recursos Humanos (otros)",
            description: `Ingresa la cantidad de otros recursos humanos con los que cuenta el establecimiento y que no se pudieron categorizar en las opciones anteriores.`,
            fields: [
                {
                    dataName: "otros_enferme", label: "Ayud. de enferm.", controlType: "textField",
                    initialValue: data ? data.otros_enferme : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "otros_otros", label: "Otros recursos humanos", controlType: "textField",
                    initialValue: data ? data.otros_otros : '',
                    validationSchema: yup.number().min(0).required(),
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
                    autoFocus: true,
                },
                {
                    dataName: "med_alerg_ped", label: "Alergia e inmonología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_alerg_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_anato", label: "Anatomía patológica", controlType: "textField",
                    initialValue: data ? data.med_anato : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_anest", label: "Anesteniología", controlType: "textField",
                    initialValue: data ? data.med_anest : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_angio", label: "Angiología general y Hmodinamia", controlType: "textField",
                    initialValue: data ? data.med_angio : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_audit", label: "Auditoría de servicios de salud", controlType: "textField",
                    initialValue: data ? data.med_audit : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_cardi", label: "Cardiología", controlType: "textField",
                    initialValue: data ? data.med_cardi : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_cardi_inf", label: "Cardiología infantil", controlType: "textField",
                    initialValue: data ? data.med_cardi_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_cirug_car", label: "Cirugía cardiovascular", controlType: "textField",
                    initialValue: data ? data.med_cirug_car : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_cardi_ped", label: "Cirugía cardiovasular pediátrica", controlType: "textField",
                    initialValue: data ? data.med_cardi_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_cirug_cabe", label: "Cirugía de cabeza y cuello", controlType: "textField",
                    initialValue: data ? data.med_cirug_cabe : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_cirug_tor", label: "Cirugía de tórax", controlType: "textField",
                    initialValue: data ? data.med_cirug_tor : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_cirug_gen", label: "Cirugía general", controlType: "textField",
                    initialValue: data ? data.med_cirug_gen : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_cirug_ped", label: "Cirugía pediátrica", controlType: "textField",
                    initialValue: data ? data.med_cirug_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_cirug_rep", label: "Cirugía plástica y reparadora", controlType: "textField",
                    initialValue: data ? data.med_cirug_rep : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_cirug_vas", label: "Cirugía vascular periférica", controlType: "textField",
                    initialValue: data ? data.med_cirug_vas : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_clini", label: "Clínica médica", controlType: "textField",
                    initialValue: data ? data.med_clini : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_colop", label: "Coloproctología", controlType: "textField",
                    initialValue: data ? data.med_colop : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_derma", label: "Dermatología", controlType: "textField",
                    initialValue: data ? data.med_derma : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_derma_ped", label: "Dermatología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_derma_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_diagn", label: "Diagnóstico por imágenes", controlType: "textField",
                    initialValue: data ? data.med_diagn : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_elect", label: "Electro fisiología cardiaca", controlType: "textField",
                    initialValue: data ? data.med_elect : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_emerg", label: "Emergentología", controlType: "textField",
                    initialValue: data ? data.med_emerg : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_endoc", label: "Endocrinología", controlType: "textField",
                    initialValue: data ? data.med_endoc : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_endoc_inf", label: "Endocrinología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_endoc_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_epide", label: "Epidemiología", controlType: "textField",
                    initialValue: data ? data.med_epide : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_farma", label: "Farmacología clínica", controlType: "textField",
                    initialValue: data ? data.med_farma : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_fisia", label: "Fisiatría (medicina física y rehabilitación)", controlType: "textField",
                    initialValue: data ? data.med_fisia : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_gastr", label: "Gastroenterología", controlType: "textField",
                    initialValue: data ? data.med_gastr : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_gastr_inf", label: "Gastroenterología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_gastr_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_genet", label: "Genética médica", controlType: "textField",
                    initialValue: data ? data.med_genet : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_geria", label: "Geriatría", controlType: "textField",
                    initialValue: data ? data.med_geria : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_gesti", label: "Gestión de servicios de salud", controlType: "textField",
                    initialValue: data ? data.med_gesti : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_ginec", label: "Ginecología", controlType: "textField",
                    initialValue: data ? data.med_ginec : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_hemat", label: "Hematología", controlType: "textField",
                    initialValue: data ? data.med_hemat : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_hemat_ped", label: "Hemato-oncología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_hemat_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_hemot", label: "Hemoterapia e inmunohematología", controlType: "textField",
                    initialValue: data ? data.med_hemot : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_hepat", label: "Hepatología", controlType: "textField",
                    initialValue: data ? data.med_hepat : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_hepat_ped", label: "Hepatología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_hepat_ped : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_infec", label: "Infectología", controlType: "textField",
                    initialValue: data ? data.med_infec : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_infec_inf", label: "Infectología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_infec_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_medic_dep", label: "Medicina del deporte", controlType: "textField",
                    initialValue: data ? data.med_medic_dep : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_medic_tra", label: "Medicina del trabajo", controlType: "textField",
                    initialValue: data ? data.med_medic_tra : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_medic_gen", label: "Medicina general / de faimilia", controlType: "textField",
                    initialValue: data ? data.med_medic_gen : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_medic_leg", label: "Medicina legal", controlType: "textField",
                    initialValue: data ? data.med_medic_leg : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_medic_nuc", label: "Medicina nuclear", controlType: "textField",
                    initialValue: data ? data.med_medic_nuc : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_medic_pal", label: "Medicina paliativa", controlType: "textField",
                    initialValue: data ? data.med_medic_pal : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_nefro", label: "Nefrología", controlType: "textField",
                    initialValue: data ? data.med_nefro : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_nefro_inf", label: "Nefrología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_nefro_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_neona", label: "Neonatología", controlType: "textField",
                    initialValue: data ? data.med_neona : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_neumo", label: "Neumonología", controlType: "textField",
                    initialValue: data ? data.med_neumo : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_neumo_inf", label: "Neumonología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_neumo_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_neuro_cir", label: "Neurocirugía", controlType: "textField",
                    initialValue: data ? data.med_neuro_cir : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_neuro", label: "Neurología", controlType: "textField",
                    initialValue: data ? data.med_neuro : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_neuro_inf", label: "Neurología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_neuro_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_nutri", label: "Nutrición", controlType: "textField",
                    initialValue: data ? data.med_nutri : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_obste", label: "Obstetricia", controlType: "textField",
                    initialValue: data ? data.med_obste : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_oftal", label: "Oftalmología", controlType: "textField",
                    initialValue: data ? data.med_oftal : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_oncol", label: "Oncología", controlType: "textField",
                    initialValue: data ? data.med_oncol : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_ortop", label: "Ortopedia y traumatología", controlType: "textField",
                    initialValue: data ? data.med_ortop : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_ortop_inf", label: "Ortopedia y traumatología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_ortop_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_otorr", label: "Otorrinolaringología", controlType: "textField",
                    initialValue: data ? data.med_otorr : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_pedia", label: "Pediatría", controlType: "textField",
                    initialValue: data ? data.med_pedia : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_psiqu", label: "Psiquiatría", controlType: "textField",
                    initialValue: data ? data.med_psiqu : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_psiqu_inf", label: "Psiquiatría infanto juvenil", controlType: "textField",
                    initialValue: data ? data.med_psiqu_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_radio", label: "Radioterapia o terapia radiante", controlType: "textField",
                    initialValue: data ? data.med_radio : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_reuma", label: "Reumatología", controlType: "textField",
                    initialValue: data ? data.med_reuma : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_reuma_inf", label: "Reumatología pediátrica", controlType: "textField",
                    initialValue: data ? data.med_reuma_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_salud_men", label: "Salud mental comunitaria", controlType: "textField",
                    initialValue: data ? data.med_salud_men : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_salud_pub", label: "Salud pública", controlType: "textField",
                    initialValue: data ? data.med_salud_pub : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_terap", label: "Terapia intensiva", controlType: "textField",
                    initialValue: data ? data.med_terap : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_terap_inf", label: "Terapista intensivo infantil", controlType: "textField",
                    initialValue: data ? data.med_terap_inf : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_tocog", label: "Tocofinecología", controlType: "textField",
                    initialValue: data ? data.med_tocog : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_toxic", label: "Toxicología", controlType: "textField",
                    initialValue: data ? data.med_toxic : "0",
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "med_urolo", label: "Urología", controlType: "textField",
                    initialValue: data ? data.med_urolo : "0",
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Observaciones",
            fields: [
                {
                    dataName: "observaciones", label: "Observaciones", controlType: "textFieldXL",
                    initialValue: "",
                    validationSchema: yup.string().max(500),
                    autoFocus: true,
                },
            ],
        },
    ], [data, usuario.id_establecimiento, establecimientos]);

    return (
        <Fragment>
            <Layout nombrePagina={data ? "Corrección de Recursos de salud" : "Nuevo Informe de Recursos de salud"}>
                <Fade in={true} timeout={900}>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            {data.inconsistencias > 0 ?
                                <div>
                                    <div className={classes.textWithIcon}>
                                        <WarningRoundedIcon color="warning" className={classes.icon} />
                                        <h2>Inconsistencias</h2>
                                    </div>
                                    <p>Se han detectado inconsistencias en los datos cargados de este informe. En caso de no corregirlas se te pedirá el consentimiento expreso de lo aquí detectado.</p>
                                </div> : ""}
                            {data && data.detInconsistencias != "" ?
                                <div className={classes.textWithIcon} key={data.detInconsistencias.id}>
                                    <WarningRoundedIcon color="warning" className={classes.icon} />
                                    <h3>
                                        {data.detInconsistencias.title}: {data.detInconsistencias.detInconsistencias.map((inconDet) => (" " + inconDet + " "))}
                                    </h3>
                                </div>
                                : ""}

                            <CustomForm
                                formSections={formSections}
                                onSubmit={onSubmit}
                                onCancel={onCancel}
                                submitButtonText={data ? "Informar correcciones" : "Subir Informe"}
                                cancelButtonText="Cancelar"
                                stepperType={"vertical"}
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