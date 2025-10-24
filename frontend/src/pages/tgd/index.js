import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/login';
import { Grid, useTheme } from '@mui/material';
import styles from './style.module.scss';
import { postData } from '../../services/ajax/';
import { AuthContext } from '../../context/auth';
import { LoadingModalContext } from '../../components/modal/loading';
import { AlertModalContext } from '../../components/modal/alert';

function Page() {
    let { code, version } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [errorTgd, setErrorTgd] = useState("");

    const { updateUsuario } = useContext(AuthContext);
    const loadingModal = useContext(LoadingModalContext);
    const alertModal = useContext(AlertModalContext);
    
    const loadData = useCallback(async () => {
        loadingModal.setOpen(true);
        setErrorTgd("");

        const response = await postData("tgd/validate.php", {
            code: code,
            version: version,
        });

        if (response.error === "") {
            updateUsuario(response.data);
            navigate("/");
        }
        else {
            alertModal.showModal("Acceso no autorizado", response.error);
            setErrorTgd(response.error);
        }

        loadingModal.setOpen(false);
    }, [code]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <Layout>
            <Grid container direction="column">
                <h2>Ingreso por TGD</h2>
                <p>Pantalla de ingreso por TGD. En caso de que el ingreso falle, verificar el mensaje de error arrojado.</p>

                {errorTgd != "" ? 
                    <div>
                        <h3>Error al ingresar:</h3>
                        <p>{errorTgd}</p>
                    </div>
                : ""}
                
                <p>Para reintentar se deberá reingresar desde en icono correspondiente en TGD.</p>

                <a
                    className={styles.a}
                    href = "https://gobiernodigital.chaco.gob.ar"
                    style={{color: theme.palette.secondary.main}}>
                        Ir a Tu Gobierno Digital
                </a>
            </Grid>
        </Layout>
    );
}

export default Page;