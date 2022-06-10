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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var databaseController_1 = __importDefault(require("./databaseController"));
var uuid_1 = require("uuid");
var queries_1 = require("./configurations/queries");
var Transactions = /** @class */ (function () {
    function Transactions(window, appPaths) {
        this.browserWindow = window;
        this.systemAuth = auth_1["default"].getInstance(appPaths);
        this.databaseController = databaseController_1["default"].getInstance(appPaths);
        this.errorLogger = (0, log4js_1.getLogger)("Error");
        this.eventsLogger = (0, log4js_1.getLogger)("App");
        this.accessLogger = (0, log4js_1.getLogger)("Access");
        this.updateTotals();
    }
    Transactions.prototype.setDefaultCategories = function () {
        var _this = this;
        var count = 0;
        this.getCategoriesServerSide().then(function (result) {
            result.forEach(function (category) {
                if (count < 10) {
                    var budget = {
                        userID: "",
                        budgetID: "",
                        categoryID: category.categoryID,
                        totalBalance: "100",
                        actualBalance: "0",
                        remaningBalance: "100",
                        active: true,
                        currentMonth: 0
                    };
                    _this.addNewBudget(budget);
                    count++;
                }
            });
        })["catch"](function (error) {
        });
    };
    Transactions.prototype.importTransactions = function (accountID, accountName) {
        var _this = this;
        var dialogWindow = electron_1.dialog;
        var results = [];
        var focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
        return new Promise(function (resolve, reject) {
            var directoryPath = electron_1.dialog.showOpenDialog(focusedWindow, {
                properties: ['openFile'],
                filters: [{ name: 'Database Files', extensions: ['csv'] }]
            });
            directoryPath.then(function (dResult) { return __awaiter(_this, void 0, void 0, function () {
                var transactionsFile, count;
                var _this = this;
                return __generator(this, function (_a) {
                    transactionsFile = dResult.filePaths[0];
                    count = 0;
                    fs.createReadStream(transactionsFile)
                        .pipe(csv())
                        .on('data', function (data) {
                        data.accountID = accountID;
                        data.accountName = accountName;
                        data.txnID = (0, uuid_1.v4)();
                        data.userID = _this.systemAuth.getCurrentUser().userID;
                        data.amount = data.amount.replace("$", "");
                        data.recurring = false;
                        data.date = new Date(data.date).getTime() + "";
                        if (count < 3) {
                            data.cleared = false;
                            count++;
                        }
                        else {
                            data.cleared = true;
                        }
                        results.push(data);
                    })
                        .on('end', function () {
                        // 
                        _this.databaseController.runQueryWithMultipleData(queries_1.QUERY.ADD_NEW_TRANSACTION, results)["catch"](function (err) {
                        })
                            .then(function () {
                            var uid = _this.systemAuth.getCurrentUser().userID;
                            _this.databaseController.runQuery(queries_1.QUERY.CLEAR_USER_SETUPMODE(uid));
                            if (_this.systemAuth.getCurrentUser().setupMode) {
                                _this.setDefaultCategories();
                            }
                            _this.systemAuth.getCurrentUser().setupMode = false;
                        });
                        _this.updateTotals();
                        resolve(results.length);
                    });
                    return [2 /*return*/];
                });
            }); })["catch"](function (error) {
                _this.errorLogger.error("Unable to import file for user" + auth_1["default"].instance.getCurrentUser() + ", Error:" + JSON.stringify(error));
                reject(error);
            });
        });
    };
    Transactions.prototype.addNewAccount = function (data) {
        var _this = this;
        data.userID = this.systemAuth.getCurrentUser().userID;
        data.accountID = (0, uuid_1.v4)();
        this.databaseController.runQueryWithData(queries_1.QUERY.ADD_NEW_ACCOUNT, data)
            .then(function (result) {
            _this.browserWindow.webContents.send("eventChange", "success");
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to edit transaction");
        });
    };
    Transactions.prototype.addNewCategory = function (data) {
        var _this = this;
        data.categoryID = (0, uuid_1.v4)();
        data.subCategories = JSON.stringify([]);
        this.databaseController.runQueryWithData(queries_1.QUERY.ADD_NEW_CATEGORY, data)
            .then(function (result) {
            _this.browserWindow.webContents.send("updateStatus", { status: "success" });
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to add category");
        });
    };
    Transactions.prototype.addNewBudget = function (data) {
        var _this = this;
        var budget = {
            categoryID: data.categoryID,
            totalBalance: data.totalBalance,
            active: true,
            userID: this.systemAuth.getCurrentUser().userID,
            actualBalance: "0",
            budgetID: (0, uuid_1.v4)(),
            currentMonth: new Date().getMonth(),
            remaningBalance: data.totalBalance
        };
        data.userID = this.systemAuth.getCurrentUser().userID;
        data.active = true;
        this.databaseController.runQueryWithData(queries_1.QUERY.ADD_NEW_BUDGET, budget)
            .then(function (result) {
            _this.updateTotals();
            _this.browserWindow.webContents.send("updateStatus", { status: "success" });
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to edit budget");
        });
    };
    Transactions.prototype.addNewTransaction = function (data) {
        var _this = this;
        data.userID = this.systemAuth.getCurrentUser().userID;
        data.txnID = (0, uuid_1.v4)();
        this.databaseController.runQueryWithData(queries_1.QUERY.ADD_NEW_TRANSACTION, data)
            .then(function (result) {
            _this.browserWindow.webContents.send("eventChange", "success");
            _this.updateTotals();
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to edit transaction");
        });
    };
    Transactions.prototype.editTransactionCategory = function (data) {
        var _this = this;
        var queryString = queries_1.QUERY.UPDATE_USER_TRANSACTION_CATEGORY(this.systemAuth.getCurrentUser().userID, data.txnID, data.category);
        this.databaseController.runQuery(queryString)
            .then(function (result) {
            _this.browserWindow.webContents.send("editTransactionCategoryStatus", "success");
            _this.updateTotals();
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to edit transaction");
        });
    };
    Transactions.prototype.editBudgetTotal = function (data) {
        var _this = this;
        var queryString = queries_1.QUERY.EDIT_BUDGET_TOTAL(this.systemAuth.getCurrentUser().userID, data.budgetID, data.totalBalance, data.remainingBalance);
        this.databaseController.runQuery(queryString)
            .then(function (result) {
            _this.updateTotals();
        })["catch"](function (error) {
            if (error.errno == "19") { // already exists then upsert 
            }
            _this.eventsLogger.error("Unable to edit transaction");
        });
    };
    Transactions.prototype.getTransactions = function () {
        var _this = this;
        var uid = this.systemAuth.getCurrentUser().userID;
        this.databaseController.runQuery(queries_1.QUERY.GET_ALL_TRANSACTIONS(uid))
            .then(function (result) {
            _this.browserWindow.webContents.send("transactions", result);
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to get transactions");
        });
    };
    Transactions.prototype.getDashboardTransactions = function () {
        var _this = this;
        var uid = this.systemAuth.getCurrentUser().userID;
        this.databaseController.runQuery(queries_1.QUERY.GET_ALL_TRANSACTIONS(uid))
            .then(function (result) {
            _this.browserWindow.webContents.send("dashboardTransactions", result);
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to get transactions");
        });
    };
    Transactions.prototype.getExpectedTransactions = function () {
        var _this = this;
        var uid = this.systemAuth.getCurrentUser().userID;
        this.databaseController.runQuery(queries_1.QUERY.GET_ALL_TRANSACTIONS(uid))
            .then(function (result) {
            _this.browserWindow.webContents.send("transactions", result);
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to get transactions");
        });
    };
    Transactions.prototype.getAccounts = function () {
        var _this = this;
        var uid = this.systemAuth.getCurrentUser().userID;
        this.databaseController.runQuery(queries_1.QUERY.GET_ALL_ACCOUNTS(uid))
            .then(function (result) {
            // 
            _this.browserWindow.webContents.send("accounts", result);
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to get transactions");
        });
    };
    Transactions.prototype.getCategories = function () {
        var _this = this;
        this.databaseController.runQuery(queries_1.QUERY.GET_ALL_CATEGORIES)
            .then(function (result) {
            _this.browserWindow.webContents.send("categories", result);
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to get categories list");
        });
    };
    Transactions.prototype.getCategoriesServerSide = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.databaseController.runQuery(queries_1.QUERY.GET_ALL_CATEGORIES)
                .then(function (result) {
                resolve(result);
            })["catch"](function (error) {
                _this.eventsLogger.error("Unable to get categories list");
                reject("Error");
            });
        });
    };
    Transactions.prototype.getMonthlyTotal = function (month) {
        var _this = this;
        // also returns the transactions as well.
        var uid = this.systemAuth.getCurrentUser().userID;
        var dateVal = new Date();
        dateVal.setMonth(dateVal.getMonth() - month);
        dateVal.setDate(1);
        dateVal.setHours(0, 0, 0, 0);
        var timeStampStart = dateVal.getTime() + "";
        dateVal.setMonth(dateVal.getMonth() + 1);
        var timeStampEnd = dateVal.getTime() + "";
        this.databaseController.runQuery(queries_1.QUERY.GET_ALL_TRANSACTIONS_IN_RANGE(uid, timeStampStart, timeStampEnd))
            .then(function (result) {
            _this.browserWindow.webContents.send("monthlyTransactions", { status: "success", month: month, result: result });
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to get transactions in that range");
        });
    };
    Transactions.prototype.getSpendingOverview = function () {
        var _this = this;
        var uid = this.systemAuth.getCurrentUser().userID;
        var dateVal = new Date();
        dateVal.setMonth(dateVal.getMonth());
        dateVal.setDate(1);
        dateVal.setHours(0, 0, 0, 0);
        var timeStampStart = dateVal.getTime() + "";
        dateVal.setMonth(dateVal.getMonth() + 1);
        var timeStampEnd = dateVal.getTime() + "";
        this.databaseController.runQuery(queries_1.QUERY.GET_CURRENT_MONTH_SPENDING(uid, timeStampStart, timeStampEnd))
            .then(function (result) {
            _this.browserWindow.webContents.send("receiveSpendingOverviewData", result);
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to get spending overview");
        });
    };
    Transactions.prototype.getBudgetData = function () {
        var _this = this;
        var uid = this.systemAuth.getCurrentUser().userID;
        var month = new Date().getMonth();
        this.databaseController.runQuery(queries_1.QUERY.GET_ALL_BUDGETS(uid))
            .then(function (result) {
            var resetNeeded = false;
            result.forEach(function (element) {
                if (element.currentMonth != month) {
                    resetNeeded = true;
                }
            });
            if (resetNeeded) {
                _this.databaseController.runQuery(queries_1.QUERY.RESET_BUDGET_TOTALS_NEW_MONTH(uid, month))
                    .then(function (result) {
                    _this.updateTotals();
                })["catch"](function (error) {
                });
            }
            _this.browserWindow.webContents.send("budgetData", { status: "success", month: month, result: result });
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to get budget data");
        });
    };
    Transactions.prototype.getBudgetSummary = function () {
        var _this = this;
        var uid = this.systemAuth.getCurrentUser().userID;
        this.databaseController.runQuery(queries_1.QUERY.GET_BUDGET_SUMMARY(uid))
            .then(function (result) {
            result.forEach(function (element) {
                element.remaining = Number(element.budget) - Number(element.actual);
            });
            _this.browserWindow.webContents.send("budgetSummaryData", { status: "success", result: result[0] });
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to GET_BUDGET_SUMMARY data");
        });
    };
    Transactions.prototype.updateTotals = function () {
        var _this = this;
        var dateVal = new Date();
        dateVal.setMonth(dateVal.getMonth());
        dateVal.setDate(1);
        dateVal.setHours(0, 0, 0, 0);
        var timeStampStart = dateVal.getTime() + "";
        dateVal.setMonth(dateVal.getMonth() + 1);
        var timeStampEnd = dateVal.getTime() + "";
        var user = this.systemAuth.getCurrentUser();
        if (user == null || user.userID == null) {
            return;
        }
        this.databaseController.runQuery(queries_1.QUERY.GET_TRANSACTION_CATEGORY_SPENDING_IN_RANGE(user.userID, timeStampStart, timeStampEnd))
            .then(function (result) {
            try {
                if (result.length == 0) {
                    _this.databaseController.runQuery(queries_1.QUERY.UPDATE_BUDGET_TOTALS_WITH_ZERO(user.userID));
                }
                result.forEach(function (element) {
                    _this.databaseController.runQuery(queries_1.QUERY.UPDATE_BUDGET_TOTALS(user.userID, element.categoryID, Number(element.actual).toFixed(2)));
                });
            }
            catch (error) {
            }
            finally {
                _this.browserWindow.webContents.send("updateStatus", { status: "success" });
            }
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to get transactions");
        });
    };
    Transactions.prototype.deleteSingleTransaction = function (data) {
        var _this = this;
        var uid = this.systemAuth.getCurrentUser().userID;
        this.databaseController.runQuery(queries_1.QUERY.DELETE_SINGLE_USER_TRANSACTION(uid, data.txnID))
            .then(function (result) {
            _this.browserWindow.webContents.send("updateStatus", { status: "success" });
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to delete transaction", data.txnID);
        });
    };
    Transactions.prototype.deleteSingleBudget = function (data) {
        var _this = this;
        var uid = this.systemAuth.getCurrentUser().userID;
        this.databaseController.runQuery(queries_1.QUERY.DELETE_SINGLE_USER_BUDGET(uid, data.budgetID))
            .then(function (result) {
            _this.browserWindow.webContents.send("updateStatus", { status: "success" });
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to delete budget", data.budgetID);
        });
    };
    Transactions.prototype.deleteSingleAccountAndTransactions = function (data) {
        var _this = this;
        var uid = this.systemAuth.getCurrentUser().userID;
        this.databaseController.runQuery(queries_1.QUERY.DELETE_USER_TRANSACTIONS_SINGLE_ACCOUNT(uid, data.accountID))
            .then(function (result) {
            _this.databaseController.runQuery(queries_1.QUERY.DELETE_USER_SINGLE_ACCOUNT(uid, data.accountID))
                .then(function (result) {
                _this.browserWindow.webContents.send("editAccountStatus", { status: "success" });
            });
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to delete account data", data.accountID);
        });
    };
    Transactions.prototype.editAccountBalance = function (data) {
        var _this = this;
        var editAccountBalance = queries_1.QUERY.EDIT_ACCOUNT_BALANCE(this.systemAuth.getCurrentUser().userID, data.accountID, data.newBalance);
        this.databaseController.runQuery(editAccountBalance)
            .then(function (result) {
            _this.browserWindow.webContents.send("editAccountStatus", { status: "success" });
            _this.updateTotals();
        })["catch"](function (error) {
            _this.eventsLogger.error("Unable to edit transaction" + editAccountBalance + error);
        });
    };
    return Transactions;
}());
exports["default"] = Transactions;
//# sourceMappingURL=transactionManager.js.map