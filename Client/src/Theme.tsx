import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#cc0001', // Primary color Lighter Red   
        },
        secondary: {
            main: '#a80000', // Secondary color Darker Red
        },
        background: {
            default: '#f5f5f5', // Background color
        },
        text: {
            primary: '#000000', // Text color
            secondary: '#9e0e04' // Tertiary text color Red
        },
    },
    typography: {
        fontFamily: 'Arial', // Default font
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
        },
        button: {
            textTransform: 'none', // Disable uppercase text for buttons
        },
    },
});

