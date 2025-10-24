import React, { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { makeStyles } from 'tss-react/mui';
import { useTheme, useMediaQuery } from '@mui/material';
import { Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

export const AlertModalContext = React.createContext({});

export function GoogleMapPickerModal(props) {
    const {
        open, setOpen,
        data,
        action,
    } = props;

    const theme = useTheme();
    const isBigScreen = useMediaQuery(theme.breakpoints.up('xl')) ? true : false;

    const [latLong, setLatLong] = useState(data.latLong ? data.latLong : null);
    const map = useMap();
    const geocodingLib = useMapsLibrary('geocoding');

    // TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
    const useStyles = makeStyles()((theme) => ({
        horizontal: {
        },
        vertical: {
            writingMode: "vertical-rl",
            /*textOrientation: "upright"*/
        },
    }));
    const { classes } = useStyles();

    const handleClose = () => {
        setOpen(false);
    };
    const handleAcept = () => {
        handleClose();
        if (action)
            action(latLong);
    }

    //request puede ser de dos formas:
    //{ address: "calle 123, Resistencia, Chaco, Argentina" }
    //{ location: { lat: -27.451163, lng: -58.986510 } }
    const googleGeocoder = async (dir) => {
        new geocodingLib.Geocoder().geocode(dir)
            .then((result) => {
                const { results } = result;
                var t_formatted_address = results[0].formatted_address;
                var t_location = results[0].geometry.location.toJSON();
                var t_location_type = results[0].geometry.location_type;
                
                setLatLong(t_location);
                map.setCenter(t_location);
            })
            .catch((e) => {
                alert("Geocode was not successful for the following reason: " + e);
            });
    }

    useEffect(() => {
        if (!geocodingLib || !map) return;
        
        googleGeocoder({ address: data.direccion + ", " + data.localidad + ", " + data.estado + ", " + data.pais });
    }, [data, map]);

    const onClickMap = useCallback((ev) => {
        if (!map) return;
        if (!ev.detail.latLng) return;

        setLatLong(ev.detail.latLng);
        map.panTo(ev.detail.latLng);
    });

    return (
        <Dialog
            open={open} onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            fullWidth maxWidth={isBigScreen ? "md" : "sm"}
        >
            <DialogTitle id="alert-dialog-title">
                Confirmar ubicación precisa
            </DialogTitle>

            <DialogContent>
                <p>Por favor confirma si la ubicación en el mapa es correcta. De ser necesario puedes hacer clic en otra ubicación para corregirla.</p>

                <Map
                    style={{ /*width: '50vw',*/ height: '50vh' }}
                    defaultZoom={18}
                    defaultCenter={latLong ? latLong : { lat: -27.451163, lng: -58.986510 }}
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}
                    onClick={onClickMap}
                >
                    <Marker position={latLong} />
                </Map>
            </DialogContent>

            <DialogActions>
                {action && <Button onClick={handleClose}>Cancelar</Button>}

                <Button onClick={handleAcept} color="primary">Confirmar</Button>
            </DialogActions>
        </Dialog>
    );
}