import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;  

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({ default: false })
    isAdmin!: boolean; 

    @Column({default : 18})
    age!: number;

    @CreateDateColumn()
    createdAt!: Date; 

    @UpdateDateColumn()
    updatedAt!: Date; 
}
