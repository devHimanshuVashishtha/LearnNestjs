import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private jwtService: JwtService) { }
    use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization']
        if (!authHeader) throw new UnauthorizedException('Authorization is missing')
        const [type, token] = authHeader.split(' ')
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid token provided')
        }
        try {
            const verifyToken = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            })
            req['resetuser'] = verifyToken
            next()
        } catch (err) {
            throw new UnauthorizedException('invalid or expire token')
        }
    }

}