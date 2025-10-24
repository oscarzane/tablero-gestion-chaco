import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Fade, Grid, Paper } from '@mui/material';
import MaterialTable from './table';
import FiltradorBD from './filtrador';
import { postData } from '../../services/ajax';
import { enqueueSnackbar } from 'notistack';
//import styles from './style.module.scss';

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

export const MaterialTableFilterType = {
    textBox: "textBox",
    select: "select",
    checkBox: "checkBox",
    checkboxGroup: "checkboxGroup",
}

export default function MaterialTableV2(props) {
    const {
        tableTitle,
        tableId,
        defaultOrder,
        defaultOrderBy,
        tableHeaders,
        moreMenuItems,
        rowActions,
        getUrl,//url de consulta a la base de datos
        customParameters,//array de parametros personalizados para la consulta
        rowsPerPage,//cantidad de paginas por hoja
        initialFilters = [],//filtros a usar
        tableNeedUpdate,
        setTableNeedUpdate,
        globalsContext = false,//se usa para almacenar los filtros y busqueda
        tableName = "",//se usa para discernir entre cada tabla guardada en globalscontext
    } = props;

    const { classes } = useStyles();

    const [datosBd, setDatosBd] = useState([]);
    const [paginaActual, setPaginaActual] = useState(globalsContext && globalsContext.filtrosPorVentana[tableName + "paginaActual"] ? globalsContext.filtrosPorVentana[tableName + "paginaActual"] : 0);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [orderBy, setOrderBy] = useState(defaultOrderBy);
    const [orderType, setOrderType] = useState(defaultOrder);

    const [filters, setFilters] = useState(globalsContext && globalsContext.filtrosPorVentana[tableName + "filters"] ? globalsContext.filtrosPorVentana[tableName + "filters"] : initialFilters);
    const handleSetFilters = (e) => {
        setFilters(e);
        if(globalsContext)
            globalsContext.setFiltrosPorVentana(e, tableName + "filters");
    };

    const leerBd = async () => {
        setDatosBd([]);

        const response = await postData(getUrl, {
            filtrosTabla: filters,
            rowsPerPage: rowsPerPage,
            page: paginaActual,
            orderType: orderType,
            orderBy: orderBy,

            ...customParameters
        });

        if (response.error === "") {
            setPaginaActual(response.data.page);
            setTotalRegistros(response.data.total_count);

            if(globalsContext)
                globalsContext.setFiltrosPorVentana(response.data.page, tableName + "paginaActual");

            setDatosBd(response.data.data);
        }
        else
            enqueueSnackbar(response.error, { variant: "error" });
    };

    const informacionFiltrada = useMemo(() => {
        if(filters && filters.length > 0) {
            for(let i=0; i<filters.length; i++) {
                if (filters[i].value !== filters[i].resetValue) {
                    return true;
                }
            }
        }
        return false;
    }, [filters]);
    console.log("filteros", filters);

    useEffect(() => {
        leerBd();
    }, [paginaActual, orderBy, orderType, tableNeedUpdate]);

    return (
        <Fragment>
            <FiltradorBD
                filters={filters}
                setFilters={handleSetFilters}
                updateData={leerBd}
            />

            <Fade in={true} timeout={900}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <MaterialTable
                            title={tableTitle}
                            loadData={leerBd}
                            headers={tableHeaders}
                            data={datosBd}
                            moreMenuItems={moreMenuItems}
                            selectable={false}
                            rowActions={rowActions}
                            idName={tableId}
                            rowsPerPage={rowsPerPage}
                            needUpdate={tableNeedUpdate}
                            paginaActual={paginaActual}
                            setPaginaActual={setPaginaActual}
                            totalRegistros={totalRegistros}
                            orderBy={orderBy}
                            setOrderBy={setOrderBy}
                            orderType={orderType}
                            setOrderType={setOrderType}
                            informacionFiltrada={informacionFiltrada}
                        />
                    </Paper>
                </Grid>
            </Fade>
        </Fragment>
    );
}