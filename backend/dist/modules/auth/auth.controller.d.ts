import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerUserDto: RegisterUserDto): Promise<any>;
    login(req: Request): Promise<{
        access_token: string;
    }>;
    getProfile(req: Request): Express.User;
}
