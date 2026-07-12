import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'OVERDUE_RETURN' | 'TRANSFER_REQUEST' | 'MAINTENANCE_ALERT' | 'AUDIT_DISCREPANCY' | 'BOOKING_REMINDER';
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
      state.items = action.payload.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      state.unreadCount = action.payload.filter((item) => !item.isRead).length;
    },
    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.items.forEach((item) => {
        item.isRead = true;
      });
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, markRead, markAllRead } =
  notificationSlice.actions;
export default notificationSlice.reducer;
