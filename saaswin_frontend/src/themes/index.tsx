import PropTypes from 'prop-types';
// material-ui
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from './typography';
// project import
import { useThemeStore } from 'utils/store/theme';
import { useMemo } from 'react';
import Palette from './palette';

// ==============================|| DEFAULT THEME - MAIN ||============================== //

export default function ThemeCustomization({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { mode, presetColor, fontFamily } = useThemeStore();
    const theme = useMemo(() => Palette(mode, presetColor), [mode, presetColor]);
    const themeTypography = useMemo(() => Typography(fontFamily), [fontFamily]);
    const themeOptions = useMemo(
        () => ({
            common: {
                black: '#000',
                white: '#fff',
            },
            palette: theme.palette,
            typography: themeTypography,
        }),
        [theme, themeTypography]
    );
    const themes = createTheme(themeOptions);
    return (
        <ThemeProvider theme={themes}>
            <CssBaseline enableColorScheme />
            {children}
        </ThemeProvider>
    );
}

ThemeCustomization.propTypes = { children: PropTypes.node };
