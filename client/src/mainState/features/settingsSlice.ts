import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    setTokenMain: (state, action: PayloadAction<Array<any>>) => {
      state.currentUser.token = action.payload;
    },
  },
});

export const { setCurrentUserMain } = settingsSlice.actions;
export const { setUsernameMain } = settingsSlice.actions;
export const { setTokenMain } = settingsSlice.actions;

export default settingsSlice.reducer;

export const getSettings = (state: SettingsState) => state;
