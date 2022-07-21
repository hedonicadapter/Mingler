import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAliasedAction } from 'electron-redux';

interface AppState {
  appVisible: Boolean;
  cardExpandedMasterToggle: Boolean;
  settingsOpen: Boolean;
  settingsFocused: Boolean;
  findFriendsOpen: Boolean;
  findFriendsSearchValue: string;
  windowWidth: number;
}

const initialState: AppState = {
  appVisible: true,
  cardExpandedMasterToggle: false,
  settingsOpen: false,
  settingsFocused: false,
  findFriendsOpen: false,
  findFriendsSearchValue: '',
  windowWidth: 430,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    appVisibleTrue: (state) => {
      state.appVisible = true;
    },
    appVisibleFalse: (state) => {
      // if (state.settingsFocused) return;
      state.appVisible = false;
    },
    toggleCardExpandedMasterToggle: (state) => {
      state.cardExpandedMasterToggle = !state.cardExpandedMasterToggle;
    },
    settingsOpenTrue: (state) => {
      state.settingsOpen = true;
    },
    settingsOpenFalse: (state) => {
      state.settingsOpen = false;
    },
    findFriendsOpenTrue: (state) => {
      state.findFriendsOpen = true;
    },
    findFriendsOpenFalse: (state) => {
      state.findFriendsOpen = false;
    },
    settingsFocusedTrue: (state) => {
      state.settingsFocused = true;
      // if (!state.appVisible) state.appVisible = true;
    },
    settingsFocusedFalse: (state) => {
      state.settingsFocused = false;
    },
    setFindFriendsSearchValue: (state, action: PayloadAction<string>) => {
      state.findFriendsSearchValue = action.payload;
    },
    toggleAppVisible: (state) => {
      state.appVisible = !state.appVisible;
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
      // if (state.settingsFocused) return;
      state.appVisible = false;
    },
    setWindowWidth: (state, action: PayloadAction<number>) => {
      state.windowWidth = action.payload;
    },
  },
});

export const { appVisibleTrue } = appSlice.actions;
export const { appVisibleFalse } = appSlice.actions;
export const { toggleAppVisible } = appSlice.actions;
export const { toggleCardExpandedMasterToggle } = appSlice.actions;
export const { settingsOpenTrue } = appSlice.actions;
export const { settingsOpenFalse } = appSlice.actions;
export const { findFriendsOpenTrue } = appSlice.actions;
export const { findFriendsOpenFalse } = appSlice.actions;
export const { settingsFocusedTrue } = appSlice.actions;
export const { settingsFocusedFalse } = appSlice.actions;
export const { setFindFriendsSearchValue } = appSlice.actions;

export default appSlice.reducer;

export const getApp = (state: AppState) => state.app;
