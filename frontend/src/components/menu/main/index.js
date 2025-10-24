import React, { Fragment, useContext } from 'react';
import { ListSubheader, List } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import MenuItem from './menuItem';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AuthContext } from '../../../context/auth';
import { AccountTree, People, SpaceDashboard } from '@mui/icons-material';

const useStyles = makeStyles()((theme) => ({
    container: {
        overflow: "hidden auto",
        margin: "8px 0",
    },
    headerExpandible: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        //cursor: "pointer",
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
        paddingLeft: "55px",
    },
    divider: {
        margin: "8px 0",
    }
}));

export default function Main() {
    const { usuario } = useContext(AuthContext);

    const { classes } = useStyles();

    //const [openAdministracion, setOpenAdministracion] = useState(false);

    const menuItems = [
        {
            label: "Tableros",
            visible: true,
            items: [
                {
                    label: "Coordinación presupuestaria y financiera",
                    icon: DashboardIcon,
                    url: "/tablero/coordinacion",
                    visible: true,
                    disabled: true,
                    list: [
                        {
                            label: "Administración",
                            icon: DashboardIcon,
                            url: "/administracion",
                            visible: false,
                            disabled: true,
                        },
                        {
                            label: "RRHH",
                            icon: DashboardIcon,
                            url: "/rrhh",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "UPS",
                            icon: DashboardIcon,
                            url: "/ups",
                            visible: true,
                            disabled: true,
                        },
                        {
                            label: "Arquitectura hospitalaria",
                            icon: DashboardIcon,
                            url: "/arquitectura-hospitalaria",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Auditoria interna",
                            icon: DashboardIcon,
                            url: "/auditoria-interna",
                            visible: true,
                            disabled: true,
                        },
                        {
                            label: "Recupero de gastos",
                            icon: DashboardIcon,
                            url: "/recupero-gastos",
                            visible: true,
                            disabled: false,
                        },
                    ],
                },
                {
                    label: "Promoción de la salud y prevención de enfermedades",
                    icon: DashboardIcon,
                    url: "/tablero/promocion",
                    visible: true,
                    disabled: false,
                    list: [
                        {
                            label: "Saneamiento ambiental",
                            icon: DashboardIcon,
                            url: "/saneamiento-ambiental",
                            visible: true,
                            disabled: true,
                        },
                        {
                            label: "Atencion social",
                            icon: DashboardIcon,
                            url: "/atencion-social",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Epidemiología",
                            icon: DashboardIcon,
                            url: "/epidemiologia",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Nutrición",
                            icon: DashboardIcon,
                            url: "/nutricion",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Coordinación general",
                            icon: DashboardIcon,
                            url: "/coordinacion-general",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Laboratorios",
                            icon: DashboardIcon,
                            url: "/laboratorios",
                            visible: true,
                            disabled: false,
                        },
                    ],
                },
                {
                    label: "Regulación y fiscalización",
                    icon: DashboardIcon,
                    url: "/tablero/regulacion",
                    visible: false,
                    disabled: false,
                    list: [
                        {
                            label: "Medicina laboral",
                            icon: false,
                            url: "/medicina-laboral",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Fiscalización sanitaria",
                            icon: false,
                            url: "/fiscalizacion-sanitaria",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Ingeniería Hospitalaria",
                            icon: false,
                            url: "/ingenieria-hospitalaria",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Bromatología",
                            icon: false,
                            url: "/bromatologia",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Salud ocupacional",
                            icon: false,
                            url: "/salud-ocupacional",
                            visible: true,
                            disabled: false,
                        },
                    ],
                },
                {
                    label: "Programación y gestión estratégica",
                    icon: DashboardIcon,
                    url: "/tablero/programacion",
                    visible: false,
                    disabled: false,
                    list: [
                        {
                            label: "Gestión insumos médicos",
                            icon: false,
                            url: "/insumos-medicos",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Salud digital y gobernanza",
                            icon: false,
                            url: "/salud-digital",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Desarrollo capital humano",
                            icon: false,
                            url: "/capital-humano",
                            visible: true,
                            disabled: false,
                        },
                    ],
                },
                {
                    label: "Redes de salud - Este",
                    icon: DashboardIcon,
                    url: "/tablero/redes",
                    visible: false,
                    disabled: false,
                    list: [
                        
                        {
                            label: "Salud mental",
                            icon: false,
                            url: "/salud-mental",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Enfermería",
                            icon: false,
                            url: "/enfermeria",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Kinesiología y rehabilitación",
                            icon: false,
                            url: "/kinesiologia",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Odontología",
                            icon: false,
                            url: "/odontologia",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Diversidad cultural",
                            icon: false,
                            url: "/diversidad-cultural",
                            visible: true,
                            disabled: false,
                        },
                        {
                            label: "Materno infancia",
                            icon: false,
                            url: "/materno-infancia",
                            visible: true,
                            disabled: false,
                        },
                    ],
                },
                {
                    label: "Articulación sanitaria",
                    icon: DashboardIcon,
                    url: "/tablero/articulacion",
                    visible: false,
                    disabled: false,
                    list: [
                        {
                            label: "Emergencias",
                            icon: false,
                            url: "/emergencias",
                            visible: true,
                            disabled: false,
                        },
                    ],
                },
            ],
        },
        {
            label: "Administración",
            visible: true,
            items: [
                {
                    label: "Usuarios",
                    icon: People,
                    url: "/usuarios",
                    visible: true,
                    disabled: false,
                    list: []
                },
                {
                    label: "Tableros",
                    icon: SpaceDashboard,
                    url: "/tableros",
                    visible: true,
                    disabled: false,
                    list: []
                },
                {
                    label: "Areas",
                    icon: AccountTree,
                    url: "/areas",
                    visible: true,
                    disabled: false,
                    list: []
                },
            ],
        },
        {
            label: "Informes",
            visible: true,
            items: [],
        }
    ];

    return (
        <div className={classes.container}>
            { menuItems.map((seccion) => (
                seccion.visible ?
                    <Fragment>
                        <ListSubheader inset className={classes.headerExpandible}> {seccion.label} </ListSubheader>

                        {seccion.items.map((item) => (
                            item.visible ?
                                <Fragment>
                                    <MenuItem url={item.url} label={item.label} Icon={item.icon} disabled={item.disabled} />
                                    <List component="div" disablePadding>
                                        { item.list.map((subitem) => (
                                            subitem.visible ?
                                                <MenuItem url={item.url + subitem.url} label={subitem.label} Icon={subitem.icon} disabled={subitem.disabled} sx={{ pl: 7 }} />
                                            : null
                                        ))}
                                    </List>
                                </Fragment>
                            : null
                        ))}
                    </Fragment>
                : null
            ))}
        </div >
    );
}