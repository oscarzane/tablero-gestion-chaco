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
            title: "Diagnósticos por imagenes",
            data: [
                {
                    id: "0totDiagnos",
                    data: parseInt(p_formValues["placasCE"]) + parseInt(p_formValues["placasIN"] ? p_formValues["placasIN"] : 0)
                        + parseInt(p_formValues["ecografCE"]) + parseInt(p_formValues["ecografIN"] ? p_formValues["ecografIN"] : 0)
                        + parseInt(p_formValues["endoscoCE"]) + parseInt(p_formValues["endoscoIN"] ? p_formValues["endoscoIN"] : 0)
                        + parseInt(p_formValues["tomografCE"]) + parseInt(p_formValues["tomografIN"] ? p_formValues["tomografIN"] : 0)
                        + parseInt(p_formValues["colongiCE"]) + parseInt(p_formValues["colongiIN"] ? p_formValues["colongiIN"] : 0),
                },
            ]
        },
        {
            id: 1,
            title: "Otras prestaciones y estudios especiales",
            data: [
                {
                    id: "0totOtras",
                    data: parseInt(p_formValues["electroenceCE"]) + parseInt(p_formValues["electroenceIN"] ? p_formValues["electroenceIN"] : 0)
                        + parseInt(p_formValues["ergonoCE"]) + parseInt(p_formValues["ergonoIN"] ? p_formValues["ergonoIN"] : 0)
                        + parseInt(p_formValues["papCE"]) + parseInt(p_formValues["papIN"] ? p_formValues["papIN"] : 0)
                        + parseInt(p_formValues["espiromeCE"]) + parseInt(p_formValues["espiromeIN"] ? p_formValues["espiromeIN"] : 0)
                        + parseInt(p_formValues["electromioCE"]) + parseInt(p_formValues["electromioIN"] ? p_formValues["electromioIN"] : 0),
                },
            ]
        },
        {
            id: 2,
            title: "Rehabilitación",
            data: [
                {
                    id: "0totRehab",
                    data: parseInt(p_formValues["kinesioCE"]) + parseInt(p_formValues["kinesioIN"] ? p_formValues["kinesioIN"] : 0)
                        + parseInt(p_formValues["fonoauCE"]) + parseInt(p_formValues["fonoauIN"] ? p_formValues["fonoauIN"] : 0)
                        + parseInt(p_formValues["psicoloCE"]) + parseInt(p_formValues["psicoloIN"] ? p_formValues["psicoloIN"] : 0)
                        + parseInt(p_formValues["fisioteraCE"]) + parseInt(p_formValues["fisoteraIN"] ? p_formValues["fisoteraIN"] : 0)
                        + parseInt(p_formValues["estimuTemCE"]) + parseInt(p_formValues["estimuTemIN"] ? p_formValues["estimuTemIN"] : 0),
                },
            ]
        },
        {
            id: 3,
            title: "Cirugías",
            data: [
                {
                    id: "0totCirugias",
                    data: parseInt(p_formValues["cirugiaAmb"]) + parseInt(p_formValues["cirugiaInter"] ? p_formValues["cirugiaInter"] : 0),
                },
            ]
        },
        {
            id: 4,
            title: "Partos",
            data: [
                {
                    id: "0totPartos",
                    data: parseInt(p_formValues["partoVag"]) + parseInt(p_formValues["partoCes"]),
                },
            ]
        },
        {
            id: 5,
            title: "Productos del parto",
            data: [
                {
                    id: "0totProdParto",
                    data: parseInt(p_formValues["nacVivos"]) + parseInt(p_formValues["nacMuert"]),
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

        const response = await postFiles(data ? "produccion-mensual/editar.php" : "produccion-mensual/nuevo.php", {
            id_usuario: usuario.id_usuario,
            id_produccion_mensual: data ? data.id_produccion_mensual : false,
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

        const response = await postFiles("produccion-mensual/inconsistencias.php", {
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
            name: "Diagnósticos por imágenes (en Consultorio Exterior)",
            fields: [
                {
                    dataName: "placasCE", label: "N° placas radiología", controlType: "textField",
                    initialValue: data ? data.placasCE : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "pacienCE", label: "Pacientes atendidos radiología", controlType: "textField",
                    initialValue: data ? data.pacienCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ecografCE", label: "Ecografías", controlType: "textField",
                    initialValue: data ? data.ecografCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "endoscoCE", label: "Endoscopías", controlType: "textField",
                    initialValue: data ? data.endoscoCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "tomografCE", label: "Tomografías", controlType: "textField",
                    initialValue: data ? data.tomografCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "colongiCE", label: "Colongiografías retrógradas", controlType: "textField",
                    initialValue: data ? data.colongiCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        ...(() => {
            return !Formatter.tieneInternacion(usuario.establecimiento_tipo) ? [] : [{
                name: "Diagnósticos por imágenes (en Internación)",
                fields: [
                    {
                        dataName: "placasIN", label: "N° placas radiología", controlType: "textField",
                        initialValue: data ? data.placasIN : '',
                        validationSchema: yup.number().min(0).required(),
                        autoFocus: true,
                    },
                    {
                        dataName: "pacienIN", label: "Pacientes atendidos radiología", controlType: "textField",
                        initialValue: data ? data.pacienIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                    {
                        dataName: "ecografIN", label: "Ecografías", controlType: "textField",
                        initialValue: data ? data.ecografIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                    {
                        dataName: "endoscoIN", label: "Endoscopías", controlType: "textField",
                        initialValue: data ? data.endoscoIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                    {
                        dataName: "tomografIN", label: "Tomografías", controlType: "textField",
                        initialValue: data ? data.tomografIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                    {
                        dataName: "colongiIN", label: "Colongiografías retrógradas", controlType: "textField",
                        initialValue: data ? data.colongiIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                ],
            }]
        })(),
        {
            name: "Otras prestaciones y estudios especiales (en Consultorio Exterior)",
            fields: [
                {
                    dataName: "electroenceCE", label: "Electroencefalogramas", controlType: "textField",
                    initialValue: data ? data.electroenceCE : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "ergonoCE", label: "Ergonometría", controlType: "textField",
                    initialValue: data ? data.ergonoCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "papCE", label: "P.A.P.", controlType: "textField",
                    initialValue: data ? data.papCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "espiromeCE", label: "Espirometría", controlType: "textField",
                    initialValue: data ? data.espiromeCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "electromioCE", label: "Electromiografía", controlType: "textField",
                    initialValue: data ? data.electromioCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        ...(() => {
            return !Formatter.tieneInternacion(usuario.establecimiento_tipo) ? [] : [{
                name: "Otras prestaciones y estudios especiales (en Internación)",
                fields: [
                    {
                        dataName: "electroenceIN", label: "Electroencefalogramas", controlType: "textField",
                        initialValue: data ? data.electroenceIN : '',
                        validationSchema: yup.number().min(0).required(),
                        autoFocus: true,
                    },
                    {
                        dataName: "ergonoIN", label: "Ergonometría", controlType: "textField",
                        initialValue: data ? data.ergonoIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                    {
                        dataName: "papIN", label: "P.A.P.", controlType: "textField",
                        initialValue: data ? data.papIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                    {
                        dataName: "espiromeIN", label: "Espirometría", controlType: "textField",
                        initialValue: data ? data.espiromeIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                    {
                        dataName: "electromioIN", label: "Electromiografía", controlType: "textField",
                        initialValue: data ? data.electromioIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                ],
            }]
        })(),
        {
            name: "Rehabilitación (en Consultorio Exterior)",
            fields: [
                {
                    dataName: "kinesioCE", label: "Ses. de Kinesiología", controlType: "textField",
                    initialValue: data ? data.kinesioCE : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "fonoauCE", label: "Serv. de Fonoaudiología", controlType: "textField",
                    initialValue: data ? data.fonoauCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "psicoloCE", label: "Serv. de Psicología", controlType: "textField",
                    initialValue: data ? data.psicoloCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "fisioteraCE", label: "Serv. de Fisioterapia", controlType: "textField",
                    initialValue: data ? data.fisioteraCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "estimuTemCE", label: "Serv. de Estim. Temprana", controlType: "textField",
                    initialValue: data ? data.estimuTemCE : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        ...(() => {
            return !Formatter.tieneInternacion(usuario.establecimiento_tipo) ? [] : [{
                name: "Rehabilitación (en Internación)",
                fields: [
                    {
                        dataName: "kinesioIN", label: "Ses. de Kinesiología", controlType: "textField",
                        initialValue: data ? data.kinesioIN : '',
                        validationSchema: yup.number().min(0).required(),
                        autoFocus: true,
                    },
                    {
                        dataName: "fonoauIN", label: "Serv. de Fonoaudiología", controlType: "textField",
                        initialValue: data ? data.fonoauIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                    {
                        dataName: "psicoloIN", label: "Serv. de Psicología", controlType: "textField",
                        initialValue: data ? data.psicoloIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                    {
                        dataName: "fisoteraIN", label: "Serv. de Fisioterapia", controlType: "textField",
                        initialValue: data ? data.fisoteraIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                    {
                        dataName: "estimuTemIN", label: "Serv. de Estim. Temprana", controlType: "textField",
                        initialValue: data ? data.estimuTemIN : '',
                        validationSchema: yup.number().min(0).required(),
                    },
                ],
            }]
        })(),
        {
            name: "Cirugías",
            fields: [
                {
                    dataName: "cirugiaAmb", label: "Ambulatorias", controlType: "textField",
                    initialValue: data ? data.cirugiaAmb : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                ...(() => {
                    return !Formatter.tieneInternacion(usuario.establecimiento_tipo) ? [] : [{
                        dataName: "cirugiaInter", label: "De Internación", controlType: "textField",
                        initialValue: data ? data.cirugiaInter : '',
                        validationSchema: yup.number().min(0).required(),
                    }]
                })(),
            ],
        },
        {
            name: "Tipo de Parto",
            fields: [
                {
                    dataName: "partoVag", label: "Parto vaginal", controlType: "textField",
                    initialValue: data ? data.partoVag : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "partoCes", label: "Parto por cesárea", controlType: "textField",
                    initialValue: data ? data.partoCes : '',
                    validationSchema: yup.number().min(0).required(),
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
                    autoFocus: true,
                },
                {
                    dataName: "nacMuert", label: "Nacidos muertos", controlType: "textField",
                    initialValue: data ? data.nacMuert : '',
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
            <Layout nombrePagina={data ? "Corrección de Producción Mensual" : "Nuevo Informe de Producción Mensual"}>
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