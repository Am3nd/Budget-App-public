"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.PROD_PATHS = exports.PATHS = void 0;
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
/*  Here we store all the paths to major files in order
    to support any changes down the path
*/
exports.PATHS = {
    DB_PATH: path_1["default"].join(electron_1.app.getAppPath(), "..", "source", "extraResources", "user.db"),
    CLIENT_SOURCE: path_1["default"].join(electron_1.app.getAppPath(), "..", "..", "client", "HTML", "login.html"),
    CLIENT_INDEX: path_1["default"].join(electron_1.app.getAppPath(), "..", "..", "client", "HTML", "pages", "dashboard.html"),
    LOG_CONFIGURATIONS: path_1["default"].join(__dirname, "..", "..", "source", "configurations", "LogConfigurations.json")
};
exports.PROD_PATHS = {
    DB_PATH: path_1["default"].join(electron_1.app.getAppPath(), "..", "extraResources", "user.db"),
    CLIENT_SOURCE: path_1["default"].join(electron_1.app.getAppPath(), "app", "client", "HTML", "login.html"),
    CLIENT_INDEX: path_1["default"].join(electron_1.app.getAppPath(), "app", "client", "HTML", "pages", "dashboard.html"),
    LOG_CONFIGURATIONS: path_1["default"].join(electron_1.app.getAppPath(), "app", "server", "generated", "configurations", "LogConfigurations.json")
};
//# sourceMappingURL=CustomPaths.js.map