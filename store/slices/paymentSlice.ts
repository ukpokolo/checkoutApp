import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PaymentStatus =
  | "idle"
  | "initiating"
  | "processing"
  | "verifying"
  | "success"
  | "failed"
  | "cancelled";

interface PaymentState {
  status: PaymentStatus;
  txnRef: string | null;
  amount: number | null;
  error: string | null;
  responseCode: string | null;
  verifiedAt: number | null;
}

const initialState: PaymentState = {
  status: "idle",
  txnRef: null,
  amount: null,
  error: null,
  responseCode: null,
  verifiedAt: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPayment: () => initialState,

    setInitiating(state) {
      state.status = "initiating";
      state.error = null;
    },

    setProcessing(
      state,
      action: PayloadAction<{ txnRef: string; amount: number }>
    ) {
      state.status = "processing";
      state.txnRef = action.payload.txnRef;
      state.amount = action.payload.amount;
    },

    sdkCompleted(
      state,
      action: PayloadAction<{ responseCode: string; txnRef: string }>
    ) {
      const { responseCode, txnRef } = action.payload;
      state.txnRef = txnRef;
      if (responseCode === "00") {
        state.status = "verifying";
      } else if (responseCode === "09" || responseCode === "021") {
        state.status = "cancelled";
      } else {
        state.status = "failed";
        state.responseCode = responseCode;
      }
    },

    setVerifyResult(
      state,
      action: PayloadAction<{ responseCode: string; message: string }>
    ) {
      const { responseCode, message } = action.payload;
      state.responseCode = responseCode;
      state.verifiedAt = Date.now();
      if (responseCode === "00") {
        state.status = "success";
      } else {
        state.status = "failed";
        state.error = message;
      }
    },

    setFailed(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const {
  resetPayment,
  setInitiating,
  setProcessing,
  sdkCompleted,
  setVerifyResult,
  setFailed,
} = paymentSlice.actions;

export default paymentSlice.reducer;
