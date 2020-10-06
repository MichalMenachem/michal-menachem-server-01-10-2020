import express from "express";
import logger from "morgan";
import cors from "cors";

import messagesRouter from "./routes/messages";

const app = express();
const port = 8080; // default port to listen

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/messages", messagesRouter);

// start the Express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server started at http://localhost:${port}`);
});

export default app;
