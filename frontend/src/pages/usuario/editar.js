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

    const [establecimientos, setEstablecimientos] = useState([]);

    const globalsContext = useContext(GlobalsContext);
    const [data, setData] = useState(false);

    //Modals
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();


    const onSubmit = async (values, { resetForm }) => {
        loadingModal.setOpen(true);

        const response = await postFiles(data ? "usuario/editar.php" : "usuario/nuevo.php", {
            id_usuario: usuario.id_usuario,
            id_usuario_edit: data ? data.id_usuario : false,
            ...values,
            establecimientos: JSON.stringify(values.establecimientos),
        });
        if (response.error === "") {
            enqueueSnackbar(data ? "Usuario modificado ok" : 'Nuevo usuario ok', { variant: "success" });

            onClose();
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
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

    const readEstablecimientos = useCallback(async () => {
        const response = await postData("establecimiento/leerSimple.php", {
            id_usuario: usuario.id_usuario,
            publicos: 1,
            solo_del_usuario: 0
        });

        if (response.error === "") {
            setEstablecimientos(response.data);
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

            const response = await postData("usuario/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_usuario_edit: globalsContext.idEdit,
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
            await readEstablecimientos();

            loadingModal.setOpen(false);
        }

        loadDefaultValues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalsContext.idEdit]);

    const formSections = useMemo(() => [
        {
            name: "Datos personales",
            fields: [
                {
                    dataName: "cuitCuil", label: "CUIT / CUIL", controlType: "textField",
                    initialValue: data ? data.cuitCuil : '',
                    validationSchema: yup.number().required().min(20000000000).max(31000000000),
                    autoFocus: true,
                },
                {
                    dataName: "nombre", label: "Nombre y apellido", controlType: "textField",
                    initialValue: data ? data.nombre : '',
                    validationSchema: yup.string(),
                },
                {
                    dataName: "genero", label: "Género", controlType: "select", items: Formatter.genero,
                    initialValue: data ? data.genero : null,
                    validationSchema: yup.string().required(),
                },
            ],
        },
        {
            name: "Perfiles especiales",
            fields: [
                {
                    dataName: "admin", label: "Administrador/a", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.admin === "1" : false,
                    validationSchema: yup.boolean(),
                },
                {
                    dataName: "es_central", label: "Es de estadística central", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.es_central === "1" : false,
                    validationSchema: yup.boolean(),
                },
                {
                    dataName: "puede_eliminar", label: "Puede eliminar", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.puede_eliminar === "1" : false,
                    validationSchema: yup.boolean(),
                },
                {
                    dataName: "solo_region", label: "Supervisor/a de Región", controlType: "select", items: [{ id: 0, nombre: "No" }, ...Formatter.region],
                    initialValue: data ? data.solo_region : "0",
                    validationSchema: yup.string().required(),
                },
                {
                    dataName: "revisor", label: "Revisor", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: data ? data.revisor === "1" : false,
                    validationSchema: yup.boolean(),
                },
            ],
        },
        {
            name: "Establecimientos asignados",
            description: "Agrega con el botón '+' los establecimientos asignados a este usuario. Puedes eliminarlos con el ícono a la derecha de cada fila.",
            fields: [
                {
                    dataName: "establecimientos", label: "Establecimientos", controlType: "detalleList",
                    initialValue: data ? data.establecimientos : [],
                    validationSchema: yup.array().min(0)/*.max(1)*/,
                    labelPopup: "establecimiento", labelPopupGenero: "o",//o a
                    totalShow: true, totalDataName: "", totalIsMoney: false,//nombre del dataname a sumar/contar(false para contar), si es o no de tipo moneda
                    customValidate: (values) => {//validador personalizado, opcional
                        //if (values.edad > 0 && values.unidad_edad == 9) return "La edad solo puede ser 0 cuando la unidad de edad es 'ignorada'";
                        return "";
                    },
                    listFields: [
                        {
                            dataName: "id_establecimiento", label: "Establecimiento", controlType: "autocomplete", items: establecimientos,
                            validationSchema: yup.string().required(), initialValue: null,//initial value se usa solo para nuevos
                            visibleType: 1,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "carga", label: "Carga de planillas", controlType: "checkBox",
                            validationSchema: yup.boolean(), initialValue: false,//initial value se usa solo para nuevos
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "scarga", label: "Supervisión de cargas", controlType: "checkBox",
                            validationSchema: yup.boolean(), initialValue: false,//initial value se usa solo para nuevos
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "codif", label: "Codificación", controlType: "checkBox",
                            validationSchema: yup.boolean(), initialValue: false,//initial value se usa solo para nuevos
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                        {
                            dataName: "scodif", label: "Supervisión de codificación", controlType: "checkBox",
                            validationSchema: yup.boolean(), initialValue: false,//initial value se usa solo para nuevos
                            visibleType: 2,//1 primary, 2 secondary, 3 photo, 0 none
                        },
                    ],
                    //customIcon: <icon />,
                },
            ],
        },
    ], [data, establecimientos]);

    return (
        <Fragment>
            <Layout nombrePagina={data ? "Modificación de Usuario" : "Nuevo Usuario"}>
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