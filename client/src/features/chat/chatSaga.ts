import { call, put, takeLatest } from 'redux-saga/effects';
import { chatService, type Conversation, type ChatMessage } from '@/api/chatService';
import {
  fetchConversationsRequest,
  fetchConversationsSuccess,
  fetchConversationsFailure,
  fetchMessagesRequest,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  sendMessageRequest,
  sendMessageSuccess,
  sendMessageFailure,
  markAsReadRequest,
  markAsReadSuccess,
  createConversationRequest,
  createConversationSuccess,
  createConversationFailure,
  fetchPotentialPartnersRequest,
  fetchPotentialPartnersSuccess,
  fetchPotentialPartnersFailure
} from './chatSlice';
import { toast } from 'sonner';

function* handleFetchPotentialPartners() {
  try {
    const data: any[] = yield call(chatService.getPotentialPartners);
    yield put(fetchPotentialPartnersSuccess(data));
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Failed to fetch potential partners';
    yield put(fetchPotentialPartnersFailure(errorMsg));
  }
}

function* handleFetchConversations() {
  try {
    const data: Conversation[] = yield call(chatService.getConversations);
    yield put(fetchConversationsSuccess(data));
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Failed to fetch conversations';
    yield put(fetchConversationsFailure(errorMsg));
    toast.error(errorMsg);
  }
}

function* handleFetchMessages(action: ReturnType<typeof fetchMessagesRequest>) {
  try {
    const data: ChatMessage[] = yield call(chatService.getMessages, action.payload);
    yield put(fetchMessagesSuccess(data));
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Failed to fetch messages';
    yield put(fetchMessagesFailure(errorMsg));
    toast.error(errorMsg);
  }
}

function* handleSendMessage(action: ReturnType<typeof sendMessageRequest>) {
  try {
    const { conversationId, content, files } = action.payload;
    const data: ChatMessage = yield call(chatService.sendMessage, conversationId, content, files);
    yield put(sendMessageSuccess(data));
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Failed to send message';
    yield put(sendMessageFailure(errorMsg));
    toast.error(errorMsg);
  }
}

function* handleMarkAsRead(action: ReturnType<typeof markAsReadRequest>) {
  try {
    yield call(chatService.markAsRead, action.payload);
    yield put(markAsReadSuccess(action.payload));
  } catch (error: any) {
    console.error('Failed to mark messages as read:', error);
  }
}

function* handleCreateConversation(action: ReturnType<typeof createConversationRequest>) {
    try {
        const { participants, contextId, contextType } = action.payload;
        const data: Conversation = yield call(chatService.createConversation, participants, contextId, contextType);
        yield put(createConversationSuccess(data));
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'Failed to create conversation';
        yield put(createConversationFailure(errorMsg));
        toast.error(errorMsg);
    }
}

export function* chatSaga() {
  yield takeLatest(fetchConversationsRequest.type, handleFetchConversations);
  yield takeLatest(fetchMessagesRequest.type, handleFetchMessages);
  yield takeLatest(sendMessageRequest.type, handleSendMessage);
  yield takeLatest(markAsReadRequest.type, handleMarkAsRead);
  yield takeLatest(createConversationRequest.type, handleCreateConversation);
  yield takeLatest(fetchPotentialPartnersRequest.type, handleFetchPotentialPartners);
}
