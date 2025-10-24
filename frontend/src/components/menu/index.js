import React from 'react';
import PropTypes from 'prop-types';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Typography } from '@mui/material';

SimpleMenu.propTypes = {
    items: PropTypes.array.isRequired,
};

function SimpleMenu(props) {
    const {
        items,
        anchorEl, setAnchorEl
    } = props;

    const handleClose = (action) => {
        setAnchorEl(null);

        if (action)
            action();
    };

    return (
        <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => handleClose(null)}
        >
            {items.map((item, i) => (
                <MenuItem
                    onClick={() => handleClose(item.action)} key={item.label}
                >
                    {item.icon}

                    <span style={{ paddingLeft: "8px" }} />

                    <Typography variant="inherit" noWrap>
                        {item.label}
                    </Typography>
                </MenuItem>
            ))}
        </Menu>
    );
}

export default SimpleMenu;