import React from 'react';
import { Grid, useTheme } from '@mui/material';
import { darkColors } from './colors';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Legend, Tooltip } from 'chart.js';


export function ChartDoughnut(props) {
    const {
        data = false,
    } = props;

    const theme = useTheme();
    const prefersDarkMode = theme.palette.mode === "dark";

    ChartJS.register(ArcElement, Title, Legend, Tooltip);

    const chartOptions = {
        color: prefersDarkMode ? 'white' : "black",
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: data.title,
                color: prefersDarkMode ? 'white' : "black",
            },
        },
        aspectRatio: 1
    };

    const chartData = {
        labels: [...data.labels],
        datasets: (() => {
            var t_d = [];
            data.datasets.forEach(ds => {
                t_d.push({
                    label: ds.label,
                    data: ds.data,
                    backgroundColor: (() => {
                        var t_color = [];
                        ds.color.forEach(dsc => {
                            t_color.push(darkColors[dsc]);
                        });
                        return t_color;
                    })(),
                    borderWidth: 1,
                });
            });
            return t_d;
        })(),
    };

    return (
        <Grid item xs={12} sm={6} md={12} lg={6} xl={6}>
            <Doughnut options={chartOptions} data={chartData} />
        </Grid>
    );
}