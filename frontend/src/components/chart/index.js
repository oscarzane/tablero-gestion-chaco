import React, { useState, useContext, useEffect, Fragment, useMemo } from 'react';
import { makeStyles } from 'tss-react/mui';
import { AuthContext } from '../../context/auth';
import { postData } from '../../services/ajax';
import { useSnackbar } from 'notistack';
import { ChartDoughnut } from './doughnut';
import { ChartBar } from './bar';
import { Grid, Typography } from '@mui/material';
import AnimatedNumber from "react-awesome-animated-number";
import "react-awesome-animated-number/dist/index.css";

const useStyles = makeStyles()((theme) => ({
    chartContainer: {
        /*padding: theme.spacing(2),
        display: 'flex',
        flexWrap: "wrap",*/
    },
    dataContainer: {
        padding: theme.spacing(2),
        display: 'flex',
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        alignItems: "center",
        height: "100%",
    },
    importantData: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        color: theme.palette.primary.main,
    },
    importantData50: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        color: theme.palette.primary.main,
        width: "50%",
    },
}));

export function ChartManager(props) {
    const { classes } = useStyles();
    const {
        url = "",
        barTitle = false,
        doughnutTitle = false,
        ano = 2023,
        region = 0,
        establecimiento = 0,
    } = props;

    const { usuario } = useContext(AuthContext);
    const [resultBD, setResultBD] = useState(null);
    const [importantData, setImportantData] = useState(null);

    //Modals
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    useEffect(() => {
        loadData();
    }, [ano, region, establecimiento]);

    const loadData = async () => {
        setResultBD(null);

        const response = await postData(url, {
            id_usuario: usuario.id_usuario,
            ano: ano,
            region: region,
            establecimiento: establecimiento,
        });

        if (response.error === "") {
            setResultBD(response.data);
            setImportantData(response.data.resume);
        }
        else
            enqueueSnackbar(response.error, { variant: "error" });
    };

    const dataDoughnut = useMemo(() => {
        var labels = [];
        var data = [];
        var color = [];
        if (resultBD) {
            Object.keys(resultBD.estados).forEach(function(key) {
                if (resultBD.estados[key].suma > 0) {
                    labels.push(resultBD.estados[key].label);
                    data.push(resultBD.estados[key].suma);
                    color.push(resultBD.estados[key].color);
                }
            });
        }
        
        return {
            title: doughnutTitle,
            labels: labels,
            datasets: [{
                label: '',
                data: data,
                color: color,
            },],
        };
    }, [resultBD]);

    const dataBar = useMemo(() => {
        var datasets = [];

        if (resultBD) {
            Object.keys(resultBD.estados).forEach(function(key) {
                if (JSON.stringify(resultBD.estados[key].data) != "[0,0,0,0,0,0,0,0,0,0,0,0]") {
                    datasets.push({
                        label: resultBD.estados[key].label,
                        data: resultBD.estados[key].data,
                        color: resultBD.estados[key].color
                    });
                }
            });
        }
        
        return {
            title: barTitle,
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            datasets: datasets,
        };
    }, [resultBD]);

    return (
        <Fragment>
            <div className={classes.dataContainer}>
                {importantData && importantData.map((a) => (
                    a.nombre != "" ?
                        <div className={importantData.length > 3 ? classes.importantData50 : classes.importantData} key={url + importantData.indexOf(a)}>
                            <Typography color="inherit" variant="h4" component="div">
                                <AnimatedNumber
                                    value={a.valor}
                                    hasComma={false}
                                    size={40}
                                    duration={2000}
                                />
                            </Typography>
                            <Typography color="inherit" variant="subtitle2" component="div"> {a.nombre} </Typography>
                        </div> : null
                ))}
            </div>
            <Grid
                container
                className={classes.chartContainer}
                direction="row"
                justifyContent="center"
                wrap="wrap"
            >
                {barTitle ? <ChartBar data={dataBar} /> : ""}

                {doughnutTitle ? <ChartDoughnut data={dataDoughnut} /> : ""}
            </Grid>
        </Fragment>
    );
}