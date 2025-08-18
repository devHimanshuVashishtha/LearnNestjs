import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer'

@Injectable()

export class MailService {
    private transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 465,
            secure: true,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY,
            }

        })
    }
    async sendMail(to: string, subject: string, text: string) {
        const info = await this.transporter.sendMail({
            from: `"NESTJS App" <${process.env.SENDGRID_FROM_EMAIL}>`, to, subject, text,
        })
        console.log('Message sent: %s', info.messageId);
        return info;
    }

}
