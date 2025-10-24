import React, { useContext, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { setYupLocaleES } from '../../../const/yup';
import { postFiles } from '../../../services/ajax';
import { useTheme, useMediaQuery, Fade } from '@mui/material';
import { formInitialValues, FormSections, formValidationSchema } from '../../formSections';
import { useSnackbar } from 'notistack';
import { LoadingModalContext } from '../loading';
import { Fragment } from 'react';

setYupLocaleES();

export default function AdjuntarArchivosDialog(props) {
    const {
        open, setOpen,
        loadData,
        id_usuario,
        referencia,
        id_referencia,
        sobreescribir = false,
        eliminar = false,
    } = props;

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    //Modals
    const loadingModal = useContext(LoadingModalContext);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const formSections = [
        {
            name: "",
            fields: [
                {
                    dataName: "archivo", label: "Comprobante", controlType: "fileList",
                    initialValue: [],//data ? data.files : [],
                    validationSchema: yup.array()/*.min(1).max(1)*/,
                    name: "Archivos adjuntos",
                    //description: "",
                    acceptTypeFiles: "application/pdf, .jpg, .jpeg, .png",
                    maxSize: 10,
                    multipleFiles: true,
                },
            ],
        },
    ];

    useEffect(() => {
    }, []);

    const onSubmit = async (values, { resetForm }) => {
        loadingModal.setOpen(true);
        var t_fecha = new Date(values.fecha); t_fecha.setTime(t_fecha.getTime() - t_fecha.getTimezoneOffset() * 60 * 1000);
        const response = await postFiles("file/nuevo.php", {
            id_usuario: id_usuario,
            referencia: referencia,
            id_referencia: id_referencia,
            sobreescribir: sobreescribir,
            eliminar: eliminar,
        },
            {
                files: values.archivo,
            });

        if (response.error === "") {
            enqueueSnackbar("Archivos actualizados ok", { variant: "success" });

            onCloseDialog(resetForm);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }

        loadingModal.setOpen(false);
    }

    const onCloseDialog = async (resetForm) => {
        setOpen(false);
        resetForm({});
        await loadData();
    }

    return (
        <Fragment>
            <Formik
                initialValues={formInitialValues(formSections)}
                validationSchema={formValidationSchema(formSections)}
                onSubmit={onSubmit}
                enableReinitialize
            >
                {({ errors, touched, isSubmitting, values, handleChange, handleBlur, submitForm, resetForm, setFieldValue }) => (
                    <Dialog
                        open={open} onClose={() => onCloseDialog(resetForm)} aria-labelledby="form-dialog-title"
                        fullWidth maxWidth={isBigScreen ? "md" : "sm"}
                    >
                        <DialogTitle id="form-dialog-title">
                            {"Adjuntar archivos"}
                        </DialogTitle>

                        <DialogContent>
                            <DialogContentText>
                                {"Aquí puedes adjuntar archivos adicionales"}
                            </DialogContentText>

                            <Form>
                                <FormSections
                                    formSections={formSections}
                                    values={values}
                                    errors={errors}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                    touched={touched}
                                    setFieldValue={setFieldValue}
                                    isModal={true}
                                />
                            </Form>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={() => onCloseDialog(resetForm)}> Cancelar </Button>
                            <Button type="submit" disabled={isSubmitting} color="primary" onClick={submitForm}>
                                {"Agregar"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Formik>
        </Fragment>
    );
}