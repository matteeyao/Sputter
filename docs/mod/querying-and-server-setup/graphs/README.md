# Graphs

Before we dive into the fundamentals of GraphQL, let's talk about what a graph is and how it can help us to think about the information stored in our database. By now, you are used to thinking about the backend of an application as an MVC framework. Graphs will allow us to simplify this representation and more easily model the relationships between different types of data.

## What is a graph?

A graph is a data structure - a specialized format for organizing and storing data. There are many kinds of data structures, some of which you are already familiar w/ like linked lists and binary search trees. Graphs are a simple and powerful data structure which consist of *nodes* and *edges*.

The formal definition of a graph is as follows:

> A graph consists of a set of nodes and edges which connect pairs of nodes.

Although you might not realize it, you likely make use of graphs on a daily basis. Social networking sites such as Twitter or LinkedIn use graphs to model users and the relationships between them. In a path finding application such as Google Maps, intersections are represented as nodes while roads are represented as edges connecting the intersections. Graphs are also used in your computer's operating system to allocate resources to different processes.

Let's take a look at a simple graph which might represent users and follows on Twitter:

![](https://s3-us-west-1.amazonaws.com/appacademy-open-assets/graphql/d1/directed_graph.png)

The set of nodes in this graph is `N = {F, A, N, B, D}`. The set of edges is `E = {FN, NF, FA, AB, BF, BD, DA, NB}`. The graph represented here is called a *directed graph* b/c each edge has a direction associated w/ it. This makes sense for an application like Twitter since, although user `F` follows user `A`, it does not necessarily mean that user `A` follows user `F`. This is different from an application like Facebook, where connected users are 'friends' of each other. In this case, the graph would be undirected and the edges would be drawn w/o arrows.

A *tree* is simply a directed graph w/ no cycles, meaning that you cannot trace a path from any node that leads back to itself. Trees are hierarchical data structures w/ a signature pyramid appearance:

![](https://s3-us-west-1.amazonaws.com/appacademy-open-assets/graphql/d1/tree.png)

## Graphs and GraphQL

Let's say you were building an application for an online store. A user visiting a product page would likely access it by `ID`. However, from this ID, we still need to access more data - product specifications, seller information, reviews, and so forth. Using a traditional REST API, this data would be aggregated by a cascade of many HTTP fetches to our backend.

The creators of GraphQL realized something important, which is that all of this contingent fetching can be represented as a tree. When we make a request to our server using GraphQL, we send this entire request tree to our backend instead of individual requests. This allows the server to fulfill all of our requests in one go, eliminating a large amount of unnecessary communication between the client and server.

GraphQL does not replace our database, and does not even necessarily replace our RESTful API. In fact, we can use GraphQL w/ any database, such as PostgreSQL or MongoDB. When adding GraphQL to an application, you as the developer will define the `Types` (nodes) and `Relationships` (edges) between the data in your application. We will still need access to our data through some API to tell GraphQL where the data is located. However, GraphQL will package these requests into a single request tree which will be fulfilled on the backend and returned in its entirety. Simply put, GraphQL is a query language that traverses your data graph to produce a query result tree. Later on, we'll learn how to cache our responses in the frontend to accelerate data fetching.

If this doesn't completely make sense to you right now, have no fear. The nature of the request tree will become clear as we begin to make GraphQL queries in the upcoming sections.
