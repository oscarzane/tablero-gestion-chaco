import React, { useContext, useState } from 'react';
import { ListItemIcon, ListItemText, Menu, MenuItem, Switch } from '@mui/material';
import { AuthContext } from '../../context/auth';
import { AlertModalContext } from '../modal/alert';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import CambiarEstablecimientoDialog from '../modal/cambiarEstablecimiento';
import { GlobalsContext } from '../../context/globals';


export default function UserMenu(props) {
    const { anchorEl, onClose, onClick, } = props;
    const { usuario, updateUsuario } = useContext(AuthContext);
    const { showModal } = useContext(AlertModalContext);
    const globalsContext = useContext(GlobalsContext);

    const handleLogout = () => {
        showModal(
            "Cerrar sesión",
            "¿Estás seguro que deseas cerrar la sesión?",
            function () {
                updateUsuario(null);
            });
    }

    const [changeEstablecimientoOpen, setChangeEstablecimientoOpen] = useState(false);
    const handleChangeEstablecimiento = (e = false) => {
        setChangeEstablecimientoOpen(true);
    };

    const handleChangeDarkMode = (e = false) => {
        globalsContext.setDarkModeOn(!globalsContext.darkModeOn);
    };

    return (
        <div>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={anchorEl != null}
                onClose={onClose}
                onClick={onClick}
            /*transformOrigin={{ horizontal: 'right', vertical: 'top' }}*/
            /*anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}*/
            >
                <MenuItem onClick={handleChangeEstablecimiento} >
                    <ListItemIcon> <BusinessRoundedIcon fontSize="medium" /> </ListItemIcon>
                    Cambiar Establecimiento
                </MenuItem>

                <MenuItem onClick={handleChangeDarkMode}>
                    <ListItemIcon>
                        <DarkModeRoundedIcon />
                    </ListItemIcon>
                    <ListItemText id="switch-list-label-darkMode" primary="Modo noche" />
                    <Switch
                        edge="end"
                        onChange={handleChangeDarkMode}
                        checked={globalsContext.darkModeOn}
                        inputProps={{
                            'aria-labelledby': 'switch-list-label-darkMode',
                        }}
                    />
                </MenuItem>

                <MenuItem onClick={handleLogout} >
                    <ListItemIcon> <LogoutRoundedIcon fontSize="medium" /> </ListItemIcon>
                    Cerrar Sesión
                </MenuItem>
            </Menu>

            <CambiarEstablecimientoDialog
                open={changeEstablecimientoOpen}
                setOpen={setChangeEstablecimientoOpen}
            />
        </div>
    );
}