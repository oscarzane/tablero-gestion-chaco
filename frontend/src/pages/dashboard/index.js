import React, { useState, useContext, Fragment, useEffect, useMemo } from 'react';
import Layout from '../../components/layout/main';
import { makeStyles } from 'tss-react/mui';
import { Fade, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import { AuthContext } from '../../context/auth';
import { ChartManager } from '../../components/chart';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Formatter } from '../../const/formatter';
import { postData } from '../../services/ajax';
import { enqueueSnackbar } from 'notistack';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
//import styles from './style.module.scss';

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: "column",
        overflow: 'auto',
        height: '100%',
    },
    title: {
        textAlign: "center",
        margin: "8px",
    },
    selectContainer: {
        display: "flex",
        flexWrap: "wrap",
    },
    select: {
        flexGrow: "1",
        [theme.breakpoints.up('lg')]: {
            margin: "0 4px 0 0",
            padding: "0 4px 0 0",
        },
        margin: "2px",
        padding: "2px",
    },
    warningMensaje: {
        display: "flex",
        color: "#F70",
        alignItems: "center",
        "svg": { margin: "8px", },
    },
}));

function Page() {
    const { classes } = useStyles();
    let currentDate = new Date();

    //Auxiliar data
    const { usuario } = useContext(AuthContext);
    const [verPor, setVerPor] = useState((usuario.admin * 1 === 1 || usuario.revisor * 1 === 1) ? "4" : (usuario.solo_region * 1 > 0 ? "3" : "1"));

    const [ano, setAno] = useState(currentDate.getMonth() > 0 ? currentDate.getFullYear() : currentDate.getFullYear() - 1);
    const [region, setRegion] = useState(usuario.region);
    const [establecimiento, setEstablecimiento] = useState(usuario.id_establecimiento == null ? 0 : usuario.id_establecimiento);

    const handleChangeVerPor = (event, newValue) => {
        setVerPor(newValue);
    };
    const handleChangeAno = (e) => {
        setAno(e.target.value);
    };
    const handleChangeRegion = (e) => {
        setRegion(e.target.value);

        readEstablecimientos(e.target.value);
    };
    const handleChangeEstablecimiento = (e) => {
        setEstablecimiento(e.target.value);
    };

    const [estabPorRegion, setEstabPorRegion] = useState([]);
    const readEstablecimientos = async (p_region, p_establecimiento = null) => {
        setRegion(p_region);

        if (p_region == 0) {
            setEstabPorRegion([]);
            setEstablecimiento(0);
        }
        else {
            const response = await postData("establecimiento/leerSimple.php", {
                id_usuario: usuario.id_usuario,
                publicos: 1,//1 solo pub, 2 solo priv, 3 todos
                solo_del_usuario: 1,//1 trae solo los estab del usuario
                region: p_region,//trae solo los de la region seleccionada
            });

            if (response.error === "") {
                setEstabPorRegion(response.data);
                setEstablecimiento(p_establecimiento == null ? 0 : p_establecimiento);
            }
            else {
                enqueueSnackbar(response.error, { variant: "error" });
            }
        }
    };

    const planillasHabilitadasEstab = useMemo(() => {
        let t_result = {
            a_consuextern: region == 0, a_agensanit: region == 0, a_laboratorio: region == 0, a_materinfan: region == 0,
            a_prodmensual: region == 0, a_obstetricia: region == 0, a_recibyderiv: region == 0, a_hospitalizacion: region == 0,
            a_trabajosocial: region == 0, a_enfermeria: region == 0
        };
        //evito calcular todos los establecimiento si estoy mirando todas las regiones
        if (region == 0) return t_result;

        for (var i = 0; i < estabPorRegion.length; i++) {
            //tomo en cuenta todos los establecimientos, salvo que este seleccionado uno
            if (establecimiento == 0 || establecimiento == estabPorRegion[i].id) {
                if (estabPorRegion[i].a_agensanit == 1) t_result.a_agensanit = true;
                if (estabPorRegion[i].a_consuextern == 1) t_result.a_consuextern = true;
                if (estabPorRegion[i].a_hospitalizacion == 1) t_result.a_hospitalizacion = true;
                if (estabPorRegion[i].a_laboratorio == 1) t_result.a_laboratorio = true;
                if (estabPorRegion[i].a_materinfan == 1) t_result.a_materinfan = true;
                if (estabPorRegion[i].a_obstetricia == 1) t_result.a_obstetricia = true;
                if (estabPorRegion[i].a_prodmensual == 1) t_result.a_prodmensual = true;
                if (estabPorRegion[i].a_recibyderiv == 1) t_result.a_recibyderiv = true;
                if (estabPorRegion[i].a_trabajosocial == 1) t_result.a_trabajosocial = true;
                if (estabPorRegion[i].a_enfermeria == 1) t_result.a_enfermeria = true;
            }
        }

        return t_result;
    }, [estabPorRegion, region, establecimiento]);

    useEffect(() => {
        readEstablecimientos(usuario.region, usuario.id_establecimiento);
    }, [usuario.region, usuario.id_establecimiento]);

    return (
        <Layout nombrePagina="Panel de Inicio">
            <Fade in={true} timeout={1000}>
                <Grid item xs={12}>
                    <h1>Sistema de tableros de gestión</h1>

                    <p>
                        Aquí puedes observar el estado de la información en los diferentes tableros de gestión.
                        Utiliza los controles de la derecha para verificar cada tablero.
                        De necesitar el acceso a uno solicitarlo a tablerosalud@chaco.gob.ar
                    </p>

                </Grid>
            </Fade>
        </Layout>
    );
}

export default Page;