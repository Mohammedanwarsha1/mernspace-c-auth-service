import type { Repository } from "typeorm";
import { User } from "../entity/User";
import { Tenant } from "../entity/Tenant";
import type { LimitedUserData, UserData, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (user) {
            const err = createHttpError(400, "email is already existed");
            throw err;
        }

        if (tenantId !== undefined) {
            const tenant = await this.userRepository.manager
                .getRepository(Tenant)
                .findOne({ where: { id: tenantId } });

            if (!tenant) {
                throw createHttpError(
                    400,
                    `tenantId ${tenantId} does not exist`,
                );
            }
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
                tenant: tenantId ? { id: tenantId } : undefined,
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

    async findbyEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
            select: [
                "id",
                "firstName",
                "lastName",
                "email",
                "password",
                "role",
            ],
        });
    }
    async findById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id,
            },
            relations: {
                tenant: true,
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
    async getAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder();
        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .getManyAndCount();
        return result;
    }
}
