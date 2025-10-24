/*** Version 2020.09.25 */
import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types'
import { Form, Formik } from 'formik';
import { makeStyles } from 'tss-react/mui';
import {
    Grid, Typography, FormControl, InputLabel, Select, MenuItem, FormHelperText, FormControlLabel,
    Checkbox, TextField, useMediaQuery, useTheme, Button, Stepper, Step, StepLabel, StepContent,
    Autocomplete
} from '@mui/material';
import * as yup from 'yup';
import { SingleImageInput } from './input/image/single';
import { SignatureInput } from './input/signature';
import { FileList } from './file-list';
import { DetalleList } from './detalle-list/';
import 'dayjs/locale/es';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import dayjs from 'dayjs';
import { AutocompleteAsyncInput } from './input/autocompleteAsync';


const useStyles = makeStyles()((theme) => ({
    sectionMargin: {
        marginBottom: theme.spacing(4),
        overflow: "hidden",
    },
    section: {
        overflow: "hidden",
    },
    formControl: {
        width: "100%",
    },
    formControlLabel: {
        marginTop: "-5px",
        marginBottom: "-5px",
    },
    botonera: {
        marginBottom: "2px",
        justifyContent: "flex-end",
    }
}));

/*  sections: seccion o secciones del formulario */
/*  restoredValues: valores guardados para reinicializar el form sin perder valores anteriores (util en prev y sig steppers) */
export const formInitialValues = (sections, restoredValues = {}) => {
    const values = {};

    for (var i = 0; i < sections.length; i++)
        for (var i2 = 0; i2 < sections[i].fields.length; i2++)
            fieldInitialize(sections[i].fields[i2], values, restoredValues);

    return values;
};
const fieldInitialize = (field, values, restoredValues) => {
    if (typeof restoredValues[field.dataName] === 'undefined')
        values[field.dataName] = field.initialValue;
    else
        values[field.dataName] = restoredValues[field.dataName];

    //si el field tiene otros dependientes, los inicializo
    if (field.child)
        fieldInitialize(field.child, values, restoredValues);
}

export const formValidationSchema = (sections) => {
    const schemas = {};

    for (var i = 0; i < sections.length; i++)
        for (var i2 = 0; i2 < sections[i].fields.length; i2++)
            fieldValidationSchema(sections[i].fields[i2], schemas);

    return yup.object().shape(schemas);
}
const fieldValidationSchema = (field, schemas) => {
    schemas[field.dataName] = field.validationSchema;
    //si el field tiene otros dependientes, los valido
    if (field.child)
        fieldValidationSchema(field.child, schemas);
}

const enterToTab = (e) => {
    if (e.key === "Enter") {
        e.stopPropagation();
        e.preventDefault();

        var inputs = [
            ...document.getElementsByClassName("MuiInputBase-input"),//getElementsByTagName("input")
            ...document.querySelectorAll("button[type='submit']")
        ];

        for (var i = 0; i < inputs.length; i++) {
            if (document.activeElement == inputs[i] && i + 1 < inputs.length) {
                inputs[i + 1].focus();
                break;
            }
        }
    }
}

export const fieldSize = {
    xs: 1, s: 2, m: 0, l: 3, xl: 4, xxl: 5, xxxl: 6
}

