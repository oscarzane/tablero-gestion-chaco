import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Grid, useTheme } from '@mui/material';
import { darkColors } from './colors';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Legend, Tooltip, CategoryScale, LinearScale, BarElement } from 'chart.js';

export function ChartBar(props) {
    const {
        data = false,
    } = props;

    ChartJS.register(Title, Legend, Tooltip, CategoryScale, LinearScale, BarElement);

    const theme = useTheme();
    const prefersDarkMode = theme.palette.mode === "dark";

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
        legend: {
            display: false,
        },
        scales: {
            x: {
                grid: { color: "rgba(255,255,255,.15)", },
                ticks: { color: prefersDarkMode ? 'white' : "black", },
                stacked: true,
            },
            y: {
                grid: { color: "rgba(255,255,255,.15)", },
                ticks: {
                    color: prefersDarkMode ? 'white' : "black",
                    callback: (val) => { if (val % 1 === 0) { return val; } },
                },
                stacked: true,
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
                    backgroundColor: darkColors[ds.color],
                });
            });
            return t_d;
        })(),
    };

    return (
        <Grid item xs={12} sm={6} md={12} lg={6} xl={6}>
            <Bar options={chartOptions} data={chartData} />
        </Grid>
    );
}