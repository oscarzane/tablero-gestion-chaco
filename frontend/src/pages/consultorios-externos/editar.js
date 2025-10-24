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
    { text: "Servicio", orientation: "horizontal" },
    { text: "Dias", orientation: "vertical" },
    { text: "Horas", orientation: "vertical" },
    { text: "Consul.", orientation: "vertical" },
    { text: "Embara.", orientation: "vertical" },
];
export const calculateDataControlTotales = (p_formValues, p_unidades_operativas) => {
    var t_return = [];
    var t_horasFinal = 0, t_diasFinal = 0, t_consulFinal = 0, t_embFinal = 0;
    var t_horasRow = 0, t_diasRow = 0, t_consulRow = 0, t_embRow = 0;
    var t_id = 0;

    p_unidades_operativas.forEach(unidad => {
        t_id = unidad.id_uo_por_establecimiento;
        t_horasRow = parseInt(p_formValues[t_id + "_horas"]);
        t_diasRow = parseInt(p_formValues[t_id + "_dias"]);
        t_consulRow = parseInt(p_formValues[t_id + "_men1m"]) + parseInt(p_formValues[t_id + "_men1f"]) + parseInt(p_formValues[t_id + "_1m"])
            + parseInt(p_formValues[t_id + "_1f"]) + parseInt(p_formValues[t_id + "_2a5m"]) + parseInt(p_formValues[t_id + "_2a5f"])
            + parseInt(p_formValues[t_id + "_6a9m"]) + parseInt(p_formValues[t_id + "_6a9f"]) + parseInt(p_formValues[t_id + "_10a14m"])
            + parseInt(p_formValues[t_id + "_10a14f"]) + parseInt(p_formValues[t_id + "_15a19m"]) + parseInt(p_formValues[t_id + "_15a19f"])
            + parseInt(p_formValues[t_id + "_20a49m"]) + parseInt(p_formValues[t_id + "_20a49f"]) + parseInt(p_formValues[t_id + "_50m"])
            + parseInt(p_formValues[t_id + "_50f"]);
        t_embRow = parseInt(p_formValues[t_id + "_ce_1t"]) + parseInt(p_formValues[t_id + "_ce_2t"])
            + parseInt(p_formValues[t_id + "_ce_3t"]) + parseInt(p_formValues[t_id + "_ce_ulterior"]);

        t_return.push({
            id: t_id,
            title: unidad.servicio_nombre + (unidad.subunidad_nombre === "" ? "" : ", Sub. " + unidad.subunidad_nombre) + " (" + unidad.sector_nombre + ")",
            data: [
                { id: t_id + "dias", data: t_diasRow },
                { id: t_id + "horas", data: t_horasRow },
                { id: t_id + "consul", data: t_consulRow },
                { id: t_id + "emb", data: t_embRow }
            ]
        });

        t_diasFinal += t_diasRow;
        t_horasFinal += t_horasRow;
        t_consulFinal += t_consulRow;
        t_embFinal += t_embRow;
    });
    t_return.push({
        id: "-1",
        title: "TOTALES",
        data: [
            { id: "-1dias", data: t_diasFinal },
            { id: "-1horas", data: t_horasFinal },
            { id: "-1consul", data: t_consulFinal },
            { id: "-1emb", data: t_embFinal }
        ]
    });

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
    const [unidadesEstablecimiento, setUnidadesEstablecimiento] = useState([]);

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

        const response = await postFiles(data ? "consultorio-externo/editar.php" : "consultorio-externo/nuevo.php", {
            id_usuario: usuario.id_usuario,
            id_consultorio_externo: data ? data.id_consultorio_externo : false,
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

        const response = await postFiles("consultorio-externo/inconsistencias.php", {
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
        setDataControlTotalesModal(calculateDataControlTotales(values, data ? data.detalle : unidadesEstablecimiento));
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

    const readUnidadesEstablecimiento = useCallback(async () => {
        setUnidadesEstablecimiento([]);

        const response = await postData("establecimiento/leer-id.php", {
            id_usuario: usuario.id_usuario,
            id_establecimiento: usuario.id_establecimiento,
        });

        if (response.error === "") {
            setUnidadesEstablecimiento(response.data.uo_por_establecimiento_con);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario, usuario.id_establecimiento]);

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
        else {
            alertModal.showModal(
                "Servicios asignados",
                "De necesitar agregar o quitar servicios a los aquí listados (ej, pediatría, ginecología, etc.) por favor solicitar por mail oficial a msp.estadsanitaria@chaco.gob.ar",
            );
        }
    }, [globalsContext.idEdit, usuario.id_usuario]);

    useEffect(() => {
        const loadDefaultValues = async () => {
            loadingModal.setOpen(true);

            await loadData();
            await readEstablecimientos();
            await readUnidadesEstablecimiento();

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
        ...(() => {
            const t_unidades = [];
            const t_lista = data ? data.detalle : unidadesEstablecimiento; console.log(t_lista);
            t_lista.forEach(listitem => {
                t_unidades.push({
                    name: listitem.nombre_str,
                    fields: [
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_dias", label: "Días de atención", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_dias"] : '',
                            validationSchema: yup.number().min(0).required(),
                            autoFocus: true,
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_horas", label: "Horas de atención", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_horas"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_men1m", label: "Menor de 1 año - M", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_men1m"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_men1f", label: "Menor de 1 año - F", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_men1f"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_1m", label: "1 año - M", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_1m"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_1f", label: "1 año - F", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_1f"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_2a5m", label: "2 a 5 años - M", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_2a5m"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_2a5f", label: "2 a 5 años - F", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_2a5f"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_6a9m", label: "6 a 9 años - M", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_6a9m"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_6a9f", label: "6 a 9 años - F", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_6a9f"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_10a14m", label: "10 a 14 años - M", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_10a14m"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_10a14f", label: "10 a 14 años - F", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_10a14f"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_15a19m", label: "15 a 19 años - M", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_15a19m"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_15a19f", label: "15 a 19 años - F", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_15a19f"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_20a49m", label: "20 a 49 años - M", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_20a49m"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_20a49f", label: "20 a 49 años - F", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_20a49f"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_50m", label: "50 años y más - M", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_50m"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_50f", label: "50 años y más - F", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_50f"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_ce_1t", label: "Cont. Emb. 1° Trim.", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_ce_1t"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_ce_2t", label: "Cont. Emb. 2° Trim.", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_ce_2t"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_ce_3t", label: "Cont. Emb. 3° Trim.", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_ce_3t"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                        {
                            dataName: listitem.id_uo_por_establecimiento + "_ce_ulterior", label: "Cont. Emb. 1° Ulterior", controlType: "textField",
                            initialValue: data ? listitem[listitem.id_uo_por_establecimiento + "_ce_ulterior"] : '',
                            validationSchema: yup.number().min(0).required(),
                        },
                    ],
                });
            });
            return t_unidades;
        })(),
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
    ], [data, usuario.id_establecimiento, establecimientos, unidadesEstablecimiento]);

    return (
        <Fragment>
            <Layout nombrePagina={data ? "Corrección de Consultorio Externo" : "Nuevo Informe de Consultorio Externo"}>
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
                            {data ? data.detalle.map((det) => (
                                det.detInconsistencias != "" ?
                                    <div className={classes.textWithIcon} key={det.detInconsistencias.id}>
                                        <WarningRoundedIcon color="warning" className={classes.icon} />
                                        <h3>
                                            {det.detInconsistencias.title}: {det.detInconsistencias.detInconsistencias.map((inconDet) => (" " + inconDet + " "))}
                                        </h3>
                                    </div>
                                    : ""
                            )
                            ) : ""}

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