export interface MessageData {
  id: string;
  emailReceivers: Array<string>;
  isActive: boolean;
  messageContent: string;
  inactivePeriodDays: number;
  reminderIntervalDays: number;
}

export const defaultMessageData = {
  emailReceivers: [] as Array<string>,
  id: '',
  inactivePeriodDays: 60,
  isActive: true,
  messageContent: '',
  reminderIntervalDays: 15,
};
