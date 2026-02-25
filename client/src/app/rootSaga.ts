import { authSaga } from "@/features/auth/auth.Saga";
import kycWatcherSaga from "@/features/kyc/kycSaga";
import preferenceWatcherSaga from "@/features/preference/preferenceSaga";
import { all } from "redux-saga/effects";

export default function* rootSaga(): Generator {
  yield all([
    // wishlistSaga(),
    authSaga(),
    kycWatcherSaga(),
    preferenceWatcherSaga(),
    // productSaga(),
    // refreshSaga(),
    // syncSaga(),
  ]);
}
