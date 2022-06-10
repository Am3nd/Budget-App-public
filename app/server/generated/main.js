"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.APPPATH = exports.current_env = void 0;
require("dotenv").config({ path: "./configurations/.env" });
var electron_1 = require("electron");
var CustomPaths_1 = require("./configurations/CustomPaths");
var budgetController_1 = __importDefault(require("./budgetController"));
var databaseController_1 = __importDefault(require("./databaseController"));
var path_1 = __importDefault(require("path"));
var mainWindow;
function isDev() {
    return process.argv[2] == "--dev" ? "dev" : "prod";
}
exports.current_env = isDev();
///Setup Paths
exports.APPPATH = exports.current_env === "dev" ? CustomPaths_1.PATHS : CustomPaths_1.PROD_PATHS;
//Setup Logger
// configure(APPPATH.LOG_CONFIGURATIONS);
// const logger = getLogger("Error")
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        electron_1.app.setAsDefaultProtocolClient("electron-budget", process.execPath, [path_1["default"].resolve(process.argv[1])]);
    }
}
else {
    electron_1.app.setAsDefaultProtocolClient("electron-budget");
}
var gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on("second-instance", function (event, commandLine, workingDirectory) {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            mainWindow.webContents.send("status", { status: "passwordResetSuccess" });
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
    });
    // Create mainWindow, load the rest of the app, etc...
    electron_1.app.whenReady().then(function () {
        try {
            createWindow(exports.APPPATH.CLIENT_SOURCE);
            var controller = budgetController_1["default"].getInstance(mainWindow, exports.APPPATH);
            controller.startListeners(mainWindow);
            databaseController_1["default"].getInstance(exports.APPPATH);
        }
        catch (error) {
            console.log("Error", error);
        }
    });
    electron_1.app.on("open-url", function (event, url) {
        mainWindow.webContents.send("status", { status: "passwordResetSuccess" });
    });
}
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
    else {
        electron_1.app.quit();
    }
});
electron_1.app.on("open-url", function (event, url) {
    mainWindow.webContents.send("status", { status: "passwordResetSuccess" });
});
function createWindow(path) {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        width: 1400,
        height: 600,
        minHeight: 300,
        minWidth: 300,
        autoHideMenuBar: false
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path);
    // Open the DevTools.
    if (exports.current_env === "dev") {
        mainWindow.webContents.openDevTools();
    }
}
//# sourceMappingURL=main.js.map