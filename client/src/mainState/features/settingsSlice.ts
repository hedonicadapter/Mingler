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
      state.currentUser = action.payload;
    },
  },
});

export const { setCurrentUserMain } = settingsSlice.actions;

export default settingsSlice.reducer;
