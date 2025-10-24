import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { List, IconButton, Typography, Grid, Tooltip, Fade, Badge } from '@mui/material';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles()((theme) => ({
    sectionMargin: {
        /*marginBottom: theme.spacing(4),*/
        overflow: "hidden",
    },
    section: {
        overflow: "hidden",
    },
    header: {
        display: "flex",
        justifyContent: "flex-start",
    },
    title: {
        display: "flex",
        alignItems: "center",
    },
    list: {
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        marginTop: theme.spacing(-1),
    },
    file: {
        backgroundColor: theme.palette.primary.main,
        display: "flex",
        alignItems: "center",
        margin: "4px",
        padding: "12px",
        height: "48px",
        borderRadius: "32px",
    },
    icon: {
        marginRight: "8px"
    },
    fileText: {
        width: "100%",
        maxHeight: "170%",
        overflow: "hidden",
    }
}));

export function FileList(props) {
    const { classes } = useStyles();
    const {
        name, description,
        files, setFiles,
        maxSize, acceptTypeFiles,
        errors,
        isModal = false,
        multipleFiles = true,
    } = props;
    const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const [inputFileRef, setInputFileRef] = useState(false);

    const handleAddFileClick = () => {
        inputFileRef.click();
    };

    const handleAddFileChange = (e) => {
        var new_files = e.target.files;
        var t_rows = [...files];
        var t_existe = false;
        var t_errorTamano = "";
        for (var i = 0; i < new_files.length; i++) {
            if (new_files[i].size > maxSize * 1024 * 1024)
                t_errorTamano += t_errorTamano === "" ? new_files[i].name : " | " + new_files[i].name;
            else {
                t_existe = false;
                for (var i2 = 0; i2 < t_rows.length; i2++) {
                    if (t_rows[i2].name === new_files[i].name) {
                        t_existe = true;
                        t_rows[i2].file = new_files[i];
                        t_rows[i2].accion = 2;//actualizar
                        break;
                    }
                }
                if (!t_existe) {
                    t_rows.push({
                        id_file: 0,
                        name: new_files[i].name,
                        file: new_files[i],
                        accion: 1,//nuevo
                    });
                }
            }
        }
        if (t_errorTamano) {
            enqueueSnackbar(t_errorTamano + " | Tamaño máximo exedido (" + maxSize + " MB)", { variant: "error" });
        }
        //if (JSON.stringify(t_rows) !== JSON.stringify(files))
        setFiles(t_rows);
    };

    const handleDeleteFile = (file) => {
        const index = files.indexOf(file);
        const t_fileList = [...files];
        t_fileList.splice(index, 1);
        //t_fileList[index].accion = 3;//eliminar
        setFiles(t_fileList);
    }
    
    return (
        <Grid container className={isModal ? classes.section : classes.sectionMargin}>
            <Grid /*item xs={12}*/>
                <div className={classes.header}>
                    <Typography variant="h6" className={classes.title}> {name ? name : "Archivos adjuntos"} </Typography>

                    <Tooltip title="Añadir +">
                        <div>
                            <IconButton
                                aria-label="new"
                                color="secondary"
                                onClick={handleAddFileClick}
                                htmlFor="file-list-input"
                                disabled={ files && (files.length >= 1 && !multipleFiles) }
                                size="large">
                                <NoteAddIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                </div>

                {description && <Typography variant="body1" align="justify"> {description} </Typography>}

                <input
                    type="file" multiple={ multipleFiles } onChange={handleAddFileChange} style={{ display: "none" }}
                    ref={(e) => e !== inputFileRef ? setInputFileRef(e) : false}
                    accept={acceptTypeFiles}
                />
            </Grid>

            <List className={classes.list} /*item*/>
                {files && files.map((file) => (
                    file.accion!==3 && <Grid item xs={12} sm={isModal ? 6 : 6} md={isModal ? 6 : 4} lg={isModal ? 6 : 3} xl={isModal ? 6 : 2} key={file.name}>
                        <Fade in={true} timeout={900}>
                            <Badge color="secondary" className={classes.file} badgeContent={file.file ? "Nuevo" : 0} >
                                <InsertDriveFileRoundedIcon className={classes.icon} />

                                <Typography variant="body2" className={classes.fileText}> {file.name} </Typography>

                                <Tooltip title="Eliminar">
                                    <IconButton
                                        edge="end"
                                        color="secondary"
                                        onClick={() => handleDeleteFile(file)}
                                        size="large">
                                        <CancelRoundedIcon />
                                    </IconButton>
                                </Tooltip>
                            </Badge>
                        </Fade>
                    </Grid>
                ))}
            </List>

            {errors && 
                <Fade in={true} >
                    <Grid item xs={12}>
                        <Typography variant="caption" color="error">
                            { errors }
                        </Typography>
                    </Grid>
                </Fade>
            }
        </Grid>
    );
}