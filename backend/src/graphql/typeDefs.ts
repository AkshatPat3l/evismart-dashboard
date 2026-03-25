export const typeDefs = `#graphql
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

  type Invoice {
    id: ID!
    number: String!
    case: Case
    client: ClientClinic!
    amount: Float!
    tax: Float!
    total: Float!
    status: String!
    issueDate: String!
    dueDate: String!
    paidDate: String
    description: String
    createdAt: String
  }

  type Payment {
    id: ID!
    invoice: Invoice!
    client: ClientClinic!
    case: Case
    amount: Float!
    status: String!
    method: String!
    reference: String!
    failureReason: String
    processedAt: String!
  }

  type MonthlyFinance {
    month: String!
    collected: Float!
    failed: Float!
  }

  type FinanceSummary {
    totalCollected: Float!
    totalPending: Float!
    totalFailed: Float!
    netRevenue: Float!
    succeededCount: Int!
    failedCount: Int!
    monthlyBreakdown: [MonthlyFinance!]!
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
    metrics: [Metric!]!\n    revenueChart: [Int!]!
    products: [ProductStat!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    cases(status: String, limit: Int, offset: Int): [Case!]!
    clients: [ClientClinic!]!
    invoices(status: String): [Invoice!]!
    analytics(timeRange: String): Analytics!
    payments(status: String, clientId: String, limit: Int, offset: Int): [Payment!]!
    financeSummary: FinanceSummary!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    createInvoice(clientId: String!, caseId: String, amount: Float!, tax: Float!, description: String, dueDate: String!): Invoice!
    updateInvoice(id: String!, status: String, amount: Float, tax: Float, description: String, dueDate: String): Invoice!
    deleteInvoice(id: String!): Boolean!
    payInvoice(id: String!): Invoice!
    logPayment(invoiceId: String!, status: String!, method: String, failureReason: String): Payment!
  }
`;
