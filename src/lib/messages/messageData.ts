export interface MessageData {
  id: string;
  emailReceivers: Array<string>;
  isActive: boolean;
  messageContent: string;
  inactivePeriodDays: number;
  reminderIntervalDays: number;
}
