import React, { Fragment, useContext } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Grid, useMediaQuery, Drawer, AppBar, Toolbar, Typography, Divider, IconButton, Container, Avatar, Tooltip } from '@mui/material/';
import MenuIcon from '@mui/icons-material/Menu';
import logo_blanco_color from '../../../images/logo_blanco_color.png';
import logo_negro_color from '../../../images/logo_negro_color.png';
import logo_s_color from '../../../images/logo_s_color.png';
import MainMenu from '../../../components/menu/main';
import { GlobalsContext } from '../../../context/globals';
import fondoLogin from '../../../images/fondo_light.png';
import ConectionAlert from '../../conectionAlert';
import { AuthContext } from '../../../context/auth';
import UserMenu from '../../menu/user';
import packageJson from '../../../../package.json';

function Copyright() {
    return (
        /*<Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="http://vasaweb.com.ar/" target="_blank"> VaSa </Link>
            {' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>*/
        <Fragment>
            <Typography variant="body2" color="textSecondary" align="center">
                {'Copyright © Ministerio de Salud - Chaco ' + new Date().getFullYear() + '.'}
            </Typography>

            <Typography variant="body2" color="textSecondary" align="center">
                versión {packageJson.version}
            </Typography>
        </Fragment>
    );
}

const drawerWidth = 272;

window.addEventListener('beforeunload', function (e) {
    // Cancel the event as stated by the standard.
    e.preventDefault();
    // Chrome requires returnValue to be set.
    e.returnValue = '';
});

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        height: "100%",
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        height: theme.spacing(7),
        flexShrink: 0,
        [theme.breakpoints.down('md')]: {
            height: theme.spacing(16),
            alignItems: "end",
        },
        ...theme.mixins.toolbar,
    },
    logo: {
        height: "100%",
        [theme.breakpoints.down('md')]: {
            height: "auto",
            width: "100%",
        },
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    appBarDrawerOpen: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    appBarDrawerMini: {
        marginLeft: theme.spacing(9),
        width: `calc(100% - ${theme.spacing(9)})`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    },
    content: {
        flex: "1 1 auto",
        display: "flex",
        overflow: "hidden",
        flexGrow: 1,
        height: '100vh',
        paddingTop: theme.spacing(7),
        boxSizing: "border-box",
        backgroundImage: "url(" + fondoLogin + ")",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        [theme.breakpoints.up('sm')]: {
            paddingTop: theme.spacing(8),
        },
    },
    container: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        flex: "1 1 auto",
        height: "100%",
        overflow: "auto",
        backgroundColor: theme.palette.background.default + (theme.palette.mode === "dark" ? "EE" : "E"),
        maxWidth: "100%!important",
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    fixedHeight: {
        height: 240,
    },

    rightContainer: {
        display: "flex",
        alignItems: "center",
    },
    textRightContainer: {
        display: "flex",
        flexDirection: "column",
        marginRight: "8px",
        "& > *": {
            lineHeight: 1.1,
            textAlign: "right",
        },
        "& span:last-child": {
            fontSize: "0.75em",
        },
    },
    userName: {
        fontSize: ".7em!important",
    },
    userSubtitle: {
        fontSize: ".65em!important",
        marginTop: "-5px",
    },
    userSubtitleSec: {
        fontSize: ".6em!important",
        marginTop: "-5px",
    },
}));

function Layout(props) {
    const { nombrePagina } = props;
    const theme = useTheme();
    const prefersDarkMode = theme.palette.mode === "dark";
    const isMobile = useMediaQuery(theme.breakpoints.down('md')) ? true : false;
    const { classes, cx } = useStyles();
    const { usuario } = useContext(AuthContext);

    const globalsContext = useContext(GlobalsContext);
    const [open, setOpen] = React.useState(false);

    const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState(null);

    const handleDrawerOpen = () => {
        if (isMobile)
            setOpen(!open);
        else
            globalsContext.setSideOpenInDesktop(!globalsContext.sideOpenInDesktop);
    };

    const userMenuHandleClick = (event) => {
        setUserMenuAnchorEl(event.currentTarget);
    };
    const userMenuHandleClose = () => {
        setUserMenuAnchorEl(null);
    };
    
    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="absolute"
                className={cx(
                    classes.appBar,
                    globalsContext.sideOpenInDesktop && !isMobile && classes.appBarDrawerOpen,
                    !globalsContext.sideOpenInDesktop && !isMobile && classes.appBarDrawerMini
                )}
                elevation={1}
            >
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        className={classes.menuButton}
                        size="large">
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" color="inherit" noWrap className={classes.title}>
                        {nombrePagina ? nombrePagina : ""}
                    </Typography>

                    <div className={classes.rightContainer}>
                        <div className={classes.textRightContainer}>
                            <Typography variant="caption" className={classes.userName} noWrap>
                                <b>{usuario.nombre}</b>
                            </Typography>

                            {usuario.establecimiento_nombre == "" ? null :
                                <Typography variant="caption" className={classes.userSubtitle} noWrap>
                                    {usuario.establecimiento_nombre}
                                </Typography>
                            }

                            <Typography variant="caption" className={classes.userSubtitleSec} noWrap>
                                {usuario.perfiles_str}
                            </Typography>
                        </div>

                        <Tooltip title="Mi cuenta">
                            <IconButton
                                onClick={userMenuHandleClick}
                                size="small"
                                sx={{ ml: 2 }}
                                aria-controls={open ? 'account-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                            >
                                <Avatar
                                    alt={usuario.nombre}
                                    src=""//todo foto
                                    sx={{ bgcolor: theme.palette.secondary.main }}
                                />
                            </IconButton>
                        </Tooltip>
                        <UserMenu
                            anchorEl={userMenuAnchorEl}
                            onClose={userMenuHandleClose}
                            onClick={userMenuHandleClose}
                        />
                    </div>
                </Toolbar>
            </AppBar>

            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                classes={{
                    paper: cx(
                        classes.drawerPaper,
                        (isMobile ? !open : !globalsContext.sideOpenInDesktop) && classes.drawerPaperClose),
                }}
                open={isMobile ? open : globalsContext.sideOpenInDesktop}
                onClose={handleDrawerOpen}
                PaperProps={{ elevation: 1 }}
            >
                <div className={classes.toolbarIcon}>
                    <img
                        className={classes.logo}
                        src={(isMobile ? open : globalsContext.sideOpenInDesktop) ?
                                (prefersDarkMode ? logo_blanco_color : logo_negro_color) :
                                logo_s_color}
                        alt="logo"
                    />
                </div>

                <Divider />

                <MainMenu />
            </Drawer>

            <main className={classes.content} >
                <Container className={classes.container} id="mainContainer">

                    <Grid container spacing={3}>
                        {props.children}
                    </Grid>

                    <Box pt={4}>
                        <Copyright />
                    </Box>
                </Container>
            </main>
            <ConectionAlert />
        </div>
    );
}

export default Layout;