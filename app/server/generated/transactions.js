"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var electron_1 = require("electron");
var log4js_1 = require("log4js");
var csv = require("csv-parser");
var fs = __importStar(require("fs"));
var auth_1 = __importDefault(require("./auth"));
var Transactions = /** @class */ (function () {
    function Transactions(window) {
        this.browserWindow = window;
        this.systemAuth = auth_1["default"].getInstance();
        this.errorLogger = (0, log4js_1.getLogger)("Error");
        this.eventsLogger = (0, log4js_1.getLogger)("App");
        this.accessLogger = (0, log4js_1.getLogger)("Access");
    }
    Transactions.prototype.importTransactions = function () {
        var _this = this;
        var dialogWindow = electron_1.dialog;
        var results = [];
        var focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
        return new Promise(function (resolve, reject) {
            var directoryPath = electron_1.dialog.showOpenDialog(focusedWindow, {
                properties: ['openFile'],
                filters: [{ name: 'Database Files', extensions: ['csv'] }]
            });
            directoryPath.then(function (dResult) {
                
                var transactionsFile = dResult.filePaths[0];
                fs.createReadStream(transactionsFile)
                    .pipe(csv())
                    .on('data', function (data) { return results.push(data); })
                    .on('end', function () {
                    
                    resolve(results);
                });
            })["catch"](function (error) {
                
                _this.errorLogger.error("Unable to import file for user" + auth_1["default"].instance.currentUser + ", Error:" + JSON.stringify(error));
                // reject(error)
            });
        });
    };
    return Transactions;
}());
exports["default"] = Transactions;
//# sourceMappingURL=transactions.js.map