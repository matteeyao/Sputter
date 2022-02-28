## TypeScript basics

Initialize project w/ TypeScript:

```zsh
yarn add typescript -D
```

Install dependencies:

```zsh
yarn add ts-node
```

Install dev dependencies:

```zsh
yarn add @types/express -D
```

An example `tsconfig.json` can look like such:

```json
{
    "compilerOptions": {
        "outDir": "dist",
        "lib": ["ESNext"],
        "esModuleInterop": true,
    }
}
```

Let's create a simple script file, `app.ts`:

```ts
interface Inputs {
    name: string;
}

function myFunction(props: Input) {
    return props;
}

myFunction({ name: "Tom" });
```

Add this script to `package.json`:

```json
"scripts": {
    "build": "tsc",
    "dev": "ts-node app.ts",
},
```

W/ the above script, run `yarn build` to build the `dist` directory, which you will be able to run w/ `node`.

To run `app.ts`, run `yarn dev`.

## Types and interfaces

Are fundamental to TypeScript.

> [!NOTE]
> TypeScript does not allow you to extend a type.

```ts
interface MyInterface {
    property1?: string;
    property2: number;
    property3: boolean;
}

function myFunction(input: MyInterface): MyInterface {
    return input;
}
```

If our function does not return anything, we can specify the return type as `void`:

```ts
function myFunction(input: MyInterface): void {
    input;
}
```

If our function is `async`, then we can specify the return type as `Promise<generic>`:

```ts
async function myFunction(input: MyInterface): Promise<MyInterface> {
    return input;
}
```

We can extend interfaces:

```ts
interface MyInterface {
    property1?: string;
    property2: number;
    property3: boolean;
}

interface MyInterfaceThree {
    property5?: boolean
}

interface MyInterfaceTwo extends MyInterface, MyInterfaceThree {
    property4: string
}

async function myFunction(input: MyInterface): Promise<MyInterface> {
    return input;
}
```

You can declare types, instead of interfaces:

```ts
type MyType = {
    property1: string
}

type MyTypeTwo = {
    property2: boolean;
} & MyType

async function myFunction(input: MyTypeTwo): Promise<MyTypeTwo> {
    return input;
}
```

Enumerators, which are JavaScript objects, define a list of properties:

```ts
type MyType = {
    property1: string
}

enum MyEnum {
    enumOne = 'enumOne',
    enumTwo = 'enumTwo',
}

type MyTypeTwo = {
    property2: boolean;
    property3: MyEnum;
} & MyType


async function myFunction(input: MyTypeTwo): Promise<MyTypeTwo> {
    return input;
}

myFunction({
    property3: MyEnum.enumOne
})

Object.values(MyEnum).map;
// or
Object.key(MyEnum).map;
```

## Libraries

```ts
import express from 'express';
import crypto from 'crypto': // standard node library

const app = express();
```

## Generics

```ts
function myFunc<T>(input: T): T {
    return input;
}

const result = myFunc<{
    name: string;
}>({
    name: "Tom",
});

const result = myFunc<string[]>(["Tom"]);
```

## Utilities

```ts
interface MyInterface {
    property1: string;
    property2?: number;
    property3?: boolean;
}

const obj: Partial<MyInterface> = {};

const objTwp: Omit<MyInterface, 'property3' | 'property2'> = {
    property1: "Only one available",
}
```
