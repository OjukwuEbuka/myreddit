import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    BaseEntity,
    ManyToOne,
    OneToMany
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import {User} from "./User";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
export class Post extends BaseEntity
 {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field(() => Int, { nullable: true })
    voteStatus: number | null;
    
    @Field()
    @Column({ type: "int", default: 0 })
    points!: number;

    @OneToMany(() => Updoot, updoot => updoot.post)
    updoots: Updoot[];

    @Field()
    @Column()
    creatorId: number;

    @Field()
    @ManyToOne(() => User, user => user.posts)
    creator: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

}