const fieldExport = (isMobile, field, values, handleChange, handleBlur, errors, touched, setFieldValue, classes,
    isModal,
    items = false, /*select specific params*/
    resolution = 1280, ratio = 1 / 1 /*singleImage specific params*/) => {

    var xs = 12, sm = 6, md = isModal ? 6 : 4, lg = isModal ? 6 : 3, xl = isModal ? 6 : 2;
    if (field.size) {
        switch (field.size) {
            case fieldSize.xs: { xs = isModal ? 12 : 4; sm = isModal ? 6 : 3; md = isModal ? 4 : 2; lg = isModal ? 4 : 2; xl = isModal ? 4 : 2; }; break;
            case fieldSize.s: { xs = isModal ? 12 : 6; sm = isModal ? 12 : 4; md = isModal ? 6 : 3; lg = isModal ? 4 : 2; xl = isModal ? 4 : 2; }; break;
            case fieldSize.l: { xs = 12; sm = 12; md = isModal ? 12 : 6; lg = isModal ? 12 : 4; xl = isModal ? 6 : 3; }; break;
            case fieldSize.xl: { xs = 12; sm = 12; md = 12; lg = isModal ? 12 : 6; xl = isModal ? 12 : 4; }; break;
            case fieldSize.xxl: { xs = 12; sm = 12; md = 12; lg = 12; xl = isModal ? 12 : 6; }; break;
            case fieldSize.xxxl: { xs = 12; sm = 12; md = 12; lg = 12; xl = 12; }; break;
        }
    }
    if (field.controlType === "textFieldXL") {//obsoleto
        xs = 12; sm = 12; md = 6; lg = 4; xl = 3;
    }
    else if (field.controlType === "textFieldXS") {//obsoleto
        xs = 6; sm = 4; md = 3; lg = 2; xl = 2;
    }

    var t_child_items = items ? (items.find(el => el.id === values[field.dataName]) ? items.find(el => el.id === values[field.dataName]).items : false) : false;


    if (field.controlType === "fileList") {
        return (
            <Fragment key={field.dataName}>
                <Grid item xs={xs}>
                    <FileList
                        files={values[field.dataName]}
                        setFiles={(v) => setFieldValue(field.dataName, v)}
                        errors={errors[field.dataName]}
                        name={field.name ? field.name : false}
                        description={field.description ? field.description : false}
                        acceptTypeFiles={field.acceptTypeFiles}
                        maxNameLength={field.maxNameLength}
                        maxSize={field.maxSize}
                        isModal={isModal}
                        multipleFiles={field.multipleFiles}
                    />
                </Grid>
            </Fragment>
        );
    }
    else if (field.controlType === "detalleList") {
        return (
            <Fragment key={field.dataName}>
                <Grid item xs={xs}>
                    <DetalleList
                        data={values[field.dataName] ? values[field.dataName] : []}
                        setData={(v) => setFieldValue(field.dataName, v)}
                        label={field.label ? field.label : false}
                        description={field.description ? field.description : false}
                        errors={errors[field.dataName]}
                        isModal={isModal}
                        customIcon={field.customIcon ? field.customIcon : false}
                        listFields={field.listFields ? field.listFields : []}
                        customValidate={field.customValidate ? field.customValidate : false}//validador personalizado, opcional (devuelve texto de error o vacio)
                        labelPopup={field.labelPopup ? field.labelPopup : ""}//nombre que tendra el elemento en el popup
                        labelPopupGenero={field.labelPopupGenero ? field.labelPopupGenero : "o"}//o,a segun corresponda (masc, fem)
                        totalShow={field.totalShow ? field.totalShow : false}//mostrar o no el total
                        totalDataName={field.totalDataName ? field.totalDataName : false}//nombre del dataname a sumar para el total, false contar lista
                        totalIsMoney={field.totalIsMoney ? field.totalIsMoney : false}//si es o no de tipo moneda el total a sumar
                        sortable={field.sortable ? field.sortable : false}//si es o no ordenable
                        customSubtitle={field.customSubtitle != null ? field.customSubtitle : null}
                        disabled={field.disabled ? field.disabled : false}
                        customDescription={field.customDescription ? field.customDescription : ""}//descripcion personalizada para el popup
                    />
                </Grid>
            </Fragment>
        );
    }
    else {
        return (
            <Fragment key={field.dataName}>
                <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
                    {(field.controlType === "textField" || field.controlType === "textFieldXL" || field.controlType === "textFieldXS") &&
                        <TextField
                            variant="standard"
                            label={field.label}
                            value={values[field.dataName] ? values[field.dataName] : ""}
                            onChange={handleChange(field.dataName)}
                            onBlur={handleBlur(field.dataName)}
                            onKeyDown={enterToTab}
                            error={errors[field.dataName] && touched[field.dataName]}
                            helperText={errors[field.dataName] && touched[field.dataName] ? errors[field.dataName] : ""}
                            type="text"
                            fullWidth
                            disabled={field.disabled ? field.disabled : false}
                            //required={field.validationSchema._exclusive.required}
                            autoFocus={field.autoFocus ? true : false} />
                    }

                    {field.controlType === "datePicker" &&
                        <DateField
                            variant={"standard"}
                            //variant={isMobile ? "" : "inline"}
                            label={field.label}
                            value={values[field.dataName] ? dayjs(values[field.dataName]) : null}
                            onChange={val => setFieldValue(field.dataName, val)}
                            onBlur={handleBlur(field.dataName)}
                            onKeyDown={enterToTab}
                            error={errors[field.dataName] && touched[field.dataName]}
                            helperText={errors[field.dataName] && touched[field.dataName] ? errors[field.dataName] : ""}
                            format="DD/MM/YYYY"
                            fullWidth
                            disabled={field.disabled ? field.disabled : false}
                            autoFocus={field.autoFocus ? true : false}
                        //required={field.validationSchema._exclusive.required}
                        />
                    }

                    {field.controlType === "checkBox" &&
                        <FormControl variant="standard" component="fieldset" className={classes.formControl}>
                            <Typography variant="caption" component="legend" color="textSecondary"> {field.label} </Typography>
                            <FormControlLabel className={classes.formControlLabel}
                                control={
                                    <Checkbox
                                        icon={field.iconNoChecked}
                                        checkedIcon={field.iconChecked}
                                        name={field.dataName}
                                        checked={values[field.dataName] ? values[field.dataName] : false}
                                        onChange={handleChange(field.dataName)}
                                        onBlur={handleBlur(field.dataName)}
                                        disabled={field.disabled ? field.disabled : false}
                                        onKeyDown={enterToTab}
                                    //required={field.validationSchema._exclusive.required}
                                    />
                                }
                                label={field.label}
                            />
                        </FormControl>
                    }

                    {field.controlType === "select" &&
                        <FormControl
                            variant="standard"
                            className={classes.formControl}
                            onKeyDown={enterToTab}
                            error={errors[field.dataName] && touched[field.dataName]}>
                            <InputLabel id={field.dataName + "-label"}> {field.label} </InputLabel>
                            <Select
                                variant="standard"
                                labelId={field.dataName + "-label"}
                                id={field.dataName}
                                value={values[field.dataName] ? values[field.dataName] : ''}
                                onChange={
                                    (e) => {
                                        //si cambio el valor
                                        if (e.target.value != values[field.dataName]) {
                                            setFieldValue(field.dataName, e.target.value);
                                            //si el campo tiene hijo dependiente, lo reseteo
                                            var t_child = field.child;
                                            while (typeof t_child !== 'undefined') {
                                                setFieldValue(t_child.dataName, '');
                                                t_child = t_child.child;
                                            }
                                        }
                                    }
                                }

                                onBlur={handleBlur(field.dataName)}
                                disabled={field.disabled ? field.disabled : false}
                                //required={field.validationSchema._exclusive.required}
                                autoFocus={field.autoFocus ? true : false}
                            >
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {items ? items.map((grupo) => (
                                    <MenuItem key={grupo.id + ""} value={grupo.id + ""}>{grupo.nombre}</MenuItem>
                                )) : null}
                            </Select>
                            <FormHelperText>{errors[field.dataName] && touched[field.dataName] ? errors[field.dataName] : ""}</FormHelperText>
                        </FormControl>
                    }

                    {field.controlType === "autocomplete" &&
                        <FormControl
                            variant="standard"
                            className={classes.formControl}
                            onKeyDown={enterToTab}
                            error={errors[field.dataName] && touched[field.dataName]}
                        >
                            {/*objeto con formato {id: "", label: ""}*/}
                            <Autocomplete
                                id={field.dataName}
                                value={values[field.dataName] ? values[field.dataName] : null}
                                onChange={(event, newValue) => {
                                    //si cambio el valor
                                    if (newValue == null || newValue.id != values[field.dataName]) {
                                        setFieldValue(field.dataName, newValue != null ? newValue.id : "");
                                        //si el campo tiene hijo dependiente, lo reseteo
                                        var t_child = field.child;
                                        while (typeof t_child !== 'undefined') {
                                            setFieldValue(t_child.dataName, null);
                                            t_child = t_child.child;
                                        }
                                    }
                                }}
                                onBlur={(event) => {
                                    handleBlur(field.dataName);
                                }}
                                disabled={field.disabled ? field.disabled : false}
                                autoHighlight={true}
                                openOnFocus={true}
                                options={items ? items : []}
                                renderInput={(params) => <TextField variant="standard" autoFocus={field.autoFocus ? true : false} {...params} label={field.label} />}
                                isOptionEqualToValue={(option, value) => {
                                    return value.id ? option.id == value.id : option.id == value;
                                }}
                                getOptionLabel={(option) => {
                                    if (option.nombre_str) return option.nombre_str;
                                    else if (option.nombre) return option.nombre;
                                    else {
                                        for (var i = 0; i < items.length; i++) {
                                            if (items[i].id == option) {
                                                if (items[i].nombre_str) return items[i].nombre_str;
                                                else if (items[i].nombre) return items[i].nombre;
                                            }
                                        }
                                        return "";
                                    }
                                }}
                            //required={field.validationSchema._exclusive.required}
                            />
                            <FormHelperText>{errors[field.dataName] && touched[field.dataName] ? errors[field.dataName] : ""}</FormHelperText>
                        </FormControl>
                    }

                    {field.controlType === "autocompleteAsync" &&
                        <FormControl
                            variant="standard"
                            className={classes.formControl}
                            onKeyDown={enterToTab}
                            error={errors[field.dataName] && touched[field.dataName]}
                        >
                            {/*objeto con formato {id: "", label: ""}*/}
                            <AutocompleteAsyncInput
                                id={field.dataName}
                                value={values[field.dataName] ? values[field.dataName] : null}
                                onChange={(event, newValue) => {
                                    //si cambio el valor
                                    if (newValue == null || newValue.id != values[field.dataName]) {
                                        setFieldValue(field.dataName, newValue != null ? newValue : "");//setFieldValue(field.dataName, newValue != null ? newValue.id : "")
                                        //si el campo tiene hijo dependiente, lo reseteo
                                        var t_child = field.child;
                                        while (typeof t_child !== 'undefined') {
                                            setFieldValue(t_child.dataName, null);
                                            t_child = t_child.child;
                                        }
                                    }
                                }}
                                onBlur={(event) => {
                                    handleBlur(field.dataName);
                                }}
                                disabled={field.disabled ? field.disabled : false}
                                autoHighlight={field.autoHighlight ? true : false}
                                openOnFocus={field.openOnFocus ? true : false}
                                items={items ? items : []}
                                renderInput={(params) => <TextField variant="standard" autoFocus={field.autoFocus ? true : false} {...params} label={field.label} />}
                                isOptionEqualToValue={(option, value) => {
                                    return value.id ? option.id == value.id : option.id == value;
                                }}
                                getOptionLabel={(option) => {
                                    if (option.nombre_str) return option.nombre_str;
                                    else if (option.nombre) return option.nombre;
                                    else {
                                        for (var i = 0; i < items.length; i++) {
                                            if (items[i].id == option) {
                                                if (items[i].nombre_str) return items[i].nombre_str;
                                                else if (items[i].nombre) return items[i].nombre;
                                            }
                                        }
                                        return "";
                                    }
                                }}
                                postName={field.postName}
                                postVars={field.postVars}
                                minSearchLength={field.minSearchLength}
                            />
                            <FormHelperText>{errors[field.dataName] && touched[field.dataName] ? errors[field.dataName] : ""}</FormHelperText>
                        </FormControl>
                    }

                    {field.controlType === "singleImage" &&
                        <SingleImageInput
                            label={field.label}
                            value={values[field.dataName] ? values[field.dataName] : ""}
                            onChange={handleChange(field.dataName)}
                            onBlur={handleBlur(field.dataName)}
                            error={errors[field.dataName] && touched[field.dataName]}
                            helperText={errors[field.dataName] && touched[field.dataName] ? errors[field.dataName] : ""}
                            disabled={field.disabled ? field.disabled : false}
                            resolution={resolution}
                            ratio={ratio}
                            autoFocus={field.autoFocus ? true : false}
                        //required={field.validationSchema._exclusive.required}
                        />
                    }

                    {field.controlType === "signature" &&
                        <SignatureInput
                            label={field.label}
                            value={values[field.dataName] ? values[field.dataName] : ""}
                            onChange={handleChange(field.dataName)}
                            onBlur={handleBlur(field.dataName)}
                            error={errors[field.dataName] && touched[field.dataName]}
                            helperText={errors[field.dataName] && touched[field.dataName] ? errors[field.dataName] : ""}
                            disabled={field.disabled ? field.disabled : false}
                            autoFocus={field.autoFocus ? true : false}
                        //required={field.validationSchema._exclusive.required}
                        />
                    }
                </Grid>
                {
                    field.child &&
                    fieldExport(
                        isMobile, field.child, values, handleChange, handleBlur, errors, touched, setFieldValue, classes,
                        isModal,
                        t_child_items
                    )
                }
            </Fragment>
        );
    }
}

