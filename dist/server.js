"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const data_source_1 = require("./data-source");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log('Data Source initialized');
    app_1.default.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
    .catch((err) => console.error('Error during Data Source initialization', err));
