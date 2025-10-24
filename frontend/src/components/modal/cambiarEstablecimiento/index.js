import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { setYupLocaleES } from '../../../const/yup';
import { useTheme, useMediaQuery, Fade, } from '@mui/material';
import { formInitialValues, FormSections, formValidationSchema } from '../../formSections';
import { useSnackbar } from 'notistack';
import { Fragment } from 'react';
import { AuthContext } from '../../../context/auth';
import { postData } from '../../../services/ajax';
import { LoadingModalContext } from '../loading';

setYupLocaleES();

export default function DetalleVentaDialog(props) {
    const {
        open, setOpen,
    } = props;

    const { usuario, updateUsuario } = useContext(AuthContext);
    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;
    const loadingModal = useContext(LoadingModalContext);

    const [establecimientos, setEstablecimientos] = useState([]);

    //Modals
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    //evita que de error al cambiar desde un establecimiento que ya no se tiene asignado
    const tieneEstablecimiento = (p_id_establecimiento, p_lista) => {
        for(var i=0; i<p_lista.length; i++)
            if(p_lista[i].id == p_id_establecimiento) return true;
        return false;
    };

    const formSections = useMemo(() => [
        {
            name: "",
            fields: [
                {
                    dataName: "id_establecimiento", label: "Establecimiento", controlType: "autocomplete", items: establecimientos,
                    initialValue: tieneEstablecimiento(usuario.id_establecimiento, establecimientos) ? usuario.id_establecimiento : null,
                    validationSchema: yup.string().required(),
                },
            ],
        },
    ], [establecimientos, usuario.id_establecimiento]);

    const readEstablecimientos = useCallback(async () => {
        const response = await postData("establecimiento/leerSimple.php", {
            id_usuario: usuario.id_usuario,
            publicos: 1,//1 solo pub, 2 solo priv, 3 todos
            solo_del_usuario: 1,//1 trae solo los estab del usuario
        });

        if (response.error === "") {
            setEstablecimientos(response.data);
        }
        else {
            enqueueSnackbar(response.error, { variant: "error" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

    const onSubmit = async (values, { resetForm }) => {
        loadingModal.setOpen(true);

        const response = await postData("usuario/cambiar-establecimiento.php", {
            id_usuario: usuario.id_usuario,
            id_establecimiento: values.id_establecimiento
        });
        if (response.error === "") {
            updateUsuario({ ...usuario, ...response.data });

            enqueueSnackbar("Establecimiento cambiado ok", { variant: "success" });
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
    }

    useEffect(() => {
        const loadDefaultValues = async () => {
            loadingModal.setOpen(true);

            await readEstablecimientos();

            loadingModal.setOpen(false);
        }

        loadDefaultValues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readEstablecimientos]);

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
                            Cambiar de establecimiento
                        </DialogTitle>

                        <DialogContent>
                            <DialogContentText>
                                Elige el establecimiento al que deseas cambiar. Puedes escribir en el campo de búsqueda para encontrar por nombre. Recuerda hacer click en el establecimiento para que quede seleccionado.
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
                                Cambiar
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Formik>
        </Fragment>
    );
}