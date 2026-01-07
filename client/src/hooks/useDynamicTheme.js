import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';

/**
 * Hook to create a dynamic MUI theme based on restaurant colors
 * @returns {object} MUI theme object
 */
export const useDynamicTheme = () => {
  const { theme } = useTheme();

  return useMemo(() => {
    if (!theme) {
      // Return default theme if theme context is not ready
      return createTheme({
        palette: {
          primary: {
            main: '#ff6b35',
          },
          secondary: {
            main: '#2d5016',
          },
        },
      });
    }

    return createTheme({
      palette: {
        primary: {
          main: theme.primary.main,
          light: theme.primary.light,
          dark: theme.primary.dark,
          contrastText: theme.primary.contrastText,
        },
        secondary: {
          main: theme.secondary.main,
          light: theme.secondary.light,
          dark: theme.secondary.dark,
          contrastText: theme.secondary.contrastText,
        },
        background: {
          default: theme.background.default,
          paper: theme.background.paper,
        },
        text: {
          primary: theme.text.primary,
          secondary: theme.text.secondary,
        },
      },
      typography: {
        fontFamily: '"Montserrat Alternates", "Helvetica", "Arial", sans-serif',
        h4: {
          fontWeight: 600,
        },
        h6: {
          fontWeight: 500,
        },
      },
    });
  }, [theme]);
};

