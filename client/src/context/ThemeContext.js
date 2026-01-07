import React, { createContext, useState, useEffect } from 'react';
import { generateHoverColor, generateDarkerColor } from '../utils/colorUtils';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [restaurantColors, setRestaurantColors] = useState({
    primaryColor: '#ff6b35',
    secondaryColor: '#2d5016'
  });

  const [theme, setTheme] = useState(null);

  // Update theme whenever colors change
  useEffect(() => {
    const primary = restaurantColors.primaryColor;
    const secondary = restaurantColors.secondaryColor;

    const newTheme = {
      primary: {
        main: primary,
        light: generateHoverColor(primary, 20),
        dark: generateDarkerColor(primary, 20),
        contrastText: '#fff'
      },
      secondary: {
        main: secondary,
        light: generateHoverColor(secondary, 20),
        dark: generateDarkerColor(secondary, 20),
        contrastText: '#fff'
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff'
      },
      text: {
        primary: secondary,
        secondary: '#666666'
      }
    };

    setTheme(newTheme);
  }, [restaurantColors]);

  const updateColors = (primaryColor, secondaryColor) => {
    setRestaurantColors({
      primaryColor: primaryColor || restaurantColors.primaryColor,
      secondaryColor: secondaryColor || restaurantColors.secondaryColor
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, restaurantColors, updateColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

