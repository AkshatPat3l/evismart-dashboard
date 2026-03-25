"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
exports.typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    role: String!
    labId: String!
  }

  type ClientClinic {
    id: ID!
    name: String!
    dentist: String!
    cases: Int!
    location: String!
    status: String!
  }

  type Case {
    id: ID!
    patient: String!
    client: ClientClinic!
    type: String!
    status: String!
    date: String!
    createdAt: String
  }

  type RevenueStat {
    total: String!
    changePercentage: String!
  }

  type TurnaroundStat {
    averageDays: String!
    changePercentage: String!
  }

  type Metric {
    label: String!
    value: String!
    change: String!
    isUp: Boolean!
  }

  type ProductStat {
    name: String!
    val: Int!
    color: String!
  }

  type Analytics {
    metrics: [Metric!]!
    revenueChart: [Int!]!
    products: [ProductStat!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    cases(status: String, limit: Int, offset: Int): [Case!]!
    clients: [ClientClinic!]!
    analytics(timeRange: String): Analytics!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
  }
`;
