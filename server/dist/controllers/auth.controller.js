"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-career-key-2026-xyz';
async function register(req, res) {
    try {
        const { email, password, fullName } = req.body;
        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password and full name are required' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({
            data: {
                email,
                fullName,
                passwordHash,
                role: 'STUDENT',
            },
        });
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
}
async function getMe(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
}
