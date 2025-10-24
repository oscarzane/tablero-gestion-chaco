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

    const [establecimientos, setEstablecimientos] = useState([]);
    const [paises, setPaises] = useState([]);
    const [unidades_operativas, setUnidadesOperativas] = useState([]);

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

    const [openInconsistenciasModal, setOpenInconsistenciasModal] = useState(false);
    const [dataInconsistenciasModal, setDataInconsistenciasModal] = useState([]);

    const [referenciaVerLogModal, setReferenciaVerLogModal] = useState(null);
    const [idReferenciaVerLogModal, setIdReferenciaVerLogModal] = useState(null);


    const onSubmitFinal = async (values) => {
        loadingModal.setOpen(true);

        const response = await postFiles("hospitalizacion/revisar.php", {
            id_usuario: usuario.id_usuario,
            id_hospitalizacion: data.id_hospitalizacion,
            ...values
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

    const onSubmitControlTotalesModal = async (values) => {
        const zeroPad = (num, places) => String(num).padStart(places, '0');//agrega ceros al numero segun cantidad de places totales
        var t_values = { ...values };

        t_values.f_nacimiento = values.f_nacimiento == null ? null :
            values.f_nacimiento.$y ? values.f_nacimiento.$y + "-" + zeroPad(values.f_nacimiento.$M + 1, 2) + "-" + zeroPad(values.f_nacimiento.$D, 2) :
                values.f_nacimiento.getFullYear() + "-" + zeroPad(values.f_nacimiento.getMonth() + 1, 2) + "-" + zeroPad(values.f_nacimiento.getDay(), 2);

        t_values.f_ingreso = values.f_ingreso == null ? null :
            values.f_ingreso.$y ? values.f_ingreso.$y + "-" + zeroPad(values.f_ingreso.$M + 1, 2) + "-" + zeroPad(values.f_ingreso.$D, 2) :
                values.f_ingreso.getFullYear() + "-" + zeroPad(values.f_ingreso.getMonth() + 1, 2) + "-" + zeroPad(values.f_ingreso.getDay(), 2);

        t_values.f_egreso = values.f_egreso == null ? null :
            values.f_egreso.$y ? values.f_egreso.$y + "-" + zeroPad(values.f_egreso.$M + 1, 2) + "-" + zeroPad(values.f_egreso.$D, 2) :
                values.f_egreso.getFullYear() + "-" + zeroPad(values.f_egreso.getMonth() + 1, 2) + "-" + zeroPad(values.f_egreso.getDay(), 2);

        t_values.emb_f_term = values.emb_f_term == null ? null :
            values.emb_f_term.$y ? values.emb_f_term.$y + "-" + zeroPad(values.emb_f_term.$M + 1, 2) + "-" + zeroPad(values.emb_f_term.$D, 2) :
                values.emb_f_term.getFullYear() + "-" + zeroPad(values.emb_f_term.getMonth() + 1, 2) + "-" + zeroPad(values.emb_f_term.getDay(), 2);

        if (values.resultado_revision * 1 == 1) {//si es aprobada, realizo comprobacion de inconsistencias
            loadingModal.setOpen(true);

            const response = await postFiles("hospitalizacion/inconsistencias.php", {
                id_usuario: usuario.id_usuario,
                ...t_values,
                detalleProdGesta: JSON.stringify(t_values.detalleProdGesta),
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
        else //si no es aprobada, omito comprobacion de inconsistencias
            onSubmitFinal(t_values);
    }

    const onSubmit = async (values, { resetForm }) => {
        if (values.resultado_revision * 1 !== 1 && values.comentario === "")//si no es aprobada, el comentario es obligatorio
            enqueueSnackbar("Debes ingresar el comentario con el detalle del rechazo/corrección.", { variant: "error" });
        else {
            setFormValues(values);
            //setDataControlTotalesModal(calculateDataControlTotales(values, data.detalle));
            //setOpenControlTotalesModal(true);
            onSubmitControlTotalesModal(values);
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

    const readEstablecimientos = useCallback(async () => {
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
    }, []);

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
            await readEstablecimientos();

            var t_data = await loadData();
            await readUnidadesOperativas(t_data);

            if(t_data.observaciones !== "")
                verHistorial();

            loadingModal.setOpen(false);
        }

        loadDefaultValues();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalsContext.idEdit]);

    const verHistorial = () => {
        setIdReferenciaVerLogModal(globalsContext.idEdit);
        setReferenciaVerLogModal(Formatter.log_referencia.HOSPITALIZACION.id);
    };

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
                    dataName: "dni", label: "N° Documento", controlType: "textField",
                    initialValue: data ? data.dni : null,
                    validationSchema: yup.number().min(0).nullable(),
                    disabled: true,
                },
                {
                    dataName: "f_nacimiento", label: "F. Nacimiento", controlType: "datePicker",
                    initialValue: data ? (data.f_nacimiento_iso ? new Date(data.f_nacimiento_iso) : null) : null,
                    validationSchema: yup.date().nullable().min(new Date(1900, 0, 1)),
                    disabled: true,
                },
                {
                    dataName: "unidad_edad", label: "Unidad edad al ingreso", controlType: "autocomplete", items: Formatter.unidad_edad,
                    initialValue: data ? data.unidad_edad : null,
                    validationSchema: yup.string().nullable(),
                    disabled: true,
                },
                {
                    dataName: "edad", label: "Edad al ingreso", controlType: "textField",
                    initialValue: data ? data.edad : null,
                    validationSchema: yup.number().min(0).max(130).nullable(),
                    disabled: true,
                },
                {
                    dataName: "dni_madre", label: "N° Doc. Madre (men 1 año)", controlType: "textField",
                    initialValue: data ? data.dni_madre : null,
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
                {
                    dataName: "sexo", label: "Sexo", controlType: "autocomplete", items: Formatter.sexo,
                    initialValue: data ? data.sexo : null,
                    validationSchema: yup.string().nullable(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Paciente - Datos Sociales",
            fields: [
                {
                    dataName: "asoc_a", label: "Cobertura médica", controlType: "autocomplete", items: Formatter.cobertura_medica,
                    initialValue: data ? data.asoc_a : null,
                    validationSchema: yup.string().nullable(),
                    disabled: true,
                },
                {
                    dataName: "niv_instruc", label: "Nivel de instrucción", controlType: "autocomplete", items: Formatter.nivel_instruccion,
                    initialValue: data ? data.niv_instruc : null,
                    validationSchema: yup.string().nullable(),
                    disabled: true,
                },
                {
                    dataName: "sit_laboral", label: "Situación laboral", controlType: "autocomplete", items: Formatter.situacion_laboral,
                    initialValue: data ? data.sit_laboral : null,
                    validationSchema: yup.string().nullable(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Estada",
            fields: [
                {
                    dataName: "f_ingreso", label: "F. Ingreso", controlType: "datePicker",
                    initialValue: data ? (data.f_ingreso_iso ? new Date(data.f_ingreso_iso) : null) : null,
                    validationSchema: yup.date().min(new Date(2020, 0, 1)),
                    disabled: true,
                },
                {
                    dataName: "id_uo_por_establecimiento_ingreso", label: "Unidad de Ingreso", controlType: "autocomplete", items: unidades_operativas,
                    initialValue: data ? data.id_uo_por_establecimiento_ingreso : null,
                    validationSchema: yup.string(),
                    size: fieldSize.xl,
                    disabled: true,
                },
                {
                    dataName: "f_egreso", label: "F. Egreso", controlType: "datePicker",
                    initialValue: data ? (data.f_egreso_iso ? new Date(data.f_egreso_iso) : null) : null,
                    validationSchema: yup.date().min(new Date(2020, 0, 1)).max(new Date()),
                    disabled: true,
                },
                {
                    dataName: "id_uo_por_establecimiento_egreso", label: "Unidad de Egreso", controlType: "autocomplete", items: unidades_operativas,
                    initialValue: data ? data.id_uo_por_establecimiento_egreso : null,
                    validationSchema: yup.string(),
                    size: fieldSize.xl,
                    disabled: true,
                },
                {
                    dataName: "dias_estada", label: "Total días de estada", controlType: "textField",
                    initialValue: data ? data.dias_estada : "",
                    validationSchema: yup.number().min(1),
                    disabled: true,
                },
                {
                    dataName: "tipo_egreso", label: "Tipo de egreso", controlType: "autocomplete", items: Formatter.tipo_egreso,
                    initialValue: data ? data.tipo_egreso : null,
                    validationSchema: yup.string(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Diagnósticos al egreso",
            description: `El Diagnóstico principal al egreso es la afección diagnosticada al final del proceso de atención de la salud como la
            causante primaria de la necesidad de tratamiento o investigación que tuvo el paciente. Si hay más de una afección así
            caracterizada, debe seleccionarse la que se considera causante del mayor uso de recursos. Si no se hizo ningún diagnóstico, debe seleccionarse el síntoma principal, hallazgo
            anormal o problema más importante como afección principal.
            En Otros diagnósticos se debe anotar las otras afecciones o problemas que requirieron atención durante el período de la internación.
            Cada diagnóstico debe ser tan informativo y detallado como sea posible (incluyendo la etiología).
            Se excluyen los diagnósticos relacionados a un episodio anterior y que no inciden en el actual.`,
            fields: [
                {
                    dataName: "diagnostico_principal", label: "Diagnóstico principal", controlType: "textField",
                    initialValue: data ? data.diagnostico_principal : "",
                    validationSchema: yup.string().max(500),
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
            ],
        },
        {
            name: "Procedimientos quirúrgicos y obstétricos",
            description: `Solo si se realizó algún procedimiento y que está relacionado con el diagnóstico principal al egreso.
            Registrar los procedimientos quirúrgicos y obstétricos realizados durante la presente internación y que impliquen el uso de quirófano, sala de partos, sala de procedimientos o que requieran la administración de anestesia general, aunque se realicen fuera de los lugares mencionados.`,
            fields: [
                {
                    dataName: "procedimientos", label: "Procedimientos", controlType: "textField",
                    initialValue: data ? data.procedimientos : "",
                    validationSchema: yup.string().max(500),
                    size: fieldSize.xxxl,
                    disabled: true,
                },
            ],
        },
        {
            name: "Otras circunstancias que prolongan la internación",
            description: `Motivos que prolongan la estadía del paciente tras el alta médica. Ej: no cuenta con familiares, disposición de un juez, puérpera con alta que acompaña al neonato, etc.`,
            fields: [
                {
                    dataName: "otras_circun", label: "Motivo de la estadía prolongada", controlType: "textField",
                    initialValue: data ? data.otras_circun : null,
                    validationSchema: yup.string().max(500).nullable(),
                    size: fieldSize.xl,
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
                            validationSchema: yup.number().integer().min(0).max(8000),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                            disabled: true,
                        },
                        {
                            dataName: "condicion", label: "Condición al nacer", controlType: "autocomplete", items: Formatter.prod_gesta_condicion,
                            validationSchema: yup.string(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                            disabled: true,
                        },
                        {
                            dataName: "terminacion", label: "Terminación", controlType: "autocomplete", items: Formatter.prod_gesta_terminacion,
                            validationSchema: yup.string(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                            disabled: true,
                        },
                        {
                            dataName: "sexo", label: "Sexo", controlType: "autocomplete", items: Formatter.sexo,
                            validationSchema: yup.string(),
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
                    dataName: "resultado_revision", label: "Resultado", controlType: "select", items: Formatter.resultados_revision,
                    initialValue: '',
                    validationSchema: yup.string(),
                },
                {
                    dataName: "comentario", label: "Comentario", controlType: "textField",
                    initialValue: '',
                    validationSchema: yup.string().max(5000),
                    size: fieldSize.xxxl,
                },
            ],
        },
    ], [data, establecimientos, paises, unidades_operativas]);

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
                            {data.inconsistencias > 0 ?
                                <div>
                                    <div className={classes.textWithIcon}>
                                        <WarningRoundedIcon color="warning" className={classes.icon} />
                                        <h2>Inconsistencias</h2>
                                    </div>
                                    <p>Se han detectado inconsistencias en los datos cargados de este informe. Puedes solicitar la corrección del informe o aprobarlo con las inconsistencias. En caso de aprobarlo se te pedirá el consentimiento expreso de lo aquí detectado.</p>

                                    <div className={classes.textWithIcon} key={data.detInconsistencias.id}>
                                        <WarningRoundedIcon color="warning" className={classes.icon} />
                                        <h3>
                                            {data.detInconsistencias.title}:  {data.detInconsistencias.detInconsistencias.map((inconDet) => (" " + inconDet + " "))}
                                        </h3>
                                    </div>
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