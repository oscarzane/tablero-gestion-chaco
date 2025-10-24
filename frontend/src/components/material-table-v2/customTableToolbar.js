import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import {
    lighten,
    Toolbar,
    Typography,
    Tooltip,
    IconButton,
    InputAdornment,
    Fade,
    FormControl,
    Input,
} from '@mui/material';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SimpleMenu from '../menu';

// TODO jss-to-tss-react codemod: Unable to handle style definition reliably. Unsupported arrow function syntax.
//Unexpected value type of ConditionalExpression.
const useToolbarStyles = makeStyles()((theme) => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
        justifyContent: "flex-end",
    },
    highlight:
        theme.palette.mode === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    title: {
        flex: '1 1 100%',
    },
}));

const calculateFilterMenu = (filters, selectedFilter, setSelectedFilter) => {
    var t_filterMenu = [];
    for (let i = 0; i < filters.length; i++) {
        t_filterMenu.push({
            label: filters[i],
            icon: selectedFilter === i ? <RadioButtonCheckedRoundedIcon color="primary" /> : <RadioButtonUncheckedRoundedIcon />,
            action: () => setSelectedFilter(i)
        });
    }
    return t_filterMenu;
}

CustomTableToolbar.propTypes = {
    title: PropTypes.string.isRequired,
    numSelected: PropTypes.number.isRequired,
};

export default function CustomTableToolbar(props) {
    const { classes, cx } = useToolbarStyles();
    const {
        title,
        numSelected,
        moreMenuItems,
        loadData,
        filters,
        selectedFilter,
        setSelectedFilter,
    } = props;
    const [anchorElMenuMas, setAnchorElMenuMas] = useState(null);

    const [anchorElMenuFilter, setAnchorElMenuFilter] = useState(null);
    const filterMenuItems = calculateFilterMenu(filters, selectedFilter, setSelectedFilter);


    return (
        <Toolbar
            className={cx(classes.root, {
                [classes.highlight]: numSelected > 0,
            })}
        >
            {numSelected > 0 ?
                <Fragment>
                    <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
                        {numSelected} selccionados
                    </Typography>

                    <Tooltip title="Eliminar">
                        <IconButton aria-label="delete" size="large">
                            <DeleteRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Fragment>
                :
                <Fragment>
                    <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
                        {title}
                    </Typography>

                    {loadData ? <Tooltip title="Recargar">
                        <IconButton color="secondary" onClick={loadData} size="large">
                            <ReplayRoundedIcon />
                        </IconButton>
                    </Tooltip> : null}

                    {filters && filters.length > 0 ? <Fragment>
                        <Tooltip title="Filtrar">
                            <IconButton
                                color="secondary"
                                onClick={(event) => setAnchorElMenuFilter(event.currentTarget)}
                                size="large">
                                <FilterListRoundedIcon />
                            </IconButton>
                        </Tooltip>
                        <SimpleMenu
                            items={filterMenuItems}
                            anchorEl={anchorElMenuFilter}
                            setAnchorEl={setAnchorElMenuFilter}
                        />
                    </Fragment> : null}

                    {moreMenuItems ?
                        <Fragment>
                            <Tooltip title="Más">
                                <IconButton
                                    color="secondary"
                                    onClick={(event) => setAnchorElMenuMas(event.currentTarget)}
                                    size="large">
                                    <MoreVertRoundedIcon />
                                </IconButton>
                            </Tooltip>
                            <SimpleMenu
                                items={moreMenuItems}
                                anchorEl={anchorElMenuMas}
                                setAnchorEl={setAnchorElMenuMas}
                            />
                        </Fragment> : null}
                </Fragment>
            }
        </Toolbar>
    );
};