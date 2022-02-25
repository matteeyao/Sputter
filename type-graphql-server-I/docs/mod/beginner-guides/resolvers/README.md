# Resolvers

Besides declaring GraphQL's object types, TypeGraphQL allows us to easily create queries, mutations, and field resolvers - like normal class methods, similar to REST controllers in frameworks like Java `Spring`, .Net `Web API` or TypeScript `[routing-controllers](https://github.com/typestack/routing-controllers)`.

## Queries and Mutations

### Resolver classes

First we create the resolver class and annotate it w/ the `@Resolver()` decorator. This class will behave like a controller from classic REST frameworks:

```ts
@Resolver()
class RecipeResolver {}
```

We can use a DI framework (as described in the [dependency injection docs](https://typegraphql.com/docs/dependency-injection.html)) to inject class dependencies (like services or repositories) or to store data inside the resolver class - it's guaranteed to be a single instance per app.

```ts
@Resolver()
class RecipeResolver {
    private recipesCollection: Recipe[] = [];
}
```

Then we can create class methods which will handle queries and mutations. For example, let's add the `recipes` query to return a collection of all recipes:

```ts
@Resolver()
class RecipeResolver {
    private recipesCollection: Recipe[] = [];

    async recipes() {
        // fake async in this example
        return await this.recipesCollection;
    }
}
```

We also need to do two things. The first is to add the `@Query` decorator, which marks the class method as a GraphQL query. The second is to provide the return type. Since the method is async, the reflection metadata system shows the return type as a `Promise`, so we have to add the decorator's parameter as `returns => [Recipe]` to declare it resolves to an array of `Recipe` object types.

```ts
@Resolver()
class RecipeResolver {
    private recipesCollection: Recipe[] = [];

    @Query(returns => [Recipe])
    async recipes() {
        return await this.recipesCollection;
    }
}
```

### Arguments

Usually, queries have some arguments - it might be the id of a resource, a search phrase or pagination settings. TypeGraphQL allows you to define arguments in two ways.

First is the inline method using the `@Arg()` decorator. The drawback is the need to repeat the argument name (due to a limitation of the reflection system) in the decorator parameter. As we can see below, we can also pass a `defaultValue` option that will be reflected in the GraphQL schema.

```ts
@Resolver()
class RecipeResolver {
    // ...
    @Query(returns => [Recipe])
    async recipes(
        @Arg("servings", { defaultValue: 2 }) servings: number,
        @Arg("title", { nullable: true }) title?: string,
    ): Promise<Recipe[]> {
        // ...
    }
}
```

This works well when there are 2 - 3 args. But when you have many more, the resolver's method definitions become bloated. In this case we can use a class definition to describe the arguments. It looks like the object type class but it has the `@ArgsType()` decorator on top.

```ts
@ArgsType()
class GetRecipesArgs {
    @Field(type => Int, { nullable: true })
    skip?: number;

    @Field(type => Int, {nullable: true })
    take?: number;

    @Field({ nullable: true })
    title?: string;
}
```

We can define default values for optional fields in the `@Field()` decorator using the `defaultValue` option or by using a property initializer - in both cases TypeGraphQL will reflect this in the schema by setting the default value, so users will be able to omit those args while sending a query.

> [!NOTE]
> Be aware that `defaultValue` works only for input args and fields, like `@Arg`, `@ArgsType`, and `@InputType`. Setting `defaultValue` does not affect `@ObjectType` or `@InterfaceType` fields as they are for output purposes only.

Also, this way of declaring arguments allows you to perform validation. You can find more details about this feature in the [validation docs](https://typegraphql.com/docs/validation.html).

We can also define helper fields and methods for our args or input classes. But be aware that **defining constructors is strictly forbidden** and we shouldn't use them there, as TypeGraphQL creates instances of args and input classes under the hood by itself.

```ts
import { Min, Max } from "class-validator";

@ArgsType()
class GetRecipesArgs {
    @Field(type => Int, { defaultValue: 0 })
    @Min(0)
    skip: number;

    @Field(type => Int)
    @Min(1)
    @Max(50)
    take = 25;

    @Field({ nullable: true })
    title?: string;

    // helpers - index calculations
    get startIndex(): number {
        return this.skip;
    }
    get endIndex(): number {
        return this.skip + this.take;
    }
}
```

Then all that is left to do is use the args class as the type of the method parameter. We can use the destructuring syntax to gain access to single arguments as variables, instead of the references to the whole args object.

```ts
@Resolver
class RecipeResolver {
    // ...
    @Query(returns => [Recipe])
    async recipes(@Args() { title, startIndex, endIndex }: GetRecipesArgs) {
        // sample implementation
        let recipes = this.recipesCollection;
        if (title) {
            recipes = recipes.filter(recipes => recipe.title === title);
        }
        return recipes.slice(startIndex, endIndex);
    }
}
```

This declaration will result in the following part of the schema in SDL:

```gql
type Query {
    recipes(skip: Int = 0, take: Int = 25, title: String): [Recipe!]
}
```

### Input types

GraphQL mutations can be similarly created: Declare the class method, use the `@Mutation` decorator, create arguments, provide a return type (if needed) etc. But for mutations we usually use `input` types, hence TypeGraphQL allows us to create inputs in the same way as [object types](https://typegraphql.com/docs/types-and-fields.html) but by using the `@InputType()` decorator:

```ts
@InputType()
class AddRecipeInput {}
```

To ensure we don't accidentally change the property type we leverage the TypeScript type checking system by implementing the `Partial` type:

```ts
@InputType()
class AddRecipeInput implements Partial<Recipe> {}
```

We then declare any input fields we need, using the `@Field()` decorator:

```ts
@InputType({ description: "New recipe data" })
class AddRecipeInput implements Partial<Recipe> {
    @Field()
    title: string;

    @Field({ nullable: true })
    description?: string;
}
```

After that we can use the `AddRecipeInput` type in our mutation. We can do this inline (using the `@Arg()` decorator) or as a field of the args class like in the query example above.

We may also need access to the context. To achieve this we use the `@Ctx()` decorator w/ the optional user-defined `Context` interface:

```ts
@Resolver()
class RecipeResolver {
    // ...
    @Mutation()
    addRecipe(@Arg("data") newRecipeData: AddRecipeInput, @Ctx() ctx: Context): Recipe {
        // sample implementation
        const recipe = RecipesUtils.create(newRecipeData, ctx.user);
        this.recipesCollection.push(recipe);
        return recipe;
    }
}
```

B/c our method is synchronous and explicitly returns `Recipe`, we can omit the `@Mutation()` type annotation.

This declaration will result in the following part of the schema in SDL:

```gql
input AddRecipeInput {
    title: String!
    description: String
}
```

```gql
type Mutation {
    addRecipe(data: AddRecipeInput!): Recipe!
}
```

By using parameter decorators, we can get rid of unnecessary parameters (like `root`) that bloat our method definition and have to be ignored by prefixing the parameter name w/ `_`. Also, we can achieve a clean separation between GraphQL and our business code by using decorators, so our resolvers and their methods behave just like services which can be easily unit-tested.

## Field resolvers

Queries and mutations are not the only type of resolvers. We often create object type field resolvers (e.g. when a `user` type has a `posts` field) which we have to resolve by fetching relational data from the database.

Field resolvers in TypeGraphQL are very similar to queries and mutations - we create them as a method on the resolver class but w/ a few modifications. First we declare which object type fields we are resolving by providing the type to the `@Resolver` decorator:

```ts
@Resolver(of => Recipe)
class RecipeResolver {
    // queries and mutations
}
```

Then we create a class method that will become the field resolver. In out example we have the `averageRating` field in the `Recipe` object type that should calculate the average from the `ratings` array.

```ts
@Resolver(of => Recipe)
class RecipeResolver {
    // queries and mutations

    averageRating(recipe: Recipe) {
        // ...
    }
}
```

We then mark the method as a field resolver w/ the `@FieldResolver()` decorator. Since we've already defined the field type in the `Recipe` class definition, there's no need to redefine it. We also decorate the method parameters w/ the `@Root` decorator in order to inject the recipe object.

```ts
@Resolver(of => Recipe)
class RecipeResolver {
    // queries and mutations

    @FieldResolver()
    averageRating(@Root() recipe: Recipe) {
        // ...
    }
}
```

For enhanced type safety we can implement the `ResolverInterface<Recipe>` interface. It's a small helper that checks if the return type of the field resolver methods, like `averageRating(...)`, matches the `averageRating` property of the `Recipe` class and whether the first parameter of the method is the actual object type (`Recipe` class).

```ts
@Resolver(of => Recipe)
class RecipeResolver implements ResolverInterface<Recipe> {
    // queries and mutations

    @FieldResolver()
    averageRating(@Root() recipe: Recipe) {
        // ...
    }
}
```






