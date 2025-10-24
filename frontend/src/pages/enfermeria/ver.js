import React, { useContext, useState, useEffect, Fragment, useCallback, useMemo } from 'react';
import Layout from '../../components/layout/main';
import { makeStyles } from 'tss-react/mui';
import { Fade, Grid, Paper } from '@mui/material';
import * as yup from 'yup';
import { postData } from '../../services/ajax';
import { AuthContext } from '../../context/auth';
import { LoadingModalContext } from '../../components/modal/loading';
import { AlertModalContext } from '../../components/modal/alert';
import { setYupLocaleES } from '../../const/yup';
import { useNavigate } from 'react-router-dom';
import { CustomForm } from '../../components/formSections';
import { GlobalsContext } from '../../context/globals';
import { useSnackbar } from 'notistack';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

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
            title: "Días de atención",
            data: [
                {
                    id: "0totDias",
                    data: parseInt(p_formValues["totDias"])
                },
            ]
        },
        {
            id: 1,
            title: "Personas atendidas",
            data: [
                {
                    id: "1totPersonas",
                    data: parseInt(p_formValues["totPersonas"])
                },
            ]
        },
        {
            id: 2,
            title: "Actividades realizadas",
            data: [
                {
                    id: "2totalActividades",
                    data: parseInt(p_formValues["consulSintomas"]) + parseInt(p_formValues["atenEnfermeria"]) + parseInt(p_formValues["accionPreventiva"])
                        + parseInt(p_formValues["tratamientoEnfer"]) + parseInt(p_formValues["controlEmbarazos"]) + parseInt(p_formValues["controlNinos"])
                        + parseInt(p_formValues["derivacion"]),
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

    const [establecimientos, setEstablecimientos] = useState([]);

    //Modals
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();


    const onCancel = () => {
        navigate(-1);
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

            const response = await postData("enfermeria/leer-id.php", {
                id_usuario: usuario.id_usuario,
                id_enfermeria: globalsContext.idEdit,
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
                    disabled: true,
                },
                {
                    dataName: "fechaa", label: "Año", controlType: "textField",
                    initialValue: data ? data.fechaa : '',
                    validationSchema: yup.number().required().positive().min(2021).max(2030),
                    disabled: true,
                },
            ],
        },
        {
            name: "Signos vitales",
            fields: [
                {
                    dataName: "sig_vit", label: "Signos vitales", controlType: "textField",
                    initialValue: data ? data.sig_vit : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "tc_axi", label: "T°C Axilar", controlType: "textField",
                    initialValue: data ? data.tc_axi : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "tc_rec", label: "T°C Rectal", controlType: "textField",
                    initialValue: data ? data.tc_rec : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ta", label: "T.A", controlType: "textField",
                    initialValue: data ? data.ta : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "f_res", label: "F. Resp", controlType: "textField",
                    initialValue: data ? data.f_res : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "f_car", label: "F. Card", controlType: "textField",
                    initialValue: data ? data.f_car : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "spo2", label: "SPO2", controlType: "textField",
                    initialValue: data ? data.spo2 : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Medicamentos y vacunas",
            fields: [
                {
                    dataName: "adm_med", label: "Administ. de Medicamentos", controlType: "textField",
                    initialValue: data ? data.adm_med : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "ev", label: "E.V", controlType: "textField",
                    initialValue: data ? data.ev : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "im", label: "I.M", controlType: "textField",
                    initialValue: data ? data.im : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "sc", label: "S.C", controlType: "textField",
                    initialValue: data ? data.sc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "id", label: "I.D", controlType: "textField",
                    initialValue: data ? data.id : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "vo", label: "V.O", controlType: "textField",
                    initialValue: data ? data.vo : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "tot_vac", label: "Total Vacunas Administradas", controlType: "textField",
                    initialValue: data ? data.tot_vac : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Tratamientos por via respiratoria en internación abreviada",
            fields: [
                {
                    dataName: "paff", label: "Serie de Paff", controlType: "textField",
                    initialValue: data ? data.paff : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "p_hp", label: "PHP", controlType: "textField",
                    initialValue: data ? data.p_hp : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "oxi_mas", label: "Oxigenoterapia por máscara", controlType: "textField",
                    initialValue: data ? data.oxi_mas : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "nebu", label: "Nebulizaciones", controlType: "textField",
                    initialValue: data ? data.nebu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "rcp", label: "RCP", controlType: "textField",
                    initialValue: data ? data.rcp : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Control sano (menor de 1 año)",
            fields: [
                {
                    dataName: "cs_m1_pes", label: "Peso", controlType: "textField",
                    initialValue: data ? data.cs_m1_pes : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "cs_m1_tal", label: "Talla", controlType: "textField",
                    initialValue: data ? data.cs_m1_tal : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_m1_cef", label: "Perim. cefálico", controlType: "textField",
                    initialValue: data ? data.cs_m1_cef : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_m1_ten", label: "Tens. arterial", controlType: "textField",
                    initialValue: data ? data.cs_m1_ten : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_m1_imc", label: "I.M.C", controlType: "textField",
                    initialValue: data ? data.cs_m1_imc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Control sano (1 año)",
            fields: [
                {
                    dataName: "cs_1_pes", label: "Peso", controlType: "textField",
                    initialValue: data ? data.cs_1_pes : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "cs_1_tal", label: "Talla", controlType: "textField",
                    initialValue: data ? data.cs_1_tal : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_1_cef", label: "Perim. cefálico", controlType: "textField",
                    initialValue: data ? data.cs_1_cef : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_1_ten", label: "Tens. arterial", controlType: "textField",
                    initialValue: data ? data.cs_1_ten : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_1_abd", label: "Perim. Abdominal", controlType: "textField",
                    initialValue: data ? data.cs_1_abd : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_1_imc", label: "I.M.C", controlType: "textField",
                    initialValue: data ? data.cs_1_imc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Control sano (2 a 5 años)",
            fields: [
                {
                    dataName: "cs_2a5_pes", label: "Peso", controlType: "textField",
                    initialValue: data ? data.cs_2a5_pes : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "cs_2a5_tal", label: "Talla", controlType: "textField",
                    initialValue: data ? data.cs_2a5_tal : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_2a5_cef", label: "Perim. cefálico", controlType: "textField",
                    initialValue: data ? data.cs_2a5_cef : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_2a5_ten", label: "Tens. arterial", controlType: "textField",
                    initialValue: data ? data.cs_2a5_ten : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_2a5_abd", label: "Perim. Abdominal", controlType: "textField",
                    initialValue: data ? data.cs_2a5_abd : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_2a5_imc", label: "I.M.C", controlType: "textField",
                    initialValue: data ? data.cs_2a5_imc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Control sano (6 a 9 años)",
            fields: [
                {
                    dataName: "cs_6a9_pes", label: "Peso", controlType: "textField",
                    initialValue: data ? data.cs_6a9_pes : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "cs_6a9_tal", label: "Talla", controlType: "textField",
                    initialValue: data ? data.cs_6a9_tal : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_6a9_cef", label: "Perim. cefálico", controlType: "textField",
                    initialValue: data ? data.cs_6a9_cef : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_6a9_ten", label: "Tens. arterial", controlType: "textField",
                    initialValue: data ? data.cs_6a9_ten : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_6a9_abd", label: "Perim. Abdominal", controlType: "textField",
                    initialValue: data ? data.cs_6a9_abd : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_6a9_imc", label: "I.M.C", controlType: "textField",
                    initialValue: data ? data.cs_6a9_imc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Control sano (10 a 14 años)",
            fields: [
                {
                    dataName: "cs_10a14_pes", label: "Peso", controlType: "textField",
                    initialValue: data ? data.cs_10a14_pes : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "cs_10a14_tal", label: "Talla", controlType: "textField",
                    initialValue: data ? data.cs_10a14_tal : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_10a14_cef", label: "Perim. cefálico", controlType: "textField",
                    initialValue: data ? data.cs_10a14_cef : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_10a14_ten", label: "Tens. arterial", controlType: "textField",
                    initialValue: data ? data.cs_10a14_ten : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_10a14_abd", label: "Perim. Abdominal", controlType: "textField",
                    initialValue: data ? data.cs_10a14_abd : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_10a14_imc", label: "I.M.C", controlType: "textField",
                    initialValue: data ? data.cs_10a14_imc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Control sano (15 a 19 años)",
            fields: [
                {
                    dataName: "cs_15a19_pes", label: "Peso", controlType: "textField",
                    initialValue: data ? data.cs_15a19_pes : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "cs_15a19_tal", label: "Talla", controlType: "textField",
                    initialValue: data ? data.cs_15a19_tal : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_15a19_cef", label: "Perim. cefálico", controlType: "textField",
                    initialValue: data ? data.cs_15a19_cef : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_15a19_ten", label: "Tens. arterial", controlType: "textField",
                    initialValue: data ? data.cs_15a19_ten : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_15a19_abd", label: "Perim. Abdominal", controlType: "textField",
                    initialValue: data ? data.cs_15a19_abd : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_15a19_imc", label: "I.M.C", controlType: "textField",
                    initialValue: data ? data.cs_15a19_imc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Control sano (20 a 49 años)",
            fields: [
                {
                    dataName: "cs_20a49_pes", label: "Peso", controlType: "textField",
                    initialValue: data ? data.cs_20a49_pes : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "cs_20a49_tal", label: "Talla", controlType: "textField",
                    initialValue: data ? data.cs_20a49_tal : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_20a49_cef", label: "Perim. cefálico", controlType: "textField",
                    initialValue: data ? data.cs_20a49_cef : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_20a49_ten", label: "Tens. arterial", controlType: "textField",
                    initialValue: data ? data.cs_20a49_ten : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_20a49_abd", label: "Perim. Abdominal", controlType: "textField",
                    initialValue: data ? data.cs_20a49_abd : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_20a49_imc", label: "I.M.C", controlType: "textField",
                    initialValue: data ? data.cs_20a49_imc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Control sano (50 años o más)",
            fields: [
                {
                    dataName: "cs_50_pes", label: "Peso", controlType: "textField",
                    initialValue: data ? data.cs_50_pes : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "cs_50_tal", label: "Talla", controlType: "textField",
                    initialValue: data ? data.cs_50_tal : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_50_cef", label: "Perim. cefálico", controlType: "textField",
                    initialValue: data ? data.cs_50_cef : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_50_ten", label: "Tens. arterial", controlType: "textField",
                    initialValue: data ? data.cs_50_ten : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_50_imc", label: "I.M.C", controlType: "textField",
                    initialValue: data ? data.cs_50_imc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Control sano (embarazadas)",
            fields: [
                {
                    dataName: "cs_emb_pes", label: "Peso", controlType: "textField",
                    initialValue: data ? data.cs_emb_pes : '',
                    validationSchema: yup.number().required().positive().min(0),
                    disabled: true,
                },
                {
                    dataName: "cs_emb_tal", label: "Talla", controlType: "textField",
                    initialValue: data ? data.cs_emb_tal : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_emb_ten", label: "Tens. arterial", controlType: "textField",
                    initialValue: data ? data.cs_emb_ten : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "cs_emb_imc", label: "I.M.C", controlType: "textField",
                    initialValue: data ? data.cs_emb_imc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Otros",
            fields: [
                {
                    dataName: "glu_cap", label: "Glucemia capilar", controlType: "textField",
                    initialValue: data ? data.glu_cap : '',
                    validationSchema: yup.number().required().min(0),
                    disabled: true,
                },
                {
                    dataName: "met_fis", label: "Aplicación metodo fisico", controlType: "textField",
                    initialValue: data ? data.met_fis : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "lav_oti", label: "Lavejes oticos", controlType: "textField",
                    initialValue: data ? data.lav_oti : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "lav_oft", label: "Lavaje oftalmicos", controlType: "textField",
                    initialValue: data ? data.lav_oft : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "int_abr", label: "Internaciones abreviadas varias", controlType: "textField",
                    initialValue: data ? data.int_abr : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Actividades de terreno",
            fields: [
                {
                    dataName: "con_enf", label: "Consultas de enfermería", controlType: "textField",
                    initialValue: data ? data.con_enf : '',
                    validationSchema: yup.number().required().min(0),
                    disabled: true,
                },
                {
                    dataName: "ate_dom", label: "Atención domiciliaria", controlType: "textField",
                    initialValue: data ? data.ate_dom : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ron_san", label: "Ronda sanitaria", controlType: "textField",
                    initialValue: data ? data.ron_san : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "citaciones", label: "Citaciones", controlType: "textField",
                    initialValue: data ? data.citaciones : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "pre_pro", label: "Charlas de prevención y promoción", controlType: "textField",
                    initialValue: data ? data.pre_pro : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "blo_foc", label: "Bloqueo de focos", controlType: "textField",
                    initialValue: data ? data.blo_foc : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "tra_int", label: "Trabajos interinstitucional", controlType: "textField",
                    initialValue: data ? data.tra_int : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Curaciones",
            fields: [
                {
                    dataName: "curaciones", label: "Curaciones", controlType: "textField",
                    initialValue: data ? data.curaciones : '',
                    validationSchema: yup.number().required().min(0),
                    disabled: true,
                },
                {
                    dataName: "suturas", label: "Suturas", controlType: "textField",
                    initialValue: data ? data.suturas : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "ext_pun", label: "Extracciones de puntos", controlType: "textField",
                    initialValue: data ? data.ext_pun : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Metodos de esterilización",
            fields: [
                {
                    dataName: "est_est", label: "Estufa", controlType: "textField",
                    initialValue: data ? data.est_est : '',
                    validationSchema: yup.number().required().min(0),
                    disabled: true,
                },
                {
                    dataName: "est_aut", label: "Autoclave", controlType: "textField",
                    initialValue: data ? data.est_aut : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "est_oll", label: "Olla a presión", controlType: "textField",
                    initialValue: data ? data.est_oll : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Total derivados del mes",
            fields: [
                {
                    dataName: "der_neo", label: "Neonatales", controlType: "textField",
                    initialValue: data ? data.der_neo : '',
                    validationSchema: yup.number().required().min(0),
                    disabled: true,
                },
                {
                    dataName: "der_ped", label: "Pediátricos", controlType: "textField",
                    initialValue: data ? data.der_ped : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
                {
                    dataName: "der_adu", label: "Adultos", controlType: "textField",
                    initialValue: data ? data.der_adu : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Totales mensuales",
            fields: [
                {
                    dataName: "pac_ate", label: "Total pacientes atendidos", controlType: "textField",
                    initialValue: data ? data.pac_ate : '',
                    validationSchema: yup.number().required().min(0),
                    disabled: true,
                },
                {
                    dataName: "pre_rea", label: "Total prestaciones realizadas", controlType: "textField",
                    initialValue: data ? data.pre_rea : '',
                    validationSchema: yup.number().min(0).required(),
                    disabled: true,
                },
            ],
        },
        {
            name: "Observaciones",
            fields: [
                {
                    dataName: "observaciones", label: "Observaciones", controlType: "textFieldXL",
                    initialValue: data ? data.observaciones : '',
                    validationSchema: yup.string().max(500),
                    disabled: true,
                },
            ],
        },
    ], [data, usuario.id_establecimiento, establecimientos]);

    return (
        <Fragment>
            <Layout nombrePagina={"Ver Informe de Prest. de Enfermería"}>
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
                                onSubmit={onCancel}
                                onCancel={onCancel}
                                submitButtonText={"Volver"}
                                cancelButtonText={"Cancelar"}
                                stepperType={""}
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