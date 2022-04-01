import React, { useContext, useState, useEffect, createContext } from 'react';
import { useSelector } from 'react-redux';
import { getSettings } from '../mainState/features/settingsSlice';

const StoreContext = createContext();
export function useStoreContext() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const settings = useSelector(getSettings);

  useEffect(() => {
    console.log(settings);
  }, [settings]);

  const value = {
    settings,
  };

  return (
    <StoreContext.Provider value={value}>
      {settings && children}
    </StoreContext.Provider>
  );
}
