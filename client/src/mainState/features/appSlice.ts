import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    toggleAppVisible: (state, action: PayloadAction<null>) => {
      state.appVisible = !state.appVisible;
    },
    appVisibleTrue: (state, action: PayloadAction<null>) => {
      state.appVisible = true;
    },
    appVisibleFalse: (state, action: PayloadAction<null>) => {
      state.appVisible = false;
    },
    settingsOpenTrue: (state, action: PayloadAction<null>) => {
      state.settingsOpen = true;
    },
    settingsOpenFalse: (state, action: PayloadAction<null>) => {
      state.settingsOpen = false;
    },
    settingsFocusedTrue: (state, action: PayloadAction<null>) => {
      state.settingsFocused = true;
    },
    settingsFocusedFalse: (state, action: PayloadAction<null>) => {
      state.settingsFocused = false;
    },
  },
});

export const { toggleAppVisible } = appSlice.actions;
export const { appVisibleTrue } = appSlice.actions;
export const { appVisibleFalse } = appSlice.actions;
export const { settingsFocusedTrue } = appSlice.actions;
export const { settingsFocusedFalse } = appSlice.actions;
export const { settingsOpenTrue } = appSlice.actions;
export const { settingsOpenFalse } = appSlice.actions;

export default appSlice.reducer;

export const getApp = (state: AppState) => state;
