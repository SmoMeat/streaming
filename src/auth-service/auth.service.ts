import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService
    ) {}
    users = [
        {
            userId: 1,
            username: "Christophe",
            password: "password123"
        }
    ]
    
    findOneUser(username: string) {
        return this.users.find(user => user.username === username)
    }

    async signIn(username: string, pass: string) {
        const user = await this.findOneUser(username)
        if (user?.password !== pass) {
            throw new UnauthorizedException();
        }
        const payload = {sub: user.userId, username: user.username}

        return {
            access_token: await this.jwtService.signAsync(payload)
        }
    }
}
