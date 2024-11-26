import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum DeviceType {
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  TABLET = 'tablet'
}

type GlobalState = {
  loading: boolean;
  isAuth: boolean;
  deviceType: DeviceType;
};

const initialState: GlobalState = {
  loading: false,
  isAuth: false,
  deviceType: DeviceType.DESKTOP
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setIsAuth(state, action: PayloadAction<boolean>) {
      state.isAuth = action.payload;
    },
    setDeviceType: (state, action: PayloadAction<DeviceType>) => {
      state.deviceType = action.payload;
    },
  },
});

export const {
  setLoading,
  setIsAuth,
  setDeviceType
} = globalSlice.actions;

export default globalSlice.reducer;