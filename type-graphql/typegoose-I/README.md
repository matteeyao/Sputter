# GraphQL API w/ TypeGraphQL, TypeGoose & TypeScript

## Why TypeGraphQL?

TypeGraphQL reduces boilerplate. W/o it, you have to update schema, data models, resolvers, and type definitions. W/ TypeGraphQL, you only need to update resolvers and data models.

## What is a decorator?

A `decorator` is a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter. `Decorator`s use the form `@expression`, where expression must evaluate to a function that will be called at runtime w/ information about the decorated declaration. See [reference](https://www.typescriptlang.org/docs/handbook/decorators.html#accessor-decorators).

## Queries & mutations

### Create user

**Query**:

```gql
mutation createUser($input: CreateUserInput!) {
    createUser(input: $input) {
        email
        _id
        name
    }
}
```

**Input**:

```gql
{
    "input":  {
        "email": "1@example.com",
        "name": "Jane Doe",
        "password": "password"
    }
}
```

### Get current user

**Query**:

```gql
query {
    me {
        _id
        name
        email
    }
}
```

### Login

**Query**:

```gql
mutation login($input: LoginInput!){
    login(input: $input)
}
```

**Input**:

```gql
{
    "input": {
        "email": "1@example.com",
        "password": "password"
    }
}
```

### Create a product

**Query**:

```gql
mutation createProduct($input: CreateProductINput!) {
    createProduct(input: $input){
        _id
        price
        productId
        name
        description
    }
}
```

**Input**:

```gql
{
    "input": {
        "name": "A test product111",
        "description": "blah blah blah blah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blah",
        "price": 24.99
    }
}
```

### Get products

```gql
query products {
    products {
        productId
        name
        description
        productId
    }
}
```

### Get a single product

**Query**:

```gql
query product($input: GetProductInput!) {
    product(input: $input) {
        _id
        productId
        price
        name
        description
    }
}
```

**Input**:

```gql
{
    "input": {
        "productId": "product_23cn3k61h8"
    }
}
```

## Walk-through

1. Initialize the project w/ `yarn`:

```zsh
yarn init
```

2. Initialize TypeScript:

```zsh
tsc --init
```

3. Install dev dependencies

```zsh
yarn add typescript ts-node-dev @types/bcrypt @types/jsonwebtoken @types/cookie-parser @types/config -D
```

4. Install dependencies

```zsh
yarn add type-graphql apollo-server graphql@15.x reflect-metadata @typegoose/typegoose mongoose class-validator bcrypt jsonwebtoken cookie-parser nanoid config dotenv
```

5. Update `tsconfig` to include:

```json
{
  "target": "es2018",
    "module": "commonjs",
    "lib": ["es2018", "esnext.asynciterable"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
}
```
