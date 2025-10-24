import React, { Fragment } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { MaterialTableFilterType } from '.';

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',

        width: '100%',
        marginBottom: theme.spacing(2),
    },
    fixedHeight: {
        height: 240,
    },
    botonera: {
        display: "flex",
        flexWrap: "wrap",
        marginBottom: theme.spacing(2),
    },
    formControl: {
        width: "100%",
    },
}));

export default function FiltradorBD(props) {
    const {
        filters,
        setFilters,
        updateData,
    } = props;
    const { classes } = useStyles();

    const handleChangeCheckboxGroup = (e, filter, opcion) => {
        /*var t_new = [...filters];

        for (var i = 0; i < t_new.length; i++) {
            if (t_new[i].id == filter.id) {
                for (var j = 0; j < t_new[i].value.length; j++) {
                    if (t_new[i].value[j].id == opcion.id) {
                        t_new[i].value[j].value = !t_new[i].value[j].value;
                    }
                }
            }
        }

        setFilters(t_new);*/
    };

    const clearFilters = () => {
        var t_new = [...filters];

        for (var i = 0; i < t_new.length; i++) {
            t_new[i].value = t_new[i].resetValue;
            t_new[i].sql = "";
        }

        setFilters(t_new);

        updateData();
    };

    const handleChangeTextBox = (e, id, comparator) => {
        var t_new = [...filters];

        for (var i = 0; i < t_new.length; i++) {
            if (t_new[i].id == id) {
                t_new[i].value = e.target.value;
                t_new[i].sql = " " + t_new[i].id + " " + comparator + " '%" + t_new[i].value + "%'";
            }
        }

        setFilters(t_new);
    };

    const handleChangeSelect = (e, id, options) => {
        var t_new = [...filters];

        for (var i = 0; i < t_new.length; i++) {
            //busco en el array de filtros el actual
            if (t_new[i].id == id) {
                //si el valor nuevo es vacio
                if (e.target.value === "") {
                    t_new[i].value = "";
                    t_new[i].sql = "";
                }
                else if (e.target.value != t_new[i].value) {//si no es vacio, y cambio el valor anterior
                    var comparator = "=";
                    //si tengo un comparador personalizado
                    if (options[0].comparator != null) {
                        for (var j = 0; j < options.length; j++) {
                            if (options[j].id == e.target.value)
                                comparator = options[j].comparator;
                        }
                    }

                    t_new[i].value = e.target.value;
                    t_new[i].sql = "";

                    //si tengo una consulta compleja
                    if (t_new[i].id_separator != null) {//ejemplo ;
                        var t_camposBD = t_new[i].id.split(t_new[i].id_separator);//ej id_usuario;id_hospitalizacion
                        var t_valoresBD = t_new[i].value.split(t_new[i].id_separator);//ej 1;4
                        var t_joinerBD = t_new[i].sql_joiner.split(t_new[i].id_separator);// ej AND;OR

                        for (var j = 0; j < t_valoresBD.length; j++) {
                            if (t_valoresBD[j] != "undefined"){//si no tengo que omitir este valor
                                t_new[i].sql += t_new[i].sql == "" ? "" : " " + t_joinerBD[j];
                                t_new[i].sql += " " + t_camposBD[j] + comparator + "'" + t_valoresBD[j] + "'";
                            }
                        }
                    }
                    else
                        t_new[i].sql = " " + t_new[i].id + comparator + "'" + t_new[i].value + "'";
                }
            }
        }
    };

    //setea los filtros en la interfaz
    const filterItem = (filter) => {
        switch (filter.type) {
            case MaterialTableFilterType.textBox: {
                return <TextField
                    variant="standard"
                    label={filter.label}
                    value={filter.value}
                    onChange={(e) => handleChangeTextBox(e, filter.id, filter.comparator ? filter.comparator : "LIKE")}
                    type="text"
                    fullWidth
                />
            };
            case MaterialTableFilterType.select: {
                return <FormControl
                    variant="standard"
                    className={classes.formControl}>
                    <InputLabel id={filter.id + "-label"}> {filter.label} </InputLabel>
                    <Select
                        variant="standard"
                        labelId={filter.id + "-label2"}
                        id={filter.id}
                        value={filter.value}
                        onChange={(e) => handleChangeSelect(e, filter.id, filter.options)}
                    >
                        <MenuItem value=""><em>Seleccionar</em></MenuItem>
                        {filter.options ? filter.options.map((opcion) => (
                            <MenuItem key={opcion.id} value={opcion.id}>{opcion.nombre}</MenuItem>
                        )) : null}
                    </Select>
                </FormControl>
            };
            case MaterialTableFilterType.checkboxGroup: {
                return <FormControl component="fieldset">
                    <FormLabel component="legend">{filter.label}</FormLabel>
                    <FormGroup key={filter.id} row={true}>
                        {filter.value && filter.value.map((opcion) => (
                            <FormControlLabel
                                key={opcion.id}
                                control={
                                    <Checkbox checked={opcion.value} onChange={(e) => handleChangeCheckboxGroup(e, filter, opcion)} />
                                }
                                label={opcion.label}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
            };
        }
    };

    return (
        <Fragment>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                        Filtrar
                    </Typography>

                    <Grid container spacing={2} className={classes.botonera}>
                        {filters && filters.map((filter) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                                {filterItem(filter)}
                            </Grid>
                        ))}
                    </Grid>

                    <Grid container spacing={2} className={classes.botonera}>
                        <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                            <Button
                                variant="contained" color="error" fullWidth
                                onClick={clearFilters}
                            >
                                {"Borrar filtros"}
                            </Button>
                        </Grid>

                        <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                            <Button
                                variant="contained" color="secondary" fullWidth
                                onClick={updateData}
                            >
                                {"Aplicar filtros"}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Fragment>
    );
}