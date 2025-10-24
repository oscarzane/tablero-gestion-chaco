import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Form, Formik } from 'formik';
import { setYupLocaleES } from '../../../const/yup';
import { useTheme, useMediaQuery, Fade, } from '@mui/material';
import { formInitialValues, FormSections, formValidationSchema } from '../../formSections';
import { Fragment } from 'react';

setYupLocaleES();

export default function FormularioSimpleDialog(props) {
    const {
        open, setOpen,
        formSections,
        title, description="",
        cancelText="Cancelar", aceptText,
        onSubmit, onCancel = false,
    } = props;

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const onCloseDialog = async (resetForm) => {
        if(onCancel)
            onCancel();
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
                        <DialogTitle id="form-dialog-title"> {title} </DialogTitle>

                        <DialogContent>
                            <DialogContentText> {description} </DialogContentText>

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
                            <Button onClick={() => onCloseDialog(resetForm)}> {cancelText} </Button>
                            <Button type="submit" disabled={isSubmitting} color="primary" onClick={submitForm}> { aceptText }</Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Formik>
        </Fragment>
    );
}