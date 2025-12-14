export default function Theme10(colors, mode) {
    const { grey } = colors;
    const greyColors = {
        0: grey[0],
        50: grey[1],
        100: grey[2],
        200: grey[3],
        300: grey[4],
        400: grey[5],
        500: grey[6],
        600: grey[7],
        700: grey[8],
        800: grey[9],
        900: grey[10],
        A50: grey[15],
        A100: grey[11],
        A200: grey[12],
        A400: grey[13],
        A700: grey[14],
        A800: grey[16],
    };
    const contrastText = '#fff';

    let primaryColors = [
        '#E1F5FC', // lighter (0번) | 50
        '#B3E5F8', // 100번
        '#82D4F3', // 200번 (기준 색상)
        '#53C3EE', // light | 300
        '#31B6EC', // 400번
        '#13A9E9', // main | 500 // 기본본
        '#0D9BDB', // dark | 600
        '#0488C7', // 700번
        '#0477B3', // darker | 800
        '#005892', // 900번
    ];
    let errorColors = ['#FDE8E7', '#F25E52', '#F04134', '#EE3B2F', '#E92A21'];
    let warningColors = ['#FFF7E0', '#FFC926', '#FFBF00', '#FFB900', '#FFA900'];
    let infoColors = ['#E0F4F5', '#26B0BA', '#00A2AE', '#009AA7', '#008694'];
    let successColors = ['#E0F5EA', '#26B56E', '#00A854', '#00A04D', '#008D3A'];

    if (mode === 'dark') {
        primaryColors = [
            '#4e0000',
            '#670000',
            '#800000',
            '#990000',
            '#b20000',
            '#cc0000',
            '#e60000',
            '#ff1a1a',
            '#ff4d4d',
            '#ff8080',
        ];
        errorColors = ['#321d1d', '#7d2e28', '#d13c31', '#e66859', '#f8baaf'];
        warningColors = ['#342c1a', '#836611', '#dda705', '#e9bf28', '#f8e577'];
        infoColors = ['#1a2628', '#11595f', '#058e98', '#1ea6aa', '#64cfcb'];
        successColors = ['#1a2721', '#115c36', '#05934c', '#1da65d', '#61ca8b'];
    }

    return {
        primary: {
            lighter: primaryColors[0],
            50: primaryColors[0],
            100: primaryColors[1],
            200: primaryColors[2],
            300: primaryColors[3],
            light: primaryColors[3],
            400: primaryColors[4],
            500: primaryColors[5],
            main: primaryColors[5],
            600: primaryColors[6],
            dark: primaryColors[6],
            700: primaryColors[7],
            800: primaryColors[8],
            darker: primaryColors[8],
            900: primaryColors[9],
            contrastText,
        },
        secondary: {
            lighter: greyColors[100],
            100: greyColors[100],
            200: greyColors[200],
            light: greyColors[300],
            400: greyColors[400],
            main: greyColors[500],
            600: greyColors[600],
            dark: greyColors[700],
            800: greyColors[800],
            darker: greyColors[900],
            A100: greyColors[0],
            A200: greyColors.A400,
            A300: greyColors.A700,
            contrastText: greyColors[0],
        },
        error: {
            lighter: errorColors[0],
            light: errorColors[1],
            main: errorColors[2],
            dark: errorColors[3],
            darker: errorColors[4],
            contrastText,
        },
        warning: {
            lighter: warningColors[0],
            light: warningColors[1],
            main: warningColors[2],
            dark: warningColors[3],
            darker: warningColors[4],
            contrastText: greyColors[100],
        },
        info: {
            lighter: infoColors[0],
            light: infoColors[1],
            main: infoColors[2],
            dark: infoColors[3],
            darker: infoColors[4],
            contrastText,
        },
        success: {
            lighter: successColors[0],
            light: successColors[1],
            main: successColors[2],
            dark: successColors[3],
            darker: successColors[4],
            contrastText,
        },
        grey: greyColors,
    };
}
