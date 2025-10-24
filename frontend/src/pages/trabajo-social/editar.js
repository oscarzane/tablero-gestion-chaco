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
            title: "Personas no binarias LGTBIQ+",
            data: [
                {
                    id: "0cantGenero",
                    data: parseInt(p_formValues["cantGenero"]),
                },
            ]
        },
        {
            id: 1,
            title: "Pueblos originarios",
            data: [
                {
                    id: "0cantOriginarios",
                    data: parseInt(p_formValues["cantOriginarios"]),
                },
            ]
        },
        {
            id: 2,
            title: "Informes",
            data: [
                {
                    id: "0cantInformes",
                    data: parseInt(p_formValues["cantInformes"]),
                },
            ]
        },
        {
            id: 3,
            title: "Diagnósticos Sociales",
            data: [
                {
                    id: "0cantDiagnosticos",
                    data: parseInt(p_formValues["cantDiagnosticos"]),
                },
            ]
        },
        {
            id: 4,
            title: "Proceso de investigación",
            data: [
                {
                    id: "0cantInvestigacion",
                    data: parseInt(p_formValues["cantInvestigacion"]),
                },
            ]
        },
        {
            id: 5,
            title: "Cons/Aten: 1° Vez",
            data: [
                {
                    id: "0TotConPri",
                    data: parseInt(p_formValues["VioConPri"]) + parseInt(p_formValues["MalConPri"]) + parseInt(p_formValues["AbuConPri"])
                    + parseInt(p_formValues["EmbConPri"]) + parseInt(p_formValues["SexConPri"]) + parseInt(p_formValues["FliConPri"])
                    + parseInt(p_formValues["NinVulConPri"]) + parseInt(p_formValues["AdoVulConPri"]) + parseInt(p_formValues["AduVulConPri"])
                    + parseInt(p_formValues["LgtVulConPri"]) + parseInt(p_formValues["FisVulConPri"]) + parseInt(p_formValues["MenVulConPri"])
                    + parseInt(p_formValues["CalVulConPri"]) + parseInt(p_formValues["ConVulConPri"]) + parseInt(p_formValues["DesSocConPri"])
                    + parseInt(p_formValues["ObeSocConPri"]) + parseInt(p_formValues["TraSocConPri"]) + parseInt(p_formValues["CroSocConPri"])
                    + parseInt(p_formValues["OncSocConPri"]) + parseInt(p_formValues["BucSocConPri"]) + parseInt(p_formValues["AmbConPri"])
                    + parseInt(p_formValues["OtrConPri"]),
                },
            ]
        },
        {
            id: 6,
            title: "Cons/Aten: Seguimiento Ulterior",
            data: [
                {
                    id: "0totConUl",
                    data: parseInt(p_formValues["VioConUlt"]) + parseInt(p_formValues["MalConUlt"]) + parseInt(p_formValues["AbuConUlt"])
                    + parseInt(p_formValues["EmbConUlt"]) + parseInt(p_formValues["SexConUlt"]) + parseInt(p_formValues["FliConUlt"])
                    + parseInt(p_formValues["NinVulConUlt"]) + parseInt(p_formValues["AdoVulConUlt"]) + parseInt(p_formValues["AduVulConUlt"])
                    + parseInt(p_formValues["LgtVulConUlt"]) + parseInt(p_formValues["FisVulConUlt"]) + parseInt(p_formValues["MenVulConUlt"])
                    + parseInt(p_formValues["CalVulConUlt"]) + parseInt(p_formValues["ConVulConUlt"]) + parseInt(p_formValues["DesSocConUlt"])
                    + parseInt(p_formValues["ObeSocConUlt"]) + parseInt(p_formValues["TraSocConUlt"]) + parseInt(p_formValues["CroSocConUlt"])
                    + parseInt(p_formValues["OncSocConUlt"]) + parseInt(p_formValues["BucSocConUlt"]) + parseInt(p_formValues["AmbConUlt"])
                    + parseInt(p_formValues["OtrConUlt"]),
                },
            ]
        },
        {
            id: 7,
            title: "Cons/Aten: Nexo",
            data: [
                {
                    id: "0totConNexo",
                    data: parseInt(p_formValues["VioConNex"]) + parseInt(p_formValues["MalConNex"]) + parseInt(p_formValues["AbuConNex"])
                    + parseInt(p_formValues["EmbConNex"]) + parseInt(p_formValues["SexConNex"]) + parseInt(p_formValues["FliConNex"])
                    + parseInt(p_formValues["NinVulConNex"]) + parseInt(p_formValues["AdoVulConNex"]) + parseInt(p_formValues["AduVulConNex"])
                    + parseInt(p_formValues["LgtVulConNex"]) + parseInt(p_formValues["FisVulConNex"]) + parseInt(p_formValues["MenVulConNex"])
                    + parseInt(p_formValues["CalVulConNex"]) + parseInt(p_formValues["ConVulConNex"]) + parseInt(p_formValues["DesSocConNex"])
                    + parseInt(p_formValues["ObeSocConNex"]) + parseInt(p_formValues["TraSocConNex"]) + parseInt(p_formValues["CroSocConNex"])
                    + parseInt(p_formValues["OncSocConNex"]) + parseInt(p_formValues["BucSocConNex"]) + parseInt(p_formValues["AmbConNex"])
                    + parseInt(p_formValues["OtrConNex"]),
                },
            ]
        },
        {
            id: 8,
            title: "Interv. en Terreno: Domicilio",
            data: [
                {
                    id: "0TotIntDom",
                    data: parseInt(p_formValues["VioIntDom"]) + parseInt(p_formValues["MalIntDom"]) + parseInt(p_formValues["AbuIntDom"])
                    + parseInt(p_formValues["EmbIntDom"]) + parseInt(p_formValues["SexIntDom"]) + parseInt(p_formValues["FliIntDom"])
                    + parseInt(p_formValues["NinVulIntDom"]) + parseInt(p_formValues["AdoVulIntDom"]) + parseInt(p_formValues["AduVulIntDom"])
                    + parseInt(p_formValues["LgtVulIntDom"]) + parseInt(p_formValues["FisVulIntDom"]) + parseInt(p_formValues["MenVulIntDom"])
                    + parseInt(p_formValues["CalVulIntDom"]) + parseInt(p_formValues["ConVulIntDom"]) + parseInt(p_formValues["DesSocIntDom"])
                    + parseInt(p_formValues["ObeSocIntDom"]) + parseInt(p_formValues["TraSocIntDom"]) + parseInt(p_formValues["CroSocIntDom"])
                    + parseInt(p_formValues["OncSocIntDom"]) + parseInt(p_formValues["BucSocIntDom"]) + parseInt(p_formValues["AmbIntDom"])
                    + parseInt(p_formValues["OtrIntDom"]),
                },
            ]
        },
        {
            id: 9,
            title: "Interv. en Terreno: Institución/Organización",
            data: [
                {
                    id: "0TotIntIns",
                    data: parseInt(p_formValues["VioIntIns"]) + parseInt(p_formValues["MalIntIns"]) + parseInt(p_formValues["AbuIntIns"])
                    + parseInt(p_formValues["EmbIntIns"]) + parseInt(p_formValues["SexIntIns"]) + parseInt(p_formValues["FliIntIns"])
                    + parseInt(p_formValues["NinVulIntIns"]) + parseInt(p_formValues["AdoVulIntIns"]) + parseInt(p_formValues["AduVulIntIns"])
                    + parseInt(p_formValues["LgtVulIntIns"]) + parseInt(p_formValues["FisVulIntIns"]) + parseInt(p_formValues["MenVulIntIns"])
                    + parseInt(p_formValues["CalVulIntIns"]) + parseInt(p_formValues["ConVulIntIns"]) + parseInt(p_formValues["DesSocIntIns"])
                    + parseInt(p_formValues["ObeSocIntIns"]) + parseInt(p_formValues["TraSocIntIns"]) + parseInt(p_formValues["CroSocIntIns"])
                    + parseInt(p_formValues["OncSocIntIns"]) + parseInt(p_formValues["BucSocIntIns"]) + parseInt(p_formValues["AmbIntIns"])
                    + parseInt(p_formValues["OtrIntIns"]),
                },
            ]
        },
        {
            id: 10,
            title: "Articulación para el acceso a políticas públicas",
            data: [
                {
                    id: "0TotArticu",
                    data: parseInt(p_formValues["VioArticu"]) + parseInt(p_formValues["MalArticu"]) + parseInt(p_formValues["AbuArticu"])
                    + parseInt(p_formValues["EmbArticu"]) + parseInt(p_formValues["SexArticu"]) + parseInt(p_formValues["FliArticu"])
                    + parseInt(p_formValues["NinVulArticu"]) + parseInt(p_formValues["AdoVulArticu"]) + parseInt(p_formValues["AduVulArticu"])
                    + parseInt(p_formValues["LgtVulArticu"]) + parseInt(p_formValues["FisVulArticu"]) + parseInt(p_formValues["MenVulArticu"])
                    + parseInt(p_formValues["CalVulArticu"]) + parseInt(p_formValues["ConVulArticu"]) + parseInt(p_formValues["DesSocArticu"])
                    + parseInt(p_formValues["ObeSocArticu"]) + parseInt(p_formValues["TraSocArticu"]) + parseInt(p_formValues["CroSocArticu"])
                    + parseInt(p_formValues["OncSocArticu"]) + parseInt(p_formValues["BucSocArticu"]) + parseInt(p_formValues["AmbArticu"])
                    + parseInt(p_formValues["OtrArticu"]),
                },
            ]
        },
        {
            id: 11,
            title: "Prom./Prev. en el servicio",
            data: [
                {
                    id: "0TotProSer",
                    data: parseInt(p_formValues["VioProSer"]) + parseInt(p_formValues["MalProSer"]) + parseInt(p_formValues["AbuProSer"])
                    + parseInt(p_formValues["EmbProSer"]) + parseInt(p_formValues["SexProSer"]) + parseInt(p_formValues["FliProSer"])
                    + parseInt(p_formValues["NinVulProSer"]) + parseInt(p_formValues["AdoVulProSer"]) + parseInt(p_formValues["AduVulProSer"])
                    + parseInt(p_formValues["LgtVulProSer"]) + parseInt(p_formValues["FisVulProSer"]) + parseInt(p_formValues["MenVulProSer"])
                    + parseInt(p_formValues["CalVulProSer"]) + parseInt(p_formValues["ConVulProSer"]) + parseInt(p_formValues["DesSocProSer"])
                    + parseInt(p_formValues["ObeSocProSer"]) + parseInt(p_formValues["TraSocProSer"]) + parseInt(p_formValues["CroSocProSer"])
                    + parseInt(p_formValues["OncSocProSer"]) + parseInt(p_formValues["BucSocProSer"]) + parseInt(p_formValues["AmbProSer"])
                    + parseInt(p_formValues["OtrProSer"]),
                },
            ]
        },
        {
            id: 12,
            title: "Prom./Prev. en la comunidad",
            data: [
                {
                    id: "0TotProCom",
                    data: parseInt(p_formValues["VioProCom"]) + parseInt(p_formValues["MalProCom"]) + parseInt(p_formValues["AbuProCom"])
                    + parseInt(p_formValues["EmbProCom"]) + parseInt(p_formValues["SexProCom"]) + parseInt(p_formValues["FliProCom"])
                    + parseInt(p_formValues["NinVulProCom"]) + parseInt(p_formValues["AdoVulProCom"]) + parseInt(p_formValues["AduVulProCom"])
                    + parseInt(p_formValues["LgtVulProCom"]) + parseInt(p_formValues["FisVulProCom"]) + parseInt(p_formValues["MenVulProCom"])
                    + parseInt(p_formValues["CalVulProCom"]) + parseInt(p_formValues["ConVulProCom"]) + parseInt(p_formValues["DesSocProCom"])
                    + parseInt(p_formValues["ObeSocProCom"]) + parseInt(p_formValues["TraSocProCom"]) + parseInt(p_formValues["CroSocProCom"])
                    + parseInt(p_formValues["OncSocProCom"]) + parseInt(p_formValues["BucSocProCom"]) + parseInt(p_formValues["AmbProCom"])
                    + parseInt(p_formValues["OtrProCom"]),
                },
            ]
        },
        {
            id: 13,
            title: "Derivación, Ref./Con. Ref.",
            data: [
                {
                    id: "0TotDeriva",
                    data: parseInt(p_formValues["VioDeriva"]) + parseInt(p_formValues["MalDeriva"]) + parseInt(p_formValues["AbuDeriva"])
                    + parseInt(p_formValues["EmbDeriva"]) + parseInt(p_formValues["SexDeriva"]) + parseInt(p_formValues["FliDeriva"])
                    + parseInt(p_formValues["NinVulDeriva"]) + parseInt(p_formValues["AdoVulDeriva"]) + parseInt(p_formValues["AduVulDeriva"])
                    + parseInt(p_formValues["LgtVulDeriva"]) + parseInt(p_formValues["FisVulDeriva"]) + parseInt(p_formValues["MenVulDeriva"])
                    + parseInt(p_formValues["CalVulDeriva"]) + parseInt(p_formValues["ConVulDeriva"]) + parseInt(p_formValues["DesSocDeriva"])
                    + parseInt(p_formValues["ObeSocDeriva"]) + parseInt(p_formValues["TraSocDeriva"]) + parseInt(p_formValues["CroSocDeriva"])
                    + parseInt(p_formValues["OncSocDeriva"]) + parseInt(p_formValues["BucSocDeriva"]) + parseInt(p_formValues["AmbDeriva"])
                    + parseInt(p_formValues["OtrDeriva"]),
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

        const response = await postFiles(data ? "trabajo-social/editar.php" : "trabajo-social/nuevo.php", {
            id_usuario: usuario.id_usuario,
            id_trabajo_social: data ? data.id_trabajo_social : false,
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

        const response = await postFiles("trabajo-social/inconsistencias.php", {
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

            const response = await postData("trabajo-social/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_trabajo_social: globalsContext.idEdit,
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
            name: "Personas atendidas",
            fields: [
                {
                    dataName: "cantGenero", label: "No Binarias LGTBIQ+", controlType: "textField",
                    initialValue: data ? data.cantGenero : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "cantOriginarios", label: "Pueblos Originarios", controlType: "textField",
                    initialValue: data ? data.cantOriginarios : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "Otras prestaciones realizadas",
            fields: [
                {
                    dataName: "cantInformes", label: "Informes", controlType: "textField",
                    initialValue: data ? data.cantInformes : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "cantDiagnosticos", label: "Diagnósticos Sociales", controlType: "textField",
                    initialValue: data ? data.cantDiagnosticos : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "cantInvestigacion", label: "Proceso de Investigación", controlType: "textField",
                    initialValue: data ? data.cantInvestigacion : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "1 - Violencia de Género",
            fields: [
                {
                    dataName: "VioConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.VioConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "VioConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.VioConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "VioConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.VioConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "VioIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.VioIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "VioIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.VioIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "VioArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.VioArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "VioProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.VioProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "VioProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.VioProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "VioDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.VioDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "2 - Maltrato Infantil",
            fields: [
                {
                    dataName: "MalConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.MalConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "MalConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.MalConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MalConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.MalConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MalIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.MalIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MalIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.MalIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MalArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.MalArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MalProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.MalProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MalProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.MalProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MalDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.MalDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "3 - Abuso sexual en niñas, niños y adolescentes",
            fields: [
                {
                    dataName: "AbuConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.AbuConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "AbuConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.AbuConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AbuConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.AbuConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AbuIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.AbuIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AbuIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.AbuIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AbuArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.AbuArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AbuProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.AbuProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AbuProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.AbuProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AbuDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.AbuDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "4 - Embarazo adolescente",
            fields: [
                {
                    dataName: "EmbConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.EmbConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "EmbConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.EmbConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "EmbConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.EmbConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "EmbIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.EmbIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "EmbIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.EmbIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "EmbArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.EmbArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "EmbProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.EmbProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "EmbProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.EmbProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "EmbDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.EmbDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "5 - Salud sexual y (no) reproductiva",
            fields: [
                {
                    dataName: "SexConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.SexConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "SexConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.SexConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "SexConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.SexConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "SexIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.SexIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "SexIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.SexIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "SexArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.SexArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "SexProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.SexProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "SexProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.SexProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "SexDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.SexDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "6 - Situaciones fliares complejas",
            fields: [
                {
                    dataName: "FliConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.FliConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "FliConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.FliConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FliConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.FliConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FliIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.FliIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FliIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.FliIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FliArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.FliArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FliProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.FliProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FliProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.FliProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FliDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.FliDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "7a - Personas en situación de vulnerabilidad - Niños/niñas",
            fields: [
                {
                    dataName: "NinVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.NinVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "NinVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.NinVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "NinVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.NinVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "NinVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.NinVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "NinVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.NinVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "NinVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.NinVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "NinVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.NinVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "NinVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.NinVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "NinVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.NinVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "7b - Personas en situación de vulnerabilidad - Adolescentes",
            fields: [
                {
                    dataName: "AdoVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.AdoVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "AdoVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.AdoVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AdoVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.AdoVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AdoVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.AdoVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AdoVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.AdoVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AdoVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.AdoVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AdoVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.AdoVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AdoVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.AdoVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AdoVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.AdoVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "7c - Personas en situación de vulnerabilidad - Adultos mayores",
            fields: [
                {
                    dataName: "AduVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.AduVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "AduVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.AduVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AduVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.AduVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AduVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.AduVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AduVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.AduVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AduVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.AduVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AduVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.AduVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AduVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.AduVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AduVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.AduVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "7d - Personas en situación de vulnerabilidad - LGTBIQ+",
            fields: [
                {
                    dataName: "LgtVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.LgtVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "LgtVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.LgtVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "LgtVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.LgtVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "LgtVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.LgtVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "LgtVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.LgtVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "LgtVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.LgtVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "LgtVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.LgtVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "LgtVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.LgtVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "LgtVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.LgtVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "7e - Personas en situación de vulnerabilidad - Con discapacidad física",
            fields: [
                {
                    dataName: "FisVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.FisVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "FisVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.FisVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FisVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.FisVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FisVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.FisVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FisVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.FisVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FisVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.FisVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FisVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.FisVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FisVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.FisVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "FisVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.FisVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "7f - Personas en situación de vulnerabilidad - Con discapacidad mental",
            fields: [
                {
                    dataName: "MenVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.MenVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "MenVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.MenVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MenVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.MenVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MenVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.MenVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MenVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.MenVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MenVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.MenVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MenVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.MenVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MenVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.MenVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "MenVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.MenVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "7g - Personas en situación de vulnerabilidad - En situación de calle",
            fields: [
                {
                    dataName: "CalVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.CalVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "CalVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.CalVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CalVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.CalVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CalVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.CalVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CalVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.CalVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CalVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.CalVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CalVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.CalVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CalVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.CalVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CalVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.CalVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "7h - Personas en situación de vulnerabilidad - Con consumos problemáticos",
            fields: [
                {
                    dataName: "ConVulConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.ConVulConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "ConVulConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.ConVulConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ConVulConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.ConVulConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ConVulIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.ConVulIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ConVulIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.ConVulIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ConVulArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.ConVulArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ConVulProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.ConVulProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ConVulProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.ConVulProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ConVulDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.ConVulDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "8a - Problemas de salud - Desnutrición / bajo peso",
            fields: [
                {
                    dataName: "DesSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.DesSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "DesSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.DesSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "DesSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.DesSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "DesSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.DesSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "DesSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.DesSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "DesSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.DesSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "DesSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.DesSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "DesSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.DesSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "DesSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.DesSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "8b - Problemas de salud - Obesidad",
            fields: [
                {
                    dataName: "ObeSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.ObeSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "ObeSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.ObeSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ObeSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.ObeSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ObeSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.ObeSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ObeSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.ObeSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ObeSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.ObeSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ObeSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.ObeSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ObeSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.ObeSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "ObeSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.ObeSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "8c - Problemas de salud - Enfermedades transmisibles",
            fields: [
                {
                    dataName: "TraSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.TraSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "TraSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.TraSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "TraSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.TraSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "TraSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.TraSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "TraSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.TraSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "TraSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.TraSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "TraSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.TraSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "TraSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.TraSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "TraSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.TraSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "8d - Problemas de salud - Enfermedades crónicas",
            fields: [
                {
                    dataName: "CroSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.CroSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "CroSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.CroSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CroSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.CroSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CroSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.CroSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CroSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.CroSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CroSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.CroSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CroSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.CroSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CroSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.CroSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "CroSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.CroSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "8e - Problemas de salud - Enfermedades oncológicas",
            fields: [
                {
                    dataName: "OncSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.OncSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "OncSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.OncSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OncSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.OncSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OncSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.OncSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OncSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.OncSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OncSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.OncSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OncSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.OncSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OncSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.OncSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OncSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.OncSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "9 - Salud bucal",
            fields: [
                {
                    dataName: "BucSocConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.BucSocConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "BucSocConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.BucSocConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "BucSocConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.BucSocConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "BucSocIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.BucSocIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "BucSocIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.BucSocIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "BucSocArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.BucSocArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "BucSocProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.BucSocProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "BucSocProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.BucSocProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "BucSocDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.BucSocDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "10 - Problemáticas medio ambiente",
            fields: [
                {
                    dataName: "AmbConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.AmbConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "AmbConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.AmbConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AmbConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.AmbConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AmbIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.AmbIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AmbIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.AmbIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AmbArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.AmbArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AmbProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.AmbProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AmbProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.AmbProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "AmbDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.AmbDeriva : '',
                    validationSchema: yup.number().min(0).required(),
                },
            ],
        },
        {
            name: "11 - Otros",
            fields: [
                {
                    dataName: "OtrConPri", label: "Consultas/Atenciones 1° Vez", controlType: "textField",
                    initialValue: data ? data.OtrConPri : '',
                    validationSchema: yup.number().min(0).required(),
                    autoFocus: true,
                },
                {
                    dataName: "OtrConUlt", label: "Consultas/Atenciones Ulterior", controlType: "textField",
                    initialValue: data ? data.OtrConUlt : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OtrConNex", label: "Consultas/Atenciones Nexo", controlType: "textField",
                    initialValue: data ? data.OtrConNex : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OtrIntDom", label: "Int. en Terreno (Domi.)", controlType: "textField",
                    initialValue: data ? data.OtrIntDom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OtrIntIns", label: "Int. en Terreno (Ins./Org.)", controlType: "textField",
                    initialValue: data ? data.OtrIntIns : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OtrArticu", label: "Articulación", controlType: "textField",
                    initialValue: data ? data.OtrArticu : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OtrProSer", label: "Prom./Prev. (servicio)", controlType: "textField",
                    initialValue: data ? data.OtrProSer : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OtrProCom", label: "Prom./Prev. (comunidad)", controlType: "textField",
                    initialValue: data ? data.OtrProCom : '',
                    validationSchema: yup.number().min(0).required(),
                },
                {
                    dataName: "OtrDeriva", label: "Derivación (Ref./Con. Ref.)", controlType: "textField",
                    initialValue: data ? data.OtrDeriva : '',
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
                    validationSchema: yup.string().max(5000),
                    autoFocus: true,
                },
            ],
        },
    ], [data, usuario.id_establecimiento, establecimientos]);

    return (
        <Fragment>
            <Layout nombrePagina={data ? "Corrección de Trabajo Social" : "Nuevo Informe de Trabajo Social"}>
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