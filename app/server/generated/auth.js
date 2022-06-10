"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var env_1 = require("./configurations/env");
var queries_1 = require("./configurations/queries");
var databaseController_1 = __importDefault(require("./databaseController"));
var electron_1 = require("electron");
var SystemAuth = /** @class */ (function () {
    function SystemAuth(appPaths) {
        this.currentUser = {
            userID: null,
            lastActivity: null,
            name: null,
            email: null,
            budgetStatus: null,
            setupMode: null
        };
        this.firebaseConfig = env_1.FIREBASE_CONFIG2;
        this.timeout = 300000;
        (0, app_1.initializeApp)(this.firebaseConfig);
        this.auth = (0, auth_1.getAuth)();
        this.databaseController = databaseController_1["default"].getInstance(appPaths);
        this.userStatus = [];
        this.appPathOBJ = appPaths;
    }
    /**
     * BudgetController is a singleton only one should exists since
     * we are using multiple event listeners so we can avoid a memory leak.
     * @returns instance of BudgetController
     */
    SystemAuth.getInstance = function (appPaths) {
        if (!SystemAuth.instance) {
            SystemAuth.instance = new SystemAuth(appPaths);
        }
        return SystemAuth.instance;
    };
    SystemAuth.prototype.login = function (email, password) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            (0, auth_1.signInWithEmailAndPassword)(_this.auth, email, password)
                .then(function (userCredential) {
                // Signed in 
                var user = userCredential.user;
                // 
                _this.databaseController.runQuery(queries_1.QUERY.GET_USER_DATA(user.uid))
                    .then(function (result) {
                    _this.currentUser.userID = user.uid;
                    _this.currentUser.lastActivity = Date.now();
                    _this.currentUser.name = result[0].fname + " " + result[0].lname;
                    _this.currentUser.email = result[0].email;
                    _this.currentUser.budgetStatus = result[0].budgetStatus;
                    _this.currentUser.setupMode = result[0].setupMode == 1 ? true : false;
                    resolve(_this.currentUser);
                });
                // ...
            })["catch"](function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                reject("Error Unable to sign in with that Combo");
                // ..
            });
        });
    };
    SystemAuth.prototype.signup = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            (0, auth_1.createUserWithEmailAndPassword)(_this.auth, data.email, data.password)
                .then(function (userCredential) {
                var user = userCredential.user;
                (0, auth_1.updateProfile)(user, {
                    displayName: data.fname + " " + data.lname
                }).then(function () {
                    _this.userStatus.push({ uid: user.uid, budgetStatus: "success", setupMode: true });
                    _this.databaseController.runQueryWithData(queries_1.QUERY.ADD_NEW_USER, {
                        userID: user.uid,
                        email: data.email,
                        fname: data.fname,
                        lname: data.lname,
                        budgetStatus: "success",
                        setupMode: true,
                        lastActive: "" + Date.now()
                    })
                        .then(function (result) {
                        resolve("success");
                    });
                });
            })["catch"](function (error) {
                reject(error.code);
            });
        });
    };
    SystemAuth.prototype.updateUserDetails = function (data) {
        var auth = (0, auth_1.getAuth)();
        this.databaseController.runQuery(queries_1.QUERY.UPDATE_USER_PROFILE(this.currentUser.userID, data.fname, data.lname));
        this.currentUser.name = data.fname + " " + data.lname;
        (0, auth_1.updateProfile)(auth.currentUser, {
            displayName: data.fname + " " + data.lname
        }).then(function () {
            auth.currentUser.reload();
            var user = auth.currentUser;
            if (data.password != null || data.password != "") {
                (0, auth_1.updatePassword)(user, data.password).then(function () {
                    electron_1.BrowserWindow.getFocusedWindow().webContents.send("updateStatus", { status: "success" });
                })["catch"](function (error) {
                });
            }
            else {
                electron_1.BrowserWindow.getFocusedWindow().webContents.send("updateStatus", { status: "success" });
            }
        })["catch"](function (error) {
        });
    };
    SystemAuth.prototype.getCurrentUser = function () {
        try {
            if (Date.now() - this.currentUser.lastActivity > this.timeout) {
                electron_1.BrowserWindow.getFocusedWindow().webContents.send("updateStatus", { status: "logUserOut" });
                // BrowserWindow.getFocusedWindow().loadURL(this.appPathOBJ.CLIENT_SOURCE)
                this.currentUser = {
                    userID: null,
                    lastActivity: null,
                    name: null,
                    email: null,
                    budgetStatus: null,
                    setupMode: null
                };
            }
            else {
                this.currentUser.lastActivity = Date.now();
            }
            return this.currentUser;
        }
        catch (error) {
        }
    };
    SystemAuth.prototype.passwordReset = function (email) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var actionCodeSettings = {
                // After password reset, the user will be give the ability to go back
                // to this page.
                url: "https://www.budgetplusnow.com?type=passwordReset&email=".concat(email)
            };
            (0, auth_1.sendPasswordResetEmail)(_this.auth, email, actionCodeSettings)
                .then(function () {
                // Password reset email sent!
                // ..
                resolve("success");
            })["catch"](function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                reject("Error Unable to sign in with that Combo");
            });
        });
    };
    return SystemAuth;
}());
exports["default"] = SystemAuth;
//# sourceMappingURL=auth.js.map