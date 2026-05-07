import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./Tenant";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar" })
    firstName: string;

    @Column({ type: "varchar" })
    lastName: string;

    @Column({ type: "varchar" })
    email: string;

    @Column({ type: "varchar" })
    password: string;

    @Column({ type: "varchar" })
    role: string;

    @ManyToOne(() => Tenant)
    tenant: Tenant | null;
}
