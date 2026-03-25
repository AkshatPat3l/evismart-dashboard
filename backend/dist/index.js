"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const server_1 = require("@apollo/server");
// @ts-ignore
const express4_1 = require("@apollo/server/express4");
const schema_1 = require("./schema");
const resolvers_1 = require("./resolvers");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = new server_1.ApolloServer({
    typeDefs: schema_1.typeDefs,
    resolvers: resolvers_1.resolvers,
});
const startServer = async () => {
    await server.start();
    app.use("/graphql", (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => {
            const token = req.headers.authorization || "";
            const user = (0, resolvers_1.getUserFromToken)(token);
            return { user };
        },
    }));
    app.listen(4000, () => {
        console.log("🚀 Server ready at http://localhost:4000/graphql");
    });
};
startServer();
