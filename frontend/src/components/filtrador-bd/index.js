import React, { Fragment } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Paper, Typography } from '@mui/material';

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
}));

export default function FiltradorBD(props) {
    const {
        filters, setFilters,
        updateData,
    } = props;
    const { classes } = useStyles();

    /*useEffect(() => {
    }, []);*/

    const handleChangeCheckboxGroup = (e, filter, opcion) => {
        var t_new = [...filters];

        for (var i = 0; i < t_new.length; i++) {
            if (t_new[i].id == filter.id) {
                for (var j = 0; j < t_new[i].value.length; j++) {
                    if (t_new[i].value[j].id == opcion.id) {
                        t_new[i].value[j].value = !t_new[i].value[j].value;
                    }
                }
            }
        }

        setFilters(t_new);
    };

    const filterItem = (filter) => {
        switch (filter.tipo) {
            case "radial": {
                return <Fragment key={filter.id}>Radial</Fragment>
            };
            case "checkboxGroup": {
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
                    {filters && filters.map((filter) => (
                        filterItem(filter)
                    ))}

                    <Button
                        variant="contained" color="secondary" fullWidth
                        onClick={updateData}
                    >
                        {"Aplicar filtros"}
                    </Button>
                </Paper>
            </Grid>
        </Fragment>
    );
}