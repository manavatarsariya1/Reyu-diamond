import { configureStore, combineReducers } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import authReducer from "../features/auth/auth.Slice"


import storage from "redux-persist/lib/storage";
import type { PersistConfig } from 'redux-persist';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
//   PersistConfig,
} from "redux-persist";

import rootSaga from "./rootSaga";

/* ===============================
   1️⃣ Saga middleware
   =============================== */
const sagaMiddleware = createSagaMiddleware();

/* ===============================
   2️⃣ Root reducer
   =============================== */
const rootReducer = combineReducers({
  auth: authReducer,
//   products: productReducer,
//   wishlist: wishlistReducer,
//   refresh: refreshReducer,
//   sync: syncReducer,
});

/* ===============================
   3️⃣ Persist config (typed)
   =============================== */
const persistConfig: PersistConfig<RootReducerType> = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

/* ===============================
   4️⃣ Persisted reducer
   =============================== */
const persistedReducer = persistReducer(persistConfig, rootReducer);
// const persistedReducer = persistReducer<any>(persistConfig, rootReducer);


/* ===============================
   5️⃣ Store
   =============================== */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // ❗ disable thunk when using saga
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }).concat(sagaMiddleware),
});

/* ===============================
   6️⃣ Run saga
   =============================== */
sagaMiddleware.run(rootSaga);

/* ===============================
   7️⃣ Persistor
   =============================== */
export const persistor = persistStore(store);

/* ===============================
   8️⃣ Types (IMPORTANT)
   =============================== */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Helper type
type RootReducerType = ReturnType<typeof rootReducer>;

export default store;
