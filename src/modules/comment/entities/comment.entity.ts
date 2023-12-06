import { Blog } from 'src/modules/blog/entities/blog.entity';
import { BaseEntity } from '../../../db/base-entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Comment extends BaseEntity {

    @Column({ nullable: false })
    fullname: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: false })
    comment: string;

    @ManyToOne(() => Blog, (blog) => blog.comments)
    @JoinColumn({ name: 'idBlog' })
    blog: Blog;
}
