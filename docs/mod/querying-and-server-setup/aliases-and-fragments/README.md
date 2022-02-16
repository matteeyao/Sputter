# Aliases and Fragments

## First query

Query seeking to return multiple objects: `planet` and `person`:

```js
{
    planet(id: "cGxhbmVoczox") {
        name,
        diameter,
        gravity,
        population,
        climates,
        terrains
    }
    person(id: "cGVvcGxlOjE=") {
        name,
        birthYear,
        eyeColor
    }
}
```

Query result:

```json
{
  "data": {
        "planet": {
            "name": "tatooine",
            "diameter": 10456,
            "gravity": "1 standard",
            "population": 200000,
            "climates": [
                "arid"
            ],
            "terrains": [
                "desert"
            ]
        },
        "person": {
            "name": "Luke Skywalker",
            "birthYear": "19BBY",
            "eyeColor": "blue",
        }
    }
}
```

## Second query

However, what if we wanted to query for two different planets?

Use **aliases**.

Query seeking to return multiple `planet`s: `tattoine` and `alderaan`

```js
{
    tattoine: planet(id: "cGxhbmV0czox") {
        name,
        diameter,
        gravity,
        population,
        climates,
        terrains
    }
    alderaan: planet(id: "cGxhbmV0czoy") {
        name,
        diameter,
        gravity,
        population,
        climates,
        terrains
    }
}
```

Query result:

```json
{
  "data": {
    "tatooine": {
      "name": "Tatooine",
      "diameter": 10456,
      "gravity": "1 standard",
      "population": 200000,
      "climates": [
        "arid"
      ],
      "terrains": [
        "desert"
      ]
    },
    "alderaan": {
      "name": "Alderaan",
      "diameter": 12500,
      "gravity": "1 standard",
      "population": 200000000,
      "climates": [
        "temperate"
      ],
      "terrains": [
        "grasslands",
        "mountains"
      ]
    }
  }
}
```

## Third query

**Fragments** allow us to dry our queries

```js
query ComparePlanets($withTerrains: Boolean!) {
  tatooine: planet(id: "cGxhbmV0czox") {
    ...FindPlanet
  },
  alderaan: planet(id: "cGxhbmV0czoy") {
    ...FindPlanet
  }
}

fragment FindPlanet on Planet {
  name,
  diameter,
  gravity,
  population,
  climates,
  terrains @include(if: $withTerrains)
}
```

Query variables:

```js
{
  "withTerrains": false
}
```

Query result:

```json
{
  "data": {
    "tatooine": {
      "name": "Tatooine",
      "diameter": 10456,
      "gravity": "1 standard",
      "population": 200000,
      "climates": [
        "arid"
      ],
      "terrains": [
        "desert"
      ]
    },
    "alderaan": {
      "name": "Alderaan",
      "diameter": 12500,
      "gravity": "1 standard",
      "population": 200000000,
      "climates": [
        "temperate"
      ],
      "terrains": [
        "grasslands",
        "mountains"
      ]
    }
  }
}
```
