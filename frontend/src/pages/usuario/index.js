import React, { useCallback, useContext, useMemo, useState } from 'react';
import Layout from '../../components/layout/main';
import { makeStyles } from 'tss-react/mui';
import { Fade, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../services/ajax/';
import { AuthContext } from '../../context/auth';
import { GlobalsContext } from '../../context/globals';
import MaterialTable, { DataType } from '../../components/material-table';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useSnackbar } from 'notistack';
import { Formatter } from '../../const/formatter';
import VerLogDialog from '../../components/modal/log/verLog';
import { AlertModalContext } from '../../components/modal/alert';
import { LoadingModalContext } from '../../components/modal/loading';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { blue, red, teal } from '@mui/material/colors';
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
    const navigate = useNavigate();
    const globalsContext = useContext(GlobalsContext);

    //Modals
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const [referenciaVerLogModal, setReferenciaVerLogModal] = useState(null);
    const [idReferenciaVerLogModal, setIdReferenciaVerLogModal] = useState(null);

    const onNuevo = useCallback(async (row) => {
        globalsContext.setIdEdit(false);
        navigate("/usuario/nuevo");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [/*globalsContext, */navigate]);

    const onEditar = useCallback(async (row) => {
        globalsContext.setIdEdit(row.id_usuario);
        navigate("/usuario/editar");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

    const onEliminar = useCallback(async (row) => {
        alertModal.showModal(
            "Eliminar usuario",
            "El usuario " + row.nombre + " será eliminado. ¿Deseas continuar?",
            async function () {
                loadingModal.setOpen(true);

                const response = await postData("usuario/eliminar.php", {
                    id_usuario: usuario.id_usuario,
                    id_usuario_edit: row.id_usuario
                });

                if (response.error === "") {
                    enqueueSnackbar("Usuario eliminado ok", { variant: "success" });
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
        title: "Usuarios",
        idName: "id_usuario",
        defaultOrder: "asc",
        headers: [
            { id: 'cuitCuil', label: 'CUIT/CUIL', dataType: DataType.CUIL, sortable: true },
            { id: 'nombre', label: 'Nombre', dataType: DataType.TEXT, sortable: true },
            { id: 'admin', label: 'Administrador', dataType: DataType.TEXT, sortable: true },
            { id: 'es_central', label: 'Central', dataType: DataType.TEXT, sortable: true },
            { id: 'puede_eliminar', label: 'Puede eliminar', dataType: DataType.TEXT, sortable: true },
            { id: 'solo_region', label: 'Sup. de Región', dataType: DataType.TEXT, sortable: true },
            { id: 'revisor', label: 'Revisor', dataType: DataType.TEXT, sortable: true },
            { id: 'establecimientos', label: 'Establecimientos', dataType: DataType.TEXT, sortable: true },
        ],
        loadData: async (orderBy, order, page, rowsPerPage, searchText, selectedFilter, pageUpdate, totalUpdate, filterListUpdate) => {
            setRowsTableMain(null);

            const response = await postData("usuario/leer.php", {
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
                menuItems.push({ label: "Añadir nuevo", icon: <AddCircleOutlineRoundedIcon sx={{ color: blue[500] }} />, action: () => onNuevo() });

            return menuItems;
        })(),
        rowActions: (row) => {
            const acciones = [];

            /*acciones.push({
                label: "Ver historial", icon: <HistoryRoundedIcon sx={{ color: blue[500] }} />, action: () => {
                    setIdReferenciaVerLogModal(row.id_usuario);
                    setReferenciaVerLogModal(Formatter.log_referencia.RECIB_DERIV.id);
                }
            });*/
            
            if (usuario.admin == 1)
                acciones.push({ label: "Editar", icon: <EditRoundedIcon sx={{ color: blue[500] }} />, action: () => onEditar(row) });
            
            if (usuario.admin == 1 || usuario.puede_eliminar)
                acciones.push({ label: "Eliminar", icon: <DeleteRoundedIcon sx={{ color: blue[500] }} />, action: () => onEliminar(row) });

            return acciones;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [usuario.id_usuario]);

    /*useEffect(() => {
        tableMain.loadData();
    }, [tableMain]);*/

    return (
        <Layout nombrePagina="Usuarios">
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