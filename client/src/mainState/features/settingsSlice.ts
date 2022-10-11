import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { arrayBufferToBase64 } from '../../helpers/fileManager';
import { upsertArray } from '../../helpers/arrayTools';
import produce from 'immer';

// add interface for currentUser
interface SettingsState {
  currentUser: Array<any> | null; // TODO: make interface
  activities: any; // TODO: make interface
  showWelcome: Boolean;
  settingsContent: string;
  browser: string;
  extensionID: string;
  globalShortcut: string;
  keys: Array<any>;
}

const initialState: SettingsState = {
  currentUser: [],
  activities: {},
  showWelcome: true, //Used to show welcome splash screen or header on first launch
  settingsContent: 'Widget',
  browser: 'Chrome',
  extensionID: '',
  globalShortcut: 'CommandOrControl+q',
  keys: [''],
};

type WindowActivity = {
  WindowTitle: string;
};

type TabActivity = { TabTitle: string; TabURL: string };

type YouTubeActivity = {
  YouTubeTitle: string;
  YouTubeURL: string;
};

type TrackActivity = {
  TrackTitle: string;
  TrackURL: string;
  Artists: string;
};

type Activity = (
  | WindowActivity
  | TabActivity
  | YouTubeActivity
  | TrackActivity
) & { Date: Date };

/*
 * User receives a new window activity, if the activity exists
 * in the form of a tab or a track, return true
 */
const findWindowDuplicate = (
  newWindow: string,
  friendsActivity: Array<Activity>
) => {
  return friendsActivity.some((actvt) => {
    let existingTab = actvt?.TabTitle;
    let existingYouTube = actvt?.YouTubeTitle;
    let existingTrack = actvt?.TrackTitle;

    if (existingTab) {
      // TODO: A better way would be a fuzzy search, but this handles cases like
      // browsers displaying the tab name as the window name and appending
      // the tab count with some text
      let existingSubstring = existingTab.substring(0, newWindow.length);
      let newSubstring = newWindow.substring(0, existingTab.length);

      if (
        existingTab.includes(newSubstring) ||
        newWindow.includes(existingSubstring)
      ) {
        return true;
      }
    } else if (existingYouTube) {
      let existingSubstring = existingYouTube.substring(0, newWindow.length);
      let newSubstring = newWindow.substring(0, existingYouTube.length);

      if (
        existingYouTube.includes(newSubstring) ||
        newWindow.includes(existingSubstring)
      ) {
        return true;
      }
    } else if (existingTrack) {
      // TODO: Might change in the future
      // Spotify sets its window title as [artists] - [song title]
      let existingTitle = actvt?.TrackTitle;
      let existingArtists = actvt?.Artists;
      if (newWindow === ` ${existingArtists} - ${existingTitle}`) return true;
    }

    return false;
  });
};

/*
 * If a new activity already exists as a window activity, delete the window activity
 */
const replaceDuplicatePreviousWindowActivity = (
  friendsActivity: Array<Activity>,
  newActivity: Activity,
  type: string
) => {
  let newActivityAsPreviousWindowActivity = friendsActivity.findIndex(
    (actvt) =>
      actvt?.WindowTitle &&
      actvt.WindowTitle.includes(newActivity[type as keyof Activity]) // for example newActivity['TabTitle']
  );
  if (newActivityAsPreviousWindowActivity > -1) {
    delete friendsActivity[newActivityAsPreviousWindowActivity];
  }
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
    setSpotifyRefreshTokenMain: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.currentUser.spotifyRefreshToken = action.payload;
    },
    setSpotifyExpiryDate: (state, action: PayloadAction<Date | null>) => {
      state.currentUser.spotifyExpiryDate = action.payload;
    },
    setProfilePictureMain: (state, action: PayloadAction<Array<any>>) => {
      state.currentUser.profilePicture = action.payload.profilePicture;
      state.currentUser.thumbnail = action.payload?.thumbnail;
    },
    setKeepMeSignedInMain: (state, action: PayloadAction<Array<any>>) => {
      state.currentUser.keepMeSignedIn = action.payload;
    },
    setActivitiesMain: (
      state,
      action: PayloadAction<{
        userID: string;
        data: Activity;
        type: string;
      }>
    ) => {
      const { userID, data, type } = action.payload;
      if (!userID || !data || !type || !data[type as keyof Activity]) return;

      let friendsActivity: any[] = [];
      let preDisconnectTrack: number = -1;

      if (state.activities && state.activities[userID]) {
        friendsActivity = [...state.activities[userID]];
      }

      if (friendsActivity.length > 0) {
        if (type === 'WindowTitle') {
          // Window activities can make duplicates
          const isDuplicate = findWindowDuplicate(
            data.WindowTitle,
            friendsActivity
          );

          if (isDuplicate) return;
        } else {
          replaceDuplicatePreviousWindowActivity(friendsActivity, data, type);

          // Delete track activity if user disconnects spotify and sends "disconnect" as a tracktitle
          if (type === 'TrackTitle') {
            console.log('type is tracktitle');
            if (data.TrackTitle === 'disconnect') {
              console.log('data.TrackTitle is disconnect ', data.TrackTitle);
              preDisconnectTrack = friendsActivity.findIndex(
                (actvt) => actvt?.TrackTitle || false
              );
              console.log('preDisconnectTrack ', preDisconnectTrack);
              if (preDisconnectTrack !== -1) {
                console.log('splicing');
                friendsActivity.splice(preDisconnectTrack, 1);
              }
            }
          }
        }
      }

      // value only changes from -1 if user emits disconnect as track activity
      if (preDisconnectTrack === -1) {
        // Check if an activity of the same type already exists,
        let activityExists = friendsActivity.findIndex(
          (actvt) => actvt?.[type] || false
        );

        // replace if it does.
        if (activityExists > -1) {
          friendsActivity[activityExists] = data;

          // Move to top, as it's the most recent activity
          friendsActivity.unshift(friendsActivity.splice(activityExists, 1)[0]);
        } else {
          friendsActivity.unshift(data);
        }
      }

      state.activities = {
        ...state.activities,
        [userID]: friendsActivity,
      };
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

export const { setActivitiesMain } = settingsSlice.actions;

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
export const getActivities = (state: SettingsState) =>
  state.settings.activities;
