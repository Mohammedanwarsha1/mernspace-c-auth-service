import type { Repository } from "typeorm";
import { User } from "../entity/User";
import type { UserData } from "../types";
import createHttpError from "http-errors";

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password,
            });
            return user;
        } catch (err) {
            const error = createHttpError(
                500,
                "failed to connect to the database",
            );
            throw error;
        }
    }
}
