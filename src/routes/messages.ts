import express, { Request, Response } from "express";
import { Message, MessageWithId } from "../models/message";
const router = express.Router();

class MessagesManager {
  private idMessageMap: Map<string, MessageWithId[]> = new Map();
  private idCounter = 0;

  /**
   * get all messages by user id
   */
  public getAll = (
    req: Request<{ userId: string }, MessageWithId[], {}>,
    res: Response<MessageWithId[]>
  ) => {
    const userMessages = this.idMessageMap.get(req.params.userId);
    userMessages
      ? res.status(200).json(userMessages)
      : res.status(200).json([]);
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
    this.idMessageMap.has(userId)
      ? this.idMessageMap.get(userId).push(messageWithId)
      : this.idMessageMap.set(userId, [messageWithId]);
    res.status(200).json(messageWithId);
  };

  /**
   * delete a message
   */
  public deleteMessage = (
    req: Request<{ userId: string; messageId: string }, MessageWithId, {}>,
    res: Response<MessageWithId | { error: string }>
  ) => {
    const userId = req.params.userId;
    const userMessages = this.idMessageMap.get(userId);
    if (userMessages !== undefined) {
      const indexToDelete = userMessages.findIndex(
        (message) => message.id === parseInt(req.params.messageId, 10)
      );
      if (indexToDelete === -1) {
        res.status(400).json({ error: "No such message" });
      } else {
        const deletedMessage = userMessages.splice(indexToDelete, 1);
        res.status(200).json(deletedMessage[0]);
      }
    } else {
      res.status(400).json({ error: "No such user" });
    }
  };
}

const manager = new MessagesManager();

router.get("/:userId/getAll", manager.getAll);

router.post("/:userId/writeMessage", manager.writeMessage);

router.post("/:userId/deleteMessage/:messageId", manager.deleteMessage);

export default router;
