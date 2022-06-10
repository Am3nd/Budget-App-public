require("dotenv").config({ path: "./configurations/.env" });
import { app, BrowserWindow, dialog, ipcMain, session } from "electron";
import { PATHS, PROD_PATHS } from "./configurations/CustomPaths";
import { configure, getLogger } from "log4js";
import BudgetController from "./budgetController";
import DatabaseController from "./databaseController";
import path from "path";

let mainWindow: BrowserWindow;

function isDev() {
  return process.argv[2] == "--dev" ? "dev" : "prod";
}
export const current_env = isDev();
///Setup Paths
export const APPPATH = current_env === "dev" ? PATHS : PROD_PATHS;

//Setup Logger
// configure(APPPATH.LOG_CONFIGURATIONS);
// const logger = getLogger("Error")

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("electron-budget", process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient("electron-budget");
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.

    if (mainWindow) {
      mainWindow.webContents.send("status", { status: "passwordResetSuccess" });
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    try {
      createWindow(APPPATH.CLIENT_SOURCE);
      const controller = BudgetController.getInstance(mainWindow, APPPATH);
      controller.startListeners(mainWindow);
      DatabaseController.getInstance(APPPATH);
    } catch (error) {
      console.log("Error", error);
    }
  });

  app.on("open-url", (event, url) => {
    mainWindow.webContents.send("status", { status: "passwordResetSuccess" });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  } else {
    app.quit();
  }
});

app.on("open-url", (event, url) => {
  mainWindow.webContents.send("status", { status: "passwordResetSuccess" });
});

function createWindow(path: string) {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 1400,
    height: 600,
    minHeight: 300,
    minWidth: 300,
    autoHideMenuBar: false,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path);

  // Open the DevTools.
  if (current_env === "dev") {
    mainWindow.webContents.openDevTools();
  }
}
