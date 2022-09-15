import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { arrayBufferToBase64 } from '../../helpers/fileManager';
import { upsertArray } from '../../helpers/arrayTools';
import produce from 'immer';

// add interface for currentUser
interface SettingsState {
  currentUser: Array<any>; // TODO: make interface
  showWelcome: Boolean;
  settingsContent: string;
  browser: string;
  extensionID: string;
  globalShortcut: string;
  keys: Array<any>;
}

const initialState: SettingsState = {
  currentUser: [],
  showWelcome: true, //Used to show welcome splash screen or header on first launch
  settingsContent: 'Widget',
  browser: 'Chrome',
  extensionID: '',
  globalShortcut: 'CommandOrControl+q',
  keys: [''],
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
        data.profilePicture = data.profilePicture;
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
    setSpotifyAccessTokenMain: (state, action: PayloadAction<string>) => {
      state.currentUser.spotifyAccessToken = action.payload;
    },
    setSpotifyRefreshTokenMain: (state, action: PayloadAction<string>) => {
      state.currentUser.spotifyRefreshToken = action.payload;
    },
    setSpotifyExpiryDate: (state, action: PayloadAction<Date>) => {
      state.currentUser.spotifyExpiryDate = action.payload;
    },
    setProfilePictureMain: (state, action: PayloadAction<Array<any>>) => {
      state.currentUser.profilePicture = action.payload.profilePicture;
      state.currentUser.thumbnail = action.payload?.thumbnail;
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
    setBrowserMain: (state, action: PayloadAction<string>) => {
      state.browser = action.payload;
    },
    setKeys: (state, action: PayloadAction<any>) => {
      state.keys.push(action.payload);
    },
  },
  extraReducers: {
    setExtensionID: (state, action: PayloadAction<string>) => {
      state.extensionID = action.payload;
    },
    setGlobalShortcut: (state, action: PayloadAction<string>) => {
      state.globalShortcut = action.payload;
    },
    setSpotifyConnected: (state, action: PayloadAction<boolean>) => {
      if (!state.currentUser) return;

      let now = new Date();
      let spotifyExpiryDate = new Date(state.currentUser?.spotifyExpiryDate);

      if (
        // If access token exists and hasnt expired
        state.currentUser.spotifyAccessToken &&
        now < spotifyExpiryDate
      ) {
        state.currentUser.spotifyConnected = action.payload;
      } else state.currentUser.spotifyConnected = false;
    },
  },
});

export const { setCurrentUserMain } = settingsSlice.actions;
export const { setUsernameMain } = settingsSlice.actions;
export const { setEmailMain } = settingsSlice.actions;
export const { setAccessTokenMain } = settingsSlice.actions;
export const { setRefreshTokenMain } = settingsSlice.actions;
export const { setProfilePictureMain } = settingsSlice.actions;

export const { setSpotifyAccessTokenMain } = settingsSlice.actions;
export const { setSpotifyRefreshTokenMain } = settingsSlice.actions;
export const { setSpotifyExpiryDate } = settingsSlice.actions;

export const { setKeepMeSignedInMain } = settingsSlice.actions;

export const { turnOffShowWelcomeMain } = settingsSlice.actions;
export const { setSettingsContentMain } = settingsSlice.actions;
export const { setBrowserMain } = settingsSlice.actions;

export const { setKeys } = settingsSlice.actions;

export default settingsSlice.reducer;

export const getSettings = (state: SettingsState) => state.settings;
export const getCurrentUser = (state: SettingsState) =>
  state.settings.currentUser;
