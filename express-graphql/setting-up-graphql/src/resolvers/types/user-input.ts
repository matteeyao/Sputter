import { IsEmail, Length, MaxLength, MinLength } from "class-validator";
import { InputType, Field } from "type-graphql";

@InputType()
export class RegisterInput {
    @Field(() => String)
    @Length(1, 255)
    name: string;

    @Field(type => String)
    @IsEmail()
    email: string;

    @Field(() => String)
    @MinLength(6, {
        message: "password must be at least 6 characters long"
    })
    @MaxLength(50, {
        message: "password must not be longer than 50 characters"
    })
    password: string;
}
