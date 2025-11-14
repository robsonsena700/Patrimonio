import { createApp } from "../server/app";
import serverless from "serverless-http";

let handlerPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  if (!handlerPromise) {
    handlerPromise = createApp().then(({ app }) => serverless(app));
  }
  const h = await handlerPromise;
  return h(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};