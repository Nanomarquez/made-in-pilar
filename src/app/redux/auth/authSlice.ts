import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "firebase/auth";
import { DocumentData } from "firebase/firestore";

type AuthState = {
  userData?: DocumentData;
  userCredentials: User | null
  isAdmin: boolean;
};

const initialState: AuthState = {
  userData:undefined,
  userCredentials: null,
  isAdmin: false
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData(state, action: PayloadAction<DocumentData | undefined>){
      console.log(action.payload);
      const isAdmin = action.payload?.username === "admin";
      state.userData = action.payload;
      state.isAdmin = isAdmin;
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