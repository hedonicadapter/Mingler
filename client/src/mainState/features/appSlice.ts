import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAliasedAction } from 'electron-redux';

interface AppState {
  appVisible: Boolean;
  settingsOpen: Boolean;
  settingsFocused: Boolean;
}

const initialState: AppState = {
  appVisible: true,
  settingsOpen: false,
  settingsFocused: false,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    appVisibleTrue: (state) => {
      state.appVisible = true;
    },
    appVisibleFalse: (state) => {
      state.appVisible = false;
    },
    settingsOpenTrue: (state) => {
      state.settingsOpen = true;
    },
    settingsOpenFalse: (state) => {
      state.settingsOpen = false;
    },
    settingsFocusedTrue: (state) => {
      state.settingsFocused = true;
    },
    settingsFocusedFalse: (state) => {
      state.settingsFocused = false;
    },
  },
  extraReducers: {
    toggleAppVisible: (state) => {
      state.appVisible = !state.appVisible;
    },
    appVisibleTrue: (state) => {
      state.appVisible = true;
    },
    appVisibleFalse: (state) => {
      state.appVisible = false;
    },
  },
});

export const { appVisibleTrue } = appSlice.actions;
export const { appVisibleFalse } = appSlice.actions;
export const { settingsFocusedTrue } = appSlice.actions;
export const { settingsFocusedFalse } = appSlice.actions;
export const { settingsOpenTrue } = appSlice.actions;
export const { settingsOpenFalse } = appSlice.actions;

export default appSlice.reducer;

export const getApp = (state: AppState) => state;
