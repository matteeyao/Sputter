// configure express
import express, { Application, Request, Response } from 'express';
const app: Application = express();

// configure MongoDB, mongoose and the things required
// import { json } from 'body-parser';
// import mongoose from 'mongoose';
// const db = require("./config/keys").mongoURI;;

// configure GraphQL and schema; remember the capitalization of `GraphQL`!
// import { graphqlHTTP } from 'express-graphql';
// import schema from './schema/user_type';

// mongoose
//   .connect(db)
//   .then(() => console.log("Connected to MongoDB successfully"))
//   .catch(err => console.log(err));

// using the bodyParser package to parse incoming requests into json
// app.use(json());

// this is our connection to GraphQL - it takes the schema we configured as an argument 
// in the object passed to the expressGraphQL function
// app.use('/graphql', graphqlHTTP({
//   schema,
  // allowing us to use GraphiQL in a dev environment
//   graphiql: true
// }));

app.get("/", (req: Request, res: Response) => res.send("Hello world"));

app.listen(5000, () => console.log('🚀 Server is running on port 5000'));
