# Variables and directives

## `@include` directive

Query w/ `@include` directive:

```js
query findPerson($id: ID, $withSpecies: Boolean!) {
  person(id: $id) {
    name,
    eyeColor,
    mass,
    species @include(if: $withSpecies) { // @skip is another Directive
      name,
      classification,
      averageHeight
    },
    homeworld {
      name,
      diameter,
      population
    }
  }
}
```

Query variables w/ `"withSpecies"` set to `false`:

```js
{
  "id": "cGVvcGxlOjE=",
  "withSpecies": false
}
```

Query result:

```json
{
  "data": {
    "person": {
      "name": "Luke Skywalker",
      "eyeColor": "blue",
      "mass": 77
    },
    "homeworld": {
      "name": "Tatooine",
      "diameter": 10465,
      "population": 200000
    }
  }
}
```

Query variables w/ `"withSpecies"` set to `true`:

```js
{
  "id": "cGVvcGxlOjE=",
  "withSpecies": true
}
```

Query result:

```json
{
  "data": {
    "person": {
      "name": "Luke Skywalker",
      "eyeColor": "blue",
      "mass": 77
    },
    "species": {
      "name": "Human",
      "classification": "mammal",
      "averageHeight": 180
    },
    "homeworld": {
      "name": "Tatooine",
      "diameter": 10465,
      "population": 200000
    }
  }
}
```

## `@skip` directive

`@skip` does the opposite of `@include`

Query w/ `@skip` directive:

```js
query findPerson($id: ID, $withSpecies: Boolean!) {
  person(id: $id) {
    name,
    eyeColor,
    mass,
    species @skip(if: $withSpecies) { // @skip is another Directive
      name,
      classification,
      averageHeight
    },
    homeworld {
      name,
      diameter,
      population
    }
  }
}
```

Query variables w/ `"withSpecies"` set to `true`:

```js
{
  "id": "cGVvcGxlOjE=",
  "withSpecies": true
}
```

Query result:

```json
{
  "data": {
    "person": {
      "name": "Luke Skywalker",
      "eyeColor": "blue",
      "mass": 77
    },
    "homeworld": {
      "name": "Tatooine",
      "diameter": 10465,
      "population": 200000
    }
  }
}
```
