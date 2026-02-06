import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne
} from "typeorm";
import { User } from "./User";

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "s3_key" })
  s3Key!: string;

  @Column({ name: "mime_type" })
  mimeType!: string;

  @ManyToOne(() => User)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
