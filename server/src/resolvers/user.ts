import { MyContext } from "src/types";
import { 
    Resolver, 
    Query, 
    Mutation, 
    Field, 
    Ctx, 
    Arg, 
    Int, 
    ObjectType, 
    FieldResolver, 
    Root, 
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

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

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(@Root() user:User, @Ctx() {req}: MyContext) {
        if (req.session.userId === user.id){
            //allow current usr to view only their own email
            return user.email;
        }
        // disallow  user from  viewing other emails
        return "";
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, req}: MyContext
    ): Promise<UserResponse> {
        if(newPassword.length <= 2) {
            return{errors: [
                {
                    field: "newPassword", 
                    message: "length must be greater than 2",
                },
            ]};
        }

        const key = FORGET_PASSWORD_PREFIX+token;
        const userId = await redis.get(key);
        if(!userId){
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired",
                    }
                ]
            }
        }

        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);

        if(!user){
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists",
                    },
                ],
            };
        }

        await User.update({id: userIdNum}, {
            password: await argon2.hash(newPassword)
        });

        // delete forgot password key from redis
        await redis.del(key);

        // log in user after password change
        req.session!.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {redis}: MyContext
    ) {
        const user = await User.findOne({where: { email }});
        if(!user){
            //the email is not in the db
            return true;
        }

        const token = v4();

        await redis.set(
            FORGET_PASSWORD_PREFIX + token, 
            user.id, 
            'ex', 1000 * 60 * 60 * 24 *3
        );
        await sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
        return true;
    }

    
    @Query(() => User, { nullable: true })
    me(
        @Ctx() { req }: MyContext
    ) {
        //Not logged in
        if(!req.session!.userId){
            return null;
        }

        return User.findOne(req.session!.userId);
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req}: MyContext
    ): Promise<UserResponse>{
        
        const errors = validateRegister(options);
        if(errors) return {errors};

        const hashedPassword = await argon2.hash(options.password);
        // const user = em.create(User, {
        //     username: options.username, 
        //     password: hashedPassword
        // });
        let user;
        try{
            // await em.persistAndFlush(user);
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                        username: options.username,
                        email: options.email, 
                        password: hashedPassword,
                })
                .returning("*")
                .execute();
            user = result.raw[0];
        } catch (err) {
            // console.log(err);
            if(err.code === "23505"){ // || err.detail.includes("already exists")){
                return {
                    errors: [{
                        field: "username",
                        message: "username already exists!"
                    }]
                }
            }
        }

        // Login user after successfull registration
        // by setting a cookie
        req.session!.userId = user.id;

        return { user };
    }
    
    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse>{
        const user = await User.findOne({
            where: 
            (usernameOrEmail.includes('@') 
            ? {email: usernameOrEmail}
            : {username: usernameOrEmail})
        });
        if (!user){
            return {
                errors: [{
                    field: "usernameOrEmail",
                    message: "username or email doesn't exist",
                }]
            }
        }
        const valid = await argon2.verify(user.password, password);
        if(!valid){
            return {
                errors: [{
                    field: "password",
                    message: "incorrect password"
                }]
            }
        }

        req.session!.userId = user.id;

        return {user};
    }

    @Query(() => [User])
    users(): Promise<User[]>{
        return User.find();
    }

    @Query(() => User, {nullable: true})
    user(
        @Arg('id', () => Int) id: number
    ): Promise<User | undefined>{
        const user = User.findOne(id);
        return user;
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ) {
        return new Promise(resolve => req.session?.destroy(err => {
            res.clearCookie(COOKIE_NAME);
            if(err) {
                console.log(err);
                resolve(false);
                return;
            }

            resolve(true);
        }))
    }
}