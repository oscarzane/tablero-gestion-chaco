import React from 'react';
import { ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { Link, useLocation } from 'react-router-dom';
import { ListItemButton } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

const useStyles = makeStyles()((theme) => ({
    link: {
    },
    disabled: {
        cursor: "default",
    },
    text: {
        "text-wrap-mode": "wrap"
    }
}));

export default function MenuItem(props) {
    const {
        url = "",
        label = "",
        Icon = CheckBoxOutlineBlankIcon,
        iconColor = "inherit",
        disabled = false,
        sx = {}
    } = props;

    const { classes } = useStyles();

    const location = useLocation();
    const theme = useTheme();

    return (
        <Link
            to={disabled ? "" : url}
            style={location.pathname === url ? { color: theme.palette.primary.main } : {}}
            className={classes.link + (disabled ? " "+classes.disabled : "")}
        >
            <ListItemButton selected={location.pathname === url} disabled={disabled} sx = {sx}>
                {Icon ? 
                    <ListItemIcon style={{ color: iconColor, minWidth: "39px" }}>
                        <Icon style={{ color: iconColor }} />
                    </ListItemIcon>
                : null}
               
                <ListItemText primary={label} className={classes.text}/>
            </ListItemButton>
        </Link>
    );
}