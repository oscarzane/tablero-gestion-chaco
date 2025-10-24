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
            title: "Días de atención",
            data: [
                {
                    id: "0totDias",
                    data: parseInt(p_formValues["totDias"])
                },
            ]
        },
        {
            id: 1,
            title: "Personas atendidas",
            data: [
                {
                    id: "1totPersonas",
                    data: parseInt(p_formValues["totPersonas"])
                },
            ]
        },
        {
            id: 2,
            title: "Actividades realizadas",
            data: [
                {
                    id: "2totalActividades",
                    data: parseInt(p_formValues["consulSintomas"]) + parseInt(p_formValues["atenEnfermeria"]) + parseInt(p_formValues["accionPreventiva"])
                        + parseInt(p_formValues["tratamientoEnfer"]) + parseInt(p_formValues["controlEmbarazos"]) + parseInt(p_formValues["controlNinos"])
                        + parseInt(p_formValues["derivacion"]),
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

        const response = await postFiles(data ? "act-agente-sanitario/editar.php" : "act-agente-sanitario/nuevo.php", {
            id_usuario: usuario.id_usuario,
            id_act_agente_sanitario: data ? data.id_act_agente_sanitario : false,
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

        loadingModal.setOpen(false);
    }

    const onSubmitControlTotalesModal = async () => {
        loadingModal.setOpen(true);

        const response = await postFiles("act-agente-sanitario/inconsistencias.php", {
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
                    initialValue: establecimientos.length>0 ? (data ? data.id_establecimiento : usuario.id_establecimiento) : "",
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
            name: "Total de días y personas atendidas",
            fields: [
                {
                    dataName: "totDias", label: "Días de atención", controlType: "textField",
                    initialValue: data ? data.totDias : '',
                    validationSchema: yup.number().required().positive().min(0),
                    autoFocus: true,
                },
                {
                    dataName: "totPersonas", label: "Total de personas atendidas", controlType: "textField",
                    initialValue: data ? data.totPersonas : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Consultas y atenciones generales",
            fields: [
                {
                    dataName: "consulSintomas", label: "Consultas por síntomas", controlType: "textField",//Consultas por síntomas de enfermedad
                    initialValue: data ? data.consulSintomas : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "atenEnfermeria", label: "Atención de enfermería", controlType: "textField",
                    initialValue: data ? data.atenEnfermeria : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "accionPreventiva", label: "Visita por acción preventiva", controlType: "textField",
                    initialValue: data ? data.accionPreventiva : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "tratamientoEnfer", label: "Visita para tratamiento enfermedad", controlType: "textField",//Visita para tratamiento contra enfermedades
                    initialValue: data ? data.tratamientoEnfer : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Controles de embarazos y a niños menores de 5 años (en puesto y visita)",
            fields: [
                {
                    dataName: "controlEmbarazos", label: "Control de embarazo", controlType: "textField",//Control de embarazo en puesto o visita
                    initialValue: data ? data.controlEmbarazos : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "controlNinos", label: "Control niño sano menor de 5 años", controlType: "textField",//Control niño sano menor de 5 años en puesto o visita
                    initialValue: data ? data.controlNinos : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Derivaciones",
            fields: [
                {
                    dataName: "derivacion", label: "Derivación", controlType: "textField",
                    initialValue: data ? data.derivacion : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
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
            <Layout nombrePagina={data ? "Corrección de Act. de Agentes Sanitarios" : "Nuevo Informe de Act. de Agentes Sanitarios"}>
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