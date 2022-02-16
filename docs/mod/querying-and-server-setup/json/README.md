# JSON

Server responses in GraphQL are returned in JSON format. Since this is the case, let's refresh our memory on what JSON is and how to use it.

JSON (JavaScript Object Notation) is a self describing, data interchange format designed to be easily parse-able by both humans and machines. It is based on the JavaScript language, and quickly gained prominence to replace XML as the standard data interchange format on the web. Data exchanged between a browser and server must be text, and JSON consists only of text. Any JavaScript object can easily be converted to JSON w/ built-in methods, and vice versa.

The syntax of JSON is very simple to follow:

* Data is in name/value pairs

* Data is separated by commas

* Curly braces hold objects

* Square brackets hold arrays

* String values must be written w/ double quotes

Let's take a look at an example of a JSON object:

```json
{
  "name": "Jeff Bezos",
  "age": 55,
  "children": 4,
  "height": 5.6,
  "wealth": 137000000000,
  "commendations": ["National Merit Scholar", "Silver Knight Award"]
}
```

We can also nest JSON data as deeply as we would like:

```json
{
    "name": "Jeff Bezos",
    "age": 55,
    "children": 4,
    "height": 5.6,
    "wealth": 137000000000,
    "commendations": ["National Merit Scholar", "Silver Knight Award"],
    "companies": {
        "Amazon": {
            "founded": 1994,
            "description": "Online marketplace",
            "missionStatement": "Our vision is to be earth's most customer-centric company; to build a place where people can come to find and discover anything they might want to buy online."
        },
        "blueOrigin": {
            "founded": 2000,
            "description": "Space travel",
            "missionStatement": "We're committed to building a road to space so our children can build the future."
        }
    }
}
```

You must convert your JSON object to JavaScript before you can make use of the data:

```js
let myJSON = '{"name": "Dr. Seuss", "books": ["Green Eggs and Ham", "Fox in Socks", "Horton Hears a Who!"]}';

let myObj = JSON.parse(myJSON);

console.log(myObj);

// >> {name: "Dr. Seuss", books: ["Green Eggs and Ham", "Fox in Socks", "Horton Hears a Who!"]}
```

Now you can manipulate your data as you would any other JavaScript object.

We also need to convert a JavaScript object before we can send it to the server:

```js
let myObj = {name: "Dr. Seuss", books: ["Green Eggs and Ham", "Fox in Socks", "Horton Hears a Who!"]};

let myJSON = JSON.stringify(myObj);

console.log(myJSON);

// >> '{"name":"Dr. Seuss","books":["Green Eggs and Ham","Fox in Socks","Horton Hears a Who!"]}'
```

We'll get a lot of practice using JSON in the upcoming sections. Just keep in mind that a JSON object is not a JavaScript object, but that we can easily coerce JavaScript objects to JSON in order to send information through HTTP requests.
