import express, { Request, Response } from "express";
import { Message, MessageWithId } from "../models/message";
const router = express.Router();

interface Inbox {
  received: MessageWithId[];
  sent: MessageWithId[];
}

class MessagesManager {
  private sentMessagesMap: Map<string, MessageWithId[]> = new Map();
  private receivedMessagesMap: Map<string, MessageWithId[]> = new Map();
  private idCounter = 0;

  /**
   * get all messages sent or received by the user
   */
  public getAll = (
    req: Request<{ userId: string }, Inbox, {}>,
    res: Response<Inbox>
  ) => {
    const receivedMessages = this.receivedMessagesMap.get(req.params.userId);
    const sentMessages = this.sentMessagesMap.get(req.params.userId);
    res
      .status(200)
      .json({ sent: sentMessages || [], received: receivedMessages || [] });
  };

  /**
   * send a new message
   */
  public writeMessage = (
    req: Request<{ userId: string }, MessageWithId, Message>,
    res: Response<MessageWithId>
  ) => {
    const userId = req.params.userId;
    const messageWithId = { ...req.body, id: this.idCounter };
    this.idCounter++;
    this.addMessageToMap(this.sentMessagesMap, userId, messageWithId);
    this.addMessageToMap(
      this.receivedMessagesMap,
      messageWithId.receiver,
      messageWithId
    );
    res.status(200).json(messageWithId);
  };

  /**
   * delete a message
   */
  public deleteMessage = (
    req: Request<
      { userId: string; messageId: string },
      MessageWithId | { error: string },
      {}
    >,
    res: Response<MessageWithId | { error: string }>
  ) => {
    const { userId, messageId } = req.params;
    const deletedFromReceived = this.deleteMessageFromMap(
      this.receivedMessagesMap,
      userId,
      messageId
    );
    const deletedFromSent = this.deleteMessageFromMap(
      this.sentMessagesMap,
      userId,
      messageId
    );
    if (deletedFromReceived === undefined && deletedFromSent === undefined) {
      res.status(400).json({ error: "Message or user not found" });
    } else {
      res.status(200).json(deletedFromReceived || deletedFromSent);
    }
  };

  private deleteMessageFromMap(
    messagesMap: Map<string, MessageWithId[]>,
    userId: string,
    messageId: string
  ) {
    const messages = messagesMap.get(userId);
    if (messages !== undefined) {
      const indexToDelete = messages.findIndex(
        (message) => message.id === parseInt(messageId, 10)
      );
      if (indexToDelete !== -1) {
        const deletedMessage = messages.splice(indexToDelete, 1);
        return deletedMessage[0];
      }
    }
    return undefined;
  }

  private addMessageToMap(
    messagesMap: Map<string, MessageWithId[]>,
    userId: string,
    messageWithId: MessageWithId
  ) {
    if (messagesMap.has(userId)) {
      messagesMap.get(userId).push(messageWithId);
    } else {
      messagesMap.set(userId, [messageWithId]);
    }
  }
}

const manager = new MessagesManager();

router.get("/:userId/getAll", manager.getAll);

router.post("/:userId/writeMessage", manager.writeMessage);

router.post("/:userId/deleteMessage/:messageId", manager.deleteMessage);

export default router;
