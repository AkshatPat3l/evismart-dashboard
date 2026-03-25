import * as bcrypt from "bcryptjs";
import { PrismaClient, Case, ClientClinic } from "@prisma/client";
import { generateToken } from "../utils/auth";

const prisma = new PrismaClient();

export const mockAnalytics = {
  metrics: [
    { label: "Total Revenue", value: "$84,240", change: "+12.5%", isUp: true },
    { label: "Completed Cases", value: "432", change: "+5.2%", isUp: true },
    {
      label: "Avg Turnaround",
      value: "3.2 days",
      change: "-8.1%",
      isUp: false,
    },
    { label: "Remake Rate", value: "1.4%", change: "-0.3%", isUp: false },
  ],
  revenueChart: [40, 60, 45, 80, 55, 90, 75, 100, 85, 95, 70, 110],
  products: [
    { name: "Crown & Bridge", val: 45, color: "bg-blue-500" },
    { name: "Aligners", val: 30, color: "bg-purple-500" },
    { name: "Implants", val: 15, color: "bg-emerald-500" },
  ],
};

const formatPayment = (p: any) => ({
  ...p,
  processedAt: p.processedAt.toISOString(),
});

export const resolvers = {
  Query: {
    cases: async (_: any, args: any, context: any) => {
      const where = args.status ? { status: args.status } : {};
      const cases = await prisma.case.findMany({
        where,
        include: { client: true },
      });
      return cases.map((c: Case & { client: ClientClinic }) => ({
        ...c,
        date: c.date,
        createdAt: c.createdAt.toISOString(),
      }));
    },
    clients: async (_: any, __: any, context: any) => {
      return prisma.clientClinic.findMany();
    },
    analytics: (_: any, __: any, context: any) => {
      return mockAnalytics;
    },
    invoices: async (_: any, args: any) => {
      const where = args.status ? { status: args.status } : {};
      const invoices = await prisma.invoice.findMany({
        where,
        include: { client: true, case: { include: { client: true } } },
        orderBy: { createdAt: "desc" },
      });
      return invoices.map((inv: any) => ({
        ...inv,
        createdAt: inv.createdAt.toISOString(),
      }));
    },
    payments: async (_: any, args: any) => {
      const where: any = {};
      if (args.status) where.status = args.status;
      if (args.clientId) where.clientId = args.clientId;
      const payments = await prisma.payment.findMany({
        where,
        include: {
          invoice: { include: { client: true, case: true } },
          client: true,
          case: true,
        },
        orderBy: { processedAt: "desc" },
        take: args.limit ?? 100,
        skip: args.offset ?? 0,
      });
      return payments.map(formatPayment);
    },
    financeSummary: async () => {
      const payments = await prisma.payment.findMany({
        include: { invoice: true },
      });
      const invoices = await prisma.invoice.findMany();

      const succeeded = payments.filter((p) => p.status === "Succeeded");
      const failed = payments.filter((p) => p.status === "Failed");
      const totalCollected = succeeded.reduce((s, p) => s + p.amount, 0);
      const totalFailed = failed.reduce((s, p) => s + p.amount, 0);
      const totalPending = invoices
        .filter((inv) => inv.status === "Pending" || inv.status === "Overdue")
        .reduce((s, inv) => s + inv.total, 0);

      // Build monthly breakdown (last 6 months)
      const months: Record<string, { collected: number; failed: number }> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        months[key] = { collected: 0, failed: 0 };
      }
      payments.forEach((p) => {
        const key = p.processedAt.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        if (months[key]) {
          if (p.status === "Succeeded") months[key].collected += p.amount;
          else months[key].failed += p.amount;
        }
      });
      const monthlyBreakdown = Object.entries(months).map(([month, v]) => ({
        month,
        ...v,
      }));

      return {
        totalCollected,
        totalPending,
        totalFailed,
        netRevenue: totalCollected - totalFailed,
        succeededCount: succeeded.length,
        failedCount: failed.length,
        monthlyBreakdown,
      };
    },
  },
  Mutation: {
    login: async (_: any, { email, password }: any) => {
      if (!email || !password) throw new Error("Email and password required");

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Incorrect email address");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Incorrect password");

      const token = generateToken(user.id);
      return { token, user };
    },
    createInvoice: async (
      _: any,
      { clientId, caseId, amount, tax, description, dueDate }: any,
    ) => {
      console.log("--- Mutation: createInvoice ---");
      console.log("Received clientId:", clientId);
      console.log("Received caseId:", caseId);

      try {
        const count = await prisma.invoice.count();
        const number = `INV-2026-${String(count + 1).padStart(3, "0")}`;
        const total = amount + (tax || 0);
        const today = new Date();
        const issueDate = today.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const invoice = await prisma.invoice.create({
          data: {
            number,
            clientId,
            caseId: caseId || null,
            amount,
            tax: tax || 0,
            total,
            status: "Pending",
            issueDate,
            dueDate,
            description: description || null,
          },
          include: { client: true, case: { include: { client: true } } },
        });
        console.log("Invoice created successfully:", invoice.number);
        return { ...invoice, createdAt: invoice.createdAt.toISOString() };
      } catch (error: any) {
        console.error("Invoice creation failed. ClientId attempted:", clientId);
        console.error("Prisma Error:", error);
        throw new Error(`Failed to create invoice: ${error.message}`);
      }
    },
    updateInvoice: async (_: any, { id, ...data }: any) => {
      const invoice = await prisma.invoice.update({
        where: { id },
        data,
        include: { client: true, case: { include: { client: true } } },
      });
      return { ...invoice, createdAt: invoice.createdAt.toISOString() };
    },
    deleteInvoice: async (_: any, { id }: { id: string }) => {
      await prisma.invoice.delete({ where: { id } });
      return true;
    },
    payInvoice: async (_: any, { id }: { id: string }) => {
      console.log(`Processing payment for invoice ${id}...`);
      const now = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const invoice = await prisma.invoice.update({
        where: { id },
        data: {
          status: "Paid",
          paidDate: now,
        },
        include: { client: true, case: { include: { client: true } } },
      });

      // Auto-log successful payment
      await prisma.payment.create({
        data: {
          invoiceId: id,
          clientId: invoice.clientId,
          caseId: invoice.caseId ?? null,
          amount: invoice.total,
          status: "Succeeded",
          method: "Card",
        },
      });

      return { ...invoice, createdAt: invoice.createdAt.toISOString() };
    },
    logPayment: async (
      _: any,
      { invoiceId, status, method, failureReason }: any,
    ) => {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });
      if (!invoice) throw new Error("Invoice not found");

      const payment = await prisma.payment.create({
        data: {
          invoiceId,
          clientId: invoice.clientId,
          caseId: invoice.caseId ?? null,
          amount: invoice.total,
          status,
          method: method ?? "Card",
          failureReason: failureReason ?? null,
        },
        include: {
          invoice: { include: { client: true, case: true } },
          client: true,
          case: true,
        },
      });
      return formatPayment(payment);
    },
  },
};
