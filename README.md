# GraphQL

## Query

```js
{
  pokemon(id: "1") {
    name,
    color
  }
}
```

## Result

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

## Prerequisite Knowledge

* Specification, not implementation

* Language agnostic

* Large amount of competition

</br>

---

</br>

# Graphs

A graph is a data structure - a specialized format for organizing and storing data. There are many kinds of data structures, some of which you are already familiar w/ like linked lists and binary search trees. Graphs are a simple and powerful data structure which consist of *nodes* and *edges*.

The formal definition of a graph is as follows:

```
A graph consists of a set of nodes and edges which connect pairs of nodes.
```

Although you might not realize it, you likely make use of graphs on a daily basis. Social networking sites such as Twitter or LinkedIn use graphs to model users and the relationships between them. In a path finding application such as Google Maps, intersections are represented as nodes while roads are represented as edges connecting the intersections. Graphs are also used in your computer's operating system to allocate resources to different processes.

Let's take a look at a simple graph which might represent users and follows on Twitter:

![](./backend/assets/images/directed-graph.png)

The set of nodes in this graph is `N = {F, A, N, B, D}`. The set of edges is `E = {FN, NF, FA, AB, BF, BD, DA, NB}`. The graph represented here is called a *directed graph* b/c each edge has a direction associated w/ it. This makes sense for an application like Twitter since, although user `F` follows user `A`, it does not necessarily mean that user `A` follows user `F`. This is different from an application like Facebook, where connected users are 'friends' of each other. In this case, the graph would be undirected and the edges would be drawn w/o arrows.

A *tree* is simply a directed graph w/ no cycles, meaning that you cannot trace a path from any node that leads back to itself. Trees are hierarchical data structures w/ a signature pyramid appearance:

![](./backend/assets/images/binary-tree.png)

## Graphs and GraphQL

Let's say you were building an application for an online store. A user visiting a product page would likely access it by ID. However, from this ID, we still need to access more data - product specifications, seller information, reviews, and so forth. Using a traditional REST API, this data would be aggregated by a cascade of many HTTP fetches to our backend.

The creators of GraphQL realized something important, which is that all of this contingent fetching can be represented as a tree. When we make a request to our server using GraphQL, we send this entire request tree to our backend instead of individual requests. This allows the server to fulfill all of our requests in one go, eliminating a large amount of unnecessary communication between the client and server.

GraphQL does not replace our database, and does not even necessarily replace our RESTful API. In fact, we can use GraphWL w/ any database, such as PostgreSQL or MongoDB. When adding GraphQL to an application, you as the developer will define the `Types` (nodes) and `Relationships` (edges) between the data in your application. We will still need access to our data through some API to tell GraphQL where the data is located. However, GraphQL will package these requests into a single request tree which will be fulfilled on the backend and returned in its entirety. Simply put, GraphQL is a query language that traverses your data graph to produce a query result tree. Later on, we'll learn how to cache our responses in the frontend to accelerate data fetching.

If this doesn't completely make sense to you right now, have no fear. The nature of the request tree will become clear as we begin to make GraphQL queries in the upcoming sections.

</br>

---

</br>

# RESTful Routing

In this section we will review the conventions of RESTful routing and discuss some of the associated drawbacks. Even if you have utilized a REST API in the previous projects, it will be helpful to refresh your memory and discuss the reasons we might choose to augment our API w/ GraphQL.

## What is REST?

REST (Representational State Transfer) is an architecture style for designing networked applications. Typically associated w/ HTTP requests, developers can utilize REST architecture in their project w/o installing additional libraries or additional software. The request methods and data type are decoupled, meaning that REST has the ability to return many different data formats such as JSON, XML, and YAML.

REST is defined by 6 architectural constraints:

* **Uniform interface**: Individual resources are identified w/ URLs. The resources in the database are in a different form than the data returned to the client, and the client can modify the resources if given permission. Messages communicated between the client and server are self-descriptive and include enough information to process the request. When a developer is familiar w/ one of your APIs, they should be able to follow a similar approach for your other APIs.

* **Client-server**: The client and the server are decoupled, allowing them to evolve separately w/o any dependence on one another.

* **Stateless**: Information from requests not stored on the server. Each and every request is treated individually, w/ no dependence on prior requests. The client is responsible for managing the state of the application rather than the server, meaning that each request must contain the necessary information to fulfill the request, including authorization details.

* **Cacheable**: Caching should be applied to resources when applicable to improve application performance. Responses must define themselves as cacheable (or not) to prevent the client from sending extraneous data in response to subsequent requests.

* **Layered system**: The client cannot tell whether it is connected directly to the end system or to some intermediary → helps to enforce security and enables scalability via load balancing.

* **Code on demand**: An optional constraint which allows the server to return executable code.

In practice, RESTful routes enable a simple-to-understand API for accessing and modifying data using HTTP methods - `GET`, `POST`, `PUT`, `DELETE`, and `PATCH`. For example, if we wished to retrieve all of the products on an online store for a given category, we would make a `GET` request to an endpoint that looks something like:

```
http://shopurl.com/api/categories/20/products
```

