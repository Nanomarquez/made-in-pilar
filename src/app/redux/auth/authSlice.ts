import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "firebase/auth";
import { DocumentData } from "firebase/firestore";

type AuthState = {
  userData?: DocumentData;
  userCredentials: User | null
};

const initialState: AuthState = {
  userData:undefined,
  userCredentials: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData(state, action: PayloadAction<DocumentData | undefined>){
      state.userData = action.payload;
    },
    setUserCredentials(state, action: PayloadAction<User | null>){
      state.userCredentials = action.payload;
    }
  },
});

export const {
  setUserData,
  setUserCredentials,
} = authSlice.actions;

export default authSlice.reducer;