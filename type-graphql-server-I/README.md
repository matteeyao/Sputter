# TypeGraphQL series

1. setup **type-graphql**

2. register users

3. validation of user input

4. login

5. authorization/middleware decorators

6. confirmation email

7. forgot/change password

8. logout

9. write a test

10. Higher order resolvers

## Startup commands

To initialize **yarn**:

```zsh
$ yarn init -y
```

Add dependencies:

```zsh
$ yarn add apollo-server-express express graphql@15.7.2 reflect-metadata type-graphql
```

Add dev dependencies:

```zsh
$ yarn add -D @types/express @types/graphql @types/node nodemon ts-node typescript
```

With TypeScript installed, you can initialize your TypeScript project by using the following command:

```zsh
$ npx tsc --init
```

Install **TypeORM**:

```zsh
yarn add pg typeorm bcryptjs
```

> [!NOTE]
> For a stronger hashing algorithm, install `Argon2` in place of `bcryptjs`

Install corresponding dev dependencies:

```zsh
yarn add -D @types/bcryptjs
```

## Validation

Let's add a library called `ts-node-dev`, which will replace `nodemon` and is an upgrade for use w/ TypeScript

```zsh
yarn add ts-node-dev --dev
```

Install `class-validator`:

```zsh
yarn add class-validator
```

## Login

We'll be creating a resolver to allow users to log into our API. To keep users logged in, we're going to be using sessions and we're going to be using the `express-session` library. We're also going to be storing these session data in Reduce using the `connect-redis` library.

```zsh
yarn add express-session connect-redis ioredis cors
```

Install the corresponding types:

```zsh
yarn add -D @types/express-session @types/connect-redis @types/ioredis @types/cors
```