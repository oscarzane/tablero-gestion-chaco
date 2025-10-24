import React, { useState, Fragment, useContext, useMemo } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { postData, postFiles } from '../../../services/ajax';
import { List, ListItem, Fade, useMediaQuery, useTheme, DialogContentText } from '@mui/material';
import { Skeleton } from '@mui/material';
import { useSnackbar } from 'notistack';
import { setYupLocaleES } from '../../../const/yup';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { formInitialValues, FormSections, formValidationSchema } from '../../formSections';
import { AuthContext } from '../../../context/auth';
import { AlertModalContext } from '../alert';

setYupLocaleES();

export default function TomarFotoDialog(props) {
    const {
        open, setOpen,
        referencia,
        id_referencia,
        loadingModalSetOpen,
        loadDataParent,
    } = props;
    const { usuario } = useContext(AuthContext);
    const [data, setData] = useState(null);
    //const [localReferencia, setLocalReferencia] = useState(false);
    const [localIdReferencia, setLocalIdReferencia] = useState(false);

    const alertModal = useContext(AlertModalContext);
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const formSections = useMemo(() => [
        {
            name: "",
            fields: [
                {
                    dataName: "photo", label: "Foto", controlType: "singleImage",
                    initialValue: data ? data.foto : '',
                    validationSchema: yup.string().required(),
                    resolution: 1024,
                    ratio: 3 / 4,
                },
            ],
        },
    ], [data]);

    const loadData = async () => {
        setData(null);

        const response = await postData("solicitud-licencia/leer-id.php", {
            id_usuario: usuario.id_usuario,
            id_solicitud_licencia: id_referencia,
        });

        if (response.error === "") {
            setData(response.data);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
    }

    if (/*localReferencia !== referencia || */localIdReferencia !== id_referencia) {
        //setLocalReferencia(referencia);
        setLocalIdReferencia(id_referencia);
        if (/*referencia*/ id_referencia)
            loadData(/*referencia, id_referencia*/);
    }

    const onSubmit = async (values, { resetForm }) => {
        loadingModalSetOpen(true);

        const response = await postFiles("solicitud-licencia/subir-foto.php", {
            id_usuario: usuario.id_usuario,
            id_referencia: id_referencia,
            photo: values.photo,
        });

        if (response.error === "") {
            enqueueSnackbar("Foto subida correctamente", { variant: "success" });

            alertModal.showModal("Nuevo estado de la solicitud", response.data.nuevo_estado);

            if (loadDataParent)
                loadDataParent();
                
            onCloseDialog(resetForm);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
            resetForm({});
            loadData(referencia);
        }

        loadingModalSetOpen(false);
    }

    const onCloseDialog = async (resetForm) => {
        setOpen(false);
        resetForm({});
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
                            Tomar foto
                        </DialogTitle>

                        <DialogContent>
                            <Fade in={data !== null} timeout={900}>
                                <Fragment>
                                    <DialogContentText>
                                        Elige la foto para adjuntar a la solicitud. Luego haz click en 'Subir foto'. Contribuyente: {data && data.contribuyente_str}
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
                                </Fragment>
                            </Fade>

                            <Fade in={data === null} timeout={900}>
                                <List dense>
                                    {data === null ?
                                        <Fragment>
                                            <ListItem><Skeleton variant="text" width="100%" /> </ListItem>
                                            <ListItem><Skeleton variant="text" width="100%" /> </ListItem>
                                        </Fragment> : null
                                    }
                                </List>
                            </Fade>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={() => onCloseDialog(resetForm)}> Cancelar </Button>
                            <Button type="submit" disabled={isSubmitting} color="primary" onClick={submitForm}> Subir foto </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Formik>
        </Fragment>
    );
}