This URL is easily read by a human, making the API developer friendly. Even if we keep adding parameters to the URL string, it is still reasonably simple to tell what kind of information we are after:

```
http://shopurl.com/api/categories/20/products/112/reviews/10/replies?_positive=true
```

The flexibility and data-agnostic nature of RESTful architecture has allowed it to grow and evolve w/ the web, enabling feature rich and developer friendly applications. However, problems have arisen w/ the architecture in recent years as the web has grown to accommodate a growing number of mobile users, who typically use the Internet to access applications which are not only data-rich, but must also have access to constantly changing data.

## Limitations of REST

### Repeated Queries

REST architecture is still very useful for applications w/ segmented resources. However, in modern applications, much of the data we need to access is **highly relational**. In the last section we learned how to represent a graph w/ nodes and edges. If we think of the information in our database as a graph, a highly relational database is one w/ a large number of edges compared to the number of nodes.

Fetching highly relational data w/ a REST API often involves repeated requests to the backend. In our online store example, suppose we had a list of products fow which we would like to return a list of comments. In order to do so we would need to iterate over the list of products and make a separate request for each one (an N + 1 query). We could, of course, add a RESTful endpoint to our application which takes a list of products and returns a list of comments. However, this results in a highly specialized endpoint for a single use case. If we have many connected resources in our application, we could potentially end up w/ hundreds of such specialized endpoints:

</br>

---

</br>

## React Setup

Start by setting up the frontend of the application:

* In your terminal, run the command below, which will install React globally. Update `npm` if prompted to do so.

    ```
    npm install -g create-react-app
    ```

* In the root directory of your project, run the command below - this will install a new React application in a new folder called `frontend`.

    ```
    create-react-app frontend
    ```

* If you look in the `frontend` directory, you will notice that it has its own `node_modules` folder. Make sure to `.gitignore` this folder.

* When setting up routes for our React app, we don't want to be required to type the full path; we would rather just write something like `'/api/users/:id'`. To do this we will need to add a key-value pair to the `package.json` **in our frontend folder**: `"proxy": "http://localhost:5000"`

* React runs on its own development server - localhost:3000. While we could write separate commands to run each server, this would quickly become rote. We will use an npm package called 'concurrently' to run both servers at once.

    + As a sidenote, making an axios request with a proxy will first run an API request to localhost:3000 and then redirect the request to localhost:5000. You may get a console error saying that the route, localhost:3000/api/users/ does not exist. This error is okay, as axios is making a request to both servers at this point.

* Navigate to the root directory of your project

* Run

    ```
    npm install concurrently
    ```

* Add three new scripts to your `package.json`:

    + The first script will allow users who download your project from GitHub to easily install dependencies from both folders

    ```
    "frontend-install": "npm install --prefix fronted"

    "frontend": "npm start --prefix frontend"

    "dev": "concurrently \"npm run server\" \"npm run frontend\""
    ```
* Now, if we type `npm run dev` in the terminal, both of our servers will start running. You can view the frontend on `localhost:3000`

* You may find the Chrome React Developer Tools and Redux DevTools useful for your project. If you installed the 'ES7 React/Redux/GraphQL/React-Native snippets' extension in VS Code, you can run 'rfc → tab' to create a functional component or 'rcc → tab' to create a class component. (make sure to review the documentation for this extension).

</br>

---

</br>

## Frontend Auth (MERN)

### Axios and jwt-decode

Let's add `axios` and `jwt-decode` to our frontend so that we can fetch information from our server and parse the user's token:

* Navigate to your frontend folder

* Run

    ```
    npm install axios jwt-decode
    ```

Project startup:

```
npm run dev
```

### Setting Axios Headers

Let's start out by ensuring that we send our authorization token w/ every request. In the last section, you installed `axios` so that you could make requests to your server from the frontend. We will be using `axios` to make our requests instead of `AJAX` like you did in the full stack project. 

Conveniently, `axios` allows us to set a common header for requests. We only have to do this once upon login (or when the user refreshes the page when we check to make sure the token has not expired). Let's create a new file in our `util` directory called `session_api_util.js`. We'll create a `setAuthToken`` method to either set or delete the common header dependent on whether the token is passed into our method:

```js
// frontend/src/util/session_api_util.js

import axios from 'axios';

export const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = token;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
```

We can pass in a falsy value to our function to ensure that the token will be removed from memory once our user is logged out or when the token has expired.

### User Logout

We will store a boolean value in our state to indicate that the user is authenticated. We can map this slice of state to our components to selectively render information depending on whether our user is logged in. It may seem a bit counterintuitive to set up logout before login, but we want to start building our app from the entry file and will need to handle logout there. In this example, we've attempted to make the redux pattern as similar as possible to the one you are familiar with previous project examples. Delete the preconfigured component files from `create-react-app` and create a new file in `src` called `index.js`.

</br>

---

</br>

## Testing the Frontend to Backend Connection on our MERN Stack App

To test that the frontend is connected to the backend, in Chrome Developer Tools, enter

```js
axios.get("/api/users/test").then(res => console.log(res))

// → {data: {…}, status: 200, statusText: "OK", headers: {…}, config: {…}, …}
```