"use strict";
exports.__esModule = true;
exports.QUERY = void 0;
exports.QUERY = {
    ADD_NEW_ACCOUNT: "INSERT INTO accounts (account,accountID,balance,last_updated,name,type,userID) values(?, ?, ?, ?, ?, ?, ?)",
    ADD_NEW_TRANSACTION: "INSERT INTO transactions (accountID,accountName,amount,category,cleared,date,description,recurring,txnID,userID) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ADD_NEW_CATEGORY: "INSERT INTO categories (categoryID, name, subCategories) values(?, ?, ?)",
    ADD_NEW_BUDGET: "INSERT OR REPLACE INTO budgets ( active,actualBalance,budgetID,categoryID,currentMonth,remainingBalance,totalBalance,userID  ) values(?,?,?,?,?,?,?,?)",
    ADD_NEW_USER: "INSERT INTO users ( budgetStatus,email,fname,lastActive,lname,setupMode,userID) values(?, ?, ?, ?, ?, ?, ?)",
    CLEAR_USER_SETUPMODE: function (uid) { return "update users set setupMode=0 where userID=\"".concat(uid, "\""); },
    GET_USER_DATA: function (uid) { return "SELECT * FROM users where userID=\"".concat(uid, "\""); },
    GET_BUDGET_SUMMARY: function (uid) { return "select sum(totalBalance) as budget, sum(actualBalance) as actual,  (sum(totalBalance) - sum(actualBalance)) as remaining from  budgets where userID=\"".concat(uid, "\" "); },
    GET_ALL_BUDGETS: function (uid) { return "select  b.budgetID, b.userID, c.name as categoryName, b.categoryID, b.totalBalance, b.remainingBalance, b.actualBalance, b.active, b.currentMonth from budgets b join categories c where b.categoryID=c.categoryID and userID=\"".concat(uid, "\""); },
    GET_ALL_ACCOUNTS: function (uid) { return "SELECT * FROM accounts where userID=\"".concat(uid, "\""); },
    GET_ALL_TRANSACTIONS: function (uid) { return "SELECT * FROM transactions where userID=\"".concat(uid, "\""); },
    GET_ALL_EXPECTED_TRANSACTIONS: function (uid) { return "SELECT * FROM transactions where userID=\"".concat(uid, "\" and recurring=1"); },
    GET_TRANSACTION_CATEGORY_SPENDING_IN_RANGE: function (uid, start, end) { return "select c.categoryID, sum(amount) as actual from  transactions t join categories c where c.name=t.category and  userID=\"".concat(uid, "\" and date BETWEEN \"").concat(start, "\" and \"").concat(end, "\" group by c.categoryID  "); },
    GET_ALL_TRANSACTIONS_IN_RANGE: function (uid, start, end) { return "SELECT * FROM transactions where userID=\"".concat(uid, "\" and date BETWEEN \"").concat(start, "\" and \"").concat(end, "\""); },
    GET_CURRENT_MONTH_SPENDING: function (uid, start, end) { return "SELECT category, sum(amount) as actual FROM transactions WHERE userID=\"".concat(uid, "\" and date BETWEEN \"").concat(start, "\" and \"").concat(end, "\" GROUP BY category"); },
    UPDATE_BUDGET_TOTALS_WITH_ZERO: function (uid) { return "update budgets set actualBalance=\"0\", remainingBalance=0 where userID=\"".concat(uid, "\""); },
    RESET_BUDGET_TOTALS_NEW_MONTH: function (uid, currentMonth) { return "update budgets set actualBalance=\"0\", currentMonth=\"".concat(currentMonth, "\", remainingBalance=totalBalance where userID=\"").concat(uid, "\" and currentMonth!=\"").concat(currentMonth, "\""); },
    UPDATE_BUDGET_TOTALS: function (uid, categoryID, actualBalance) { return "update budgets set actualBalance=\"".concat(actualBalance, "\", remainingBalance=(CAST(totalBalance as NUMERIC)-CAST(actualBalance as NUMERIC) ) where userID=\"").concat(uid, "\" and categoryID=\"").concat(categoryID, "\" "); },
    UPDATE_USER_PROFILE: function (uid, fname, lname) { return "update users set fname=\"".concat(fname, "\", lname=\"").concat(lname, "\"   where userID=\"").concat(uid, "\""); },
    UPDATE_USER_TRANSACTION_CATEGORY: function (uid, txnID, category) { return "UPDATE transactions set category=\"".concat(category, "\" , cleared=1 where userID=\"").concat(uid, "\" and txnID=\"").concat(txnID, "\""); },
    EDIT_BUDGET_TOTAL: function (uid, budgetID, newTotal, newRemaining) { return "UPDATE budgets set totalBalance=\"".concat(newTotal, "\", remainingBalance=\"").concat(newRemaining, "\" where userID=\"").concat(uid, "\" and budgetID=\"").concat(budgetID, "\""); },
    EDIT_ACCOUNT_BALANCE: function (uid, accountID, newBalance) { return "UPDATE accounts set balance=\"".concat(newBalance, "\" where userID=\"").concat(uid, "\" and accountID=\"").concat(accountID, "\""); },
    DELETE_USER_TRANSACTIONS_SINGLE_ACCOUNT: function (uid, accountID) { return "DELETE from transactions where userID=\"".concat(uid, "\" and accountID=\"").concat(accountID, "\""); },
    DELETE_USER_TRANSACTIONS: function (uid) { return "DELETE from transactions where userID=\"".concat(uid, "\" "); },
    DELETE_SINGLE_USER_TRANSACTION: function (uid, txnID) { return "DELETE from transactions where userID=\"".concat(uid, "\" and txnID=\"").concat(txnID, "\" "); },
    DELETE_SINGLE_USER_BUDGET: function (uid, budgetID) { return "DELETE from budgets where userID=\"".concat(uid, "\" and budgetID=\"").concat(budgetID, "\" "); },
    DELETE_USER_ACCOUNTS: function (uid) { return " DELETE from accounts where userID=\"".concat(uid, "\""); },
    DELETE_USER_BUDGETS: function (uid) { return " DELETE from budgets where userID=\"".concat(uid, "\"; "); },
    DELETE_USER_SINGLE_ACCOUNT: function (uid, accountID) { return " DELETE from accounts where userID=\"".concat(uid, "\" and accountID=\"").concat(accountID, "\"; "); },
    RESET_USER_SETUP_MODE: function (uid) { return "update users set setupMode=\"1\" where userID=\"".concat(uid, "\"; "); },
    GET_ALL_CATEGORIES: "SELECT * FROM categories"
};
//# sourceMappingURL=queries.js.map