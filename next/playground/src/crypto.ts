import hmacSHA512 from "crypto-js/hmac-sha512";
import { SHA512 } from "crypto-js";

const payloadHash = SHA512("").toString();

console.log("payload hash", payloadHash);

const timestamp = Math.round(Date.now() / 1000);

console.log("timestamp", timestamp);

const signatureString = `GET\n/api/v4/wallet/deposits\n\n${payloadHash}\n${timestamp}`;

console.log("signature", signatureString);

console.log(
  hmacSHA512(
    signatureString,
    "66d5f4df96186caa6728412e6aa75eb464caadc344c1d02404693cc44dcb1038"
  ).toString()
);
