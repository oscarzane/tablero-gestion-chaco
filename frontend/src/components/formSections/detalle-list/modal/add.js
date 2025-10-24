import React, { useContext, useMemo } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Form, Formik } from 'formik';
import { setYupLocaleES } from '../../../../const/yup';
import { useTheme, useMediaQuery, Fade, } from '@mui/material';
import { formInitialValues, FormSections, formValidationSchema } from '../../index';
import { useSnackbar } from 'notistack';
import { Fragment } from 'react';
import { AlertModalContext } from '../../../modal/alert';

setYupLocaleES();

export default function AddDetalleDialog(props) {
    const {
        open, setOpen,
        addNewItem,
        data,
        listFields,
        labelPopup,
        labelPopupGenero,
        disabled,
        customValidate,
        customDescription,
    } = props;

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const alertModal = useContext(AlertModalContext);

    //Modals
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const formSections = useMemo(() => [
        {
            name: "",
            fields: (() => {
                if (data) {//si tengo data (editar), seteo el initial value de los listfield, sino va defecto
                    var t_temp = [];
                    listFields.forEach(el => {
                        t_temp.push({
                            ...el,
                            initialValue: data[el.dataName]
                        });
                    });
                    return t_temp;
                }
                return listFields;
            })(),
        },
    ], [listFields, data]);

    const firstUppercase = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const onSubmit = async (values, { resetForm }) => {
        if (disabled) {//solo lectura
            onCloseDialog(resetForm);
        }
        else {//editable
            var t_error = customValidate ? customValidate(values) : "";

            if (t_error == "") {//sin errores
                var t_newData = {
                    ...data,
                    ...values,
                };
                addNewItem(t_newData);

                enqueueSnackbar(data ?
                    firstUppercase(labelPopup) + " editad" + labelPopupGenero + " correctamente" :
                    firstUppercase(labelPopup) + " añadid" + labelPopupGenero + " correctamente",
                    { variant: "success" });

                onCloseDialog(resetForm);
            }
            else {//con errores
                alertModal.showModal("Error en los datos ingresados", t_error);
            }
        }
    }

    const onCloseDialog = async (resetForm) => {
        setOpen(false);
        resetForm({});
    };

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
                            {data ?
                                (disabled ? "Ver " : "Editar ") + labelPopup :
                                "Nuevo " + labelPopup
                            }
                        </DialogTitle>

                        <DialogContent>
                            <DialogContentText>
                                {
                                    (data ?
                                        "Aquí puedes " + (disabled ? "ver" : "editar") + " los datos " + (labelPopupGenero == "o" ? "del " : "de la ") + labelPopup :
                                        "Ingresa los datos " + (labelPopupGenero == "o" ? "del " : "de la ") + labelPopup) +
                                    ". " + customDescription
                                }
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
                                {data ? (disabled ? "Aceptar" : "Aplicar") : "Agregar"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Formik>
        </Fragment>
    );
}