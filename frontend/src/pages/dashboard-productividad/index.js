import React, { useState, useContext, Fragment, useEffect, useMemo } from 'react';
import Layout from '../../components/layout/main';
import { makeStyles } from 'tss-react/mui';
import { Fade, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Skeleton, Typography } from '@mui/material';
import { AuthContext } from '../../context/auth';
import { ChartManager } from '../../components/chart';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Formatter } from '../../const/formatter';
import { postData } from '../../services/ajax';
import { enqueueSnackbar } from 'notistack';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { asignarLabelAndColor, ChartManagerV2, TipoGrafico } from '../../components/chart-v2';
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

    const [ano, setAno] = useState(currentDate.getMonth() > 0 ? currentDate.getFullYear() : currentDate.getFullYear() - 1);
    const [mes, setMes] = useState(0);

    const handleChangeAno = (e) => {
        setAno(e.target.value);
    };
    const handleChangeMes = (e) => {
        setMes(e.target.value);
    };

    const [productividadData, setProductividadData] = useState([]);
    const [productividadVariantes, setProductividadVariantes] = useState([]);
    const [productividadAgrupaciones, setProductividadAgrupaciones] = useState([]);
    const readProductividad = async (p_id_usuario, p_ano, p_mes) => {
        setProductividadData(null);

        const response = await postData("usuario/grafico-productividad.php", {
            id_usuario: p_id_usuario,
            ano: p_ano,
            mes: p_mes
        });

        if (response.error === "") {
            setProductividadData(asignarLabelAndColor(response.data.entidades, response.data.variantes));
            setProductividadVariantes(response.data.variantes);
            setProductividadAgrupaciones(response.data.agrupaciones);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }


    };

    useEffect(() => {
        readProductividad(usuario.id_usuario, ano, mes);
    }, [usuario.id_usuario, ano, mes]);

    return (
        <Layout nombrePagina="Panel de productividad">
            <Fade in={true} timeout={1000}>
                <Grid item xs={12}>
                    <h1>Panel de productividad</h1>

                    <p>
                        Aquí puedes observar la productividad por tareas realizadas en el sistema.
                        Puedes utilizar los controles de aquí debajo para personalizar la información obtenida.
                    </p>

                    <Grid item xs={12} lg={9} xl={6} className={classes.selectContainer}>
                        <FormControl variant="filled" className={classes.select}>
                            <InputLabel id="ano-select-label">Año</InputLabel>
                            <Select
                                labelId="ano-select-label"
                                id="ano-select"
                                value={ano}
                                label="Año"
                                onChange={handleChangeAno}
                            >
                                {Formatter.anosDatos.map((a) => (
                                    <MenuItem value={a.id} key={Formatter.anosDatos.indexOf(a)}>{a.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="filled" className={classes.select}>
                            <InputLabel id="mes-select-label">Mes</InputLabel>
                            <Select
                                labelId="mes-select-label"
                                id="mes-select"
                                value={mes}
                                label="Mes"
                                onChange={handleChangeMes}
                            >
                                <MenuItem value={0} key={0}>Todos</MenuItem>
                                {Formatter.meses.map((a) => (
                                    <MenuItem value={a.id} key={Formatter.meses.indexOf(a)}>{a.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Fade>

            {productividadData == null ?
                <Fade in={true} timeout={900}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                        <Paper className={classes.paper}>
                            <Skeleton variant="rectangular" height={400} />
                        </Paper>
                    </Grid>
                </Fade>
                :
                productividadData.map((entidad, index) => {
                    return (<Fade in={true} timeout={900}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.title} color="inherit" variant="h6" component="div">
                                    {entidad.label}
                                </Typography>

                                <ChartManagerV2
                                    data={entidad.data}
                                    agrupaciones={productividadAgrupaciones}
                                    variantes={productividadVariantes}
                                    mostrarBarra={true}
                                    mostratTorta={true}
                                    titulo={mes == 0 ? "Productividad por Mes" : "Productividad por día"}
                                />
                            </Paper>
                        </Grid>
                    </Fade>);
                })
            }

        </Layout>
    );
}

export default Page;