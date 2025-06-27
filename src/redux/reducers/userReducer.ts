import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserState, UserInfoResponse, StudentInfo } from '../../types/userType';

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    getUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.currentUser = action.payload;
      state.error = null;
    },
    
    getUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    setUserFromResponse: (state, action: PayloadAction<UserInfoResponse>) => {
      if (action.payload.success && action.payload.user) {
        state.currentUser = action.payload.user;
        state.loading = false;
        state.error = null;
      }
    },
    
    updateUserInfo: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload,
        };
      }
    },
    
    updateStudentInfo: (state, action: PayloadAction<Partial<StudentInfo>>) => {
      if (state.currentUser?.studentInfo) {
        state.currentUser.studentInfo = {
          ...state.currentUser.studentInfo,
          ...action.payload,
        };
      }
    },
    
    clearUser: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const userReducer = userSlice.reducer;
export const {
  getUserRequest,
  getUserSuccess,
  getUserFailure,
  setUserFromResponse,
  updateUserInfo,
  updateStudentInfo,
  clearUser
} = userSlice.actions;

// Selector to get user data from state
export const userSelector = (state: any) => state.userReducer.currentUser;

export type { User };
