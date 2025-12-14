import { alpha, createTheme } from '@mui/material/styles';
import ThemeOption from './theme';
import { presetDarkPalettes, presetPalettes } from '@ant-design/colors';
// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export default function Palette(mode: 'light' | 'dark', presetColor: string) {
    const colors = mode === 'dark' ? presetDarkPalettes : presetPalettes;
    const greyPrimary = [
        '#ffffff',
        '#fafafa',
        '#f5f5f5',
        '#f0f0f0',
        '#d9d9d9',
        '#bfbfbf',
        '#8c8c8c',
        '#595959',
        '#262626',
        '#141414',
        '#000000',
    ];
    const greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
    const greyConstant = ['#fafafb', '#e6ebf1'];
    colors.grey = [...greyPrimary, ...greyAscent, ...greyConstant];
    const paletteColor = ThemeOption(colors, presetColor, mode);
    return createTheme({
        palette: {
            mode, // light 또는 dark 모드
            common: {
                black: '#000',
                white: '#fff',
            },
            ...paletteColor,
            text: {
                primary: mode === 'dark' ? alpha(paletteColor.grey[900], 0.87) : paletteColor.grey[700],
                secondary: mode === 'dark' ? alpha(paletteColor.grey[900], 0.45) : paletteColor.grey[500],
                disabled: mode === 'dark' ? alpha(paletteColor.grey[900], 0.1) : paletteColor.grey[400],
            },
            action: {
                disabled: paletteColor.grey[300],
            },
            // divider: mode === 'dark' ? alpha(paletteColor.grey[900], 0.05) : paletteColor.grey[200],
            // background: {
            //     paper: mode === 'dark' ? paletteColor.grey[100] : paletteColor.grey[0],
            //     default: paletteColor.grey.A50,
            // },
        },
    });
}
