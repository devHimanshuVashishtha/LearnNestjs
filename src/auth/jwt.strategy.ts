import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { request } from 'http';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            jwtFromRequest: (req: Request) => {
                if (req && req.cookies && req.cookies['jwt']) {
                    return req.cookies['jwt'];
                }
                if (req.headers.authorization) {
                    return req.headers.authorization.replace('Bearer ', '');
                }
                return null;
            },
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'DEV_SECRET_CHANGE_ME',
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email };
    }
}
