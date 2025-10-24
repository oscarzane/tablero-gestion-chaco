import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { makeStyles } from 'tss-react/mui';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

import {
    TableCell,
    IconButton,
    TableRow,
    Tooltip,
    Table,
    TableContainer,
    TableBody,
    TablePagination,
    Checkbox,
    Fade,
    Avatar,
} from '@mui/material';

import Skeleton from '@mui/material/Skeleton';
import CustomTableHead from './customTableHead';
import CustomTableToolbar from './customTableToolbar';
import { Formatter } from '../../const/formatter';
import SimpleMenu from '../menu';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
    },
    table: {
        /*minWidth: 750,*/
    },
    rowPar: {
        /*background: theme.palette.primary.main + "11",
        ":hover": {
            backgroundColor: theme.palette.primary.main + "22!important",
        }*/
    },
    rowImapr: {

    },
    textWithIcon: {
        display: 'flex',
        alignItems: "center",
        justifyContent: "center",
        marginTop: theme.spacing(2),
        color: theme.palette.warning.main,
        "& p": {
            margin: 0,
            marginLeft: theme.spacing(1),
        },
    },
}));


export const DataType = { TEXT: 1, DATE: 2, NUMBER: 3, PHOTO_AVATAR: 4, MONEY: 5, CUIL: 6 };
const columnAlign = (dataType) => {
    switch (dataType) {
        case DataType.NUMBER: return "right";
        case DataType.MONEY: return "right";
        default: return "left";
    }
}
const columnFormat = (data, dataType) => {
    switch (dataType) {
        case DataType.DATE: return Formatter.dateBdToUi(data);
        case DataType.PHOTO_AVATAR: return <Avatar alt="Photo Avatar" src={data} />
        case DataType.NUMBER: return (data * 1).toLocaleString("es-AR");
        case DataType.MONEY: return "$ " + (data * 1).toLocaleString("es-AR");
        case DataType.CUIL: {
            if (data == "" || data == "0") return "-";
            if (data.length > 4) return data.substring(0, 2) + "-" + data.substring(2, data.length - 1) + "-" + data.substring(data.length - 1, data.length);
            return data;
        }
        default: return data;
    }
}
const columnCustomStyle = (dataType) => {
    switch (dataType) {
        case DataType.DATE:
        case DataType.PHOTO_AVATAR:
        case DataType.NUMBER:
        case DataType.MONEY:
        case DataType.CUIL:
        case DataType.STATE: return { textWrap: 'nowrap' };
        default: return {};
    }
}

