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
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
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
        navigate("/establecimiento/nuevo");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [/*globalsContext, */navigate]);

    const onEditar = useCallback(async (row) => {
        globalsContext.setIdEdit(row.id_establecimiento);
        navigate("/establecimiento/editar");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

    const onEliminar = useCallback(async (row) => {
        alertModal.showModal(
            (row.eliminado == 1 ? "Habilitar" : "Deshabilitar") + " establecimiento",
            "El establecimiento " + row.nombre + " será " + (row.eliminado == 1 ? "habilitado" : "deshabilitado") + ". ¿Deseas continuar?",
            async function () {
                loadingModal.setOpen(true);

                const response = await postData("establecimiento/eliminar.php", {
                    id_usuario: usuario.id_usuario,
                    id_establecimiento: row.id_establecimiento,
                    eliminado: row.eliminado
                });

                if (response.error === "") {
                    enqueueSnackbar("Establecimiento " + (row.eliminado == 1 ? "habilitado" : "deshabilitado") + " ok", { variant: "success" });
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
        title: "Establecimientos de salud",
        idName: "id_establecimiento",
        defaultOrder: "asc",
        headers: [
            { id: 'codigo', label: 'Código', dataType: DataType.TEXT, sortable: true },
            { id: 'tipo_str', label: 'Tipo', dataType: DataType.TEXT, sortable: true },
            { id: 'nombre', label: 'Nombre', dataType: DataType.TEXT, sortable: true },
            { id: 'eliminado_str', label: 'Deshabilitado', dataType: DataType.TEXT, sortable: true },
            { id: 'a_agensanit_str', label: 'Agen. Sanit.', dataType: DataType.TEXT, sortable: true },
            { id: 'a_consuextern_str', label: 'Con. Externo', dataType: DataType.TEXT, sortable: true },
            { id: 'a_hospitalizacion_str', label: 'Hospitalización', dataType: DataType.TEXT, sortable: true },
            { id: 'a_laboratorio_str', label: 'Laboratorio', dataType: DataType.TEXT, sortable: true },
            { id: 'a_obstetricia_str', label: 'Obstetricia', dataType: DataType.TEXT, sortable: true },
            { id: 'a_enfermeria_str', label: 'Prest. Enfermería', dataType: DataType.TEXT, sortable: true },
            { id: 'a_prodmensual_str', label: 'Prod. Mensual', dataType: DataType.TEXT, sortable: true },
            { id: 'a_materinfan_str', label: 'Prog. Mat. Infantil', dataType: DataType.TEXT, sortable: true },
            { id: 'a_recibyderiv_str', label: 'Rec. y Deriv.', dataType: DataType.TEXT, sortable: true },
            { id: 'a_trabajosocial_str', label: 'Trabajo Social', dataType: DataType.TEXT, sortable: true },
        ],
        loadData: async (orderBy, order, page, rowsPerPage, searchText, selectedFilter, pageUpdate, totalUpdate, filterListUpdate) => {
            setRowsTableMain(null);

            const response = await postData("establecimiento/leer.php", {
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
                    setIdReferenciaVerLogModal(row.id_establecimiento);
                    setReferenciaVerLogModal(Formatter.log_referencia.RECIB_DERIV.id);
                }
            });*/
            
            if (usuario.admin == 1) {
                acciones.push({ label: "Editar", icon: <EditRoundedIcon sx={{ color: blue[500] }} />, action: () => onEditar(row) });
                acciones.push({
                    label: row.eliminado == 1 ? "Habilitar" : "Deshabilitar",
                    icon: row.eliminado == 1 ? <FileDownloadDoneIcon sx={{ color: blue[500] }} /> : <DeleteRoundedIcon sx={{ color: blue[500] }} />,
                    action: () => onEliminar(row)
                });
            }

            return acciones;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [usuario.id_usuario]);

    /*useEffect(() => {
        tableMain.loadData();
    }, [tableMain]);*/

    return (
        <Layout nombrePagina="Establecimientos de salud">
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
                            tableName={"verEstablecimiento"}//se usa para discernir entre cada tabla guardada en globalscontext
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