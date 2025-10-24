import React, { createRef, useState, Fragment } from 'react';
import { makeStyles } from 'tss-react/mui';
import { List, IconButton, Typography, Grid, Tooltip, Fade, ListItem, ListItemAvatar, Avatar, ListItemText, } from '@mui/material';
import QueueIcon from '@mui/icons-material/Queue';
import DeleteIcon from '@mui/icons-material/Delete';
import AddDetalleDialog from './modal/add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useAutoAnimate } from '@formkit/auto-animate/react'

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
    filaVenta: {
        backgroundColor: theme.palette.primary.main,
        display: "flex",
        margin: "4px 0",
        borderRadius: "32px",
        alignItems: "center",
        cursor: "pointer",
        "& > *": { margin: 0, },
        "&:hover": { backgroundColor: theme.palette.primary.main + "DD", },
        '& .MuiListItemText-primary': { color: "#FFF" }, // titulo
        '& .MuiListItemText-secondary': { color: "#CCC" }, // aclaracion subtitulo ej sector:
        '& .MuiListItemText-secondary span': { color: "#FFF" }, // subtitulo ej general 8
    },
    inline: {
        display: 'inline',
    },
    total: {
        textAlign: "right",
        width: "100%",
        paddingRight: theme.spacing(1),
    },
}));

