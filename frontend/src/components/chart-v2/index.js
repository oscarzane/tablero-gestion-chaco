import React, { useState, useContext, useEffect, Fragment, useMemo } from 'react';
import { makeStyles } from 'tss-react/mui';
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

export const TipoGrafico = {
    barra: 0,
    torta: 1,
};

export const asignarLabelAndColor = (entidad, labels) => {
    //recorro las entidades
    for (var i = 0; i < entidad.length; i++) {//i es para entidad
        //recorro las agrupaciones de datos
        for (var j = 0; j < entidad[i].data.length; j++) {//j es para data
            entidad[i].data[j].label = labels[j].label;
            entidad[i].data[j].color = j;
        }
    }

    return entidad;
};


export function ChartManagerV2(props) {
    const { classes } = useStyles();
    const {
        data = [],
        agrupaciones = [],
        variantes = [],
        mostrarBarra = true,
        mostrarTorta = true,
        titulo = ""
    } = props;

    const [importantData, setImportantData] = useState(null);//data.resume en la bd

    const graficoBarra = () => {
        var t_dataGrafico = {
            title: titulo,
            labels: agrupaciones,
            datasets: [],
        };
        for (var i = 0; i < data.length; i++) {
            if (sumaArray(data[i].data) > 0)
                t_dataGrafico.datasets.push({
                    id: data[i].id,
                    data: data[i].data,
                    color: data[i].color,
                    label: data[i].label
                });
        }

        return <ChartBar data={t_dataGrafico} />;
    }
    const graficoTorta = () => {
        var t_dataGrafico = {
            title: titulo,
            labels: [],
            datasets: [],
        };

        var t_data = [];
        var t_color = [];
        var t_labels = [];

        for (var i = 0; i < data.length; i++) {
            if (sumaArray(data[i].data) > 0) {
                t_data.push(sumaArray(data[i].data));
                t_color.push(data[i].color);
                t_labels.push(data[i].label)
            }
        }

        t_dataGrafico.labels = t_labels;
        t_dataGrafico.datasets.push({
            data: t_data,
            color: t_color,
        });

        return <ChartDoughnut data={t_dataGrafico} />;
    };
    //permite saber si un array esta compuesto por ceros
    const sumaArray = (p_data) => {
        var t_suma = 0;
        for (var i = 0; i < p_data.length; i++)
            t_suma += p_data[i] * 1;
        return t_suma;
    };

    return (
        <Fragment>
            <div className={classes.dataContainer}>
                {importantData && importantData.map((a) => (
                    a.nombre != "" ?
                        <div className={importantData.length > 3 ? classes.importantData50 : classes.importantData} key={importantData.indexOf(a)}>
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
                {mostrarBarra ? graficoBarra() : null}
                {mostrarTorta ? graficoTorta() : null}
            </Grid>
        </Fragment>
    );
}