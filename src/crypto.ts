import hmacSHA512 from "crypto-js/hmac-sha512";
import { SHA512 } from "crypto-js";

export const getPayloadHash = (payload: string) => SHA512(payload).toString();

export const getSignatureString = (
  method: string,
  url: string,
  params: string,
  payloadHash: string,
  timestamp: number
) => `${method}\n/api/v4${url}\n${params}\n${payloadHash}\n${timestamp}`;

export const getSign = (signatureString: string) =>
  hmacSHA512(
    signatureString,
    "66d5f4df96186caa6728412e6aa75eb464caadc344c1d02404693cc44dcb1038"
  ).toString();
