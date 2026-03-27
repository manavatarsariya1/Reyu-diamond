import { authSaga } from "@/features/auth/auth.Saga";
import kycWatcherSaga from "@/features/kyc/kycSaga";
import preferenceWatcherSaga from "@/features/preference/preferenceSaga";
import inventoryWatcherSaga from "@/features/inventory/inventorySaga";
import { auctionWatcherSaga } from "@/features/auction/auctionSaga";
import bidWatcherSaga from "@/features/bid/bidSaga";
import { watchDealSagas } from "@/features/deal/dealSaga";
import { paymentSaga } from "@/features/payment/paymentSaga";
import { chatSaga } from "@/features/chat/chatSaga";
import { notificationSaga } from "@/features/notification/notificationSaga";
import { all, fork } from "redux-saga/effects";

export default function* rootSaga(): Generator {
  yield all([
    // wishlistSaga(),
    authSaga(),
    kycWatcherSaga(),
    preferenceWatcherSaga(),
    inventoryWatcherSaga(),
    auctionWatcherSaga(),
    bidWatcherSaga(),
    fork(watchDealSagas),
    fork(paymentSaga),
    chatSaga(),
    notificationSaga(),
    // productSaga(),
    // refreshSaga(),
    // syncSaga(),
  ]);
}
