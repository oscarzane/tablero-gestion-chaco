import React, { useContext, useState, useEffect, Fragment, useCallback, useMemo } from 'react';
import Layout from '../../components/layout/main';
import { makeStyles } from 'tss-react/mui';
import { Button, Fade, Grid, Paper } from '@mui/material';
import * as yup from 'yup';
import { postData, postFiles } from '../../services/ajax';
import { AuthContext } from '../../context/auth';
import { LoadingModalContext } from '../../components/modal/loading';
import { AlertModalContext } from '../../components/modal/alert';
import { setYupLocaleES } from '../../const/yup';
import { useNavigate } from 'react-router-dom';
import { Formatter } from '../../const/formatter';
import { CustomForm, fieldSize } from '../../components/formSections';
import { GlobalsContext } from '../../context/globals';
import { useSnackbar } from 'notistack';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { InconsistenciasModal } from '../../components/modal/inconsistencias';
import VerLogDialog from '../../components/modal/log/verLog';

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
        color: theme.palette.warning.main,
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

    const [unidades_operativas, setUnidadesOperativas] = useState([]);
    const [paises, setPaises] = useState([]);

    const globalsContext = useContext(GlobalsContext);
    const [data, setData] = useState(false);
    const [formValues, setFormValues] = useState(false);

    //Modals
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const [openInconsistenciasModal, setOpenInconsistenciasModal] = useState(false);
    const [dataInconsistenciasModal, setDataInconsistenciasModal] = useState([]);

    const [referenciaVerLogModal, setReferenciaVerLogModal] = useState(null);
    const [idReferenciaVerLogModal, setIdReferenciaVerLogModal] = useState(null);


    const onSubmitFinal = async (values) => {
        loadingModal.setOpen(true);
        const response = await postData("hospitalizacion/revisarCodificacion.php", {
            id_usuario: usuario.id_usuario,
            id_hospitalizacion: globalsContext.idEdit,
            resultado_revision: values.resultado_revision,
            comentario: values.comentario,
            cant_reparos: data.cant_reparos
        });
        if (response.error === "") {
            alertModal.showModal(
                "Informe supervisado ok",
                "El informe ha sido supervisado con éxito. Puedes salir al menu principal o supervisar un nuevo informe:",
                onSupervisarCodPool, "Supervisar nuevo",
                onClose, "Salir");

            enqueueSnackbar('Informe supervisado ok', { variant: "success" });
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }

        loadingModal.setOpen(false);
    }

    const onSubmit = async (values, { resetForm }) => {
        if (values.resultado_revision * 1 !== 1 && values.comentario === "")//si no es aprobada, el comentario es obligatorio
            enqueueSnackbar("Debes ingresar el comentario con el detalle del rechazo/corrección.", { variant: "error" });
        else {
            setFormValues(values);
            onSubmitFinal(values);
        }
    }

    const onClose = useCallback(async () => {
        navigate(-1);
    }, [navigate]);
    const onCancel = () => {
        alertModal.showModal(
            "Cancelar",
            "Se perderán todos los cambios. ¿Deseas continuar?",
            function () {
                onClose();
            });
    }

    //pide una nueva planilla a supervisar codificacion desde la pool de pendientes
    const onSupervisarCodPool = useCallback(async () => {
        loadingModal.setOpen(true);

        const response = await postData("hospitalizacion/iniciar-codificacionSupervision.php", {
            id_usuario: usuario.id_usuario,
            id_hospitalizacion: globalsContext.idEdit,
        });

        if (response.error === "") {
            //si tengo una id, la codifico
            if (response.data.id_hospitalizacion) {//se asigno una hospitalizacion
                globalsContext.setIdEdit(response.data.id_hospitalizacion);
            }
            else {//no hay id
                //todo pool, debe mostrar la lista de hospi propias y un boton para pedir otra nueva
                alertModal.showModal(
                    "Sin Hospitalizaciones",
                    "No quedan hospitalizaciones codificadas pendientes de supervisar. Hay " + response.data.hospitalizaciones.length + " ya asignadas a supervisores de codificación.");
                globalsContext.setIdEdit(false);
                onClose();
            }
        }
        else
            enqueueSnackbar(response.error, { variant: "error" });

        loadingModal.setOpen(false);
    }, [usuario.id_usuario, globalsContext.idEdit]);

    const readPaises = useCallback(async () => {
        setPaises([]);

        const response = await postData("geo/leerSimple.php", {
            id_usuario: usuario.id_usuario,
            separar_departamentos: false,
        });

        if (response.error === "") {
            setPaises(response.data);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

    const readUnidadesOperativas = useCallback(async (t_data) => {
        setUnidadesOperativas([]);

        const response = await postData("establecimiento/leer-id.php", {
            id_usuario: usuario.id_usuario,
            id_establecimiento: t_data ? t_data.id_establecimiento : usuario.id_establecimiento,
        });

        if (response.error === "") {
            setUnidadesOperativas(response.data.uo_por_establecimiento_hos);
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

            const response = await postData("hospitalizacion/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_hospitalizacion: globalsContext.idEdit,
            });

            if (response.error === "") {
                setData(response.data);
                return response.data;
            }
            else {
                enqueueSnackbar(response.error, { variant: "error" });
            }

            loadingModal.setOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalsContext.idEdit, usuario.id_usuario]);

    useEffect(() => {
        const loadDefaultValues = async () => {
            loadingModal.setOpen(true);

            await readPaises();

            var t_data = await loadData();
            await readUnidadesOperativas(t_data);
            document.getElementById('mainContainer').scrollTo({ top: 0, behavior: 'smooth' });

            if (t_data.observaciones !== "")
                verHistorial();

            loadingModal.setOpen(false);
        }

        loadDefaultValues();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalsContext.idEdit]);

    const formSections = useMemo(() => [
        {
            name: "Establecimiento y número",
            fields: [
                {
                    dataName: "establecimiento_str", label: "Establecimiento", controlType: "textField",
                    initialValue: data ? data.establecimiento_str : '',
                    validationSchema: yup.string(),
                    disabled: true,
                },
                {
                    dataName: "num_informe", label: "N° Informe", controlType: "textField",
                    initialValue: data && data.num_informe ? data.num_informe : '',
                    validationSchema: yup.number().positive(),
                    disabled: true,
                },
                {
                    dataName: "num_histo_clinica", label: "N° Historia Clínica", controlType: "textField",
                    initialValue: data && data.num_histo_clinica ? data.num_histo_clinica : '',
                    validationSchema: yup.number().min(0),
                    disabled: true,
                },
                {
                    dataName: "observaciones", label: "Observaciones", controlType: "textField",
                    initialValue: data ? data.observaciones : '',
                    validationSchema: yup.string().max(5000),
                    disabled: true,
                    size: fieldSize.xxxl,
                },
            ],
        },
        {
            name: "Paciente - Datos Personales",
            fields: [
                {
                    dataName: "edad", label: "Edad al ingreso", controlType: "textField",
                    initialValue: data ? data.edad : null,
                    validationSchema: yup.number().min(0).max(130).nullable(),
                    disabled: true,
                },
                {
                    dataName: "unidad_edad", label: "Unidad edad al ingreso", controlType: "autocomplete", items: Formatter.unidad_edad,
                    initialValue: data ? data.unidad_edad : null,
                    validationSchema: yup.string().nullable(),
                    disabled: true,
                },
                {
                    dataName: "sexo", label: "Sexo", controlType: "autocomplete", items: Formatter.sexo,
                    initialValue: data ? data.sexo : null,
                    validationSchema: yup.string().required(),
                    disabled: true,
                },
                {
                    dataName: "f_nacimiento", label: "F. Nacimiento", controlType: "datePicker",
                    initialValue: data ? (data.f_nacimiento_iso ? new Date(data.f_nacimiento_iso) : null) : null,
                    validationSchema: yup.date().nullable().min(new Date(1900, 0, 1)),
                    disabled: true,
                },
                {
                    dataName: "dni", label: "N° Documento", controlType: "textField",
                    initialValue: data ? data.dni : null,
                    validationSchema: yup.number().min(0).nullable(),
                    disabled: true,
                },
                {
                    dataName: "id_geo_pais", label: "Pais residencia", controlType: "autocomplete", items: paises,
                    initialValue: data ? data.id_geo_pais : null,
                    validationSchema: yup.string().nullable(),
                    disabled: true,
                    child: {
                        dataName: "id_geo_provincia", label: "Provincia residencia", controlType: "autocomplete",
                        initialValue: data ? data.id_geo_provincia : null,
                        validationSchema: yup.string().nullable(),
                        disabled: true,
                        child: {
                            dataName: "id_geo_localidad", label: "Localidad residencia", controlType: "autocomplete",
                            initialValue: data ? data.id_geo_localidad : null,
                            validationSchema: yup.string().nullable(),
                            disabled: true,
                        },
                    },
                },
            ],
        },
        {
            name: "Estada",
            fields: [
                {
                    dataName: "dias_estada", label: "Total días de estada", controlType: "textField",
                    initialValue: data ? data.dias_estada : "",
                    validationSchema: yup.number().required().min(1),
                    disabled: true,
                },
                {
                    dataName: "tipo_egreso", label: "Tipo de egreso", controlType: "autocomplete", items: Formatter.tipo_egreso,
                    initialValue: data ? data.tipo_egreso : null,
                    validationSchema: yup.string().required(),
                    disabled: true,
                },
                {
                    dataName: "f_egreso", label: "F. Egreso", controlType: "datePicker",
                    initialValue: data ? (data.f_egreso_iso ? new Date(data.f_egreso_iso) : null) : null,
                    validationSchema: yup.date().required().min(new Date(2020, 0, 1)).max(new Date()),
                    disabled: true,
                },
                {
                    dataName: "id_uo_por_establecimiento_ingreso", label: "Unidad de Ingreso", controlType: "autocomplete", items: unidades_operativas,
                    initialValue: data ? data.id_uo_por_establecimiento_ingreso : null,
                    validationSchema: yup.string().required(),
                    size: fieldSize.xl,
                    disabled: true,
                },
                {
                    dataName: "id_uo_por_establecimiento_egreso", label: "Unidad de Egreso", controlType: "autocomplete", items: unidades_operativas,
                    initialValue: data ? data.id_uo_por_establecimiento_egreso : null,
                    validationSchema: yup.string().required(),
                    size: fieldSize.xl,
                    disabled: true,
                },
            ],
        },
        {
            name: "Diagnósticos al egreso",
            fields: [
                {
                    dataName: "diagnostico_principal", label: "Diagnóstico principal", controlType: "textField",
                    initialValue: data ? data.diagnostico_principal : "",
                    validationSchema: yup.string().max(500).required(),
                    size: fieldSize.xxl,
                    disabled: true,
                },
                {
                    dataName: "otros_diagnosticos", label: "Otros diagnósticos", controlType: "textField",
                    initialValue: data ? data.otros_diagnosticos : "",
                    validationSchema: yup.string().max(1000),
                    size: fieldSize.xxl,
                    disabled: true,
                },
                {
                    dataName: "detalleDiagnosticos", label: "Códigos de Diagnósticos", controlType: "detalleList",
                    initialValue: data ? data.detalleDiagnosticos : [],
                    validationSchema: yup.array().min(1),
                    labelPopup: "diagnóstico", labelPopupGenero: "o",//o a
                    totalShow: true, totalDataName: "", totalIsMoney: false,//nombre del dataname a sumar/contar(false para contar), si es o no de tipo moneda
                    sortable: true,
                    disabled: true,
                    customValidate: (values) => {//validador personalizado, opcional
                        return "";
                    },
                    listFields: [
                        {
                            dataName: "id_codigo_diagnostico", label: "Código de diagnóstico (para buscar minimo 3 caracteres)", controlType: "autocompleteAsync", items: [],
                            //initialValue: [],
                            postName: "codigo-diagnostico/leerSimple.php",
                            postVars: {
                                id_usuario: usuario.id_usuario,
                                rubro: 1,//1 diagnostico, 2 casusa externa, 3 proc quirurjico
                            },
                            validationSchema: yup.object().required(),
                            visibleType: 1,//1 primary, 2 secondary, 3 photo, 0 none
                            size: fieldSize.xxxl,
                            autoFocus: false,
                            minSearchLength: 3,//minima longitud antes de buscar
                        },
                    ],
                    customSubtitle: (data, row) => {
                        if (data.indexOf(row) == 0) return "Diagnóstico principal";
                        return "Diagnóstico secundario";
                    },
                    //customIcon: <icon />,
                },
            ],
        },
        {
            name: "Procedimientos quirúrgicos y obstétricos",
            fields: [
                {
                    dataName: "procedimientos", label: "Procedimientos", controlType: "textField",
                    initialValue: data ? data.procedimientos : "",
                    validationSchema: yup.string().max(500),
                    size: fieldSize.xxxl,
                    disabled: true,
                },
                {
                    dataName: "detalleProcedimientos", label: "Códigos de Procedimientos", controlType: "detalleList",
                    initialValue: data ? data.detalleProcedimientos : [],
                    validationSchema: yup.array(),
                    labelPopup: "procedimiento", labelPopupGenero: "o",//o a
                    totalShow: true, totalDataName: "", totalIsMoney: false,//nombre del dataname a sumar/contar(false para contar), si es o no de tipo moneda
                    sortable: true,
                    disabled: true,
                    customValidate: (values) => {//validador personalizado, opcional
                        return "";
                    },
                    listFields: [
                        {
                            dataName: "id_codigo_procedimiento", label: "Código de procedimiento (para buscar minimo 3 caracteres)", controlType: "autocompleteAsync", items: [],
                            postName: "codigo-diagnostico/leerSimple.php",
                            postVars: {
                                id_usuario: usuario.id_usuario,
                                rubro: 3,//1 diagnostico, 2 casusa externa, 3 proc quirurjico
                            },
                            validationSchema: yup.object().required(),
                            visibleType: 1,//1 primary, 2 secondary, 3 photo, 0 none
                            size: fieldSize.xxxl,
                            autoFocus: false,
                            minSearchLength: 3,//minima longitud antes de buscar
                        },
                    ],
                    customSubtitle: (data, row) => {
                        //if (data.indexOf(row) == 0) return "Diagnóstico principal";
                        return "Procedimiento " + (data.indexOf(row) + 1);
                    },
                    //customIcon: <icon />,
                },
            ],
        },
        {
            name: "Otras circunstancias que prolongan la internación",
            fields: [
                {
                    dataName: "otras_circun", label: "Motivo de la estadía prolongada", controlType: "textField",
                    initialValue: data && data.otras_circun ? data.otras_circun : null,
                    validationSchema: yup.string().max(500).nullable(),
                    size: fieldSize.xxl,
                    disabled: true,
                },
                {
                    dataName: "dias_otras_circun", label: "Días de estada adicionales", controlType: "textField",
                    initialValue: data ? data.dias_otras_circun : null,
                    validationSchema: yup.number().min(1).nullable(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Causa externa de traumatismo, envenenamiento y otros efectos adversos",
            fields: [
                {
                    dataName: "externa_prod_por", label: "Producido por", controlType: "autocomplete", items: Formatter.causa_externa_producido,
                    initialValue: data ? data.externa_prod_por : null,
                    validationSchema: yup.string().nullable(),
                    disabled: true,
                },
                {
                    dataName: "externa_lugar", label: "Lugar donde ocurrió", controlType: "autocomplete", items: Formatter.causa_externa_lugar,
                    initialValue: data ? data.externa_lugar : null,
                    validationSchema: yup.string().nullable(),
                    disabled: true,
                },
                {
                    dataName: "externa_como", label: "Cómo se produjo (descripción detallada)", controlType: "textField",
                    initialValue: data ? data.externa_como : null,
                    validationSchema: yup.string().max(500).nullable(),
                    disabled: true,
                },
                {
                    dataName: "externa_cod", label: "Código de causa externa (para buscar minimo 3 caracteres)", controlType: "autocompleteAsync", items: [],
                    postName: "codigo-diagnostico/leerSimple.php",
                    initialValue: data ? data.externa_cod : null,
                    postVars: {
                        id_usuario: usuario.id_usuario,
                        rubro: 2,//1 diagnostico, 2 casusa externa, 3 proc quirurjico
                    },
                    validationSchema: yup.object(),
                    visibleType: 1,//1 primary, 2 secondary, 3 photo, 0 none
                    size: fieldSize.xxxl,
                    autoFocus: false,
                    minSearchLength: 3,//minima longitud antes de buscar
                    disabled: true,
                },
            ],
        },
        {
            name: "Datos del evento obstétrico",
            fields: [
                {
                    dataName: "emb_f_term", label: "F. terminación embarazo", controlType: "datePicker",
                    initialValue: data ? (data.emb_f_term_iso ? new Date(data.emb_f_term_iso) : null) : null,
                    validationSchema: yup.date().min(new Date(2020, 0, 1)).max(new Date()).nullable(),
                    disabled: true,
                },
                {
                    dataName: "emb_edad", label: "Semanas de gestación", controlType: "textField",
                    initialValue: data ? data.emb_edad : null,
                    validationSchema: yup.number().min(0).max(50).integer().nullable(),
                    disabled: true,
                },
                {
                    dataName: "emb_paridad", label: "Total Nac. anteriores", controlType: "textField",
                    initialValue: data ? data.emb_paridad : null,
                    validationSchema: yup.number().min(0).max(43).integer().nullable(),
                    disabled: true,
                },
                {
                    dataName: "emb_cant", label: "Cantidad de productos del parto", controlType: "textField",
                    initialValue: data ? data.emb_cant : null,
                    validationSchema: yup.number().min(0).max(15).integer().nullable(),
                    disabled: true,
                },
                {
                    dataName: "detalleProdGesta", label: "Productos de la gestación", controlType: "detalleList",
                    initialValue: data ? data.detalleProdGesta : [],
                    validationSchema: yup.array()/*.max(1)*/,
                    labelPopup: "nacido vivo/muerto", labelPopupGenero: "o",//o a
                    totalShow: true, totalDataName: "", totalIsMoney: false,//nombre del dataname a sumar/contar(false para contar), si es o no de tipo moneda
                    disabled: true,
                    customValidate: (values) => {//validador personalizado, opcional
                        return "";
                    },
                    listFields: [
                        {
                            dataName: "peso", label: "Peso en gramos", controlType: "textField",
                            validationSchema: yup.number().integer().min(0).max(8000).required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                            disabled: true,
                        },
                        {
                            dataName: "condicion", label: "Condición al nacer", controlType: "autocomplete", items: Formatter.prod_gesta_condicion,
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                            disabled: true,
                        },
                        {
                            dataName: "terminacion", label: "Terminación", controlType: "autocomplete", items: Formatter.prod_gesta_terminacion,
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                            disabled: true,
                        },
                        {
                            dataName: "sexo", label: "Sexo", controlType: "autocomplete", items: Formatter.sexo,
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                            disabled: true,
                        },
                    ],
                    //customIcon: <icon />,
                },
            ],
        },
        {
            name: "Resultado de la revisión",
            fields: [
                {
                    dataName: "resultado_revision", label: "Resultado", controlType: "select", items: Formatter.resultados_revision_codificacion,
                    initialValue: '',
                    validationSchema: yup.string().required(),
                },
                {
                    dataName: "comentario", label: "Comentario", controlType: "textField",
                    initialValue: '',
                    validationSchema: yup.string().max(5000),
                    size: fieldSize.xxxl,
                },
            ],
        },
    ], [data, unidades_operativas]);

    const verHistorial = () => {
        setIdReferenciaVerLogModal(globalsContext.idEdit);
        setReferenciaVerLogModal(Formatter.log_referencia.HOSPITALIZACION.id);
    };

    const guardarParaDespues = () => {
        alertModal.showModal("Saltear informe",
            "El informe será salteado para ser supervisado más adelante y se te asignará uno nuevo. ¿Deseas continuar?",
            () => {
                onSupervisarCodPool();
            },
            "Guardar");
    };

    return (
        <Fragment>
            <Layout nombrePagina={"Aprobar / Rechazar Hospitalización"}>
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                    <Button variant="contained" color="secondary" fullWidth onClick={verHistorial} >
                        {"Ver historial"}
                    </Button>
                </Grid>

                <Fade in={true} timeout={900}>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            {data.cant_reparos > 0 ?
                                <div className={classes.textWithIcon}>
                                    <WarningRoundedIcon color="warning" className={classes.icon} />
                                    <h3>Esta planilla ha tenido solicitudes de reparo.</h3>
                                </div>
                                : ""}

                            <CustomForm
                                formSections={formSections}
                                onSubmit={onSubmit}
                                onCancel={onCancel}
                                submitButtonText={"Completar Revisión"}
                                cancelButtonText="Cancelar"
                                stepperType={""}
                                isModal={false}
                            />
                        </Paper>
                    </Grid>
                </Fade>

                <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                    <Button variant="contained" color="warning" fullWidth onClick={guardarParaDespues} >
                        {"Guardar para después"}
                    </Button>
                </Grid>
            </Layout>

            <InconsistenciasModal
                open={openInconsistenciasModal}
                setOpen={setOpenInconsistenciasModal}
                data={dataInconsistenciasModal}
                action={onSubmitFinal}
            />

            <VerLogDialog
                referencia={referenciaVerLogModal}
                setReferencia={setReferenciaVerLogModal}
                id_referencia={idReferenciaVerLogModal}
                id_usuario={usuario.id_usuario}
            />

        </Fragment>
    );
}

export default Page;