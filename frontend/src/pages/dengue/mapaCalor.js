import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Fade, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../services/ajax/';
import { AuthContext } from '../../context/auth';
import { GlobalsContext } from '../../context/globals';
import { useSnackbar } from 'notistack';
import { AlertModalContext } from '../../components/modal/alert';
import { LoadingModalContext } from '../../components/modal/loading';
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
//import styles from './style.module.scss';

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',

        width: '100%',
        marginBottom: theme.spacing(2),
    },
    fixedHeight: {
        height: 240,
    },
    botonera: {
        display: "flex",
        flexWrap: "wrap",
        marginBottom: theme.spacing(2),
    },
}));

export default function MapaCalor(props) {
    const { classes } = useStyles();
    //Auxiliar data
    const { usuario } = useContext(AuthContext);
    const navigate = useNavigate();
    const globalsContext = useContext(GlobalsContext);
    const { data, radius, opacity } = props;

    //Modals
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const map = useMap();
    const visualizationLib = useMapsLibrary('visualization');
    const coreLib = useMapsLibrary('core');

    const heatmap = useMemo(() => {
        if (visualizationLib)
            return new visualizationLib.HeatmapLayer();
    }, [visualizationLib]);

    useEffect(() => {
        if (!visualizationLib || !coreLib || !map) return;

        var heatMapData = [];
        if (data) {
            for (var i = 0; i < data.length; i++) {
                heatMapData.push({
                    location: new coreLib.LatLng(
                        data[i].latitud,
                        data[i].longitud
                    ),
                    //weight: data[i].gravedad
                });
            }
        }

        heatmap.setData(heatMapData);
        heatmap.setMap(map);
    }, [map, data, visualizationLib, coreLib]);


    return (
        <Fragment>
            <Fade in={true} timeout={900}>
                <Grid item xs={12}>
                    <Map
                        style={{ /*width: '50vw',*/ height: '50vh' }}
                        defaultZoom={12}
                        defaultCenter={{ lat: -27.451163, lng: -58.986510 }}
                        gestureHandling={'greedy'}
                        disableDefaultUI={false}
                    >
                    </Map>
                </Grid>
            </Fade>
        </Fragment>
    );
}