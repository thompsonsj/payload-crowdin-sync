import { Payload } from "payload";
import { PayloadRequest } from "payload/types";

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