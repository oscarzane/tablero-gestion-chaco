import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Layout from '../../components/layout/main';
import { makeStyles } from 'tss-react/mui';
import { Fade, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../services/ajax/';
import { AuthContext } from '../../context/auth';
import { LoadingModalContext } from '../../components/modal/loading';
import { GlobalsContext } from '../../context/globals';
import MaterialTable, { DataType } from '../../components/material-table';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import ReplyAllRoundedIcon from '@mui/icons-material/ReplyAllRounded';
import { useSnackbar } from 'notistack';
import { Formatter } from '../../const/formatter';
import VerLogDialog from '../../components/modal/log/verLog';
import { AlertModalContext } from '../../components/modal/alert';
import { blue } from '@mui/material/colors';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
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
}));

function Page() {
    const { classes } = useStyles();
    //Auxiliar data
    const { usuario } = useContext(AuthContext);
    const [aprobarChequeoDialogData, setAprobarChequeoDialogData] = useState(false);
    const navigate = useNavigate();
    const globalsContext = useContext(GlobalsContext);

    //Modals
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const [referenciaVerLogModal, setReferenciaVerLogModal] = useState(null);
    const [idReferenciaVerLogModal, setIdReferenciaVerLogModal] = useState(null);

    const onEliminar = useCallback(async (row) => {
        alertModal.showModal(
            "Eliminar planilla",
            "La planilla será eliminada. ¿Deseas continuar?",
            async function () {
                loadingModal.setOpen(true);

                const response = await postData("consultorio-externo/eliminar.php", {
                    id_usuario: usuario.id_usuario,
                    id_consultorio_externo: row.id_consultorio_externo
                });

                if (response.error === "") {
                    enqueueSnackbar("Planilla eliminada ok", { variant: "success" });
                    setTableMainNeedUpdate(Date.now());
                }
                else
                    enqueueSnackbar(response.error, { variant: "error" });

                loadingModal.setOpen(false);
            });
    }, [usuario.id_usuario]);

    const newInforme = useCallback(async (row) => {
        globalsContext.setIdEdit(false);
        navigate("/consultorios-externos/nuevo");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [/*globalsContext, */navigate]);

    const onCorregir = useCallback(async (row) => {
        globalsContext.setIdEdit(row.id_consultorio_externo);
        navigate("/consultorios-externos/editar");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

    const onAprobarRechazar = useCallback(async (row) => {
        //si no es admin y trara de supervisarse a si mismo
        /*if (usuario.admin == 0 && row.id_usuario_carga == usuario.id_usuario) {
            const response = await postData("usuario/scarga-por-estab.php", {
                id_usuario: usuario.id_usuario,
                id_establecimiento: usuario.id_establecimiento
            });

            if (response.error === "") {
                //si tiene mas de un supervisor el establecimiento
                if (response.data.length > 1) {
                    //nombre de supervisores
                    var t_nombres = "";
                    for (var i = 0; i < response.data.length; i++) {
                        t_nombres += t_nombres == "" ? "" : " / ";
                        t_nombres += response.data[i].nombre == "" ? response.data[i].cuitCuil : response.data[i].nombre;
                    }
                    alertModal.showModal(
                        "Supervisión incorrecta",
                        "No puedes supervisar una planilla cargada por ti. Solicita a otro supervisor que realice esta acción. Supervisores habilitados: " + t_nombres);
                }
                else {
                    globalsContext.setIdEdit(row.id_consultorio_externo);
                    navigate("/consultorios-externos/aprobar-rechazar");
                }
            }
            else
                enqueueSnackbar(response.error, { variant: "error" });
        }
        else {*/
        globalsContext.setIdEdit(row.id_consultorio_externo);
        navigate("/consultorios-externos/aprobar-rechazar");
        //}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

    const onReabrirCorreccion = useCallback(async (row) => {
        alertModal.showModal(
            "Reabrir para correción",
            "El informe ya finalizado " + row.fecha_str + ", será reabierto y quedará pendiente de corrección. ¿Deseas continuar?",
            async function () {
                loadingModal.setOpen(true);

                const response = await postData("consultorio-externo/reabrir.php", {
                    id_usuario: usuario.id_usuario,
                    id_consultorio_externo: row.id_consultorio_externo
                });

                if (response.error === "") {
                    enqueueSnackbar("Informe reabierto ok", { variant: "success" });
                    setTableMainNeedUpdate(Date.now());
                }
                else
                    enqueueSnackbar(response.error, { variant: "error" });

                loadingModal.setOpen(false);
            });
    }, [usuario.id_usuario]);

    //MaterialTable elements
    const [rowsTableMain, setRowsTableMain] = useState(null);
    let [tableMainNeedUpdate, setTableMainNeedUpdate] = useState(Date.now());
    const tableMain = useMemo(() => ({
        title: "Consultorios Externos",
        idName: "id_consultorio_externo",
        defaultOrder: "desc",
        headers: [
            { id: 'fecha_str', label: 'Fecha', dataType: DataType.DATE, sortable: true },
            ...(() => { return usuario.admin ? [{ id: 'establecimiento_str', label: 'Establecimiento', dataType: DataType.TEXT, sortable: true }] : [] })(),
            { id: 'estado_str', label: 'Estado', dataType: DataType.TEXT, sortable: false },
            { id: 'inconsistencias', label: 'Inconsistencias', dataType: DataType.NUMBER, sortable: true },
            { id: 'totalDias', label: 'Total Días', dataType: DataType.NUMBER, sortable: true },
            { id: 'totalHoras', label: 'Total Horas', dataType: DataType.NUMBER, sortable: true },
            { id: 'totalMF', label: 'Total Consultas', dataType: DataType.NUMBER, sortable: true },
            { id: 'totalEmb', label: 'Total Embarazadas', dataType: DataType.NUMBER, sortable: true },
        ],
        loadData: async (orderBy, order, page, rowsPerPage, searchText, selectedFilter, pageUpdate, totalUpdate, filterListUpdate) => {
            setRowsTableMain(null);

            const response = await postData("consultorio-externo/leer.php", {
                id_usuario: usuario.id_usuario,
                orderBy: orderBy,
                order: order,
                page: page,
                rowsPerPage: rowsPerPage,
                searchText: searchText,
                selectedFilter: selectedFilter
            });

            if (response.error === "") {
                pageUpdate(response.data.page);
                totalUpdate(response.data.total_count);
                filterListUpdate(response.data.filterList);
                setRowsTableMain(response.data.data);
            }
            else
                enqueueSnackbar(response.error, { variant: "error" });
        },
        moreMenuItems: (() => {
            const menuItems = [];

            if (usuario.carga == 1 || usuario.admin == 1)
                menuItems.push({ label: "Nuevo informe", icon: <AddCircleOutlineRoundedIcon sx={{ color: blue[500] }} />, action: () => newInforme() });

            return menuItems;
        })(),
        rowActions: (row) => {
            const acciones = [];

            acciones.push({
                label: "Ver historial", icon: <HistoryRoundedIcon sx={{ color: blue[500] }} />, action: () => {
                    setIdReferenciaVerLogModal(row.id_consultorio_externo);
                    setReferenciaVerLogModal(Formatter.log_referencia.CONSU_EXT.id);
                }
            });

            if (row.responsable == 1 && row.estado == 2) {
                if (usuario.carga == 1 || usuario.admin == 1)
                    acciones.push({ label: "Corregir informe", icon: <ListAltRoundedIcon sx={{ color: blue[500] }} />, action: () => onCorregir(row) });
            }
            if (row.responsable == 2 && row.estado == 1) {
                if (usuario.scarga == 1 || usuario.admin == 1)
                    acciones.push({ label: "Aprobar / Rechazar", icon: <AssignmentTurnedInRoundedIcon sx={{ color: blue[500] }} />, action: () => onAprobarRechazar(row) });
            }
            if (row.responsable == 99 && row.estado == 1) {
                if (usuario.scarga == 1 || usuario.admin == 1)
                    acciones.push({ label: "Reabrir para corrección", icon: <ReplyAllRoundedIcon sx={{ color: blue[500] }} />, action: () => onReabrirCorreccion(row) });
            }

            if (usuario.admin == 1 || usuario.puede_eliminar)
                acciones.push({ label: "Eliminar", icon: <DeleteRoundedIcon sx={{ color: blue[500] }} />, action: () => onEliminar(row) });

            return acciones;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [usuario]);

    /*useEffect(() => {
        tableMain.loadData();
    }, [tableMain]);*/

    return (
        <Layout nombrePagina="Consultorios Externos">
            <Fade in={true} timeout={900}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <MaterialTable
                            title={tableMain.title}
                            loadData={tableMain.loadData}
                            headers={tableMain.headers}
                            data={rowsTableMain}
                            moreMenuItems={tableMain.moreMenuItems}
                            selectable={false}
                            rowActions={tableMain.rowActions}
                            idName={tableMain.idName}
                            defaultOrder={tableMain.defaultOrder}
                            defaultRowsPerPage={5}
                            needUpdate={tableMainNeedUpdate}
                            globalsContext={globalsContext}//se usa para almacenar los filtros y busqueda
                            tableName={"verConsultorioExterno"}//se usa para discernir entre cada tabla guardada en globalscontext
                        />
                    </Paper>
                </Grid>
            </Fade>

            <VerLogDialog
                referencia={referenciaVerLogModal}
                setReferencia={setReferenciaVerLogModal}
                id_referencia={idReferenciaVerLogModal}
                id_usuario={usuario.id_usuario}
            />
        </Layout>
    );
}

export default Page;