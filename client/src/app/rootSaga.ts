import { authSaga } from "@/features/auth/auth.Saga";
import { all } from "redux-saga/effects";

export default function* rootSaga(): Generator {
  yield all([
    // wishlistSaga(),
    authSaga(),
    // productSaga(),
    // refreshSaga(),
    // syncSaga(),
  ]);
}
