import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import reducers from './reducers';
import { persistStore, persistReducer } from 'redux-persist';

const createNoopStorage = () => {
  return {
    getItem(){
      return Promise.resolve(null);
    },
    setItem(){
      return Promise.resolve(null);
    },
    removeItem(){
      return Promise.resolve(null);
    }
  }
}

const storage = 
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();


const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist:['auth', 'global'],
  blacklist: ['']
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);
setupListeners(store.dispatch);

export { store , persistor }

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;