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
exports.__esModule = true;
var sqlite3 = __importStar(require("sqlite3"));
var DatabaseController = /** @class */ (function () {
    function DatabaseController(appPaths) {
        var dbFilePath = appPaths.DB_PATH;
        //// Database initialization
        this.dbConn = new sqlite3.Database(dbFilePath, function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
    }
    DatabaseController.getInstance = function (appPaths) {
        if (!DatabaseController.instance) {
            DatabaseController.instance = new DatabaseController(appPaths);
        }
        return DatabaseController.instance;
    };
    DatabaseController.prototype.runQueryWithData = function (query, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var formattedData = [];
            Object.keys(data)
                .sort()
                .forEach(function (v, i) {
                formattedData.push(data[v]);
            });
            _this.dbConn.run(query, formattedData, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve("success");
                }
            });
        });
    };
    DatabaseController.prototype.runQueryWithMultipleData = function (query, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var count = 0;
            var _loop_1 = function (i) {
                var formattedData = [];
                Object.keys(data[i])
                    .sort()
                    .forEach(function (v, ji) {
                    formattedData.push(data[i][v]);
                });
                _this.dbConn.all(query, formattedData, function (err, rows) {
                    if (err) {
                        if (err.errno == 19) {
                            reject("alreadyExists" + err);
                        }
                        reject(err);
                    }
                    else {
                        resolve("success");
                    }
                });
            };
            for (var i = 0; i < data.length; i++) {
                _loop_1(i);
            }
        });
    };
    DatabaseController.prototype.runQuery = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var data = [];
            _this.dbConn.all(query, [], function (err, rows) {
                // process rows here  
                if (err) {
                    reject(err);
                }
                else {
                    if (rows != undefined) {
                        rows.forEach(function (row) { data.push(row); });
                    }
                }
                resolve(data);
            });
        });
    };
    return DatabaseController;
}());
exports["default"] = DatabaseController;
//# sourceMappingURL=databaseController.js.map