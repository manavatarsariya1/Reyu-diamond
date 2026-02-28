import { authSaga } from "@/features/auth/auth.Saga";
import kycWatcherSaga from "@/features/kyc/kycSaga";
import preferenceWatcherSaga from "@/features/preference/preferenceSaga";
import inventoryWatcherSaga from "@/features/inventory/inventorySaga";
import { auctionWatcherSaga } from "@/features/auction/auctionSaga";
import bidWatcherSaga from "@/features/bid/bidSaga";
import { all } from "redux-saga/effects";

export default function* rootSaga(): Generator {
  yield all([
    // wishlistSaga(),
    authSaga(),
    kycWatcherSaga(),
    preferenceWatcherSaga(),
    inventoryWatcherSaga(),
    auctionWatcherSaga(),
    bidWatcherSaga(),
    // productSaga(),
    // refreshSaga(),
    // syncSaga(),
  ]);
}
