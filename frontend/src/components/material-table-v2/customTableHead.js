import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import { TableHead, TableRow, TableCell, Checkbox, TableSortLabel } from '@mui/material';
import { DataType } from './index';

const useStyles = makeStyles()(() => ({
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
}));

CustomTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

export default function CustomTableHead(props) {
    const { classes } = useStyles();
    const {
        order, orderBy, onRequestSort, onSelectAllClick, numSelected, rowCount,
        selectable, rowActions, headers
    } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {selectable ?
                    <TableCell padding="checkbox">
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{ 'aria-label': 'select all desserts' }}
                        />
                    </TableCell> : null}

                {rowActions && rowActions.length > 0 ?
                    <TableCell align='center' padding='normal' >  </TableCell> : null}

                {headers.map((header) => (
                    <TableCell
                        key={header.id}
                        align={header.align}
                        padding={header.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === header.id ? order : false}
                    >
                        {header.sortable ?
                            <TableSortLabel
                                active={orderBy === header.id}
                                direction={order === "asc" ? "desc" : 'asc'}
                                onClick={createSortHandler(header.id)}
                            >
                                {header.label}
                                {orderBy === header.id ? (
                                    <span className={classes.visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </span>
                                ) : null}
                            </TableSortLabel>
                        :
                            header.label
                        }
                        
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}