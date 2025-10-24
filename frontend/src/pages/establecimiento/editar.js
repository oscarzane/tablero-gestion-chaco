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

    const [serviciosMasSubunidades, setServiciosMasSubunidades] = useState([]);
    const [sectores, setSectores] = useState([]);

    const globalsContext = useContext(GlobalsContext);
    const [data, setData] = useState(false);

    //Modals
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();


    const onSubmit = async (values, { resetForm }) => {
        loadingModal.setOpen(true);

        if(values.a_consuextern && values.uo_por_establecimiento_con.length == 0){
            alertModal.showModal(
                "Faltan unidades operativas",
                "El establecimiento presentará la planilla de consultas médicas en consultorio externo, " +
                "pero no se han seleccionado las unidades operativas para tal fin.");
        }
        else if(values.a_hospitalizacion && values.uo_por_establecimiento_hos.length == 0){
            alertModal.showModal(
                "Faltan unidades operativas",
                "El establecimiento presentará los informes estadísticos de hospitalización, " +
                "pero no se han seleccionado las unidades operativas para tal fin.");
        }
        else{
            const response = await postFiles(data ? "establecimiento/editar.php" : "establecimiento/nuevo.php", {
                id_usuario: usuario.id_usuario,
                id_establecimiento: data ? data.id_establecimiento : false,
                ...values,
                uo_por_establecimiento_con: JSON.stringify(values.uo_por_establecimiento_con),
                uo_por_establecimiento_hos: JSON.stringify(values.uo_por_establecimiento_hos),
            });
            if (response.error === "") {
                enqueueSnackbar(data ? "Establecimiento modificado ok" : 'Nuevo establecimiento ok', { variant: "success" });

                onClose();
            }
            else {
                enqueueSnackbar(response.error, { variant: "error" });
            }
        }

        loadingModal.setOpen(false);
    }

    const onClose = useCallback(async () => {
        navigate(-1);
    }, [globalsContext, navigate]);
    const onCancel = () => {
        alertModal.showModal(
            "Cancelar",
            "Se perderán todos los cambios. ¿Deseas continuar?",
            function () {
                onClose();
            });
    }

    const readServiciosMasSubunidades = useCallback(async () => {
        const response = await postData("uo-servicio/leerSimple.php", {
            id_usuario: usuario.id_usuario,
            id_establecimiento: globalsContext.idEdit ? globalsContext.idEdit : 0,
        });

        if (response.error === "") {
            setServiciosMasSubunidades(response.data);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const readSectores = useCallback(async () => {
        const response = await postData("uo-sector/leerSimple.php", {
            id_usuario: usuario.id_usuario,
        });

        if (response.error === "") {
            setSectores(response.data);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = useCallback(async () => {
        //si tengo un id a editar, leo los datos desde el servidor
        if (globalsContext.idEdit) {
            loadingModal.setOpen(true);

            const response = await postData("establecimiento/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_establecimiento: globalsContext.idEdit,
            });

            if (response.error === "") {
                setData(response.data);
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

            await loadData();
            await readServiciosMasSubunidades();
            await readSectores();

            loadingModal.setOpen(false);
        }

        loadDefaultValues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalsContext.idEdit]);

    const formSections = useMemo(() => [
        {
            name: "Código y nombre",
            fields: [
                {
                    dataName: "codigo", label: "Código actual", controlType: "textField",
                    initialValue: data ? data.codigo : '',
                    validationSchema: yup.string().required().max(5),
                    autoFocus: true,
                },
                {
                    dataName: "codigoAnt", label: "Código anterior", controlType: "textField",
                    initialValue: data ? data.codigoAnt : '',
                    validationSchema: yup.string().required().max(5),
                },
                {
                    dataName: "nombre", label: "Nombre", controlType: "textField",
                    initialValue: data ? data.nombre : '',
                    validationSchema: yup.string().required().max(50),
                },
            ],
        },
        {
            name: "Tipo de establecimiento",
            fields: [
                {
                    dataName: "privado", label: "Administración", controlType: "select", items: Formatter.tipos_establecimiento_global,
                    initialValue: data ? data.privado : null,
                    validationSchema: yup.string().required(),
                    autoFocus: true,
                    child: {
                        dataName: "tipo", label: "Tipo", controlType: "select",
                        initialValue: data ? data.tipo : null,
                        validationSchema: yup.string().required(),
                    },
                },
                {
                    dataName: "codif_propia", label: "Codificación propia", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.codif_propia === "1" : false,
                    validationSchema: yup.boolean(),
                },
            ],
        },
        {
            name: "Actividades",
            fields: [
                {
                    dataName: "a_agensanit", label: "Agentes Sanitarios", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.a_agensanit === "1" : false,
                    validationSchema: yup.boolean(),
                    autoFocus: true,
                },
                {
                    dataName: "a_consuextern", label: "Consultorio Externo", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.a_consuextern === "1" : false,
                    validationSchema: yup.boolean(),
                },
                {
                    dataName: "a_hospitalizacion", label: "Hospitalización", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.a_hospitalizacion === "1" : false,
                    validationSchema: yup.boolean(),
                },
                {
                    dataName: "a_laboratorio", label: "Laboratorio", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.a_laboratorio === "1" : false,
                    validationSchema: yup.boolean(),
                },
                {
                    dataName: "a_enfermeria", label: "Prest. Enfermería", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.a_enfermeria === "1" : false,
                },
                {
                    dataName: "a_materinfan", label: "P. Mat. Infantil", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.a_materinfan === "1" : false,
                    validationSchema: yup.boolean(),
                },
                {
                    dataName: "a_prodmensual", label: "Producción Mensual", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.a_prodmensual === "1" : false,
                    validationSchema: yup.boolean(),
                },
                {
                    dataName: "a_obstetricia", label: "Obstetricia", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.a_obstetricia === "1" : false,
                    validationSchema: yup.boolean(),
                },
                {
                    dataName: "a_recibyderiv", label: "Recibidos y Derivados", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.a_recibyderiv === "1" : false,
                    validationSchema: yup.boolean(),
                },
                {
                    dataName: "a_trabajosocial", label: "Trabajo Social", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.a_trabajosocial === "1" : false,
                    validationSchema: yup.boolean(),
                },
            ],
        },
        {
            name: "Unidades Operativas de Consultorio Externo",
            description: "Agrega con el botón '+' las unidades operativas. Puedes eliminarlas con el ícono a la derecha de cada fila.",
            fields: [
                {
                    dataName: "uo_por_establecimiento_con", label: "Unidades Operativas de Consultorio Externo", controlType: "detalleList",
                    initialValue: data ? data.uo_por_establecimiento_con : [],
                    validationSchema: yup.array().min(0)/*.max(1)*/,
                    labelPopup: "unidad operativa", labelPopupGenero: "a",//o a
                    totalShow: true, totalDataName: "", totalIsMoney: false,//nombre del dataname a sumar/contar(false para contar), si es o no de tipo moneda
                    customValidate: (values) => {//validador personalizado, opcional
                        //if (values.edad > 0 && values.unidad_edad == 9) return "La edad solo puede ser 0 cuando la unidad de edad es 'ignorada'";
                        return "";
                    },
                    listFields: [
                        {
                            dataName: "id_servicioMasSubunidad", label: "Unidad operativa", controlType: "autocomplete", items: serviciosMasSubunidades,
                            validationSchema: yup.string().required(),
                            visibleType: 1,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "id_uo_sector", label: "Sector", controlType: "select", items: sectores,
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                    ],
                    //customIcon: <icon />,
                },
            ],
        },
        {
            name: "Unidades Operativas de Hospitalizacion",
            description: "Agrega con el botón '+' las unidades operativas. Puedes eliminarlas con el ícono a la derecha de cada fila.",
            fields: [
                {
                    dataName: "uo_por_establecimiento_hos", label: "Unidades Operativas de Hospitalizacion", controlType: "detalleList",
                    initialValue: data ? data.uo_por_establecimiento_hos : [],
                    validationSchema: yup.array().min(0)/*.max(1)*/,
                    labelPopup: "unidad operativa", labelPopupGenero: "a",//o a
                    totalShow: true, totalDataName: "", totalIsMoney: false,//nombre del dataname a sumar/contar(false para contar), si es o no de tipo moneda
                    customValidate: (values) => {//validador personalizado, opcional
                        //if (values.edad > 0 && values.unidad_edad == 9) return "La edad solo puede ser 0 cuando la unidad de edad es 'ignorada'";
                        return "";
                    },
                    listFields: [
                        {
                            dataName: "id_servicioMasSubunidad", label: "Unidad operativa", controlType: "autocomplete", items: serviciosMasSubunidades,
                            validationSchema: yup.string().required(),
                            visibleType: 1,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "id_uo_sector", label: "Sector", controlType: "select", items: sectores,
                            validationSchema: yup.string().required(),
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                    ],
                    //customIcon: <icon />,
                },
            ],
        },
    ], [data, serviciosMasSubunidades, sectores]);

    return (
        <Fragment>
            <Layout nombrePagina={data ? "Modificación de Establecimiento" : "Nuevo Establecimiento"}>
                <Fade in={true} timeout={900}>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <CustomForm
                                formSections={formSections}
                                onSubmit={onSubmit}
                                onCancel={onCancel}
                                submitButtonText={data ? "Informar modificaciones" : "Subir nuevo"}
                                cancelButtonText="Cancelar"
                                stepperType={"vertical"}
                                isModal={false}
                            />
                        </Paper>
                    </Grid>
                </Fade>
            </Layout>
        </Fragment>
    );
}

export default Page;