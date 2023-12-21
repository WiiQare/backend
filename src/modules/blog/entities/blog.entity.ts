import { Comment } from 'src/modules/comment/entities/comment.entity';
import { BaseEntity } from '../../../db/base-entity';
import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';

@Entity()
export class Blog extends BaseEntity {

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ nullable: true })
  quote?: string;

  @Column({ nullable: false })
  content: string;

  @Column('text', { array: true, default: '{}' })
  tags?: string[];

  @OneToMany(() => Comment, comment => comment.blog)
  comments: Comment[];

}
