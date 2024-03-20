export interface JwtPayloadDto {
    
    sub: number;
    
    username: string;
    
    iat: number;
    
    exp: number;
}