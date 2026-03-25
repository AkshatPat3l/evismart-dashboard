import express, { Request } from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { getUserFromToken } from "./utils/auth";

const startServer = async () => {
  const app = express();
  app.use(cors({ origin: "*", credentials: false }));
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }: { req: Request }) => {
      const token = req.headers.authorization || "";
      const user = getUserFromToken(token);
      return { user };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql", cors: false });

  app.listen({ port: 4000 }, () => {
    console.log("🚀 Server ready at http://localhost:4000/graphql");
  });
};

startServer();
