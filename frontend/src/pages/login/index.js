import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/login';
import { TextField, Grid, Button, useTheme, Fade } from '@mui/material';
import * as yup from 'yup';
import { Formik, Form } from 'formik';
import styles from './style.module.scss';
import { postData } from '../../services/ajax/';
import { AuthContext } from '../../context/auth';
import { LoadingModalContext } from '../../components/modal/loading';
import { AlertModalContext } from '../../components/modal/alert';
import { setYupLocaleES } from '../../const/yup';

setYupLocaleES();
const ingresarFormSchema = yup.object().shape({
    usuario: yup.string()
        .required(),
    clave: yup.string()
        .required(),
});

function Page() {
    const theme = useTheme();
    const { updateUsuario } = useContext(AuthContext);
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);

    let { token, window } = useParams();
    const navigate = useNavigate();

    const [ingresoManual, setIngresoManual] = useState(false);

    const onLoginSubmit = async (values, { setSubmitting }) => {
        loadingModal.setOpen(true);

        updateUsuario({
            "id_usuario": "SmgvM2c3eGloTEdmSmQreUhwQmpNZz09",
            "nombre": "NOMBRE APELLIDO",
            "genero": "o",
            "clave": "",
            "admin": "1",
            "solo_region": "0",
            "revisor": "0",
            "dengue": "1",
            "sdengue": "1",
            "es_central": "1",
            "puede_eliminar": "0",
            "id_establecimiento": "TVA4cEcwVGtQd3NQWlNOdmFJR1ZoQT09",
            "establecimiento_nombre": "Salud digital y gobernanza",
            "establecimiento_tipo": "7",
            "establecimiento_codigo": "80808",
            "a_consuextern": "1",
            "a_agensanit": "0",
            "a_laboratorio": "1",
            "a_materinfan": "1",
            "a_prodmensual": "1",
            "a_obstetricia": "1",
            "a_recibyderiv": "1",
            "a_hospitalizacion": "0",
            "a_trabajosocial": "1",
            "a_enfermeria": "1",
            "carga": "0",
            "scarga": "0",
            "codif": "0",
            "scodif": "0",
            "cuitCuil": "20337247645",
            "random": "1",
            "perfiles_str": "Administrador",
            "region": "8",
            "recursos_salud_ok": true
        });

        /*const response = await postData("usuario/login.php", {
            usuario: values.usuario,
            clave: values.clave
        });

        if (response.error === "") {
            updateUsuario(response.data);
        }
        else {
            alertModal.showModal("Datos incorrectos", response.error);
        }*/

        loadingModal.setOpen(false);
    }


    useEffect(() => {
        const loginUser = async () => {
            loadingModal.setOpen(true);

            const response = await postData("usuario/login.php", {
                token: token,
            });

            if (response.error === "") {
                updateUsuario(response.data);
            }
            else {
                alertModal.showModal("Datos incorrectos", response.error);
            }

            loadingModal.setOpen(false);
        }

        if (token)
            loginUser();
    }, [token]);

    return (
        <Layout>
            <Grid container direction="column">
                    <Fragment>
                        <h2>Ingreso</h2>
                        <Formik
                            initialValues={{
                                usuario: '',
                                clave: '',
                            }}
                            validationSchema={ingresarFormSchema}
                            onSubmit={onLoginSubmit}
                        >
                            {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
                                <Form className={styles.form}>
                                    <TextField
                                        variant="standard"
                                        label="Usuario"
                                        type="text"
                                        autoComplete="username"
                                        value={values.usuario}
                                        onChange={handleChange('usuario')}
                                        onBlur={handleBlur('usuario')}
                                        error={errors.usuario && touched.usuario}
                                        helperText={errors.usuario && touched.usuario ? errors.usuario : ""}
                                        fullWidth />

                                    <TextField
                                        variant="standard"
                                        label="Contraseña"
                                        type="password"
                                        autoComplete="current-password"
                                        value={values.clave}
                                        onChange={handleChange('clave')}
                                        onBlur={handleBlur('clave')}
                                        error={errors.clave && touched.clave}
                                        helperText={errors.clave && touched.clave ? errors.clave : ""}
                                        fullWidth />

                                    <Button
                                        type="submit"
                                        variant="contained" color="primary" fullWidth
                                        disabled={isSubmitting}
                                    >
                                        Ingresar
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </Fragment>

                {false && <Link className={styles.a} to="/dashboard" style={{ color: theme.palette.secondary.main }}>¿Olvidaste tu clave?</Link>}
            </Grid>
        </Layout>
    );
}

export default Page;