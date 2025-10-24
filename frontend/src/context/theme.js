import React, { useContext } from 'react';
import { esES } from '@mui/material/locale';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { GlobalsContext } from './globals';


export function ThemeContextProvider(props) {
    const globalsContext = useContext(GlobalsContext);

    const darkScrollbar = ["#1E1E1E", "#666", "#777"];
    const lightScrollbar = ["#FFF", "#BBB", "#CCC"];

    //type: prefersDarkMode ? 'dark' : 'light',
    const theme = React.useMemo(
        () => createTheme({
            palette: {
                mode: globalsContext.darkModeOn ? 'dark' : 'light',
                primary: {
                    main: globalsContext.darkModeOn ? '#5059bc' : '#00203a',
                    contrastText: '#fff',
                },
                secondary: {
                    main: '#8a9a46',
                    contrastText: '#fff',
                },
            },
            components: {
                MuiDialogActions: {
                    styleOverrides: {
                        root: {
                            padding: '8px 16px',
                        },
                    },
                },
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
                            scrollbarColor: globalsContext.darkModeOn ? darkScrollbar[1] + " " + darkScrollbar[0] : lightScrollbar[1] + " " + lightScrollbar[0],
                            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                                backgroundColor: globalsContext.darkModeOn ? darkScrollbar[0] : lightScrollbar[0],
                                width: "14px",
                                height: "14px",
                            },
                            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                                borderRadius: 8,
                                backgroundColor: globalsContext.darkModeOn ? darkScrollbar[1] : lightScrollbar[1],
                                minHeight: 24,
                                border: "3px solid",
                                borderColor: globalsContext.darkModeOn ? darkScrollbar[0] : lightScrollbar[0]
                            },
                            "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                                backgroundColor: globalsContext.darkModeOn ? darkScrollbar[2] : lightScrollbar[2],
                            },
                            "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
                                backgroundColor: globalsContext.darkModeOn ? darkScrollbar[2] : lightScrollbar[2],
                            },
                            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                                backgroundColor: globalsContext.darkModeOn ? darkScrollbar[2] : lightScrollbar[2],
                            },
                            "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                                backgroundColor: globalsContext.darkModeOn ? darkScrollbar[0] : lightScrollbar[0],
                            },
                        },
                    },
                },
                MuiInputBase: {
                    styleOverrides: {
                        root: {
                            '& .Mui-disabled': {
                                color: globalsContext.darkModeOn ? 'rgba(255,255,255,.8)!important' : 'rgba(0,0,0,.8)!important',
                                "-webkit-text-fill-color": globalsContext.darkModeOn ? "rgba(255,255,255,.8)!important" : 'rgba(0,0,0,.8)!important',
                            },
                        }
                    }
                },
            },
        }, esES),
        [globalsContext.darkModeOn],
    );

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider
                theme={theme}
            >
                {props.children}
            </ThemeProvider>
        </StyledEngineProvider>
    );
}