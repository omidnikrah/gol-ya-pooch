import { Player } from '@gol-ya-pooch/shared';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface IMessageData {
  playerId: Player['id'];
  message: string;
}

interface MessagesStore {
  messages: IMessageData[] | null;

  setMessage: (data: IMessageData) => void;
  removeMessage: (playerId: IMessageData['playerId']) => void;
}

export const useMessagesStore = create(
  subscribeWithSelector<MessagesStore>((set) => ({
    messages: null,

    setMessage: (msg) =>
      set((state) => ({ messages: [...(state.messages || []), msg] })),
    removeMessage: (playerId) =>
      set((state) => {
        const filteredMessaged = state.messages?.filter(
          (msg) => msg.playerId !== playerId,
        );

        return {
          messages: filteredMessaged,
        };
      }),
  })),
);

useMessagesStore.subscribe(
  (state) => state.messages,
  (messages) => {
    if (messages) {
      setTimeout(() => {
        useMessagesStore
          .getState()
          .removeMessage(messages[messages.length - 1].playerId);
      }, 3000);
    }
  },
);
