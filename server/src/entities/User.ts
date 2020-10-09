import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
@Entity()
export class User {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: "text", unique: true})
    username!: string;

    @Property({ type: "text" })
    password!: string;

    @Field(() => String)
    @Property({ type: "text"})
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: "text", onUpdate: () => new Date() })
    updatedAt = new Date();
}