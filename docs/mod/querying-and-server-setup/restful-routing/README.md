# RESTful Routing

In this section we will review the conventions of RESTful routing and discuss some of the associated drawbacks. Even if you have utilized a REST API in the previous projects, it will be helpful to refresh your memory and discuss the reasons we might choose to augment our API w/ GraphQL.

## What is REST?

REST (Representational State Transfer) is an architecture style for designing networked applications. Typically associated w/ HTTP requests, developers can utilize REST architecture in their project w/o installing additional libraries or additional software. The request methods and data type are decoupled, meaning that REST has the ability to return many different data formats such as JSON, XML, and YAML.

REST is defined by 6 architectural constraints:

* **Uniform interface**: Individual resources are identified with URLs. The resources in the database are in a different form than the data returned to the client, and the client can modify the resources if given permission. Messages communicated between the client and server are self-descriptive and include enough information to process the request. When a developer is familiar with one of your APIs, they should be able to follow a similar approach for your other APIs.

* **Client-server**: The client and the server are decoupled, allowing them to evolve separately without any dependence on one another.

* **Stateless**: Information from requests not stored on the server. Each and every request is treated individually, with no dependence on prior requests. The client is responsible for managing the state of the application rather than the server, meaning that each request must contain the necessary information to fulfill the request, including authorization details.

* **Cache-able**: Caching should be applied to resources when applicable to improve application performance. Responses must define themselves as cache-able (or not) to prevent the client from sending extraneous data in response to subsequent requests.

* **Layered system**: The client cannot tell whether it is connected directly to the end system or to some intermediary. This helps to enforce security and enables scalability via load balancing.

* **Code on demand**: An optional constraint which allows the server to return executable code.

In practice, RESTful routes enable a simple-to-understand API for accessing and modifying data using HTTP methods - `GET`, `POST`, `PUT`, `DELETE`, and `PATCH`. For example, if we wished to retrieve all of the products on an online store for a given category, we would make a `GET` request to an endpoint that looks something like:

```
http://shopurl.com/api/categories/20/products
```

This URL is easily read by a human, making the API developer friendly. Even if we keep adding parameters to the URL string, it is still reasonably simple to tell what kind of information we are after:

```
http://shopurl.com/api/categories/20/products/112/reviews/10/replies?_positive=true
```

The flexibility and data-agnostic nature of RESTful architecture has allowed it to grow and evolve with the web, enabling feature rich and developer friendly applications. However, problems have arisen with the architecture in recent years as the web has grown to accommodate a growing number of mobile users, who typically use the Internet to access applications which are not only data-rich, but must also have access to constantly changing data.

## Limitations of REST

### Repeated Queries

REST architecture is still very useful for applications with segmented resources. However, in modern applications, much of the data we need to access is **highly relational**. In the last section we learned how to represent a graph with nodes and edges. If we think of the information in our database as a graph, a highly relational database is one with a large number of edges compared to the number of nodes.

Fetching highly relational data with a REST API often involves repeated requests to the backend. In our online store example, suppose we had a list of products for which we would like to return a list of comments. In order to do so we would need to iterate over the list of products and make a separate request for each one (an N + 1 query). We could, of course, add a RESTful endpoint to our application which takes a list of products and returns a list of comments. However, this results in a highly specialized endpoint for a single use case. If we have many connected resources in our application, we could potentially end up with hundreds of such specialized endpoints:

```
http://shopurl.com/api/product_comments
http://shopurl.com/api/product_categories
http://shopurl.com/api/user_replies
...
```

This breaks our REST convention and results in an API schema which is very difficult to utilize as a developer.

### Over fetching

When we make a RESTful request for some resource, we return all of the information on that resource - even that which we don't need. For example, let's say we wanted to generate a list of customer names and email addresses for vendors on our online shop so that they can add them to an email list. Querying `http://shopurl.com/api/users/:id` would return something like:

```json
{
    "id": 564,
    "name": "Paul Allen",
    "email": "paul@paulallen.com",
    "address": "1234 TMI Lane",
    "city": "Seattle",
    "state": "WA",
    "zip": "98145",
    "company": "Microsoft",
    "favorites": [
        { "id": 34, "name": "Sponge Bob temporary tattoo (pack of 24)" },
        { "id": 147, "name": "12th Man bumper sticker" },
        { "id": 42, "name": "Hitchhiker's Guide to the Galaxy" },
        ...
    ],
    ...
}
```

Although we really only needed each user's name and email address, our database retrieves a vast swath of unnecessary information which we will not end up using. Perhaps we could make another, specialized endpoint which returns only the information we require. However, if we repeated this strategy every time we ran into this scenario, the documentation for our API would quickly become ridiculous and overwhelming.

### Thin client/fat server

Although the server and client are decoupled w/ REST, their relationship is unbalanced. The bulk of the processing is dependent on the server, which does all of the heavy lifting. This means that the client has very little control over the data returned to it and is limited by the endpoints exposed by the server. This made sense in the past when user devices were slow and unreliable. However, in recent years, devices have become more powerful in terms of processing power. It is difficult to take advantage of this power using a REST API.

## Advantages of GraphQL

### Single request/single response

Perhaps the biggest advantage of GraphQL is that queries are packaged into a single request to the backend. This makes data delivery more efficient and grants more power to the client.

Let's say you would like to return a list of reviews for a single product's related products. That endpoint would look something like:

```
http://shopurl.com/api/products/34/related/reviews
```

Imagine writing the controller for this endpoint. You would first have to iterate through the list of each of the product's relatives to fetch their review IDs. Then, you would iterate through the list of review IDs to fetch information on each review. Using GraphQL, these queries would be bundled into a single request to the backend w/ the data returned as a single response.

### Relevant Data Fetching

When we make a query w/ GraphQL, we specify exactly which data we would like to return from the server. This means that we never over fetch data. Besides of increased efficiency, this results in easier data manipulation on the frontend.

### Server Client Balance

Since we can tailor each query to our needs, GraphQL gives power back to the client. This increases functionality on the client side and reduces the burden on the server, leveling the relationship between server and client.

## Conclusion

RESTful architecture has catalyzed the growth of the Internet, but lends itself to segmented, non-relational data. However, as new applications increasingly necessitate highly connected data, the traditional practices of REST can become messy and confusing. GraphQL enables us to model the relationships between our data as a graph and specify the relationships between data types. This allows us to make fewer and more efficient requests retrieving only the data we need for each particular use case.
