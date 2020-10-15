import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput"

export const validateRegister = (options: UsernamePasswordInput) => {
    if (!options.email.includes("@") || options.email.length <= 2) {
        return [
            {
                field: "email",
                message: "email is invalid"
            }
        ];
    }
    
    if (options.username.length <= 2) {
        return [
            {
                field: "username",
                message: "username is invalid"
            }
        ];
    }
    
    if (options.username.includes('@')) {
        return [
            {
                field: "username",
                message: "username cannot have @ symbol"
            }
        ];
    }
    
    if (options.password.length <= 3) {
        return [
            {
                field: "password",
                message: "password is invalid"
            }
        ];
    }

    return null;
}