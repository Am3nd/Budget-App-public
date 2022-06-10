"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var electron_1 = require("electron");
var log4js_1 = require("log4js");
var auth_1 = __importDefault(require("./auth"));
var queries_1 = require("./configurations/queries");
var databaseController_1 = __importDefault(require("./databaseController"));
var transactionManager_1 = __importDefault(require("./transactionManager"));
var BudgetController = /** @class */ (function () {
    function BudgetController() {
    }
    /**
     * BudgetController is a singleton only one should exists since
     * we are using multiple event listeners so we can avoid a memory leak.
     * @returns instance of BudgetController
     */
    BudgetController.getInstance = function (window, appPaths) {
        if (!BudgetController.instance) {
            BudgetController.instance = new BudgetController();
            BudgetController.instance.browserWindow = window;
            BudgetController.instance.systemAuth = auth_1["default"].getInstance(appPaths);
            BudgetController.instance.errorLogger = (0, log4js_1.getLogger)("Error");
            BudgetController.instance.eventsLogger = (0, log4js_1.getLogger)("App");
            BudgetController.instance.accessLogger = (0, log4js_1.getLogger)("Access");
            BudgetController.instance.transactionManager = new transactionManager_1["default"](window, appPaths);
            BudgetController.instance.appPathObject = appPaths;
        }
        return BudgetController.instance;
    };
    BudgetController.prototype.signUserUp = function (data) {
        var _this = this;
        var accessLogger = BudgetController.instance.accessLogger;
        if (data.email == null || data.password == null) {
            return;
        }
        var signUpAttempt = this.systemAuth.signup(data);
        signUpAttempt.then(function (result) {
            accessLogger.info("Successfull Signup for " + data.email);
            _this.browserWindow.webContents.send('signupStatus', { status: "success" });
        })["catch"](function (errorCode) {
            accessLogger.error("Sign Up Error/" + errorCode);
            _this.browserWindow.webContents.send('signupStatus', { status: "failed", code: errorCode });
        });
    };
    BudgetController.prototype.logUserIn = function (data) {
        var _this = this;
        var accessLogger = BudgetController.instance.accessLogger;
        if (data.email == null || data.password == null) {
            return;
        }
        var loginAttempt = this.systemAuth.login(data.email, data.password);
        loginAttempt.then(function (result) {
            accessLogger.info("Successfull Login for user" + data.email);
            electron_1.BrowserWindow.getFocusedWindow().webContents.send('loginStatus', { status: "success" });
        })["catch"](function (error) {
            accessLogger.error("Login Error" + JSON.stringify(error));
            _this.browserWindow.webContents.send('loginStatus', { status: "failed" });
        });
    };
    BudgetController.prototype.importTransactions = function (accountID, accountName) {
        var _this = this;
        var eventsLogger = BudgetController.instance.eventsLogger;
        var transactionController = new transactionManager_1["default"](this.browserWindow, this.appPathObject);
        eventsLogger.info("Importing transactions for user: " + auth_1["default"].instance.getCurrentUser().userID);
        var transactions = transactionController.importTransactions(accountID, accountName);
        transactions.then(function (result) {
            _this.browserWindow.webContents.send('importTransactionsResult', { status: "success", results: result });
        })["catch"](function (err) {
        });
    };
    BudgetController.prototype.getTransactions = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("retrieving transactions for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.getTransactions();
    };
    BudgetController.prototype.getDashboardTransactions = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("retrieving transactions for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.getDashboardTransactions();
    };
    BudgetController.prototype.getBudgetData = function () {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("retrieving budget data for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.getBudgetData();
    };
    BudgetController.prototype.getBudgetSummaryData = function () {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("retrieving budget Summary data for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.getBudgetSummary();
    };
    BudgetController.prototype.getSpendingOverview = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("retrieving spending over for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.getSpendingOverview();
    };
    BudgetController.prototype.getCategories = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("retrieving categories for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.getCategories();
    };
    BudgetController.prototype.getAccountData = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("retrieving account data for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.getAccounts();
    };
    BudgetController.prototype.monthlyTotal = function (month) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("retrieving account data for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.getMonthlyTotal(month);
    };
    BudgetController.prototype.getCurrentUser = function () {
        var eventsLogger = BudgetController.instance.eventsLogger;
        var currentUser = this.systemAuth.getCurrentUser();
        if (currentUser.userID != null) {
            this.browserWindow.webContents.send("currentUser", this.systemAuth.getCurrentUser());
        }
        else {
            this.eventsLogger.error("User is not signed in but is accessing key areas");
        }
    };
    BudgetController.prototype.editTransactionCategory = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("Editing transaction for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.editTransactionCategory(data);
    };
    BudgetController.prototype.editBudgetTotal = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("Editing transaction for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.editBudgetTotal(data);
    };
    BudgetController.prototype.addNewTransaction = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("adding new transaction for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.addNewTransaction(data);
    };
    BudgetController.prototype.addNewBudget = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("adding new addNewBudget for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.addNewBudget(data);
    };
    BudgetController.prototype.addNewCategory = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("adding new addNewCategory for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.addNewCategory(data);
    };
    BudgetController.prototype.addNewAccount = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("adding new account for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.addNewAccount(data);
    };
    BudgetController.prototype.getUserDetails = function () {
        try {
            var eventsLogger = BudgetController.instance.eventsLogger;
            eventsLogger.info("adding new account for user: " + auth_1["default"].instance.getCurrentUser().userID);
            var currentUser = BudgetController.instance.systemAuth.getCurrentUser();
            var name_1 = this.getNameFromString(currentUser.name);
            var userDetails = {
                fname: name_1.fname,
                lname: name_1.lname,
                email: currentUser.email
            };
            this.browserWindow.webContents.send("userDetails", userDetails);
        }
        catch (error) {
        }
    };
    BudgetController.prototype.updateUserDetails = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("updating user details for user: " + auth_1["default"].instance.getCurrentUser().userID);
        BudgetController.instance.systemAuth.updateUserDetails(data);
    };
    BudgetController.prototype.deleteEverything = function () {
        var _this = this;
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("Deleting all user data: " + auth_1["default"].instance.getCurrentUser().userID);
        var userID = BudgetController.instance.systemAuth.getCurrentUser().userID;
        var deleteTransactions = databaseController_1["default"].getInstance(this.appPathObject).runQuery(queries_1.QUERY.DELETE_USER_TRANSACTIONS(userID));
        var deleteBudget = databaseController_1["default"].getInstance(this.appPathObject).runQuery(queries_1.QUERY.DELETE_USER_BUDGETS(userID));
        var deleteAccount = databaseController_1["default"].getInstance(this.appPathObject).runQuery(queries_1.QUERY.DELETE_USER_ACCOUNTS(userID));
        var resetToSetupMode = databaseController_1["default"].getInstance(this.appPathObject).runQuery(queries_1.QUERY.RESET_USER_SETUP_MODE(userID));
        auth_1["default"].instance.getCurrentUser().setupMode = true;
        var promiseList = [deleteAccount, deleteBudget, deleteTransactions];
        Promise.all(promiseList).then(function (result) {
            _this.browserWindow.webContents.send("updateStatus", { status: "success" });
        })["catch"](function (error) {
        });
    };
    BudgetController.prototype.deleteSingleTransaction = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("Deleting single transactions" + data.txnID + " for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.deleteSingleTransaction(data);
        this.transactionManager.updateTotals();
    };
    BudgetController.prototype.deleteSingleBudget = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("Deleting single transactions" + data.budgetID + "t for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.deleteSingleBudget(data);
        this.transactionManager.updateTotals();
    };
    BudgetController.prototype.deleteSingleAccount = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("Deleting single account for " + data.accountID + " for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.deleteSingleAccountAndTransactions(data);
        this.transactionManager.updateTotals();
    };
    BudgetController.prototype.editAccountBalance = function (data) {
        var eventsLogger = BudgetController.instance.eventsLogger;
        eventsLogger.info("Editing account balance for user: " + auth_1["default"].instance.getCurrentUser().userID);
        this.transactionManager.editAccountBalance(data);
    };
    BudgetController.prototype.startListeners = function (window) {
        electron_1.ipcMain.on('userLogin', function (event, data) {
            BudgetController.instance.logUserIn(data);
        }); //end of user Login
        electron_1.ipcMain.on('userSignup', function (event, data) {
            BudgetController.instance.signUserUp(data);
        }); // End of Signup
        electron_1.ipcMain.on('importTransactions', function (event, data) {
            BudgetController.instance.importTransactions(data.accountID, data.accountName);
        }); // End of Import Transactions
        electron_1.ipcMain.on('getTransactions', function (event, data) {
            // 
            BudgetController.instance.getTransactions(data);
        }); // End of get Transactions
        electron_1.ipcMain.on('getDashboardTransactions', function (event, data) {
            // 
            BudgetController.instance.getDashboardTransactions(data);
        }); // End of get Transactions
        electron_1.ipcMain.on('getSpendingOverview', function (event, data) {
            // 
            BudgetController.instance.getSpendingOverview(data);
        }); // End of get Transactions
        electron_1.ipcMain.on('getCategories', function (event, data) {
            // 
            BudgetController.instance.getCategories(data);
        }); // End of get categories
        electron_1.ipcMain.on('getAccountData', function (event, data) {
            // 
            BudgetController.instance.getAccountData(data);
        }); // End of get accounts
        electron_1.ipcMain.on('clientError', function (event, data) {
            // 
            BudgetController.instance.errorLogger.error("ClientSide Error" + data);
        }); // End of Errors
        electron_1.ipcMain.on('pageLoad', function (event, data) {
            // 
            BudgetController.instance.getCurrentUser();
        }); // End of PageLoad
        electron_1.ipcMain.on('getMonthlyTotal', function (event, data) {
            // 
            BudgetController.instance.monthlyTotal(data);
        }); // End of get getMonthlyTotal
        electron_1.ipcMain.on('editTransactionCategory', function (event, data) {
            // 
            BudgetController.instance.editTransactionCategory(data);
        }); // End of get editTransactionCategory
        electron_1.ipcMain.on('addNewTransaction', function (event, data) {
            // 
            BudgetController.instance.addNewTransaction(data);
        }); // End of get addNewTransaction
        electron_1.ipcMain.on('addNewAccount', function (event, data) {
            // 
            BudgetController.instance.addNewAccount(data);
        }); // End of get addNewAccount
        electron_1.ipcMain.on('getUserDetails', function (event, data) {
            // 
            BudgetController.instance.getUserDetails();
        }); // End of get getUserDetails
        electron_1.ipcMain.on('updateUserAccount', function (event, data) {
            // 
            BudgetController.instance.updateUserDetails(data);
        }); // End of get getUserDetails
        electron_1.ipcMain.on('getBudgetData', function (event, data) {
            // 
            BudgetController.instance.getBudgetData();
        }); // End of get budget data
        electron_1.ipcMain.on('getBudgetSummaryData', function (event, data) {
            // 
            BudgetController.instance.getBudgetSummaryData();
        }); // End of get budget data
        electron_1.ipcMain.on('editBudgetTotal', function (event, data) {
            // 
            BudgetController.instance.editBudgetTotal(data);
        }); // End of get budget data
        electron_1.ipcMain.on('addNewBudget', function (event, data) {
            // 
            BudgetController.instance.addNewBudget(data);
        }); // End of addNewBudget data
        electron_1.ipcMain.on('addNewCategory', function (event, data) {
            // 
            BudgetController.instance.addNewCategory(data);
        }); // End of addNewCategory data
        electron_1.ipcMain.on('deleteEverything', function (event, data) {
            BudgetController.instance.deleteEverything();
        }); // End of deleteEverything data
        electron_1.ipcMain.on('deleteSingleTransaction', function (event, data) {
            BudgetController.instance.deleteSingleTransaction(data);
        }); // End of deleteEverything data
        electron_1.ipcMain.on('deleteSingleBudget', function (event, data) {
            BudgetController.instance.deleteSingleBudget(data);
        }); // End of deleteEverything data
        electron_1.ipcMain.on('deleteSingleAccount', function (event, data) {
            BudgetController.instance.deleteSingleAccount(data);
        }); // End of single account data
        electron_1.ipcMain.on('editAccountBalance', function (event, data) {
            BudgetController.instance.editAccountBalance(data);
        }); // End of editAccountBalance data
        electron_1.ipcMain.on('forgotPassword', function (event, data) {
            BudgetController.instance.systemAuth.passwordReset(data.email)
                .then(function (result) {
                electron_1.BrowserWindow.getFocusedWindow().webContents.send("emailResetStatus", {
                    result: "success"
                });
            })["catch"](function (error) {
                electron_1.BrowserWindow.getFocusedWindow().webContents.send("emailResetStatus", {
                    result: "failed"
                });
            });
        }); // End of deleteEverything data
    }; /// End of Listeners
    BudgetController.prototype.getNameFromString = function (name) {
        var nameArr = name.split(" ").filter(String);
        var fname, lname;
        return {
            fname: nameArr[0],
            lname: nameArr[1]
        };
    };
    return BudgetController;
}());
exports["default"] = BudgetController;
//# sourceMappingURL=budgetController.js.map