import React, { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

const storage = {
    sideOpenInDesktop: "ch-siesp-globals-sideOpenInDesktop",
    idEdit: "ch-siesp-globals-idEdit",
    idBoletaPago: "ch-siesp-globals-idBoletaPago",
    darkModeOn: "ch-siesp-globals-darkModeOn",
    filtrosPorVentana: "ch-siesp-globals-filtrosPorVentana",
};

export const GlobalsContext = React.createContext({});

export function GlobalsContextProvider(props) {
    //Side Open In Desktop
    const [sideOpenInDesktop, _setSideOpenInDesktop] = useState(
        JSON.parse(window.localStorage.getItem(storage.sideOpenInDesktop)) !== null ? JSON.parse(window.localStorage.getItem(storage.sideOpenInDesktop)) : true
    );
    const setSideOpenInDesktop = (v) => {
        window.localStorage.setItem(storage.sideOpenInDesktop, JSON.stringify(v));
        _setSideOpenInDesktop(v);
    }

    //Id Edit
    const [idEdit, _setIdEdit] = useState(
        JSON.parse(window.localStorage.getItem(storage.idEdit)) !== null ? JSON.parse(window.localStorage.getItem(storage.idEdit)) : false
    );
    const setIdEdit = (v) => {
        window.localStorage.setItem(storage.idEdit, JSON.stringify(v));
        _setIdEdit(v);
    }

    //Id Boleta Pago
    const [idBoletaPago, _setIdBoletaPago] = useState(
        JSON.parse(window.localStorage.getItem(storage.idBoletaPago)) !== null ? JSON.parse(window.localStorage.getItem(storage.idBoletaPago)) : false
    );
    const setIdBoletaPago = (v) => {
        window.localStorage.setItem(storage.idBoletaPago, JSON.stringify(v));
        _setIdBoletaPago(v);
    }

    //Filtros seleccionados en cada ventana
    const [filtrosPorVentana, _setFiltrosPorVentana] = useState(
        JSON.parse(window.localStorage.getItem(storage.filtrosPorVentana)) !== null ? JSON.parse(window.localStorage.getItem(storage.filtrosPorVentana)) : []
    );
    const setFiltrosPorVentana = (filtros, ventana) => {
        var t_filtrosPorVentana = filtrosPorVentana;
        t_filtrosPorVentana[ventana] = filtros;
        window.localStorage.setItem(storage.filtrosPorVentana, JSON.stringify(t_filtrosPorVentana));
        _setFiltrosPorVentana(t_filtrosPorVentana);
    }

    //Dark Mode ON
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)') ? true : false;
    const [darkModeOn, _setDarkModeOn] = useState(
        JSON.parse(window.localStorage.getItem(storage.darkModeOn)) !== null ? JSON.parse(window.localStorage.getItem(storage.darkModeOn)) : prefersDarkMode
    );
    const setDarkModeOn = (v) => {
        window.localStorage.setItem(storage.darkModeOn, JSON.stringify(v));
        _setDarkModeOn(v);
    }

    return (
        <GlobalsContext.Provider
            value={{
                sideOpenInDesktop, setSideOpenInDesktop,
                idEdit, setIdEdit,
                idBoletaPago, setIdBoletaPago,
                darkModeOn, setDarkModeOn,
                filtrosPorVentana, setFiltrosPorVentana,
            }}>
            {props.children}
        </GlobalsContext.Provider>
    );
}