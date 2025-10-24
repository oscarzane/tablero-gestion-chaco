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
import moment from 'moment';
import 'moment-precise-range-plugin';

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

    const [establecimientos, setEstablecimientos] = useState([]);
    const [paises, setPaises] = useState([]);
    const [unidades_operativas, setUnidadesOperativas] = useState([]);

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
        var t_esCorreccion = data ? "1" : "0";

        const response = await postFiles(data ? "hospitalizacion/editar.php" : "hospitalizacion/nuevo.php", {
            id_usuario: usuario.id_usuario,
            id_hospitalizacion: data ? data.id_hospitalizacion : false,
            esCorreccion: t_esCorreccion,
            ...values,
            detalleProdGesta: JSON.stringify(values.detalleProdGesta),
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

    const onSubmit = async (values, { resetForm }) => {
        const zeroPad = (num, places) => String(num).padStart(places, '0');//agrega ceros al numero segun cantidad de places totales
        var t_values = { ...values };

        t_values.f_nacimiento = values.f_nacimiento == null ? null :
            values.f_nacimiento.$y ? values.f_nacimiento.$y + "-" + zeroPad(values.f_nacimiento.$M + 1, 2) + "-" + zeroPad(values.f_nacimiento.$D, 2) :
                values.f_nacimiento.getFullYear() + "-" + zeroPad(values.f_nacimiento.getMonth() + 1, 2) + "-" + zeroPad(values.f_nacimiento.getDate(), 2);

        t_values.f_ingreso = values.f_ingreso == null ? null :
            values.f_ingreso.$y ? values.f_ingreso.$y + "-" + zeroPad(values.f_ingreso.$M + 1, 2) + "-" + zeroPad(values.f_ingreso.$D, 2) :
                values.f_ingreso.getFullYear() + "-" + zeroPad(values.f_ingreso.getMonth() + 1, 2) + "-" + zeroPad(values.f_ingreso.getDate(), 2);

        t_values.f_egreso = values.f_egreso == null ? null :
            values.f_egreso.$y ? values.f_egreso.$y + "-" + zeroPad(values.f_egreso.$M + 1, 2) + "-" + zeroPad(values.f_egreso.$D, 2) :
                values.f_egreso.getFullYear() + "-" + zeroPad(values.f_egreso.getMonth() + 1, 2) + "-" + zeroPad(values.f_egreso.getDate(), 2);

        t_values.emb_f_term = values.emb_f_term == null ? null :
            values.emb_f_term.$y ? values.emb_f_term.$y + "-" + zeroPad(values.emb_f_term.$M + 1, 2) + "-" + zeroPad(values.emb_f_term.$D, 2) :
                values.emb_f_term.getFullYear() + "-" + zeroPad(values.emb_f_term.getMonth() + 1, 2) + "-" + zeroPad(values.emb_f_term.getDate(), 2);

        var t_error = verificarFormulario(t_values);
        if (t_error.text.length == 0) {
            loadingModal.setOpen(true);

            const response = await postFiles("hospitalizacion/inconsistencias.php", {
                id_usuario: usuario.id_usuario,
                ...t_values,
                detalleProdGesta: JSON.stringify(t_values.detalleProdGesta),
            });
            if (response.error === "") {
                if (response.data.length == 0)//no hay inconsistencias
                    onSubmitFinal(t_values);
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
        else {
            alertModal.showModal(t_error.title, t_error.text);
        }
    }

    const verificarFormulario = (formValues) => {
        var t_return = { title: "", text: [] };

        //detalleProdGesta
        if ((formValues.externa_prod_por * 1 > 0 && (formValues.externa_lugar * 1 == 0 || formValues.externa_como == "")) ||
            (formValues.externa_lugar * 1 > 0 && (formValues.externa_prod_por * 1 == 0 || formValues.externa_como == "")) ||
            (formValues.externa_como != "" && formValues.externa_como != null && (formValues.externa_prod_por * 1 == 0 || formValues.externa_lugar * 1 == 0))
        ) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("Se debe completar los tres campos correspondientes a la causa externa (item 22) o en su defecto dejar los tres en blanco.");
        }

        if ((formValues.emb_cant > 0 || formValues.detalleProdGesta.length > 0) && formValues.emb_cant != formValues.detalleProdGesta.length) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("La cantidad de productos del parto no coincide con los detalles de producto de la gestación informados. Recordar que los abortos o defunciones infantiles también deben ser completadas.");
        }

        //calculo la edad por la fecha de nacimiento
        if (formValues.f_nacimiento > formValues.f_ingreso) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("La fecha de nacimiento no puede ser posterior a la fecha de ingreso");
        }
        if (formValues.f_nacimiento > formValues.f_egreso) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("La fecha de nacimiento no puede ser posterior a la fecha de egreso");
        }

        if ((formValues.unidad_edad < 9 && formValues.unidad_edad != null && formValues.edad == null) ||
            ((formValues.unidad_edad == 9 || formValues.unidad_edad == null) && formValues.edad != null)) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("Debes completar la unidad de edad y la edad o en su defecto dejar ambos en blanco");
        }
        else if (formValues.unidad_edad == 2 && formValues.edad > 11) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("Una edad expresada en meses no puede superar los 11 meses. Considera expresar la edad en años.");
        }
        else if (formValues.unidad_edad == 3 && formValues.edad > 30) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("Una edad expresada en días no puede superar los 30 días. Considera expresar la edad en meses.");
        }
        else if (formValues.unidad_edad == 4 && formValues.edad > 23) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("Una edad expresada en horas no puede superar las 23 horas. Considera expresar la edad en días.");
        }
        else if (formValues.unidad_edad == 5 && formValues.edad > 59) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("Una edad expresada en minutos no puede superar los 59 minutos. Considera expresar la edad en horas.");
        }
        else if (formValues.f_nacimiento != null) {//si tengo una fecha de nacimiento
            var unidad_edad_calc = null;
            var edad_calc = null;
            var diff = moment.preciseDiff(formValues.f_ingreso, formValues.f_nacimiento, true);
            if (diff.years > 0) {
                unidad_edad_calc = 1;
                edad_calc = diff.years;
            }
            else if (diff.months > 0) {
                unidad_edad_calc = 2;
                edad_calc = diff.months;
            }
            else if (diff.days > 0) {
                unidad_edad_calc = 3;
                edad_calc = diff.days;
            }//al no tener precision de horas, queda null para las demas posibilidades (hours, minutes, seconds)

            if (unidad_edad_calc != formValues.unidad_edad || edad_calc != formValues.edad) {
                if (unidad_edad_calc == null) {//tengo una edad calculada menor a dias (horas, min o sec)
                    if (formValues.unidad_edad <= 3) {//la edad ingresada esta en dias o mas
                        t_return.title = "Datos incorrectos";
                        t_return.text.push("Por la fecha de nacimiento ingresada la edad correcta debería ser horas o minutos");
                    }
                }
                else {//tengo una edad calculada en dias o mayor (dias, meses, años)
                    t_return.title = "Datos incorrectos";
                    t_return.text.push("Por la fecha de nacimiento ingresada la edad correcta sería " + edad_calc + " " + Formatter.arrayDataToString(Formatter.unidad_edad, unidad_edad_calc));
                }
            }
        }

        if (formValues.f_ingreso > formValues.f_egreso) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("La fecha de ingreso no puede ser posterior a la fecha de egreso");
        }
        else {
            var dias_estada_calc = moment(formValues.f_egreso).diff(moment(formValues.f_ingreso), "days");
            dias_estada_calc = dias_estada_calc < 1 ? 1 : dias_estada_calc;
            if (formValues.dias_estada != dias_estada_calc) {
                t_return.title = "Datos incorrectos";
                t_return.text.push("Según las fechas de ingreso y egreso la estadía debió ser de " + dias_estada_calc + " días");
            }
        }

        if (formValues.emb_f_term != null && formValues.emb_f_term > formValues.f_egreso) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("La fecha de terminación del embarazo no puede ser posterior a la fecha de egreso");
        }
        if (formValues.emb_f_term != null && formValues.emb_f_term < formValues.f_ingreso) {
            t_return.title = "Datos incorrectos";
            t_return.text.push("La fecha de terminación del embarazo no puede ser anterior a la fecha de ingreso");
        }

        //verifico sexo por unidad operativa
        var t_unidadIngreso = Formatter.getArrayDataById(unidades_operativas, formValues.id_uo_por_establecimiento_ingreso);
        var t_unidadEgreso = Formatter.getArrayDataById(unidades_operativas, formValues.id_uo_por_establecimiento_egreso);
        var t_sexo = Formatter.getArrayDataById(Formatter.sexo, formValues.sexo);
        //tengo unidad de ingreso, tengo sexo masc o fem, tengo unidad con sexo, no coinciden sexos
        //245 es obstetricia, omito control de sexo para menores en ese servicio
        if (t_unidadIngreso.servicio_codigo != "245" || (t_unidadIngreso.servicio_codigo == "245" && formValues.unidad_edad == "1" && formValues.edad > 14)) {
            if (t_unidadIngreso != null && t_unidadIngreso.sector_codigo != "8" && formValues.sexo != t_unidadIngreso.sector_codigo) {
                t_return.title = "Datos incorrectos";
                t_return.text.push("El servicio de ingreso es " + (t_unidadIngreso.sector_codigo == "1" ? "masculino" : "femenino") +
                    " pero el sexo del paciente es " + t_sexo.str +
                    ". Por favor revisar si el servicio de ingreso es correcto o en su defecto completar correctamente el sexo del paciente.");
            }
            if (t_unidadEgreso != null && t_unidadEgreso.sector_codigo != "8" && formValues.sexo != t_unidadEgreso.sector_codigo) {
                t_return.title = "Datos incorrectos";
                t_return.text.push("El servicio de egreso es " + (t_unidadEgreso.sector_codigo == "1" ? "masculino" : "femenino") +
                    " pero el sexo del paciente es " + t_sexo.str +
                    ". Por favor revisar si el servicio de egreso es correcto o en su defecto completar correctamente el sexo del paciente.");
            }
        }

        //verifico por edad por unidad operativa, pediatrico y adulto debe coincidir si o si (salvo que el estab no tenga pediatria y viceversa)
        if (formValues.unidad_edad != null && formValues.unidad_edad != "9") {//si se ingresó la edad
            //si es adulto
            if(formValues.unidad_edad == "1" && formValues.edad > 14){
                //controlo la unidad de ingreso
                if(t_unidadIngreso.es_pediatrico == "1"){//ingreso unidad pediatrico
                    //recorro las unidades del establecimiento
                    for (var i = 0; i < unidades_operativas.length; i++) {
                        //verifico si tengo unidad equivalente de adulto
                        if (unidades_operativas[i].servicio_codigo == t_unidadIngreso.servicio_codigo*1 - 1) {
                            //si tengo unidad de adulto, dar error
                            t_return.title = "Datos incorrectos";
                            t_return.text.push("El paciente es mayor a 14 años pero el servicio de ingreso es pediátrico. Corregir la edad o en su defecto el servicio de ingreso seleccionado.");
                        }
                    }
                }

                //controlo la unidad de egreso
                if(t_unidadEgreso.es_pediatrico == "1"){//egreso unidad pediatrico
                    //recorro las unidades del establecimiento
                    for (var i = 0; i < unidades_operativas.length; i++) {
                        //verifico si tengo unidad equivalente de adulto
                        if (unidades_operativas[i].servicio_codigo == t_unidadEgreso.servicio_codigo*1 - 1) {
                            //si tengo unidad de adulto, dar error
                            t_return.title = "Datos incorrectos";
                            t_return.text.push("El paciente es mayor a 14 años pero el servicio de egreso es pediátrico. Corregir la edad o en su defecto el servicio de egreso seleccionado.");
                        }
                    }
                }
            }
            else{//si es menor
                //controlo la unidad de ingreso
                if(t_unidadIngreso.es_pediatrico == "0"){//ingreso unidad adulto
                    //recorro las unidades del establecimiento
                    for (var i = 0; i < unidades_operativas.length; i++) {
                        //verifico si tengo unidad equivalente de pediatrico
                        if (unidades_operativas[i].servicio_codigo == t_unidadIngreso.servicio_codigo*1 + 1) {
                            //si tengo unidad de adulto, dar error
                            t_return.title = "Datos incorrectos";
                            t_return.text.push("El paciente tiene 14 años o menos pero el servicio de ingreso es de adultos. Corregir la edad o en su defecto el servicio de ingreso seleccionado.");
                        }
                    }
                }

                //controlo la unidad de egreso
                if(t_unidadEgreso.es_pediatrico == "0"){//egreso unidad adulto
                    //recorro las unidades del establecimiento
                    for (var i = 0; i < unidades_operativas.length; i++) {
                        //verifico si tengo unidad equivalente de pediatrico
                        if (unidades_operativas[i].servicio_codigo == t_unidadEgreso.servicio_codigo*1 + 1) {
                            //si tengo unidad de adulto, dar error
                            t_return.title = "Datos incorrectos";
                            t_return.text.push("El paciente tiene 14 años o menos pero el servicio de egreso es de adultos. Corregir la edad o en su defecto el servicio de egreso seleccionado.");
                        }
                    }
                }
            }
        }

        return t_return;
    };

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
            await readUnidadesOperativas(response.data);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

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

    const readUnidadesOperativas = useCallback(async (p_data) => {
        setUnidadesOperativas([]);

        const response = await postData("establecimiento/leer-id.php", {
            id_usuario: usuario.id_usuario,
            id_establecimiento: p_data ? p_data.id_establecimiento : usuario.id_establecimiento,
        });

        if (response.error === "") {
            setUnidadesOperativas(response.data.uo_por_establecimiento_hos);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario, data.id_establecimiento, usuario.id_establecimiento]);

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
        else {
            return false;
        }
    }, [globalsContext.idEdit, usuario.id_usuario]);

    useEffect(() => {
        const loadDefaultValues = async () => {
            loadingModal.setOpen(true);

            await readEstablecimientos();
            await readPaises();

            var t_data = await loadData();
            await readUnidadesOperativas(t_data);

            if (globalsContext.idEdit && t_data.observaciones !== "")
                verHistorial();

            loadingModal.setOpen(false);
        }

        loadDefaultValues();
    }, []);

    const verHistorial = () => {
        setIdReferenciaVerLogModal(globalsContext.idEdit);
        setReferenciaVerLogModal(Formatter.log_referencia.HOSPITALIZACION.id);
    };

    const formSections = useMemo(() => [
        {
            name: "Establecimiento y número",
            fields: [
                {
                    dataName: "id_establecimiento", label: "Establecimiento", controlType: "select",
                    items: establecimientos,
                    initialValue: establecimientos.length > 0 ? (data ? data.id_establecimiento : usuario.id_establecimiento) : "",
                    validationSchema: yup.string().required(),
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
                    autoFocus: true,
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
                    autoFocus: true,
                },
                {
                    dataName: "f_nacimiento", label: "F. Nacimiento", controlType: "datePicker",
                    initialValue: data ? (data.f_nacimiento_iso ? new Date(data.f_nacimiento_iso) : null) : null,
                    validationSchema: yup.date().nullable().min(new Date(1900, 0, 1)),
                },
                {
                    dataName: "unidad_edad", label: "Unidad edad al ingreso", controlType: "autocomplete", items: Formatter.unidad_edad,
                    initialValue: data ? data.unidad_edad : null,
                    validationSchema: yup.string().nullable(),
                },
                {
                    dataName: "edad", label: "Edad al ingreso", controlType: "textField",
                    initialValue: data ? data.edad : null,
                    validationSchema: yup.number().min(0).max(115).nullable(),
                },
                {
                    dataName: "dni_madre", label: "N° Doc. Madre (men 1 año)", controlType: "textField",
                    initialValue: data ? data.dni_madre : null,
                    validationSchema: yup.number().min(0).nullable(),
                },
                {
                    dataName: "id_geo_pais", label: "Pais residencia", controlType: "autocomplete", items: paises,
                    initialValue: data ? data.id_geo_pais : null,
                    validationSchema: yup.string().nullable(),
                    child: {
                        dataName: "id_geo_provincia", label: "Provincia residencia", controlType: "autocomplete",
                        initialValue: data ? data.id_geo_provincia : null,
                        validationSchema: yup.string().nullable(),
                        child: {
                            dataName: "id_geo_localidad", label: "Localidad residencia", controlType: "autocomplete",
                            initialValue: data ? data.id_geo_localidad : null,
                            validationSchema: yup.string().nullable(),
                        },
                    },
                },
                {
                    dataName: "sexo", label: "Sexo", controlType: "autocomplete", items: Formatter.sexo,
                    initialValue: data ? data.sexo : null,
                    validationSchema: yup.string().required(),
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
                    autoFocus: true,
                },
                {
                    dataName: "niv_instruc", label: "Nivel de instrucción", controlType: "autocomplete", items: Formatter.nivel_instruccion,
                    initialValue: data ? data.niv_instruc : null,
                    validationSchema: yup.string().nullable(),
                },
                {
                    dataName: "sit_laboral", label: "Situación laboral", controlType: "autocomplete", items: Formatter.situacion_laboral,
                    initialValue: data ? data.sit_laboral : null,
                    validationSchema: yup.string().nullable(),
                },
            ],
        },
        {
            name: "Estada",
            fields: [
                {
                    dataName: "f_ingreso", label: "F. Ingreso", controlType: "datePicker",
                    initialValue: data ? (data.f_ingreso_iso ? new Date(data.f_ingreso_iso) : null) : null,
                    validationSchema: yup.date().required().min(new Date(2020, 0, 1)),
                    autoFocus: true,
                },
                {
                    dataName: "id_uo_por_establecimiento_ingreso", label: "Unidad de Ingreso", controlType: "autocomplete", items: unidades_operativas,
                    initialValue: data ? data.id_uo_por_establecimiento_ingreso : null,
                    validationSchema: yup.string().required(),
                    size: fieldSize.xl,
                },
                {
                    dataName: "f_egreso", label: "F. Egreso", controlType: "datePicker",
                    initialValue: data ? (data.f_egreso_iso ? new Date(data.f_egreso_iso) : null) : null,
                    validationSchema: yup.date().required().min(new Date(2020, 0, 1)).max(new Date()),
                },
                {
                    dataName: "id_uo_por_establecimiento_egreso", label: "Unidad de Egreso", controlType: "autocomplete", items: unidades_operativas,
                    initialValue: data ? data.id_uo_por_establecimiento_egreso : null,
                    validationSchema: yup.string().required(),
                    size: fieldSize.xl,
                },
                {
                    dataName: "dias_estada", label: "Total días de estada", controlType: "textField",
                    initialValue: data ? data.dias_estada : "",
                    validationSchema: yup.number().required().min(1),
                },
                {
                    dataName: "tipo_egreso", label: "Tipo de egreso", controlType: "autocomplete", items: Formatter.tipo_egreso,
                    initialValue: data ? data.tipo_egreso : null,
                    validationSchema: yup.string().required(),
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
                    validationSchema: yup.string().max(500).required(),
                    autoFocus: true,
                    size: fieldSize.xxl,
                },
                {
                    dataName: "otros_diagnosticos", label: "Otros diagnósticos", controlType: "textField",
                    initialValue: data ? data.otros_diagnosticos : "",
                    validationSchema: yup.string().max(1000),
                    size: fieldSize.xxl,
                },
                /*{
                    dataName: "detalleDiagnostico", label: "Diagnósticos", controlType: "detalleList",
                    initialValue: data ? data.detalleDiagnostico : [],
                    validationSchema: yup.array().min(1),
                    labelPopup: "diagnóstico", labelPopupGenero: "o",//o a
                    totalShow: true, totalDataName: "", totalIsMoney: false,//nombre del dataname a sumar/contar(false para contar), si es o no de tipo moneda
                    sortable: true,
                    customValidate: (values) => {//validador personalizado, opcional
                        return "";
                    },
                    listFields: [
                        {
                            dataName: "diagnostico", label: "Descripción detallada del diagnóstico", controlType: "textField",
                            validationSchema: yup.string().required(),
                            visibleType: 1,//1 primary, 2 secondary, 3 photo, 0 none
                            size: fieldSize.xl,
                            autoFocus: true,
                        },
                    ],
                    customSubtitle: (data, row) => {
                        if (data.indexOf(row) == 0) return "Diagnóstico principal";
                        return "Diagnóstico secundario";
                    },
                    //customIcon: <icon />,
                },*/
            ],
        },
        {
            name: "Procedimientos quirúrgicos y obstétricos",
            description: `Solo si se realizó algún procedimiento y que está relacionado con el diagnóstico principal al egreso (caso contrario dejar en blanco).
            Registrar los procedimientos quirúrgicos y obstétricos realizados durante la presente internación y que impliquen el uso de quirófano, sala de partos, sala de procedimientos o que requieran la administración de anestesia general, aunque se realicen fuera de los lugares mencionados.`,
            fields: [
                {
                    dataName: "procedimientos", label: "Procedimientos", controlType: "textField",
                    initialValue: data && data.procedimientos ? data.procedimientos : "",
                    validationSchema: yup.string().max(500),
                    autoFocus: true,
                    size: fieldSize.xxxl,
                },
                /*{
                    dataName: "detalleProcedimiento", label: "Procedimientos", controlType: "detalleList",
                    initialValue: data ? data.detalleProcedimiento : [],
                    validationSchema: yup.array(),
                    labelPopup: "procedimiento", labelPopupGenero: "o",//o a
                    totalShow: true, totalDataName: "", totalIsMoney: false,//nombre del dataname a sumar/contar(false para contar), si es o no de tipo moneda
                    customValidate: (values) => {//validador personalizado, opcional
                        return "";
                    },
                    listFields: [
                        {
                            dataName: "procedimiento", label: "Nombre del procedimiento realizado", controlType: "textField",
                            validationSchema: yup.string().required(),
                            visibleType: 1,//1 primary, 2 secondary, 3 photo, 0 none
                            size: fieldSize.xl,
                            autoFocus: true,
                        },
                    ],
                    //customIcon: <icon />,
                },*/
            ],
        },
        {
            name: "Otras circunstancias que prolongan la internación",
            description: `Solo en caso de haber motivos que prolongan la estadía del paciente tras el alta médica. Ej: no cuenta con familiares, disposición de un juez, puérpera con alta que acompaña al neonato, etc.`,
            fields: [
                {
                    dataName: "otras_circun", label: "Motivo de la estadía prolongada", controlType: "textField",
                    initialValue: data && data.otras_circun ? data.otras_circun : null,
                    validationSchema: yup.string().max(500).nullable(),
                    autoFocus: true,
                    size: fieldSize.xxxl,
                },
                {
                    dataName: "dias_otras_circun", label: "Días de estada adicionales", controlType: "textField",
                    initialValue: data ? data.dias_otras_circun : null,
                    validationSchema: yup.number().min(1).nullable(),
                },
            ],
        },
        {
            name: "Causa externa de traumatismo, envenenamiento y otros efectos adversos",
            description: `Llenar solo cuando se produce un egreso por alguna afección relacionada con una causa externa (caidas, fracturas, quemaduras, envenenamientos, intoxicaciones, etc.). Caso contrario dejar en blanco. En “Lesión autoinfligida” se incluye el intento de suicidio. En “Agresión” se incluye el intento de homicidio. La alternativa “Se ignora” se aplica cuando se desconoce la intencionalidad.`,
            fields: [
                {
                    dataName: "externa_prod_por", label: "Producido por", controlType: "autocomplete", items: Formatter.causa_externa_producido,
                    initialValue: data ? data.externa_prod_por : null,
                    validationSchema: yup.string().nullable(),
                    autoFocus: true,
                },
                {
                    dataName: "externa_lugar", label: "Lugar donde ocurrió", controlType: "autocomplete", items: Formatter.causa_externa_lugar,
                    initialValue: data ? data.externa_lugar : null,
                    validationSchema: yup.string().nullable(),
                },
                {
                    dataName: "externa_como", label: "Cómo se produjo (descripción detallada)", controlType: "textField",
                    initialValue: data ? data.externa_como : null,
                    validationSchema: yup.string().max(500).nullable(),
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
                },
                {
                    dataName: "emb_edad", label: "Semanas de gestación", controlType: "textField",
                    initialValue: data ? data.emb_edad : null,
                    validationSchema: yup.number().min(0).max(50).integer().nullable(),
                },
                {
                    dataName: "emb_paridad", label: "Total Nac. anteriores", controlType: "textField",
                    initialValue: data ? data.emb_paridad : null,
                    validationSchema: yup.number().min(0).max(43).integer().nullable(),
                },
                {
                    dataName: "emb_cant", label: "Cantidad de productos del parto", controlType: "textField",
                    initialValue: data ? data.emb_cant : null,
                    validationSchema: yup.number().min(0).max(15).integer().nullable(),
                },
                {
                    dataName: "detalleProdGesta", label: "Productos de la gestación", controlType: "detalleList",
                    initialValue: data ? data.detalleProdGesta : [],
                    validationSchema: yup.array()/*.max(1)*/,
                    labelPopup: "nacido vivo/muerto", labelPopupGenero: "o",//o a
                    totalShow: true, totalDataName: "", totalIsMoney: false,//nombre del dataname a sumar/contar(false para contar), si es o no de tipo moneda
                    customValidate: (values) => {//validador personalizado, opcional
                        /*if (values.edad < 1 && values.unidad_edad != 9) return "La edad solo puede ser 0 cuando la unidad de edad es 'ignorada'";
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
                        }*/
                        return "";
                    },
                    listFields: [
                        {
                            dataName: "peso", label: "Peso en gramos", controlType: "textField",
                            validationSchema: yup.number().integer().min(0).max(8000).required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                            autoFocus: true,
                        },
                        {
                            dataName: "condicion", label: "Condición al nacer", controlType: "autocomplete", items: Formatter.prod_gesta_condicion,
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "terminacion", label: "Terminación", controlType: "autocomplete", items: Formatter.prod_gesta_terminacion,
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "sexo", label: "Sexo", controlType: "autocomplete", items: Formatter.sexo,
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
                    dataName: "observaciones", label: "Observaciones", controlType: "textField",
                    initialValue: "",
                    validationSchema: yup.string().max(500),
                    autoFocus: true,
                    size: fieldSize.xxxl,
                },
            ],
        },
    ], [data, usuario.id_establecimiento, establecimientos, paises, unidades_operativas]);

    return (
        <Fragment>
            <Layout nombrePagina={data ? "Modificación del Informe de Hospitalización" : "Nuevo Informe de Hospitalización"}>
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                    <Button
                        variant="contained" color="secondary" fullWidth
                        onClick={verHistorial}
                        disabled={!globalsContext.idEdit}
                    >
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