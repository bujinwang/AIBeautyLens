export declare class UsersService {
    private users;
    findOne(username: string): Promise<any | undefined>;
    create(user: any): Promise<any>;
}
