# TypeGraphQL server I

## Quick-start

```zsh
npm install
```

The following `GetRecipe` query:

```ts
query GetRecipe1 {
  recipe(title: "Recipe 1") {
    title
    description
    ratings
    creationDate
    ratingsCount(minRate: 2)
    averageRating
  }
}
```

should return:

```json
{
  "data": {
    "recipe": {
      "title": "Recipe 1",
      "description": "Desc 1",
      "ratings": [
        0,
        3,
        1
      ],
      "creationDate": "2018-04-11T00:00:00.000Z",
      "ratingsCount": 1,
      "averageRating": 1.3333333333333333
    }
  }
}
```

The following `GetRecipes` query:

```ts
{
  "data": {
    "recipes": [
      {
        "title": "Recipe 1",
        "description": "Desc 1",
        "creationDate": "2018-04-11T00:00:00.000Z",
        "averageRating": 1.3333333333333333
      },
      {
        "title": "Recipe 2",
        "description": "Desc 2",
        "creationDate": "2018-04-15T00:00:00.000Z",
        "averageRating": 2.5
      },
      {
        "title": "Recipe 3",
        "description": "Desc 3",
        "creationDate": "2022-02-24T19:17:40.359Z",
        "averageRating": 4.5
      }
    ]
  }
}
```

should return:

```json
{
  "data": {
    "recipes": [
      {
        "title": "Recipe 1",
        "description": "Desc 1",
        "creationDate": "2018-04-11T00:00:00.000Z",
        "averageRating": 1.3333333333333333
      },
      {
        "title": "Recipe 2",
        "description": "Desc 2",
        "creationDate": "2018-04-15T00:00:00.000Z",
        "averageRating": 2.5
      },
      {
        "title": "Recipe 3",
        "description": "Desc 3",
        "creationDate": "2022-02-24T19:17:40.359Z",
        "averageRating": 4.5
      }
    ]
  }
}
```

The following `AddRecipe` mutation:

```ts
mutation AddRecipe {
  addRecipe(recipe: {
    title: "New recipe"
    description: "Simple description"
  }) {
    creationDate
  }
}
```

should return:

```json
{
  "data": {
    "addRecipe": {
      "creationDate": "2022-02-24T19:21:57.320Z"
    }
  }
}
```

## Setup

Initialize `npm`:

```zsh
npm init -y
```

Initialize `tsc`:

```zsh
tsc --init
```

Install the following dependencies:

```zsh
npm i apollo-server class-validator graphql reflect-metadata type-graphql
```

Install the following dev dependencies:

```zsh
npm i -D apollo-server-core nodemon ts-node ts-node-dev typescript
```
