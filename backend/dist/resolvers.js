"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromToken = exports.resolvers = exports.mockAnalytics = exports.mockCases = exports.mockClients = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "super-secret-evismart-key";
// Dummy Data
exports.mockClients = [
    {
        id: "c1",
        name: "Downtown Dental Studio",
        dentist: "Dr. Michael Chen",
        cases: 24,
        status: "Active",
        location: "New York, NY",
    },
    {
        id: "c2",
        name: "Smile Care Orthodontics",
        dentist: "Dr. Sarah Smith",
        cases: 18,
        status: "Active",
        location: "Brooklyn, NY",
    },
    {
        id: "c3",
        name: "Westside Implant Center",
        dentist: "Dr. James Wilson",
        cases: 12,
        status: "Active",
        location: "Newark, NJ",
    },
];
exports.mockCases = [
    {
        id: "CAS-10492",
        patient: "John Doe",
        client: exports.mockClients[0],
        type: "Crown & Bridge",
        status: "Processing",
        date: "Oct 24, 2026",
        createdAt: "2026-10-24T10:00:00Z",
    },
    {
        id: "CAS-10491",
        patient: "Emma Collins",
        client: exports.mockClients[1],
        type: "Aligners",
        status: "Review",
        date: "Oct 23, 2026",
        createdAt: "2026-10-23T14:30:00Z",
    },
    {
        id: "CAS-10490",
        patient: "Michael Chang",
        client: exports.mockClients[2],
        type: "Implant",
        status: "Completed",
        date: "Oct 22, 2026",
        createdAt: "2026-10-22T09:15:00Z",
    },
];
exports.mockAnalytics = {
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
exports.resolvers = {
    Query: {
        cases: (_, args, context) => {
            // if (!context.user) throw new Error('Unauthenticated');
            let filtered = exports.mockCases;
            if (args.status)
                filtered = filtered.filter((c) => c.status === args.status);
            return filtered;
        },
        clients: (_, __, context) => {
            // if (!context.user) throw new Error('Unauthenticated');
            return exports.mockClients;
        },
        analytics: (_, __, context) => {
            // if (!context.user) throw new Error('Unauthenticated');
            return exports.mockAnalytics;
        },
    },
    Mutation: {
        login: (_, { email, password }) => {
            if (!email || !password)
                throw new Error("Invalid credentials");
            const user = {
                id: "u1",
                name: "Dr. Sarah Chen",
                role: "Lab Director",
                labId: "lab-1",
            };
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
                expiresIn: "1d",
            });
            return { token, user };
        },
    },
};
const getUserFromToken = (token) => {
    try {
        if (token) {
            return jsonwebtoken_1.default.verify(token.replace("Bearer ", ""), JWT_SECRET);
        }
        return null;
    }
    catch (err) {
        return null;
    }
};
exports.getUserFromToken = getUserFromToken;
