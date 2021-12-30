"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const client_1 = __importDefault(require("./src/client"));
module.exports = async function verifyCredentials(cfg) {
    const client = new client_1.default(this, cfg);
    try {
        await client.apiRequest({ method: 'GET', url: '/' });
        this.logger.info('Verification completed successfully');
        return { verified: true };
    }
    catch (e) {
        this.logger.error('Verification failed');
        throw e;
    }
};
