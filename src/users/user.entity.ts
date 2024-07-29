import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ enum: Role, default: Role.User })
  role: Role;
}
