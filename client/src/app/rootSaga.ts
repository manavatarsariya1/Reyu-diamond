import { authSaga } from "@/features/auth/auth.Saga";
import kycWatcherSaga from "@/features/kyc/kycSaga";
import { all } from "redux-saga/effects";

export default function* rootSaga(): Generator {
  yield all([
    // wishlistSaga(),
    authSaga(),
    kycWatcherSaga(),
    // productSaga(),
    // refreshSaga(),
    // syncSaga(),
  ]);
}
