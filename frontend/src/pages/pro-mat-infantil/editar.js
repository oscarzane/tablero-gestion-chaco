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
    { text: "Total", orientation: "vertical" },
    { text: "Baja Talla", orientation: "vertical" },
];
export const calculateDataControlTotales = (p_formValues) => {
    var t_return = [
        {
            id: 0,
            title: "Niños menores de 1 año Bajo Control",
            data: [
                {
                    id: "0totalPeso",
                    data: parseInt(p_formValues["men1Peso1"]) + parseInt(p_formValues["men1Peso2"]) + parseInt(p_formValues["men1Peso3"])
                        + parseInt(p_formValues["men1Peso4"]) + parseInt(p_formValues["men1Peso5"]) + parseInt(p_formValues["men1Peso6"])
                },
                {
                    id: "0totalTalla",
                    data: parseInt(p_formValues["men1Talla1"])
                },
            ]
        },
        {
            id: 1,
            title: "Niños de 1 año Bajo Control",
            data: [
                {
                    id: "1totalPeso",
                    data: parseInt(p_formValues["de1Peso1"]) + parseInt(p_formValues["de1Peso2"]) + parseInt(p_formValues["de1Peso3"])
                        + parseInt(p_formValues["de1Peso4"]) + parseInt(p_formValues["de1Peso5"]) + parseInt(p_formValues["de1Peso6"])
                },
                {
                    id: "1totalTalla",
                    data: parseInt(p_formValues["de1Talla1"])
                },
            ]
        },
        {
            id: 2,
            title: "Niños de 2 a 5 año Bajo Control",
            data: [
                {
                    id: "2totalPeso",
                    data: parseInt(p_formValues["de2a5Peso1"]) + parseInt(p_formValues["de2a5Peso2"]) + parseInt(p_formValues["de2a5Peso3"])
                        + parseInt(p_formValues["de2a5Peso4"]) + parseInt(p_formValues["de2a5Peso5"]) + parseInt(p_formValues["de2a5Peso6"])
                },
                {
                    id: "2totalTalla",
                    data: parseInt(p_formValues["de2a5Talla1"])
                },
            ]
        },
        {
            id: 3,
            title: "Embarazadas Bajo Control",
            data: [
                {
                    id: "3totalPeso",
                    data: parseInt(p_formValues["embPeso1"]) + parseInt(p_formValues["embPeso2"]) + parseInt(p_formValues["embPeso3"]) + parseInt(p_formValues["embPeso4"])
                },
                {
                    id: "3totalTalla",
                    data: "-"
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

        const response = await postFiles(data ? "pro-mat-infantil/editar.php" : "pro-mat-infantil/nuevo.php", {
            id_usuario: usuario.id_usuario,
            id_pro_mat_infantil: data ? data.id_pro_mat_infantil : false,
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

        const response = await postFiles("pro-mat-infantil/inconsistencias.php", {
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

            const response = await postData("pro-mat-infantil/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_pro_mat_infantil: globalsContext.idEdit,
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
            name: "Niños menores de 1 año Bajo Control",
            entryType: "table",
            fields: [
                {
                    dataName: "men1Peso1", label: "Eutróficos", controlType: "textField",
                    initialValue: data ? data.men1Peso1 : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "men1Peso2", label: "Riesgo de Bajo Peso (RBP)", controlType: "textField",
                    initialValue: data ? data.men1Peso2 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "men1Peso3", label: "Bajo Peso (BP)", controlType: "textField",
                    initialValue: data ? data.men1Peso3 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "men1Peso4", label: "Bajo Peso Severo (BPS)", controlType: "textField",
                    initialValue: data ? data.men1Peso4 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "men1Peso5", label: "Sobrepeso (SP)", controlType: "textField",
                    initialValue: data ? data.men1Peso5 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "men1Peso6", label: "Obeso (O)", controlType: "textField",
                    initialValue: data ? data.men1Peso6 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "men1Talla1", label: "Baja Talla (BT)", controlType: "textField",
                    initialValue: data ? data.men1Talla1 : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Niños de 1 año Bajo Control",
            fields: [
                {
                    dataName: "de1Peso1", label: "Eutróficos", controlType: "textField",
                    initialValue: data ? data.de1Peso1 : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "de1Peso2", label: "Riesgo de Bajo Peso (RBP)", controlType: "textField",
                    initialValue: data ? data.de1Peso2 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "de1Peso3", label: "Bajo Peso (BP)", controlType: "textField",
                    initialValue: data ? data.de1Peso3 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "de1Peso4", label: "Bajo Peso Severo (BPS)", controlType: "textField",
                    initialValue: data ? data.de1Peso4 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "de1Peso5", label: "Sobrepeso (SP)", controlType: "textField",
                    initialValue: data ? data.de1Peso5 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "de1Peso6", label: "Obeso (O)", controlType: "textField",
                    initialValue: data ? data.de1Peso6 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "de1Talla1", label: "Baja Talla (BT)", controlType: "textField",
                    initialValue: data ? data.de1Talla1 : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Niños de 2 a 5 años Bajo Control",
            fields: [
                {
                    dataName: "de2a5Peso1", label: "Eutróficos", controlType: "textField",
                    initialValue: data ? data.de2a5Peso1 : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "de2a5Peso2", label: "Riesgo de Bajo Peso (RBP)", controlType: "textField",
                    initialValue: data ? data.de2a5Peso2 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "de2a5Peso3", label: "Bajo Peso (BP)", controlType: "textField",
                    initialValue: data ? data.de2a5Peso3 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "de2a5Peso4", label: "Bajo Peso Severo (BPS)", controlType: "textField",
                    initialValue: data ? data.de2a5Peso4 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "de2a5Peso5", label: "Sobrepeso (SP)", controlType: "textField",
                    initialValue: data ? data.de2a5Peso5 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "de2a5Peso6", label: "Obeso (O)", controlType: "textField",
                    initialValue: data ? data.de2a5Peso6 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "de2a5Talla1", label: "Baja Talla (BT)", controlType: "textField",
                    initialValue: data ? data.de2a5Talla1 : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Embarazadas Bajo Control",
            fields: [
                {
                    dataName: "embPeso1", label: "Normal", controlType: "textField",
                    initialValue: data ? data.embPeso1 : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "embPeso2", label: "Bajo Peso (BP)", controlType: "textField",
                    initialValue: data ? data.embPeso2 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "embPeso3", label: "Sobrepeso (SP)", controlType: "textField",
                    initialValue: data ? data.embPeso3 : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "embPeso4", label: "Obeso (O)", controlType: "textField",
                    initialValue: data ? data.embPeso4 : '',
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
            <Layout nombrePagina={data ? "Corrección de P. Mat. Infantil" : "Nuevo Informe de P. Mat. Infantil"}>
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