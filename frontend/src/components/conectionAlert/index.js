import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Typography } from '@mui/material';

const useStyles = makeStyles()((theme) => ({
    container: {
        position: "absolute",
        bottom: 0,
        zIndex: 1200,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#FFD801",
        color: "#333",
        transition: "1s",
        transitionTimingFunction: "ease-in-out",
        overflow: "hidden",
    },
    mensaje: {
        padding: "8px",
    },
}));

function ConectionAlert (props) {
    const { classes } = useStyles();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Update network status
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };
    
    useEffect(() => {
        // Listen to the online status
        window.addEventListener('online', handleStatusChange);
    
        // Listen to the offline status
        window.addEventListener('offline', handleStatusChange);
    
        // Specify how to clean up after this effect for performance improvment
        return () => {
          window.removeEventListener('online', handleStatusChange);
          window.removeEventListener('offline', handleStatusChange);
        };
    }, [isOnline]);

    return (
        <div className={classes.container} style={isOnline ? {height: 0} : {height: "36px"}}>
            <div className={classes.mensaje}>
                Conexión limitada o nula
            </div>
        </div>
    );
}

export default ConectionAlert;