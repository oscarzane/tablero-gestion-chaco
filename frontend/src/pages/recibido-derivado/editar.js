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
    { text: "", orientation: "vertical" },
    { text: "Femenino", orientation: "vertical" },
    { text: "Masculino", orientation: "vertical" },
    { text: "Indeterminado", orientation: "vertical" },
    { text: "Total", orientation: "vertical" },
];
export const calculateDataControlTotales = (p_formValues) => {
    var totRecibF = 0, totRecibM = 0, totRecibI = 0, totRecib = 0;
    var totDerivF = 0, totDerivM = 0, totDerivI = 0, totDeriv = 0;

    p_formValues.detalleRecDer.forEach(el => {
        switch (el.sexo) {
            case "1": { if (el.es_derivado == 1) totDerivM++; else totRecibM++; }; break;
            case "2": { if (el.es_derivado == 1) totDerivF++; else totRecibF++; }; break;
            case "3": { if (el.es_derivado == 1) totDerivI++; else totRecibI++; }; break;
        }
    });
    totRecib = totRecibM + totRecibF + totRecibI;
    totDeriv = totDerivM + totDerivF + totDerivI;

    var t_return = [
        {
            id: 0,
            title: "Pacientes Recibidos",
            data: [
                {
                    id: "0totRecibF",
                    data: totRecibF,
                },
                {
                    id: "0totRecibM",
                    data: totRecibM,
                },
                {
                    id: "0totRecibI",
                    data: totRecibI,
                },
                {
                    id: "0totRecib",
                    data: totRecib,
                },
            ]
        },
        {
            id: 1,
            title: "Pacientes Derivados",
            data: [
                {
                    id: "1totDerivF",
                    data: totDerivF,
                },
                {
                    id: "1totDerivM",
                    data: totDerivM,
                },
                {
                    id: "1totDerivI",
                    data: totDerivI,
                },
                {
                    id: "1totDeriv",
                    data: totDeriv,
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

        const response = await postFiles(data ? "recibido-derivado/editar.php" : "recibido-derivado/nuevo.php", {
            id_usuario: usuario.id_usuario,
            id_recibido_derivado: data ? data.id_recibido_derivado : false,
            esCorreccion: t_esCorreccion,
            ...formValues,
            detalleRecDer: JSON.stringify(formValues.detalleRecDer),
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
        var t_estabIncorrecto = false;
        for (var i = 0; i < formValues.detalleRecDer.length; i++) {//controlo que no se deriva/reciba pacientes del mismo establecimiento
            if (formValues.detalleRecDer[i].id_establecimiento == formValues.id_establecimiento)
                t_estabIncorrecto = true;
        }

        if (t_estabIncorrecto) {
            alertModal.showModal(
                "Establecimiento incorrecto",
                "No puedes derivar/recibir pacientes hacia/desde el mismo establecimiento de este formulario");
        }
        else {
            loadingModal.setOpen(true);

            const response = await postFiles("recibido-derivado/inconsistencias.php", {
                id_usuario: usuario.id_usuario,
                ...formValues,
                detalleRecDer: JSON.stringify(formValues.detalleRecDer),
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
            publicos: 3,//1 solo pub, 2 solo priv, 3 todos
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

            const response = await postData("recibido-derivado/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_recibido_derivado: globalsContext.idEdit,
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
            name: "Detalle de recibidos y derivados",
            description: "Agrega con el botón '+' a los pacientes recibidos o derivados. Puedes eliminarlos con el ícono a la derecha de cada fila.",
            fields: [
                {
                    dataName: "detalleRecDer", label: "Pacientes", controlType: "detalleList",
                    initialValue: data ? data.detalleRecDer : [],
                    validationSchema: yup.array().min(0)/*.max(1)*/,
                    labelPopup: "paciente", labelPopupGenero: "o",//o a
                    totalShow: true, totalDataName: "", totalIsMoney: false,//nombre del dataname a sumar/contar(false para contar), si es o no de tipo moneda
                    customValidate: (values) => {//validador personalizado, opcional
                        if (values.edad < 1 && values.unidad_edad != 9) return "La edad solo puede ser 0 cuando la unidad de edad es 'ignorada'";
                        if (values.edad > 0 && values.unidad_edad == 9) return "La edad solo puede ser 0 cuando la unidad de edad es 'ignorada'";
                        switch (values.unidad_edad * 1) {
                            case 1: {
                                if (values.edad > 130)//años
                                    return "La edad expresada en años no puede ser mayor a 130."
                            }; break;
                            case 2: {
                                if (values.edad > 11)//meses
                                    return "La edad expresada en meses no puede ser mayor a 11. Considera expresar la edad en años."
                            }; break;
                            case 3: {
                                if (values.edad > 30)//dias
                                    return "La edad expresada en días no puede ser mayor a 30. Considera expresar la edad en meses."
                            }; break;
                            case 4: {
                                if (values.edad > 23)//horas
                                    return "La edad expresada en horas no puede ser mayor a 23. Considera expresar la edad en días."
                            }; break;
                            case 5: {
                                if (values.edad > 59)//minutos
                                    return "La edad expresada en minutos no puede ser mayor a 59. Considera expresar la edad en horas."
                            }; break;
                        }
                        return "";
                    },
                    listFields: [
                        {
                            dataName: "dia", label: "Día del mes", controlType: "textField",
                            validationSchema: yup.number().required().min(1).max(31),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "sexo", label: "Sexo", controlType: "select", items: Formatter.sexo,
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "unidad_edad", label: "Unidad edad", controlType: "select", items: Formatter.unidad_edad,
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "edad", label: "Edad", controlType: "textField",
                            validationSchema: yup.number().required().min(0).max(130),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "es_derivado", label: "Tipo", controlType: "select", items: Formatter.es_derivado,
                            validationSchema: yup.string().required(),
                            visibleType: 1,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "id_establecimiento", label: "Establecimiento a/desde", controlType: "autocomplete", items: establecimientos,
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "diagnostico", label: "Diagnóstico", controlType: "textField",
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "motivo", label: "Motivo de la der/rec", controlType: "textField",
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                    ],
                    //customIcon: <icon />,
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
            <Layout nombrePagina={data ? "Modificación de Act. de P. Recibidos y Derivados" : "Nuevo Informe de P. Recibidos y Derivados"}>
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
                                submitButtonText={data ? "Guardar modificaciones" : "Guardar Informe"}
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