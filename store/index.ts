import { configureStore } from "@reduxjs/toolkit";
import { paymentApi } from "./api/paymentApi";
import paymentReducer from "./slices/paymentSlice";

export const store = configureStore({
  reducer: {
    payment: paymentReducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(paymentApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
