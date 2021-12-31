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
      return state;
    },
  },
});

export const { setCurrentUserMain } = settingsSlice.actions;

export default settingsSlice.reducer;

export const getCurrentUser = (state: SettingsState) => state;
