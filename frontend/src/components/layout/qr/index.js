import React, { Fragment } from 'react';
import { CssBaseline, Grid, Paper, useTheme, Fade } from '@mui/material';
import styles from './style.module.scss';
import logo from '../../../images/logo_negro_color.png';

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
                <Grid
                    item xs={12}
                    className={styles.rightContainer}
                    style={{ backgroundColor: theme.palette.background.default + (prefersDarkMode ? "BB" : "B") }}
                >
                    <Grid item xs={12} sm={8} md={6} lg={4} xl={4} className={styles.flexContainer}>
                        <Grid item xs={12} sm={10} md={8} lg={8} xl={8} className={styles.flexContainer}>
                            <img src={logo} alt="logo" />
                        </Grid>

                        <h1>Dirección de Tránsito</h1>

                        <Fade in={true} timeout={900}>
                            <Paper className={styles.inputContaier}>
                                {props.children}
                            </Paper>
                        </Fade>
                    </Grid>
                </Grid>
            </Grid>
        </Fragment>
    );
}

export default Layout;