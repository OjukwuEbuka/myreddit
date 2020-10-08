import { MyContext } from "src/types";
import { Resolver, Query, Mutation, InputType, Field, Ctx, Arg, Int, ObjectType } from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse>{
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: "username",
                    message: "username is invalid"
                }]
            }
        }
        
        if (options.password.length <= 3) {
            return {
                errors: [{
                    field: "password",
                    message: "password is invalid"
                }]
            }
        }
        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {username: options.username, password: hashedPassword});
        try{
            await em.persistAndFlush(user);
        } catch (err) {
            if(err.code === "23505"){   //|| err.detail.includes("already exists")){
                return {
                    errors: [{
                        field: "username",
                        message: "username already exists!"
                    }]
                }
            }
        }
        return { user };
    }
    
    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse>{
        const user = await em.findOne(User, {username: options.username});
        if (!user){
            return {
                errors: [{
                    field: "username",
                    message: "that username doesn't exist",
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password);
        if(!valid){
            return {
                errors: [{
                    field: "password",
                    message: "incorrect password"
                }]
            }
        }

        return {user};
    }

    @Query(() => [User])
    users(
        @Ctx() { em }: MyContext
    ): Promise<User[]>{
        return em.find(User, {});
    }

    @Query(() => User, {nullable: true})
    user(
        @Arg('id', () => Int) id: number,
        @Ctx() { em }: MyContext
    ): Promise<User | null>{
        const user = em.findOne(User, { id });
        return user;
    }
}