export default function MaterialTable(props) {
    const { classes } = useStyles();
    const {
        rowActions,
        selectable,
        moreMenuItems,
        headers,
        data,
        loadData,
        title,
        idName,
        needUpdate = 0,
        rowsPerPage,
        paginaActual,
        setPaginaActual,
        totalRegistros,
        orderBy,
        setOrderBy,
        orderType,
        setOrderType,
        informacionFiltrada = false,
    } = props;
    
    //menu actions row
    const [anchorElMenuRowActions, setAnchorElMenuRowActions] = useState(null);
    const [clickedMenuRowActions, setClickedMenuRowActions] = useState(null);

    //Order table state
    const [page, setPage] = React.useState(0);
    //select table state
    const [selected, setSelected] = React.useState([]);
    //dense table option
    const densePadding = false;

    //Filter data
    const [filters, setFilters] = React.useState([]);
    const [selectedFilter, setSelectedFilter] = useState(0);

    const [searchText, setSearchText] = useState("");
    const [showSearch, setShowSearch] = useState(false);

    const handleShowSearch = (show) => {
        if (!show && searchText !== "")
            setSearchText("");
        setShowSearch(show);
    }

    const handleOnSearch = (e) => {
        setSearchText(e.target.value);
    }

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && orderType === 'asc';
        setOrderType(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = data.map((n) => n.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        if (selectable) {
            const selectedIndex = selected.indexOf(id);
            let newSelected = [];

            if (selectedIndex === -1) {
                newSelected = newSelected.concat(selected, id);
            } else if (selectedIndex === 0) {
                newSelected = newSelected.concat(selected.slice(1));
            } else if (selectedIndex === selected.length - 1) {
                newSelected = newSelected.concat(selected.slice(0, -1));
            } else if (selectedIndex > 0) {
                newSelected = newSelected.concat(
                    selected.slice(0, selectedIndex),
                    selected.slice(selectedIndex + 1),
                );
            }

            setSelected(newSelected);
        }
    };

    const handleChangePage = (event, newPage) => {
        if (paginaActual != newPage)
            setPaginaActual(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        /*var t_newRowsPerPage = parseInt(event.target.value, defaultRowsPerPage ? defaultRowsPerPage : 10);
        var t_newPage = Math.floor(page * rowsPerPage / t_newRowsPerPage);
        setRowsPerPage(t_newRowsPerPage);
        if (t_newRowsPerPage > rowsPerPage && t_newPage != page)
            setPage(t_newPage);*/
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const emptyRows = rowsPerPage - (data ? data.length : 0);

    return (
        <Fragment>
            <CustomTableToolbar
                numSelected={selected.length}
                moreMenuItems={moreMenuItems}
                loadData={loadData}
                title={title}
                filters={filters}
                setSelectedFilter={setSelectedFilter}
                selectedFilter={selectedFilter}
                showSearch={showSearch}
                handleShowSearch={handleShowSearch}
                searchText={searchText}
                onSearch={handleOnSearch}
            />

            <TableContainer>
                <Table
                    className={classes.table}
                    aria-labelledby="tableTitle"
                    size={densePadding ? 'small' : 'medium'}
                    aria-label="enhanced table"
                >
                    <CustomTableHead
                        numSelected={selected.length}
                        order={orderType}
                        orderBy={orderBy}
                        onSelectAllClick={handleSelectAllClick}
                        onRequestSort={handleRequestSort}
                        rowCount={totalRegistros}
                        selectable={selectable}
                        moreMenuItems={moreMenuItems}
                        headers={headers}
                        rowActions={rowActions}
                    />
                    <TableBody>
                        {data && data.map((row, index) => {
                            const isItemSelected = isSelected(row[idName]);
                            const labelId = `enhanced-table-checkbox-${index}`;

                            return (
                                <Fade in={data !== null} key={row.id} timeout={900}>
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        onClick={(event) => handleClick(event, row.id)}
                                        aria-checked={isItemSelected}
                                        selected={isItemSelected}
                                        className={index % 2 == 0 ? classes.rowPar : classes.rowImpar}
                                    >
                                        {selectable ?
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isItemSelected}
                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                />
                                            </TableCell> : null
                                        }

                                        {rowActions && rowActions !== null ?
                                            <TableCell align="center" padding="checkbox">
                                                <Tooltip title="Acciones">
                                                    <div>
                                                        <IconButton
                                                            color="secondary"
                                                            onClick={(event) => {
                                                                setAnchorElMenuRowActions(event.currentTarget);
                                                                setClickedMenuRowActions(row);
                                                            }}
                                                            disabled={rowActions(row).length === 0}
                                                            size="large">
                                                            <MoreVertRoundedIcon />
                                                        </IconButton>
                                                    </div>
                                                </Tooltip>
                                            </TableCell> : null
                                        }

                                        {headers.map((header) => (
                                            <TableCell
                                                key={header.id + row[idName]}
                                                align={columnAlign(header.dataType)}
                                                padding={header.disablePadding ? 'none' : 'normal'}
                                                textwrap='nowrap'
                                                style={columnCustomStyle(header.dataType)}
                                            >
                                                {columnFormat(row[header.id], header.dataType)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </Fade>
                            );
                        })}

                        {rowActions && rowActions !== null ?
                            <SimpleMenu
                                items={clickedMenuRowActions ? rowActions(clickedMenuRowActions) : []}
                                anchorEl={anchorElMenuRowActions}
                                setAnchorEl={setAnchorElMenuRowActions}
                                data={clickedMenuRowActions}
                            /> : null
                        }

                        {data && emptyRows > 0 && (
                            <TableRow style={{ height: (densePadding ? 33 : 53) * emptyRows }}>
                                <TableCell colSpan={headers.length + (rowActions && rowActions.length > 0 ? 1 : 0)} />
                            </TableRow>
                        )}
                        {!data && (
                            [...Array(emptyRows)].map((e, i) =>
                                <Fade in={data === null} key={i} timeout={900}>
                                    <TableRow>
                                        <TableCell colSpan={headers.length + (rowActions && rowActions.length > 0 ? 1 : 0)}>
                                            <Skeleton variant="rectangular" height={20} />
                                        </TableCell>
                                    </TableRow>
                                </Fade>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[/*5, 10, 25*/]}
                component="div"
                count={totalRegistros}
                rowsPerPage={rowsPerPage}
                page={paginaActual}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {informacionFiltrada ?
                <div className={classes.textWithIcon}>
                    <WarningRoundedIcon color="warning" className={classes.icon} />
                    <p>Información con filtros aplicados</p>
                </div>
                : null} 
        </Fragment >
    );
}