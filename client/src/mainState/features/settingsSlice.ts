import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  arrayBufferToBase64,
  profilePictureToJSXImg,
} from '../../helpers/fileManager';
import { upsertArray } from '../../helpers/arrayTools';
import produce from 'immer';

interface SettingsState {
  currentUser: Array<any>;
  showWelcome: Boolean;
  settingsContent: string;
}

const initialState: SettingsState = {
  currentUser: [],
  showWelcome: true, //Used to show welcome splash screen or header on first launch
  settingsContent: 'General',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setCurrentUserMain: (state, action: PayloadAction<Array<any>>) => {
      let data = action.payload;

      if (!data) {
        state.currentUser = null;
        return;
      }

      if (data.profilePicture && Object.keys(data.profilePicture).length != 0) {
        data.profilePicture = profilePictureToJSXImg(data.profilePicture);
      }

      state.currentUser = produce(state.currentUser, (draft) => {
        return { ...draft, ...data };
      });
    },
    setUsernameMain: (state, action: PayloadAction<string>) => {
      state.currentUser.username = action.payload;
    },
    setEmailMain: (state, action: PayloadAction<string>) => {
      state.currentUser.email = action.payload;
    },
    setAccessTokenMain: (state, action: PayloadAction<string>) => {
      state.currentUser.accessToken = action.payload;
    },
    setRefreshTokenMain: (state, action: PayloadAction<string>) => {
      state.currentUser.refreshToken = action.payload;
    },
    setProfilePictureMain: (state, action: PayloadAction<Array<any>>) => {
      state.currentUser.profilePicture = profilePictureToJSXImg(action.payload);
    },
    setKeepMeSignedInMain: (state, action: PayloadAction<Array<any>>) => {
      state.currentUser.keepMeSignedIn = action.payload;
    },
    turnOffShowWelcomeMain: (state) => {
      state.showWelcome = false;
    },
    setSettingsContentMain: (state, action: PayloadAction<string>) => {
      state.settingsContent = action.payload;
    },
  },
});

export const { setCurrentUserMain } = settingsSlice.actions;
export const { setUsernameMain } = settingsSlice.actions;
export const { setEmailMain } = settingsSlice.actions;
export const { setAccessTokenMain } = settingsSlice.actions;
export const { setRefreshTokenMain } = settingsSlice.actions;
export const { setProfilePictureMain } = settingsSlice.actions;

export const { setKeepMeSignedInMain } = settingsSlice.actions;

export const { turnOffShowWelcomeMain } = settingsSlice.actions;
export const { setSettingsContentMain } = settingsSlice.actions;

export default settingsSlice.reducer;

export const getSettings = (state: SettingsState) => state.settings;
export const getCurrentUser = (state: SettingsState) =>
  state.settings.currentUser;