const DefaultForm = (formSections, isModal, classes, isMobile, onSubmit, onCancel, submitButtonText, cancelButtonText) => {
    return (
        <Formik
            initialValues={formInitialValues(formSections)}
            validationSchema={formValidationSchema(formSections)}
            onSubmit={onSubmit}
            enableReinitialize
        >
            {({ errors, touched, isSubmitting, values, handleChange, handleBlur, setFieldValue }) => (
                <Form>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                        {formSections.map((section) => (
                            <Grid container spacing={2} key={section.name} className={isModal ? classes.section : classes.sectionMargin}>
                                {(section.name || section.description) &&
                                    <Grid item xs={12}>
                                        {section.name && <Typography variant="h6"> {section.name} </Typography>}
                                        {section.description && <Typography variant="body1" align="justify"> {section.description} </Typography>}
                                    </Grid>
                                }

                                {/*section.fields.map((field) => (
                                    fieldExport(isMobile, field, values, handleChange, handleBlur, errors, touched, setFieldValue, classes,
                                        isModal,
                                        field.items,
                                        field.resolution, field.ratio)
                                    ))*/
                                    fieldsEstructure(isMobile, values, handleChange, handleBlur, errors, touched, setFieldValue, classes, isModal, section)}
                            </Grid>
                        ))}
                    </LocalizationProvider>

                    <Grid container spacing={2} className={classes.botonera}>
                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                            <Button onClick={onCancel} fullWidth>
                                {cancelButtonText}
                            </Button>
                        </Grid>

                        {onSubmit ? <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                            <Button
                                type="submit" variant="contained" color="secondary" fullWidth
                                disabled={isSubmitting}
                            >
                                {submitButtonText}
                            </Button>
                        </Grid> : ""}
                    </Grid>
                </Form>
            )}
        </Formik>
    );
};

