import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { arrayBufferToBase64 } from '../../helpers/fileManager';

interface SettingsState {
  currentUser: Array<any>;
}

const initialState: SettingsState = {
  currentUser: [],
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setCurrentUserMain: (state, action: PayloadAction<Array<any>>) => {
      // let newArr = state;
      // newArr.currentUser = action.payload;
      // return newArr;
      state.currentUser = action.payload;
    },
    setUsernameMain: (state, action: PayloadAction<Array<any>>) => {
      state.currentUser.username = action.payload;
    },
    setEmailMain: (state, action: PayloadAction<Array<any>>) => {
      state.currentUser.email = action.payload;
    },
    setTokenMain: (state, action: PayloadAction<Array<any>>) => {
      state.currentUser.token = action.payload;
    },
    setProfilePictureMain: (state, action: PayloadAction<Array<any>>) => {
      var newProfilePicture = action.payload;
      state.currentUser.profilePicture = newProfilePicture;
    },
  },
});

export const { setCurrentUserMain } = settingsSlice.actions;
export const { setUsernameMain } = settingsSlice.actions;
export const { setEmailMain } = settingsSlice.actions;
export const { setTokenMain } = settingsSlice.actions;
export const { setProfilePictureMain } = settingsSlice.actions;

export default settingsSlice.reducer;

export const getSettings = (state: SettingsState) => state;
export const getCurrentUser = (state: SettingsState) =>
  state.settings.currentUser;
