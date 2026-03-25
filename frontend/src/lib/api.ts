import { GraphQLClient } from "graphql-request";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/graphql";

export const gqlClient = new GraphQLClient(API_URL, {
  headers: () => {
    const token = localStorage.getItem("auth_token");
    return token
      ? { authorization: `Bearer ${token}` }
      : ({} as Record<string, string>);
  },
});

export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        role
        labId
      }
    }
  }
`;

export const GET_CASES_QUERY = `
  query GetCases($status: String, $limit: Int, $offset: Int) {
    cases(status: $status, limit: $limit, offset: $offset) {
      id
      patient
      client { name }
      type
      status
      date
      createdAt
    }
  }
`;

export const fetchCases = async (): Promise<any[]> => {
  const data = await gqlClient.request<{ cases: any[] }>(GET_CASES_QUERY);
  return data.cases;
};

export const fetchClients = async (): Promise<any[]> => {
  const query = `{ clients { id name dentist cases status location } }`;
  const data = await gqlClient.request<{ clients: any[] }>(query);
  return data.clients;
};

export const fetchAnalytics = async (): Promise<any> => {
  const query = `{ analytics { metrics { label value change isUp } revenueChart products { name val color } } }`;
  const data = await gqlClient.request<{ analytics: any }>(query);
  return data.analytics;
};

export const GET_INVOICES_QUERY = `
  query GetInvoices($status: String) {
    invoices(status: $status) {
      id
      number
      case { id patient }
      client { id name }
      amount
      tax
      total
      status
      issueDate
      dueDate
      paidDate
      description
      createdAt
    }
  }
`;

export const fetchInvoices = async (): Promise<any[]> => {
  const data = await gqlClient.request<{ invoices: any[] }>(GET_INVOICES_QUERY);
  return data.invoices;
};

export const CREATE_INVOICE_MUTATION = `
  mutation CreateInvoice($clientId: String!, $caseId: String, $amount: Float!, $tax: Float!, $description: String, $dueDate: String!) {
    createInvoice(clientId: $clientId, caseId: $caseId, amount: $amount, tax: $tax, description: $description, dueDate: $dueDate) {
      id
      number
      total
      status
    }
  }
`;

export const createInvoice = async (vars: {
  clientId: string;
  caseId?: string;
  amount: number;
  tax: number;
  description?: string;
  dueDate: string;
}) => {
  const data = await gqlClient.request<{ createInvoice: any }>(
    CREATE_INVOICE_MUTATION,
    vars,
  );
  return data.createInvoice;
};

export const PAY_INVOICE_MUTATION = `
  mutation PayInvoice($id: String!) {
    payInvoice(id: $id) {
      id
      status
      paidDate
    }
  }
`;

export const LOG_PAYMENT_MUTATION = `
  mutation LogPayment($invoiceId: String!, $status: String!, $method: String, $failureReason: String) {
    logPayment(invoiceId: $invoiceId, status: $status, method: $method, failureReason: $failureReason) {
      id
      status
      reference
      processedAt
    }
  }
`;

export const logPayment = async (vars: {
  invoiceId: string;
  status: string;
  method?: string;
  failureReason?: string;
}) => {
  const data = await gqlClient.request<{ logPayment: any }>(
    LOG_PAYMENT_MUTATION,
    vars,
  );
  return data.logPayment;
};

export const UPDATE_INVOICE_MUTATION = `
  mutation UpdateInvoice($id: String!, $status: String, $amount: Float, $tax: Float, $description: String, $dueDate: String) {
    updateInvoice(id: $id, status: $status, amount: $amount, tax: $tax, description: $description, dueDate: $dueDate) {
      id
      status
      amount
      tax
      total
      description
      dueDate
    }
  }
`;

export const DELETE_INVOICE_MUTATION = `
  mutation DeleteInvoice($id: String!) {
    deleteInvoice(id: $id)
  }
`;

export const GET_PAYMENTS_QUERY = `
  query GetPayments($status: String, $clientId: String) {
    payments(status: $status, clientId: $clientId) {
      id
      invoice { id number }
      client { id name }
      case { id patient }
      amount
      status
      method
      reference
      failureReason
      processedAt
    }
  }
`;

export const fetchPayments = async (vars?: {
  status?: string;
  clientId?: string;
}): Promise<any[]> => {
  const data = await gqlClient.request<{ payments: any[] }>(
    GET_PAYMENTS_QUERY,
    vars ?? {},
  );
  return data.payments;
};

export const GET_FINANCE_SUMMARY_QUERY = `
  query FinanceSummary {
    financeSummary {
      totalCollected
      totalPending
      totalFailed
      netRevenue
      succeededCount
      failedCount
      monthlyBreakdown {
        month
        collected
        failed
      }
    }
  }
`;

export const fetchFinanceSummary = async (): Promise<any> => {
  const data = await gqlClient.request<{ financeSummary: any }>(
    GET_FINANCE_SUMMARY_QUERY,
  );
  return data.financeSummary;
};
