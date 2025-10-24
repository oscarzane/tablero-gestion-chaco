import React, { useContext } from 'react';
import Layout from '../../components/layout/main';
import { Fade, Grid, Paper, Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { AlertModalContext } from '../../components/modal/alert';
import { LoadingModalContext } from '../../components/modal/loading';
import { postData } from '../../services/ajax';
import { AuthContext } from '../../context/auth';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { setYupLocaleES } from '../../const/yup';
import { FormSections, formInitialValues, formValidationSchema } from '../../components/formSections';
import { Formatter } from '../../const/formatter';

setYupLocaleES();

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(4),
        paddingBottom: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    botonera: {
        marginBottom: "2px",
        justifyContent: "flex-end",
    },
}));

function Page() {
    const { classes } = useStyles();

    //Auxiliar data
    const { usuario } = useContext(AuthContext);

    //Modals
    const alertModal = useContext(AlertModalContext);
    const loadingModal = useContext(LoadingModalContext);

    const formSections = [
        {
            name: "Filtros",
            fields: [
                {
                    dataName: "ano", label: "Año", controlType: "textField",
                    initialValue: new Date().getFullYear(),
                    validationSchema: yup.number().required().positive().min(2023).max(3000),
                },
                {
                    dataName: "region", label: "Región", controlType: "select",
                    items: [{id: 0, nombre: "Todas"}, ...Formatter.region],
                    initialValue: usuario.solo_region*1>0 ? usuario.solo_region : null,
                    validationSchema: yup.string().required(),
                    disabled: usuario.solo_region*1>0,
                },
                {
                    dataName: "incluir_sin_supervisar", label: "Incluir planillas sin supervisar", controlType: "checkBox",
                    /*iconNoChecked: <FavoriteBorderRoundedIcon />, iconChecked: <FavoriteRoundedIcon />,*/
                    initialValue: false,
                    validationSchema: yup.boolean(),
                    disabled: usuario.admin * 1 != 1 && usuario.revisor * 1 != 1 && usuario.solo_region * 1 == 0,
                },
            ],
        },
    ];

    const handleDescargar = async (values, { resetForm }) => {
        loadingModal.setOpen(true);
        
        const response = await postData("reporte/recursos-salud.php", {
            id_usuario: usuario.id_usuario,
            ano: values.ano,
            region: values.region,
            incluir_sin_supervisar: values.incluir_sin_supervisar ? values.incluir_sin_supervisar : 0,
            solo_dependientes_region: values.solo_dependientes_region ? values.solo_dependientes_region : 0,
        });
        
        if (response.error === "") {
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(response.data);
            link.target = "_blank";
            link.download = response.filename;
            //document.body.appendChild(link);
            link.click();
            //document.body.removeChild(link);
        }
        else
            alertModal.showModal("Error inesperado", response.error);
        /*var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        //link.download = filename;
        //document.body.appendChild(link);
        link.click();
        //document.body.removeChild(link);*/

        /**/

        loadingModal.setOpen(false);
    }

    return (
        <Layout nombrePagina="Reporte de Recursos de Salud">
            <Fade in={true} timeout={900}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <p>
                            En este reporte se puede verificar los recursos de salud de cada establecimiento.
                            El reporte contiene una tabla y gráfico dinámico que puede ser adaptado para mostrar la información en el formato deseado. <br></br>
                            Utiliza los filtros aquí debajo para personalizar la información obtenida.
                        </p>
                        
                        <Formik
                            initialValues={formInitialValues(formSections)}
                            validationSchema={formValidationSchema(formSections)}
                            onSubmit={handleDescargar}
                        >
                            {({ errors, touched, isSubmitting, values, handleChange, handleBlur, setFieldValue }) => (
                                <Form className={classes.form}>
                                    <FormSections
                                        formSections={formSections}
                                        values={values}
                                        errors={errors}
                                        handleChange={handleChange}
                                        handleBlur={handleBlur}
                                        touched={touched}
                                        setFieldValue={setFieldValue}
                                    />
                                    <Grid container spacing={2} className={classes.botonera}>
                                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                                            <Button type="submit" variant="outlined" color="secondary" disabled={isSubmitting} fullWidth>
                                                Descargar Reporte
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Form>
                            )}
                        </Formik>
                    </Paper>
                </Grid>
            </Fade>
        </Layout >
    );
}

export default Page;