import { Payload } from "payload";
import type { PayloadRequest } from "payload";

export const beginTransaction = async (payload: Payload) => {
  const req = {} as PayloadRequest;
  if (typeof payload?.db?.beginTransaction === 'function') {
    const transactionID = await payload?.db?.beginTransaction();
    if (transactionID) {
      req.transactionID = transactionID
    }
  }
  return req;
}

export const commitTransaction = async (payload: Payload, req: PayloadRequest) => {
  if (req.transactionID && typeof payload?.db?.commitTransaction === 'function') await payload.db.commitTransaction(req.transactionID);
}

export const rollbackTransaction = async (payload: Payload, req: PayloadRequest) => {
  if (req.transactionID && typeof payload?.db?.rollbackTransaction === 'function') await payload.db.rollbackTransaction(req.transactionID);
}
