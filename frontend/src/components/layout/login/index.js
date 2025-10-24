import React, { Fragment } from 'react';
import { CssBaseline, Grid, Paper, Hidden, useTheme, Fade, Typography, Box } from '@mui/material';
import styles from './style.module.scss';
import logo_blanco_color from '../../../images/logo_blanco_color.png';
import logo_negro from '../../../images/logo_negro.png';
import ConectionAlert from '../../conectionAlert';
import packageJson from '../../../../package.json';
import fondo_dark from '../../../images/fondo_dark.png';
import fondo_light from '../../../images/fondo_light.png';
import fondo_mid from '../../../images/fondo_mid.png';

function Layout(props) {
    const theme = useTheme();
    const prefersDarkMode = theme.palette.mode === "dark";
    
    return (
        <Fragment>
            <CssBaseline />
            <Grid
                container
                className={styles.container}
                direction="row"
                justifyContent="center"
                wrap="nowrap"
            >
                <Hidden mdDown>
                    <Grid
                        container item xs={12}
                        justifyContent="center"
                        alignItems="center"
                        wrap="nowrap"
                        style={{ backgroundImage: "url(" + fondo_dark + ")", backgroundPosition: "left" }}
                        className={styles.leftContainer}>
                        <img src={logo_blanco_color} alt="logo" />
                    </Grid>
                </Hidden>
                <Grid
                    container item xs={12}
                    className={styles.rightContainer}
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    wrap="nowrap"
                    style={{ backgroundImage: "url(" + (prefersDarkMode ? fondo_mid : fondo_light) + ")", backgroundPosition: "right" }}
                >
                    <img src={prefersDarkMode ? logo_blanco_color : logo_negro} alt="logo" />
                    <h1>Tablero de gestión</h1>
                    <Fade in={true} timeout={1000}>
                        <Paper className={styles.inputContaier}>
                            {props.children}
                        </Paper>
                    </Fade>

                    <Box pt={1}>
                        <Typography variant="body2" color="textSecondary" align="center">
                            {'Copyright © Ministerio de Salud - Chaco ' + new Date().getFullYear() + '.'}
                        </Typography>

                        <Typography variant="body2" color="textSecondary" align="center">
                            versión {packageJson.version}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
            <ConectionAlert />
        </Fragment>
    );
}

export default Layout;