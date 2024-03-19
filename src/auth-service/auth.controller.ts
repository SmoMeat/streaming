import { Body, Controller, Post } from '@nestjs/common';
import { SigninDto } from './singin.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('login')
    singin(@Body() signinDto: SigninDto) {
        console.log('allo ?')
        return this.authService.signIn(signinDto.username, signinDto.password)
    }

}