export function DetalleList(props) {
    const { classes } = useStyles();
    const {
        data, setData,
        label, description,
        errors,
        isModal = false,
        customIcon = false,
        listFields = [],
        customValidate = false,//validador personalizado, opcional (devuelve texto de error o vacio)
        labelPopup = "",//nombre que tendra el elemento en el popup
        labelPopupGenero = "o",//o,a segun corresponda (masc, fem)
        totalShow = false,//mostrar el total
        totalDataName = false,//nombre del dataname a sumar para el total, false contar lista
        totalIsMoney = false,//si es o no de tipo moneda el total a sumar
        sortable = false,//si es o no ordenable
        customSubtitle = null,//funcion que devuelve un subtitulo personalizado (data, row)
        disabled = false,
        customDescription = "",//descripcion personalizada para el popup
    } = props;
    //const { enqueueSnackbar/*, closeSnackbar*/ } = useSnackbar();

    const [listAnimationParent] = useAutoAnimate()

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addModalData, setAddModalData] = useState(false);

    const handleEdit = (e = false) => {
        setAddModalData(e);
        setAddModalOpen(true);
    };

    const handleSubmitNewEdit = (newValue) => {
        var t_newData = [...data];

        if (addModalData) {
            var index = data.indexOf(addModalData);
            t_newData[index] = { ...t_newData[index], ...newValue };
        }
        else {
            t_newData.push({ ...newValue });
        }

        setData(t_newData);
    };

    const handleDelete = (e, row) => {
        e.stopPropagation();
        const index = data.indexOf(row);
        const t_dataList = [...data];
        t_dataList.splice(index, 1);
        //t_fileList[index].accion = 3;//eliminar
        setData(t_dataList);
    }

    const handleOrderUp = (e, row) => {
        e.stopPropagation();
        const rowIndex = data.indexOf(row);
        if (rowIndex === 0) return;
        const newData = [...data];
        newData[rowIndex] = data[rowIndex - 1];
        newData[rowIndex - 1] = row;
        setData(newData);
    };

    const handleOrderDown = (e, row) => {
        e.stopPropagation();
        const rowIndex = data.indexOf(row);
        if (rowIndex === data.length - 1) return;
        const newData = [...data];
        newData[rowIndex] = data[rowIndex + 1];
        newData[rowIndex + 1] = row;
        setData(newData);
    };

    /*const handleOrderUp = (e, row) => {
        e.stopPropagation();
        const index = data.indexOf(row);
        setData(reorder(data, index, index - 1));
    }
    const handleOrderDown = (e, row) => {
        e.stopPropagation();
        const index = data.indexOf(row);
        setData(reorder(data, index, index + 1));
    }*/
    const reorder = (list, startIndex, endIndex) => {
        var result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const detalleProductoTextItem = (label, data) => {
        return (
            <React.Fragment key={label}>
                {label} {" "}

                <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                    {data}
                </Typography>

                &emsp;
            </React.Fragment>
        );
    }

    const listItemTextPrim = (row) => {
        for (var i = 0; i < listFields.length; i++) {
            //es tipo primary
            if (listFields[i].visibleType == 1) {
                if(row[listFields[i].dataName].label){
                    return row[listFields[i].dataName].label;
                }
                else if (listFields[i].items) {//posee items (select o autocomplete) //legacy
                    for (var j = 0; j < listFields[i].items.length; j++) {
                        if (listFields[i].items[j].id == row[listFields[i].dataName]) {
                            var t_value = "";
                            t_value = (t_value == "" && listFields[i].items[j].label) ? listFields[i].items[j].label : t_value;
                            t_value = (t_value == "" && listFields[i].items[j].nombre_str) ? listFields[i].items[j].nombre_str : t_value;
                            t_value = (t_value == "" && listFields[i].items[j].nombre) ? listFields[i].items[j].nombre : t_value;
                            return t_value;
                        }
                    }
                }
                else
                    return row[listFields[i].dataName];
            }
        }

        return "";
    }
    const listItemTextSec = (row) => {
        var t_result = [];

        if (customSubtitle != null) {
            t_result.push(detalleProductoTextItem(customSubtitle(data, row)));
        }

        for (var i = 0; i < listFields.length; i++) {
            if (listFields[i].visibleType == 2) {
                var t_value = "";
                if(row[listFields[i].dataName].label){
                    t_value = row[listFields[i].dataName].label;
                }
                else if (listFields[i].items) {//posee items (select o autocomplete) //legacy
                    for (var j = 0; j < listFields[i].items.length; j++) {
                        if (listFields[i].items[j].id == row[listFields[i].dataName]) {
                            t_value = (t_value == "" && listFields[i].items[j].label) ? listFields[i].items[j].label : t_value;
                            t_value = (t_value == "" && listFields[i].items[j].nombre_str) ? listFields[i].items[j].nombre_str : t_value;
                            t_value = (t_value == "" && listFields[i].items[j].nombre) ? listFields[i].items[j].nombre : t_value;
                        }
                    }
                }
                else
                    t_value = row[listFields[i].dataName];

                if (typeof t_value == "boolean")
                    t_value = t_value ? "Si" : "No";

                t_result.push(detalleProductoTextItem(listFields[i].label + ":", t_value));
            }
        }

        return (<React.Fragment> {t_result} </React.Fragment>);
    }
    const listItemAvatar = (row) => {
        for (var i = 0; i < listFields.length; i++) {
            if (listFields[i].visibleType == 3) {
                return (<ListItemAvatar>
                    <Avatar
                        alt={listFields[i].dataName}
                        src={row[listFields[i].dataName] ? row[listFields[i].dataName] : ""}//todo foto en string vacio
                    />
                </ListItemAvatar>);
            }
        }
        return "";
    }

    const totalFilas = () => {
        var t_total = 0;
        var options = {};
        if (totalIsMoney) options = { ...options, style: 'currency', currency: 'ARS' };
        var numberFormat = new Intl.NumberFormat('es-AR', options);

        if (totalDataName) {
            for (var i = 0; i < data.length; i++) {
                t_total += parseInt(data[i][totalDataName]);
            }
        }
        else
            t_total = data.length;

        return numberFormat.format(t_total);
    }

    return (
        <Grid container className={isModal ? classes.section : classes.sectionMargin}>
            <Grid /*item xs={12}*/>
                <div className={classes.header}>
                    <Typography variant="h6" className={classes.title}> {label ? label : "Detalle"} </Typography>

                    <Tooltip title="Añadir +">
                        <div>
                            <IconButton
                                aria-label="new"
                                color="secondary"
                                onClick={() => handleEdit(false)}
                                htmlFor="field-list-input"
                                disabled={disabled}
                                size="large">
                                {customIcon ? customIcon : <QueueIcon />}
                            </IconButton>
                        </div>
                    </Tooltip>
                </div>

                {description && <Typography variant="body1" align="justify"> {description} </Typography>}
            </Grid>

            <List ref={listAnimationParent} className={classes.list} /*item*/>
                {data && data.map((row) => (
                    <Grid item xs={12} key={JSON.stringify(row)}>

                        <ListItem alignItems="flex-start" className={classes.filaVenta} onClick={() => handleEdit(row)}>
                            {listItemAvatar(row)}
                            <Tooltip title={disabled ? "Ver" : "Editar"}>
                                <ListItemText
                                    primary={listItemTextPrim(row)}
                                    secondary={listItemTextSec(row)}
                                />
                            </Tooltip>
                            {sortable ?
                                <Fragment >
                                    <Tooltip title="Subir">
                                        <IconButton
                                            edge="end"
                                            color="secondary"
                                            onClick={(e) => handleOrderUp(e, row)}
                                            disabled={disabled || data.indexOf(row) == 0}
                                            size="large">
                                            <ArrowUpwardIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Bajar">
                                        <IconButton
                                            edge="end"
                                            color="secondary"
                                            onClick={(e) => handleOrderDown(e, row)}
                                            disabled={disabled || data.indexOf(row) == data.length - 1}
                                            size="large">
                                            <ArrowDownwardIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Fragment>
                                : null}

                            <Tooltip title="Eliminar">
                                <IconButton
                                    edge="end"
                                    color="error"
                                    onClick={(e) => handleDelete(e, row)}
                                    disabled={disabled}
                                    size="large">
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </ListItem>

                    </Grid>
                ))}
            </List>

            {totalShow ? <Typography variant="h6" className={classes.total}> Total {data ? totalFilas() : 0} </Typography> : ""}

            {errors &&
                <Fade in={true} >
                    <Grid item xs={12}>
                        <Typography variant="caption" color="error">
                            {errors}
                        </Typography>
                    </Grid>
                </Fade>
            }

            <AddDetalleDialog
                open={addModalOpen}
                setOpen={setAddModalOpen}
                addNewItem={handleSubmitNewEdit}
                data={addModalData}
                listFields={listFields}
                labelPopup={labelPopup}
                labelPopupGenero={labelPopupGenero}
                disabled={disabled}
                customValidate={customValidate}
                customDescription={customDescription}
            />
        </Grid>
    );
}