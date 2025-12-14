// ==============================|| DEFAULT THEME - TYPOGRAPHY ||============================== //

export default function Typography(fontFamily: string) {
    return {
        htmlFontSize: 16,
        fontFamily: fontFamily || 'Arial, sans-serif',
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 600,
        h1: {
            fontWeight: 600,
            fontSize: '2.375rem',
            lineHeight: 1.21,
            color: '#7c7c7c',
        },
        h2: {
            fontWeight: 600,
            fontSize: '1.875rem',
            lineHeight: 1.27,
            color: '#7c7c7c',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.33,
            color: '#7c7c7c',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
            color: '#7c7c7c',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.5,
            color: '#7c7c7c',
        },
        h6: {
            fontWeight: 400,
            fontSize: '0.875rem',
            lineHeight: 1.57,
            color: '#7c7c7c',
        },
        caption: {
            fontWeight: 400,
            fontSize: '0.75rem',
            lineHeight: 1.66,
            color: '#7c7c7c',
        },
        body1: {
            fontSize: '0.875rem',
            lineHeight: 1.57,
            color: '#7c7c7c',
        },
        body2: {
            fontSize: '0.75rem',
            lineHeight: 1.66,
            color: '#7c7c7c',
        },
        subtitle1: {
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: 1.57,
            color: '#7c7c7c',
        },
        subtitle2: {
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: 1.66,
            color: '#7c7c7c',
        },
        overline: {
            lineHeight: 1.66,
            color: '#7c7c7c',
        },
        button: {
            textTransform: 'none',
            color: '#7c7c7c',
        },
    };
}
