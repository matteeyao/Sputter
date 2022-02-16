# Nested Queries

`findLuke` query:

```js
query findLuke {
  person(id: "cGVvcGx1OjE=") {
    name,
    eyeColor,
    mass,
    species {
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