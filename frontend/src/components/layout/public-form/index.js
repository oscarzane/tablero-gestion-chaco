import React, { Fragment } from 'react';
import { CssBaseline, Grid, Paper, useTheme, Fade } from '@mui/material';
import styles from './style.module.scss';
import logo from '../../../images/logo_h.png';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { Formatter } from '../../../const/formatter';

function Layout(props) {
    const theme = useTheme();
    const prefersDarkMode = theme.palette.mode === "dark";

    return (
        <Fragment>
            <GoogleReCaptchaProvider
                reCaptchaKey={Formatter.recaptchaSiteKey}//recaptcha site key
                language="es"
                useRecaptchaNet={false}
                scriptProps={{
                    async: false, // optional, default to false,
                    defer: false, // optional, default to false
                    appendTo: "head", // optional, default to "head", can be "head" or "body",
                    nonce: undefined, // optional, default undefined
                }}
            >
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
                        <Grid item xs={12} sm={10} md={8} lg={8} xl={8} className={styles.flexContainer}>
                            <Grid item xs={12} sm={10} md={8} lg={6} xl={4} className={styles.flexContainer}>
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
            </GoogleReCaptchaProvider>
        </Fragment>
    );
}

export default Layout;