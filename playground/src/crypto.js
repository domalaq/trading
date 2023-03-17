"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hmac_sha512_1 = __importDefault(require("crypto-js/hmac-sha512"));
const crypto_js_1 = require("crypto-js");
const payloadHash = (0, crypto_js_1.SHA512)("").toString();
console.log("payload hash", payloadHash);
const timestamp = Math.round(Date.now() / 1000);
console.log("timestamp", timestamp);
const signatureString = `GET\n/api/v4/wallet/deposits\n\n${payloadHash}\n${timestamp}`;
console.log("signature", signatureString);
console.log((0, hmac_sha512_1.default)(signatureString, "66d5f4df96186caa6728412e6aa75eb464caadc344c1d02404693cc44dcb1038").toString());
