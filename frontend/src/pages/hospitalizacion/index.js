import React, { useCallback, useContext, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../services/ajax/';
import { AuthContext } from '../../context/auth';
import { GlobalsContext } from '../../context/globals';
import { DataType } from '../../components/material-table';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import ReplyAllRoundedIcon from '@mui/icons-material/ReplyAllRounded';
import { useSnackbar } from 'notistack';
import { Formatter } from '../../const/formatter';
import VerLogDialog from '../../components/modal/log/verLog';
import { AlertModalContext } from '../../components/modal/alert';
import { LoadingModalContext } from '../../components/modal/loading';
import { blue } from '@mui/material/colors';
import PreviewIcon from '@mui/icons-material/Preview';
import CodeIcon from '@mui/icons-material/Code';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import MaterialTableV2, { MaterialTableFilterType } from '../../components/material-table-v2';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Layout from '../../components/layout/main';
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

export default function VerBdHospitalizacion(props) {
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

    const onEliminar = useCallback(async (row) => {
        alertModal.showModal(
            "Eliminar hospitalizacion",
            "La hospitalización será eliminada. ¿Deseas continuar?",
            async function () {
                loadingModal.setOpen(true);

                const response = await postData("hospitalizacion/eliminar.php", {
                    id_usuario: usuario.id_usuario,
                    id_hospitalizacion: row.id_hospitalizacion
                });

                if (response.error === "") {
                    enqueueSnackbar("Hospitalización eliminada ok", { variant: "success" });
                    setHospitalizacionTableNeedUpdate(Date.now());
                }
                else
                    enqueueSnackbar(response.error, { variant: "error" });

                loadingModal.setOpen(false);
            });
    }, [usuario.id_usuario]);

    const newInforme = useCallback(async (row) => {
        globalsContext.setIdEdit(false);
        navigate("/hospitalizacion/nuevo");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [/*globalsContext, */navigate]);

    const onCorregir = useCallback(async (row) => {
        globalsContext.setIdEdit(row.id_hospitalizacion);
        navigate("/hospitalizacion/editar");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

    //pide una nueva planilla a supervisar codificacion desde la pool de pendientes
    const onSupervisarCodPool = useCallback(async (row) => {
        loadingModal.setOpen(true);

        const response = await postData("hospitalizacion/iniciar-codificacionSupervision.php", {
            id_usuario: usuario.id_usuario
        });

        loadingModal.setOpen(false);

        if (response.error === "") {
            //si tengo una id, la codifico
            if (response.data.id_hospitalizacion) {//se asigno una hospitalizacion
                globalsContext.setIdEdit(response.data.id_hospitalizacion);
                navigate("/hospitalizacion/aprobar-rechazar-codificacion");
            }
            else {//no hay id
                //todo pool, debe mostrar la lista de hospi propias y un boton para pedir otra nueva
                alertModal.showModal(
                    "Sin Hospitalizaciones",
                    "No quedan hospitalizaciones codificadas pendientes de supervisar. Hay " + response.data.hospitalizaciones.length + " ya asignadas a supervisores de codificación.");
            }
        }
        else
            enqueueSnackbar(response.error, { variant: "error" });
    }, [usuario.id_usuario]);

    //pide una nueva codificacion desde la pool de codificaciones
    const onCodificarPool = useCallback(async () => {
        loadingModal.setOpen(true);
        const response = await postData("hospitalizacion/iniciar-codificacion.php", {
            id_usuario: usuario.id_usuario
        });
        loadingModal.setOpen(false);

        if (response.error === "") {
            console.log(response.data.hospitalizaciones.length);
            //si tengo una id, la codifico
            if (response.data.id_hospitalizacion) {//se asigno una hospitalizacion
                globalsContext.setIdEdit(response.data.id_hospitalizacion);
                navigate("/hospitalizacion/codificar");
            }
            else {//no hay id
                //todo pool, debe mostrar la lista de hospi propias y un boton para pedir otra nueva
                alertModal.showModal(
                    "Sin Hospitalizaciones",
                    "No quedan hospitalizaciones pendientes de codificar. Hay " + response.data.hospitalizaciones.length + " ya asignadas a codificadores.");
            }
        }
        else
            enqueueSnackbar(response.error, { variant: "error" });
    }, [usuario.id_usuario]);

    //codifica la elegida manualmente en el listado
    const onCodificar = useCallback(async (row) => {
        globalsContext.setIdEdit(row.id_hospitalizacion);
        navigate("/hospitalizacion/codificar");
    }, []);

    //supervisa la codificacion la elegida manualmente en el listado
    const onSupervisarCodificacion = useCallback(async (row) => {
        globalsContext.setIdEdit(row.id_hospitalizacion);
        navigate("/hospitalizacion/aprobar-rechazar-codificacion");
    }, []);

    const onVer = useCallback(async (row) => {
        globalsContext.setIdEdit(row.id_hospitalizacion);
        navigate("/hospitalizacion/ver");
    }, []);

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
                    globalsContext.setIdEdit(row.id_hospitalizacion);
                    navigate("/hospitalizacion/aprobar-rechazar");
                }
            }
            else
                enqueueSnackbar(response.error, { variant: "error" });
        }
        else {*/
        globalsContext.setIdEdit(row.id_hospitalizacion);
        navigate("/hospitalizacion/aprobar-rechazar");
        //}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.id_usuario]);

    const onReabrirCorreccion = useCallback(async (row) => {
        alertModal.showModal(
            "Reabrir para correción",
            `El informe ` + (row.num_histo_clinica ? row.num_histo_clinica : "") + ` se encuentra en manos de estadística central. 
            El mismo será retornado a tu establecimiento y quedará pendiente de corrección. ¿Deseas continuar?`,
            async function () {
                loadingModal.setOpen(true);

                const response = await postData("hospitalizacion/reabrir.php", {
                    id_usuario: usuario.id_usuario,
                    id_hospitalizacion: row.id_hospitalizacion
                });

                if (response.error === "") {
                    enqueueSnackbar("Informe retomado ok", { variant: "success" });
                    setHospitalizacionTableNeedUpdate(Date.now());
                }
                else
                    enqueueSnackbar(response.error, { variant: "error" });

                loadingModal.setOpen(false);
            });
    }, [usuario.id_usuario]);

    //MaterialTable elements
    const [hospitalizacionTableNeedUpdate, setHospitalizacionTableNeedUpdate] = useState(Date.now());
    const hospitalizacionTableHeaders = [
        { id: 'f_egreso', label: 'Egreso', dataType: DataType.DATE, sortable: true },
        { id: 'uo_egreso_str', label: 'Uni. Egreso', dataType: DataType.TEXT, sortable: false },
        { id: 'dni', label: 'DNI', dataType: DataType.NUMBER, sortable: true },
        { id: 'num_histo_clinica', label: 'N° H.Clinica', dataType: DataType.NUMBER, sortable: true },
        { id: 'diagnostico_principal', label: 'Diagnóstico', dataType: DataType.TEXT, sortable: false },
        { id: 'estado_str', label: 'Estado', dataType: DataType.TEXT, sortable: false },
        ...(() => { return usuario.admin ? [
            { id: 'establecimiento_str', label: 'Establecimiento', dataType: DataType.TEXT, sortable: false },
        ] : [] })(),
        ...(() => { return usuario.admin || usuario.codif || usuario.scodif ? [
            { id: 'cod_nombre', label: 'Codificador Asignado', dataType: DataType.TEXT, sortable: false },
            { id: 'supcod_nombre', label: 'Sup. Codificación', dataType: DataType.TEXT, sortable: false },
        ] : [] })(),
        { id: 'inconsistencias', label: 'Inconsistencias', dataType: DataType.NUMBER, sortable: true },
        { id: 'num_informe', label: 'N° Inf', dataType: DataType.NUMBER, sortable: true },
    ];
    const hospitalizacionCustomParameters = {
        id_usuario: usuario.id_usuario
    };
    const hospitalizacionMoreMenuItems = (() => {
        const menuItems = [];

        if (usuario.carga == 1 || usuario.admin == 1)
            menuItems.push({ label: "Nuevo informe", icon: <AddCircleOutlineRoundedIcon sx={{ color: blue[500] }} />, action: () => newInforme() });

        if (usuario.codif == 1 || usuario.admin == 1)
            menuItems.push({ label: "Codificar informe", icon: <CodeIcon sx={{ color: blue[500] }} />, action: () => onCodificarPool() });

        if (usuario.scodif == 1 || usuario.admin == 1)
            menuItems.push({ label: "Supervisar Codificación", icon: <IntegrationInstructionsIcon sx={{ color: blue[500] }} />, action: () => onSupervisarCodPool() });

        return menuItems;
    })();
    const hospitalizacionRowActions = (row) => {
        let acciones = [];

        acciones.push(
            { label: "Ver planilla", icon: <PreviewIcon sx={{ color: blue[500] }} />, action: () => onVer(row) },
            {
                label: "Ver historial", icon: <HistoryRoundedIcon sx={{ color: blue[500] }} />, action: () => {
                    setIdReferenciaVerLogModal(row.id_hospitalizacion);
                    setReferenciaVerLogModal(Formatter.log_referencia.HOSPITALIZACION.id);
                }
            },
        );

        if (row.responsable == 1 && row.estado == 2) {
            if (usuario.carga == 1 || usuario.admin == 1)
                acciones.push({ label: "Corregir informe", icon: <ListAltRoundedIcon sx={{ color: blue[500] }} />, action: () => onCorregir(row) });
        }
        if (row.responsable == 2 && row.estado == 1) {
            if (usuario.scarga == 1 || usuario.admin == 1)
                acciones.push({ label: "Aprobar / Rechazar carga", icon: <AssignmentTurnedInRoundedIcon sx={{ color: blue[500] }} />, action: () => onAprobarRechazar(row) });
        }
        if (row.responsable == 3 && row.estado == 1) {
            if (usuario.codif == 1 || usuario.admin == 1)
                acciones.push({ label: "Codificar", icon: <CodeIcon sx={{ color: blue[500] }} />, action: () => onCodificar(row) });
        }
        if (row.responsable == 3 && row.estado == 2 && row.id_usuario_supcod == usuario.id_usuario) {
            if (usuario.scodif == 1 || usuario.admin == 1)
                acciones.push({ label: "Sup. codificación", icon: <IntegrationInstructionsIcon sx={{ color: blue[500] }} />, action: () => onSupervisarCodificacion(row) });
        }
        if (row.responsable * 1 > 2) {
            if (usuario.scarga == 1 || usuario.admin == 1)
                acciones.push({ label: "Retornar para corrección", icon: <ReplyAllRoundedIcon sx={{ color: blue[500] }} />, action: () => onReabrirCorreccion(row) });
        }

        if (usuario.admin == 1 || usuario.puede_eliminar)
            acciones.push({ label: "Eliminar", icon: <DeleteRoundedIcon sx={{ color: blue[500] }} />, action: () => onEliminar(row) });

        return acciones;
    };

    const filtrosHospitalizacion = [
        {
            id: "establecimiento.nombre",
            label: "Establecimiento",
            type: MaterialTableFilterType.textBox,
            value: "", resetValue: "",
            sql: "",
        },
        {
            id: "hospitalizacion.num_histo_clinica",
            label: "N° Historia Clínica",
            type: MaterialTableFilterType.textBox,
            value: "", resetValue: "",
            sql: "",
        },
        {
            id: "hospitalizacion.dni",
            label: "Documento",
            type: MaterialTableFilterType.textBox,
            value: "", resetValue: "",
            sql: "",
        },
        {
            id: "uo_servicio.nombre",
            label: "Unidad de egreso",
            type: MaterialTableFilterType.textBox,
            value: "", resetValue: "",
            sql: "",
        },
        {
            id: "hospitalizacion.diagnostico_principal",
            label: "Diagnóstico principal",
            type: MaterialTableFilterType.textBox,
            value: "", resetValue: "",
            sql: "",
        },
        {
            id: "hospitalizacion.f_ingreso",
            label: "F. de ingreso (AAAA-MM-DD)",
            type: MaterialTableFilterType.textBox,
            value: "", resetValue: "",
            sql: "",
        },
        {
            id: "hospitalizacion.f_egreso",
            label: "F. de egreso (AAAA-MM-DD)",
            type: MaterialTableFilterType.textBox,
            value: "", resetValue: "",
            sql: "",
        },
        {
            id: "hospitalizacion.f_nacimiento",
            label: "F. de nacimiento (AAAA-MM-DD)",
            type: MaterialTableFilterType.textBox,
            value: "", resetValue: "",
            sql: "",
        },
        {
            id: "hospitalizacion.edad",
            label: "Edad",
            type: MaterialTableFilterType.textBox,
            value: "", resetValue: "",
            sql: "",
        },
        {
            id: "hospitalizacion.tipo_egreso",
            label: "Tipo de egreso",
            type: MaterialTableFilterType.select,
            value: "", resetValue: "",
            sql: "",
            options: Formatter.tipo_egreso,
        },
        {
            id: "hospitalizacion.cant_reparos",
            label: "Con reparos",
            type: MaterialTableFilterType.select,
            value: "", resetValue: "",
            sql: "",
            options: [
                { id: 0, nombre: "Sin reparos", comparator: "=" },
                { id: 1, nombre: "Con reparos", comparator: ">=" },
            ],
        },
        {
            id: "hospitalizacion.responsable;hospitalizacion.estado",
            label: "Estado",
            type: MaterialTableFilterType.select,
            value: "", resetValue: "",
            sql: "",
            id_separator: ";",//caracter que separa los multiples id usados en casos de consultas complejas
            sql_joiner: "AND;AND",//boolean para unir cada filtro de la consulta compleja
            options: [
                { id: "1;2", nombre: "Pendiente de corrección" },
                { id: "2;1", nombre: "Pendiente de supervisión" },
                { id: "3;1", nombre: "Pendiente de codificación" },
                { id: "3;2", nombre: "Pendiente de sup. de codificación" },
            ],
        },
        {
            id: "hospitalizacion.id_usuario_carga;hospitalizacion.id_usuario_aprueba;hospitalizacion.id_usuario_cod;hospitalizacion.id_usuario_supcod",
            label: "Mis planillas",
            type: MaterialTableFilterType.select,
            value: "", resetValue: "",
            sql: "",
            id_separator: ";",//caracter que separa los multiples id usados en casos de consultas complejas
            sql_joiner: "OR;OR;OR;OR",//boolean para unir cada filtro de la consulta compleja
            options: [
                { id: usuario.random + ";undefined;undefined;undefined", nombre: "Cargadas" },
                { id: "undefined;" + usuario.random + ";undefined;undefined", nombre: "Supervisadas" },
                { id: "undefined;undefined;" + usuario.random + ";undefined", nombre: "Codificadas" },
                { id: "undefined;undefined;undefined;" + usuario.random, nombre: "Sup. Codificación" },
            ],
        },
    ];

    return (
        <Layout nombrePagina="Hospitalizaciones">
            <MaterialTableV2
                tableTitle={"Hospitalizaciones"}
                tableId={"id_hospitalizacion"}
                defaultOrder={"desc"}
                defaultOrderBy={"f_egreso"}
                getUrl={"hospitalizacion/leer.php"}
                rowsPerPage={5}
                tableHeaders={hospitalizacionTableHeaders}
                moreMenuItems={hospitalizacionMoreMenuItems}
                rowActions={hospitalizacionRowActions}
                customParameters={hospitalizacionCustomParameters}
                initialFilters={filtrosHospitalizacion}
                tableNeedUpdate={hospitalizacionTableNeedUpdate}
                setTableNeedUpdate={setHospitalizacionTableNeedUpdate}
                globalsContext={globalsContext}//se usa para almacenar los filtros y busqueda
                tableName={"verHospitalizaciones"}//se usa para discernir entre cada tabla guardada en globalscontext
            />

            <VerLogDialog
                referencia={referenciaVerLogModal}
                setReferencia={setReferenciaVerLogModal}
                id_referencia={idReferenciaVerLogModal}
                id_usuario={usuario.id_usuario}
            />
        </Layout>
    );
}