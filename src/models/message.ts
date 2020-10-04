export interface Message {
  sender: string;
  receiver: string;
  content: string;
  subject: string;
  creationDate: Date;
}

export type MessageWithId = Message & { id: number };
