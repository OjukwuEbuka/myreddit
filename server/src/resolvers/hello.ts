import { Resolver, Query } from "type-graphql";
// import { User } from "../entities/User";

@Resolver()
export class HelloResolver {
    @Query(() => String)
    hello() {
        return "hello world"
    }
}