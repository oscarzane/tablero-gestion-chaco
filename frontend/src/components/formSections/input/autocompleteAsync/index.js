import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Autocomplete, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { postData } from '../../../../services/ajax';

const useStyles = makeStyles()((theme) => ({
    /*container: {
        border: "solid 1px " + theme.palette.text.primary,
        borderRadius: "8px",
        margin: "6px 0 3px 0",
        display: "flex",
        overflow: "hidden",
    },*/
}));

export function AutocompleteAsyncInput(props) {
    const theme = useTheme();

    const { classes } = useStyles();
    const {
        id, value, onChange, onBlur, disabled,
        items = [],
        autoHighlight = true, openOnFocus = true,
        postName, postVars,
        minSearchLength,
        renderInput,
        getOptionLabel,
        isOptionEqualToValue
    } = props;

    const [userInputValue, setUserInputValue] = useState("");//valor ingresado por el usuario
    const [options, setOptions] = useState(items ? items : []);//opciones de la lista desplegable
    const [loading, setLoading] = useState(false);

    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    React.useEffect(() => {//cada vez que cambia el texto escrito
        let active = true;
        setOptions([]);//limpio las opciones

        if (userInputValue.length >= minSearchLength)//si tiene al menos la longitud minima
            setLoading(true);
        else {
            setLoading(false);
            return undefined;
        }

        let timer = setTimeout(() => {//arranco el timer para buscar asincronamente
            postData(postName, { ...postVars, userInputValue: userInputValue }).then(response => {
                if (active) {
                    if (response.error === "") {
                        setOptions(response.data);
                    }
                    else
                        enqueueSnackbar(response.error, { variant: "error" });

                    setLoading(false);
                }
            });
        }, 1200);//1.2 seg

        return () => {
            active = false;
            clearTimeout(timer);//limpio el timer para que no se ejecute dos veces al rellamarse el objeto
        };
    }, [userInputValue]);
    
    return (
        <Autocomplete
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onInputChange={(event, newInputValue) => {
                setUserInputValue(newInputValue);
            }}
            disabled={disabled}
            autoHighlight={autoHighlight}
            openOnFocus={openOnFocus}
            options={options}
            loading={loading}
            renderInput={renderInput}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={getOptionLabel}
        />
    );
}