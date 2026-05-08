import type { Repository } from "typeorm";
import { User } from "../entity/User";
import type { LimitedUserData, UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password, role }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (user) {
            const err = createHttpError(400, "email is already existed");
            throw err;
        }

        //Hast the password
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
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

    async findbyEmail(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
        });
    }
    async findById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id,
            },
        });
    }
    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
    async update(
        userId: number,
        { firstName, lastName, role }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to update the user in the database",
            );
            throw error;
        }
    }
}
