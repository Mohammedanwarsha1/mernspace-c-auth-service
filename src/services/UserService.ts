import { Brackets, type Repository } from "typeorm";
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
        { firstName, lastName, role, email, tenantId }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
                email,
                tenant: tenantId ? { id: tenantId } : undefined,
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
        const queryBuilder = this.userRepository.createQueryBuilder("u");
        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    //Rakesh K
                    qb.where(
                        'CONCAT("u"."firstName",\' \',"u"."lastName") ILIKE :q',
                        { q: searchTerm },
                    ).orWhere('"u"."email" ILIKE :q', {
                        q: searchTerm,
                    });
                }),
            );
        }
        if (validatedQuery.role) {
            queryBuilder.andWhere('"u"."role" = :role', {
                role: validatedQuery.role,
            });
        }
        const result = await queryBuilder
            .leftJoinAndSelect("u.tenant", "tenant")
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy("u.id", "DESC")
            .getManyAndCount();
        return result;
    }
}
