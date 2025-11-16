"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarClient = void 0;
const googleapis_1 = require("googleapis");
const getCalendarClient = () => {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    return googleapis_1.google.calendar({ version: 'v3', auth });
};
exports.getCalendarClient = getCalendarClient;
