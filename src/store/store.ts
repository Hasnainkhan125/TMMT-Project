import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { combineReducers } from "@reduxjs/toolkit"

import authSlice from "./slices/authSlice"
import investorSlice from "./slices/investorSlice"
import portfolioSlice from "./slices/portfolioSlice"
import issuerSlice from "./slices/issuerSlice"
import complianceSlice from "./slices/complianceSlice"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "investor", "portfolio", "issuer", "compliance"], // Only persist these slices
}

const rootReducer = combineReducers({
  auth: authSlice,
  investor: investorSlice,
  portfolio: portfolioSlice,
  issuer: issuerSlice,
  compliance: complianceSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
