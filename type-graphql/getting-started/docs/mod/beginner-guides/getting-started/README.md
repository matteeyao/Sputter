
## Getting started

> [!NOTE]
> Make sure you've completed all the steps described in the [installation instructions](https://typegraphql.com/docs/installation.html)

To explore all of the powerful capabilities of TypeGraphQL, we will create a sample GraphQL API for cooking recipes.

Let's start w/ the `Recipe` type, which is the foundation of our API.

## Types

Our goal is to get the equivalent of this type described in SDL:

```ts
type Recipe {
  id: ID!
  title: String!
  description: String
  creationDate: Date!
  ingredients: [String!]
}
```

So we create the `Recipe` class w/ all its properties and types:

```ts
class Recipe {
  id: string;
  title: string;
  description?: string;
  creationDate: Date;
  ingredients: string[];
}
```

Then we decorate the class and its properties w/ decorators:

```ts
@ObjectType()
class Recipe {
  @Field(type => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  creationDate: Date;

  @Field(type => [String])
  ingredients: string[];
}
```

The detailed rules of when to use `nullable`, `array` and other are described in the [types and fields docs](https://typegraphql.com/docs/types-and-fields.html).

## Resolvers

After that we want to create typical CRUD queries and mutations. To do so, we create the resolver (controller) class that will have injected the `RecipeService` in the constructor:

```ts
@Resolver(Recipe)
class RecipeResolver {
  constructor(private recipeService: RecipeService) {}

  @Query(returns => Recipe)
  async recipe(@Arg("id") id: string) {
    const recipe = await this.recipeService.findById(id);
    if (recipe === undefined) {
      throw new RecipeNotFoundError(id);
    }
    return recipe;
  }

  @Query(returns => [Recipe])
  recipes(@Args() { skip, take }: RecipesArgs) {
    return this.recipeService.findAll({ skip, take });
  }

  @Mutation(returns => Recipe)
  @Authorized()
  addRecipe(
    @Arg("newRecipeData") newRecipeData: NewRecipeInput,
    @Ctx("user") user: User,
  ): Promise<Recipe> {
    return this.recipeService.addNew({ data: newRecipeData, user });
  }

  @Mutation(returns => Boolean)
  @Authorized(Roles.Admin)
  async removeRecipe(@Arg("id") id: string) {
    try {
      await this.recipeService.removeById(id);
      return true;
    } catch {
      return false;
    }
  }
}
```

We use the `@Authorized` decorator to restrict access to authorized users only or the users that fulfill the roles requirements. The detailed rules for when and why we declare `returns => Recipe` functions and others are described in [resolvers docs](https://typegraphql.com/docs/resolvers.html).

## Inputs and Arguments

Ok, but what are `NewRecipeInput` and `RecipesArgs`? They are of course classes:

```ts
@InputType()
class NewRecipeInput {
  @Field()
  @MaxLength(30)
  title: string;

  @Field({ nullable: true })
  @Length(30, 255)
  description?: string

  @Field(type => [String])
  @ArrayMaxSize(30)
  ingredients: string[];
}

@ArgsType()
class RecipesArgs {
  @Field(type => Int)
  @Min(0)
  skip: number = 0;

  @Field(type => Iny)
  @Min(1)
  @Max(50)
  take: number = 25;
}
```

`@Length`, `@Min` and `@ArrayMaxSize` are decorators from `class-validator` that automatically perform field validation in TypeGraphQL.

## Building schema

The last step that needs to be done is to actually build the schema from the TypeGraphQL definition. We use the `buildSchema` function for this:

```ts
const schema = await buildSchema({
  resolvers: [RecipeResolver],
});

// ...creating express server or stb
```

Et voilà! Now we have a fully functional GraphQL schema! If we print it, this is how it would look:

```ts
type Recipe {
  id: ID!
  title: String!
  description: String
  creationDate: Date!
  ingredients: [String!]!
}
input NewRecipeInput {
  title: String!
  description: String
  ingredients: [String!]!
}
type Query {
  recipe(id: ID!): Recipe
  recipes(skip: Int = 0, take: Int = 25): [Recipe!]
}
type Mutation {
  addRecipe(newRecipeData: NewRecipeInput!): Recipe!
  removeRecipe(id: ID!): Boolean!
}
```

## Want more?

For more complicated cases, go to the [Examples section](https://typegraphql.com/docs/examples.html) where you can discover e.g. how well TypeGraphQL integrates with TypeORM.
