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
import { amber, blue, cyan, pink } from '@mui/material/colors';
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
    const [aprobarChequeoOpen, setAprobarChequeoOpen] = useState(false);

    const [referenciaVerLogModal, setReferenciaVerLogModal] = useState(null);
    const [idReferenciaVerLogModal, setIdReferenciaVerLogModal] = useState(null);

    const onEliminar = useCallback(async (row) => {
        alertModal.showModal(
            "Eliminar planilla",
            "La planilla será eliminada. ¿Deseas continuar?",
            async function () {
                loadingModal.setOpen(true);

                const response = await postData("trabajo-social/eliminar.php", {
                    id_usuario: usuario.id_usuario,
                    id_trabajo_social: row.id_trabajo_social
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

    const onVerSolicitud = useCallback(async (row) => {
        loadingModal.setOpen(true);
        globalsContext.setIdEdit(row.id_trabajo_social);
        navigate("/trabajo-social/ver-solicitud");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalsContext, navigate]);

    const newInforme = useCallback(async (row) => {
        globalsContext.setIdEdit(false);
        navigate("/trabajo-social/nuevo");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [/*globalsContext, */navigate]);

    const onCorregir = useCallback(async (row) => {
        globalsContext.setIdEdit(row.id_trabajo_social);
        navigate("/trabajo-social/editar");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

    const onAprobarRechazar = useCallback(async (row) => {
        globalsContext.setIdEdit(row.id_trabajo_social);
        navigate("/trabajo-social/aprobar-rechazar");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

    const onReabrirCorreccion = useCallback(async (row) => {
        alertModal.showModal(
            "Reabrir para correción",
            "El informe ya finalizado " + row.fecha_str + ", será reabierto y quedará pendiente de corrección. ¿Deseas continuar?",
            async function () {
                loadingModal.setOpen(true);

                const response = await postData("trabajo-social/reabrir.php", {
                    id_usuario: usuario.id_usuario,
                    id_trabajo_social: row.id_trabajo_social
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
        title: "Trabajo Social",
        idName: "id_trabajo_social",
        defaultOrder: "desc",
        headers: [
            { id: 'fecha_str', label: 'Fecha', dataType: DataType.DATE, sortable: true },
            ...(() => { return usuario.admin ? [{ id: 'establecimiento_str', label: 'Establecimiento', dataType: DataType.TEXT, sortable: true }] : [] })(),
            { id: 'estado_str', label: 'Estado', dataType: DataType.TEXT, sortable: false },
            { id: 'inconsistencias', label: 'Inconsistencias', dataType: DataType.NUMBER, sortable: true },
            { id: 'cantConsultas', label: 'Consultas / Atenciones', dataType: DataType.NUMBER, sortable: true },
            { id: 'cantGenero', label: 'No Binarias LGTBIQ+', dataType: DataType.NUMBER, sortable: true },
            { id: 'cantOriginarios', label: 'Pueblos Originarios', dataType: DataType.NUMBER, sortable: true },
        ],
        loadData: async (orderBy, order, page, rowsPerPage, searchText, selectedFilter, pageUpdate, totalUpdate, filterListUpdate) => {
            setRowsTableMain(null);

            const response = await postData("trabajo-social/leer.php", {
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
                    setIdReferenciaVerLogModal(row.id_trabajo_social);
                    setReferenciaVerLogModal(Formatter.log_referencia.TRAB_SOCIAL.id);
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
        <Layout nombrePagina="Trabajo Social">
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
                            tableName={"verTrabajoSocial"}//se usa para discernir entre cada tabla guardada en globalscontext
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