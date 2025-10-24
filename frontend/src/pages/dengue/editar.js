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
import { CustomForm, fieldSize } from '../../components/formSections';
import { GlobalsContext } from '../../context/globals';
import { useSnackbar } from 'notistack';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { GoogleMapPickerModal } from '../../components/modal/googleMapPicker';
import { APIProvider } from '@vis.gl/react-google-maps';

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

    const [resetFormDummy, setResetFormDummy] = useState(1);

    const [ciudades, setCiudades] = useState([]);
    const [establecimientos, setEstablecimientos] = useState([]);

    //Modals
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const [openGoogleMapPicker, setOpenGoogleMapPicker] = useState(false);
    const [dataGoogleMapPicker, setDataGoogleMapPicker] = useState([]);


    const onSubmitFinal = async (latLong) => {//lat lng
        loadingModal.setOpen(true);

        const zeroPad = (num, places) => String(num).padStart(places, '0');//agrega ceros al numero segun cantidad de places totales
        var t_values = { ...formValues };

        t_values.f_deteccion = formValues.f_deteccion == null ? null :
            formValues.f_deteccion.$y ? formValues.f_deteccion.$y + "-" + zeroPad(formValues.f_deteccion.$M + 1, 2) + "-" + zeroPad(formValues.f_deteccion.$D, 2) :
                formValues.f_deteccion.getFullYear() + "-" + zeroPad(formValues.f_deteccion.getMonth() + 1, 2) + "-" + zeroPad(formValues.f_deteccion.getDate(), 2);
        t_values.f_sintoma = formValues.f_sintoma == null ? null :
            formValues.f_sintoma.$y ? formValues.f_sintoma.$y + "-" + zeroPad(formValues.f_sintoma.$M + 1, 2) + "-" + zeroPad(formValues.f_sintoma.$D, 2) :
                formValues.f_sintoma.getFullYear() + "-" + zeroPad(formValues.f_sintoma.getMonth() + 1, 2) + "-" + zeroPad(formValues.f_sintoma.getDate(), 2);

        const response = await postFiles(data ? "caso-dengue/editar.php" : "caso-dengue/nuevo.php", {
            id_usuario: usuario.id_usuario,
            id_caso_dengue: data ? data.id_caso_dengue : false,
            ...t_values,
            latitud: latLong.lat,
            longitud: latLong.lng
        });
        if (response.error === "") {
            enqueueSnackbar(data ? "Correcciones subidas ok" : 'Nuevo caso subido ok', { variant: "success" });

            onClose(data ? true : false);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }

        loadingModal.setOpen(false);
    }

    const onSubmitGoogleMapPicker = async (latLong) => {//lat lng
        onSubmitFinal(latLong);
    }

    const onSubmit = async (values, { resetForm }) => {
        setFormValues(values);

        let t_localidad = "";
        if (values.id_geo_localidad != null) {
            for (var i = 0; i < ciudades.length; i++) {
                if (ciudades[i].id == values.id_geo_localidad) {
                    t_localidad = ciudades[i].nombre_str;
                    break;
                }
            }
        }
        setDataGoogleMapPicker({
            pais: "Argentina",
            estado: "Chaco",
            localidad: t_localidad,
            direccion: values.direccion,
            latLong: null,
        });
        setOpenGoogleMapPicker(true);
    }

    const onClose = (navegar_atras) => {
        //navigate(-1);
        setResetFormDummy(resetFormDummy + 1);
    };
    const onCancel = () => {
        alertModal.showModal(
            "Cancelar",
            "Se perderán todos los cambios. ¿Deseas continuar?",
            function () {
                onClose();
            });
    }

    const readCiudades = useCallback(async () => {
        setCiudades([]);

        const response = await postData("geo/leerCiudadesChaco.php", {
            id_usuario: usuario.id_usuario,
        });

        if (response.error === "") {
            setCiudades(response.data);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

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
            await readCiudades();
            document.getElementById('mainContainer').scrollTo({ top: 0, behavior: 'smooth' });

            loadingModal.setOpen(false);
        }

        loadDefaultValues();
    }, [resetFormDummy, usuario.id_usuario]);

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
                    dataName: "f_deteccion", label: "Fecha deteccion", controlType: "datePicker",
                    initialValue: data ? (data.f_deteccion_iso ? new Date(data.f_deteccion_iso) : new Date()) : new Date(),
                    validationSchema: yup.date().required().min(new Date(2024, 0, 1)),
                    disabled: true,
                },
            ],
        },
        {
            name: "Paciente",
            fields: [
                {
                    dataName: "dni", label: "N° Documento", controlType: "textField",
                    initialValue: data ? data.dni : null,
                    validationSchema: yup.number().min(0).nullable().required(),
                    autoFocus: true,
                },
                {
                    dataName: "telefono", label: "Teléfono de contacto", controlType: "textField",
                    initialValue: data ? data.telefono : null,
                    validationSchema: yup.number().min(0).nullable(),
                },
                {
                    dataName: "embarazada", label: "Es embarazada", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.embarazada === "1" : false,
                    validationSchema: yup.boolean(),
                },
            ],
        },
        {
            name: "Detalle del caso",
            fields: [
                {
                    dataName: "f_sintoma", label: "Fecha primeros síntomas", controlType: "datePicker",
                    initialValue: data ? (data.f_sintoma_iso ? new Date(data.f_sintoma_iso) : null) : null,
                    validationSchema: yup.date().required().min(new Date(2024, 0, 1)),
                },
                {
                    dataName: "confirmado", label: "Determinación", controlType: "select", items: Formatter.dengue_confirmacion,
                    initialValue: data ? data.confirmado : null,
                    validationSchema: yup.string().required(),
                },
                {
                    dataName: "serotipo", label: "Serotipo", controlType: "select", items: Formatter.dengue_serotipo,
                    initialValue: data ? data.serotipo : null,
                    validationSchema: yup.string().required(),
                },
            ],
        },
        {
            name: "Ubicación",
            fields: [
                {
                    dataName: "id_geo_localidad", label: "Localidad residencia", controlType: "autocomplete", items: ciudades,
                    initialValue: data ? data.id_geo_localidad : null,
                    validationSchema: yup.string().nullable().required(),
                },
                {
                    dataName: "direccion", label: "Dirección (calle y altura)", controlType: "textField",
                    initialValue: data ? data.direccion : "",
                    validationSchema: yup.string().max(500).min(5).required(),
                    size: fieldSize.xxl,
                },
            ],
        },
    ], [data, usuario.id_establecimiento, establecimientos, ciudades]);

    return (
        <Fragment>
            <Layout nombrePagina={data ? "Corrección de Caso de Dengue" : "Nuevo Caso de Dengue"}>
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
                                submitButtonText={data ? "Informar correcciones" : "Subir caso"}
                                cancelButtonText="Cancelar"
                                stepperType={false}
                                isModal={false}
                            />
                        </Paper>
                    </Grid>
                </Fade>
            </Layout>

            <APIProvider apiKey={Formatter.GOOGLE_MAPS_API_KEY}>
                <GoogleMapPickerModal
                    open={openGoogleMapPicker}
                    setOpen={setOpenGoogleMapPicker}
                    data={dataGoogleMapPicker}
                    action={onSubmitGoogleMapPicker}
                />
            </APIProvider>

        </Fragment>
    );
}

export default Page;