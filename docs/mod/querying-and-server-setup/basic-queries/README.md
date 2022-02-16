# Basic Queries

GraphQL Root query example:

```js
query findLuke {
  person(id: "cGVvcGx1OjE=") {
    name,
    eyeColor,
    mass
  }
}
```

Resulting json object:

```json
{
  "data": {
    "person": {
      "name": "Luke Skywalker",
      "eyeColor": "blue",
      "mass": 77
    }
  }
}
```

GraphQL Root query example:

```js
{
  pokemon(id: "1") {
    name,
    color
  }
}
```

Resulting json object:

```json
{
  "data": {
    "pokemon": {
      "name": "Pikachu",
      "color": "yellow"
    }
  }
}
```
