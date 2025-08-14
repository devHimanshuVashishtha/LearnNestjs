import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Twilio from 'twilio';


@Injectable()
export class SmsService {
    private client;

    constructor() {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            throw new InternalServerErrorException('Twilio credentials are missing in .env');
        }

        this.client = Twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async smsSend(to: string, message: string) {
        if (!this.client) {
            throw new InternalServerErrorException('Twilio client not initialized');
        }

        try {
            const msg = await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to,
            });
            console.log('SMS sent:', msg.sid);
            return msg;
        } catch (err) {
            console.error('Twilio send error:', err);
            throw new InternalServerErrorException('Failed to send SMS');
        }
    }
}
