"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
// Load environmental variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Configure middlewares
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use((0, cors_1.default)({
    origin: allowedOrigin === '*' ? true : allowedOrigin,
    credentials: true,
}));
app.use(express_1.default.json());
// Bind API routing table
app.use('/api', routes_1.default);
// Default test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Career Recommendation Platform API' });
});
// Bind global error handler middleware
app.use(error_middleware_1.errorMiddleware);
// Boot server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