const onNextFormStep = (onSubmit, totalSteps, activeStep, setActiveStep, totalValues, setTotalValues, values, resetForm) => {
    var t_newTotalValues = { ...totalValues, ...values };
    setTotalValues(t_newTotalValues);

    if (activeStep === totalSteps - 1)
        onSubmit(t_newTotalValues, resetForm);
    else
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
}

const onPreviousFormStep = (onCancel, activeStep, setActiveStep, values, totalValues, setTotalValues) => {
    if (activeStep === 0)
        onCancel();
    else {
        var t_newTotalValues = { ...totalValues, ...values };
        setTotalValues(t_newTotalValues);

        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
}

const StepperForm = (stepperType, formSections, isModal, classes, isMobile, onSubmit, onCancel, submitButtonText, cancelButtonText) => {
    const [activeStep, setActiveStep] = useState(0);
    const [totalValues, setTotalValues] = useState({});

    return (
        <Stepper activeStep={activeStep} orientation={stepperType}>
            {formSections.map((section, index) => (
                <Step key={section.name}>
                    <StepLabel>{section.name}</StepLabel>

                    <StepContent>
                        <Formik
                            initialValues={formInitialValues([section], totalValues)}
                            validationSchema={formValidationSchema([section])}
                            onSubmit={(values, resetForm) => onNextFormStep(onSubmit, formSections.length, activeStep, setActiveStep, totalValues, setTotalValues, values, resetForm)}
                            enableReinitialize
                        >
                            {({ errors, touched, isSubmitting, values, handleChange, handleBlur, setFieldValue }) => (
                                <Form>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">

                                        <Grid container spacing={2} className={isModal ? classes.section : classes.sectionMargin}>
                                            {(section.name || section.description) &&
                                                <Grid item xs={12}>
                                                    {/*section.name && <Typography variant="h6"> {section.name} </Typography>*/}
                                                    {section.description && <Typography variant="body1" align="justify"> {section.description} </Typography>}
                                                </Grid>
                                            }

                                            {/*section.fields.map((field) => (
                                                    fieldExport(isMobile, field, values, handleChange, handleBlur, errors, touched, setFieldValue, classes,
                                                        isModal,
                                                        field.items,
                                                        field.resolution, field.ratio)
                                                    ))*/
                                                fieldsEstructure(isMobile, values, handleChange, handleBlur, errors, touched, setFieldValue, classes, isModal, section)}
                                        </Grid>

                                    </LocalizationProvider>

                                    <Grid container spacing={2} className={classes.botonera}>
                                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                                            <Button
                                                onClick={() => onPreviousFormStep(onCancel, activeStep, setActiveStep, values, totalValues, setTotalValues)}
                                                fullWidth>
                                                {index === 0 ? cancelButtonText : "Atrás"}
                                            </Button>
                                        </Grid>

                                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                                            <Button
                                                type="submit" variant="contained" color="secondary" fullWidth
                                                disabled={isSubmitting}
                                            >
                                                {index === formSections.length - 1 ? submitButtonText : "Siguiente"}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Form>
                            )}
                        </Formik>
                    </StepContent>
                </Step>
            ))}
        </Stepper>
    );
}

//TODO: crea la estructura con los campos, segun el tipo de data entry
const fieldsEstructure = (isMobile, values, handleChange, handleBlur, errors, touched, setFieldValue, classes, isModal, section) => {
    switch (section.entryType) {
        case "table": {
            return (
                section.fields.map((field) => (
                    fieldExport(isMobile, field, values, handleChange, handleBlur, errors, touched, setFieldValue, classes,
                        isModal,
                        field.items,
                        field.resolution, field.ratio)
                ))
            );
        }; break;
        default: {
            return (
                section.fields.map((field) => (
                    fieldExport(isMobile, field, values, handleChange, handleBlur, errors, touched, setFieldValue, classes,
                        isModal,
                        field.items,
                        field.resolution, field.ratio)
                ))
            );
        }
    }
}

/* OLD FORM, migrar de a poco a CustomForm sobre todo los modales */
export function FormSections(props) {
    const { classes } = useStyles();
    const {
        formSections,
        values, errors, handleChange, handleBlur, touched, setFieldValue,
        isModal = false
    } = props;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')) ? true : false;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            {formSections.map((section) => (
                <Grid container spacing={2} key={section.name} className={isModal ? classes.section : classes.sectionMargin}>
                    {(section.name || section.description) &&
                        <Grid item xs={12}>
                            {section.name && <Typography variant="h6"> {section.name} </Typography>}
                            {section.description && <Typography variant="body1" align="justify"> {section.description} </Typography>}
                        </Grid>
                    }

                    {/*section.fields.map((field) => (
                        fieldExport(isMobile, field, values, handleChange, handleBlur, errors, touched, setFieldValue, classes,
                            isModal,
                            field.items,
                            field.resolution, field.ratio)
                        ))*/
                        fieldsEstructure(isMobile, values, handleChange, handleBlur, errors, touched, setFieldValue, classes, isModal, section)}
                </Grid>
            ))}
        </LocalizationProvider>
    );
}

/* NEW FORM, migrar de a poco a CustomForm sobre todo los modales */
export function CustomForm(props) {
    const { classes } = useStyles();
    const {
        formSections,
        onSubmit,
        onCancel,
        submitButtonText = "Aceptar",
        cancelButtonText = "Cancelar",
        stepperType = false,//false, vertical, horizontal
        isModal = false,
    } = props;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')) ? true : false;

    return (stepperType
        ? StepperForm(stepperType, formSections, isModal, classes, isMobile, onSubmit, onCancel, submitButtonText, cancelButtonText)
        : DefaultForm(formSections, isModal, classes, isMobile, onSubmit, onCancel, submitButtonText, cancelButtonText)
    );
}
CustomForm.propTypes = {
    formSections: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    submitButtonText: PropTypes.string.isRequired,
    cancelButtonText: PropTypes.string.isRequired,
    isModal: PropTypes.bool.isRequired,
};
