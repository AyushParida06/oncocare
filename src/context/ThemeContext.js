import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({ theme: 'light' });

export const ThemeProvider = ThemeContext.Provider;
export const useTheme = () => useContext(ThemeContext);
