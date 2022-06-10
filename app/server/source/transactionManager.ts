import { BrowserWindow, dialog } from "electron";
import { getLogger, Logger } from "log4js";
import csv = require('csv-parser');
import * as fs from 'fs'
import SystemAuth from "./auth";
import DatabaseController from "./databaseController";
import {v4 as uuid} from 'uuid'
import { QUERY } from "./configurations/queries";
import { sampleCategories } from "./sample-data/sample-categories";


export default class Transactions {

    private browserWindow: BrowserWindow
    private systemAuth:SystemAuth 
    private databaseController: DatabaseController
    
    private errorLogger : Logger
    private eventsLogger : Logger
    private accessLogger : Logger

 

    public constructor(window:BrowserWindow, appPaths:any) { 
       
        this.browserWindow = window;
        this.systemAuth = SystemAuth.getInstance(appPaths)
        this.databaseController = DatabaseController.getInstance(appPaths)

        this.errorLogger =  getLogger("Error") 
        this.eventsLogger = getLogger("App")
        this.accessLogger = getLogger("Access")
        this.updateTotals()
     }

   
    public setDefaultCategories(){
        let count=0
        

        this.getCategoriesServerSide().then((result :any[]) =>{
            

            result.forEach(category => {
                if(count<10){
                    const budget:BudgetType = {
                        userID: "",
                        budgetID: "",
                        categoryID: category.categoryID,
                        totalBalance: "100",
                        actualBalance: "0",
                        remaningBalance: "100",
                        active: true,
                        currentMonth: 0
                    }
                    this.addNewBudget(budget);
                    count++
                }
                
            });
        })
        .catch( error=>{

        })
    }

    public importTransactions(accountID:string, accountName:string): Promise<number>{
    
        const dialogWindow = dialog;
        const results: TransactionType[] = [];

        let focusedWindow  = BrowserWindow.getFocusedWindow();

        return new Promise((resolve,reject) =>{
            let directoryPath = dialog.showOpenDialog(focusedWindow,{ 
                properties: ['openFile'],
                filters: [{ name: 'Database Files', extensions: ['csv'] } ]
            });
            
            directoryPath.then(async (dResult) =>{
                
                let transactionsFile = dResult.filePaths[0]
                let count = 0
               fs.createReadStream(transactionsFile)
                    .pipe(csv())
                    .on('data', (data: TransactionType) =>{
                        data.accountID = accountID
                        data.accountName = accountName
                        data.txnID = uuid()
                        data.userID = this.systemAuth.getCurrentUser().userID
                        data.amount =data.amount.replace("$","")
                        data.recurring = false;
                        data.date  = new Date(data.date).getTime()+""
                        if(count<3){
                            data.cleared = false
                            count++
                        }
                        else{
                            data.cleared = true
                        }
                        results.push(data)
                    })
                    .on('end', () => {
                        // 
                    
                        this.databaseController.runQueryWithMultipleData(QUERY.ADD_NEW_TRANSACTION, results)
                        .catch(err =>{
                            
                        })
                        .then(() =>{
                            
                            const uid = this.systemAuth.getCurrentUser().userID
                            this.databaseController.runQuery(QUERY.CLEAR_USER_SETUPMODE(uid))
                            if(this.systemAuth.getCurrentUser().setupMode){
                                
                                this.setDefaultCategories() 
                            }
                             this.systemAuth.getCurrentUser().setupMode = false;

                        })
                            
                        this.updateTotals()
                        resolve(results.length );
                    
                    });
                    
                
            }).catch( error =>{
                
                this.errorLogger.error("Unable to import file for user"+SystemAuth.instance.getCurrentUser()+", Error:"+JSON.stringify(error))
                reject(error)
            })
        })
        

        

            
        
    }

    public addNewAccount(data:AccountType){
        
        data.userID = this.systemAuth.getCurrentUser().userID
        data.accountID = uuid()
        this.databaseController.runQueryWithData(QUERY.ADD_NEW_ACCOUNT,data)
        .then( result =>{
            
            this.browserWindow.webContents.send("eventChange", "success")
        })
        .catch(error =>{
            
            this.eventsLogger.error("Unable to edit transaction")
        })
    }

    public addNewCategory(data:Categories){
         
        data.categoryID = uuid()
        data.subCategories = JSON.stringify([])

        

        this.databaseController.runQueryWithData(QUERY.ADD_NEW_CATEGORY, data)
        .then( result =>{
            
            this.browserWindow.webContents.send("updateStatus", {status:"success"})
        })
        .catch(error =>{
            
            this.eventsLogger.error("Unable to add category")
        })
    }
    public addNewBudget(data:BudgetType){
        const budget:BudgetType ={
            categoryID:data.categoryID,
            totalBalance:data.totalBalance,
            active: true,
            userID: this.systemAuth.getCurrentUser().userID,
            actualBalance:"0",
            budgetID:uuid(),
            currentMonth: new Date().getMonth(),
            remaningBalance:data.totalBalance
        }
        data.userID = this.systemAuth.getCurrentUser().userID
        data.active = true

        
        this.databaseController.runQueryWithData(QUERY.ADD_NEW_BUDGET,budget)
        .then( result =>{
            
            this.updateTotals()
            this.browserWindow.webContents.send("updateStatus", {status:"success"})
        })
        .catch(error =>{
            
            this.eventsLogger.error("Unable to edit budget")
        })
    }
    public addNewTransaction(data:TransactionType){
        data.userID = this.systemAuth.getCurrentUser().userID
        data.txnID = uuid()
        
        this.databaseController.runQueryWithData(QUERY.ADD_NEW_TRANSACTION,data)
        .then( result =>{
            
            this.browserWindow.webContents.send("eventChange", "success")
            this.updateTotals()
        })
        .catch(error =>{
            
            this.eventsLogger.error("Unable to edit transaction")
        })
    }

    public editTransactionCategory(data:any){
        const queryString = QUERY.UPDATE_USER_TRANSACTION_CATEGORY(
            this.systemAuth.getCurrentUser().userID,
            data.txnID,
            data.category
        );
        

        this.databaseController.runQuery( queryString)
        .then( result =>{
            
            this.browserWindow.webContents.send("editTransactionCategoryStatus", "success")
            this.updateTotals()
        })
        .catch(error =>{
           
            this.eventsLogger.error("Unable to edit transaction")
        })
    }

    public editBudgetTotal(data:any){
        const queryString = QUERY.EDIT_BUDGET_TOTAL(
            this.systemAuth.getCurrentUser().userID,
            data.budgetID,
            data.totalBalance,
            data.remainingBalance
        );
        

        this.databaseController.runQuery( queryString)
        .then( result =>{
            
            this.updateTotals();
         })
        .catch(error =>{
           
           if(error.errno =="19"){ // already exists then upsert 
               
           }
            this.eventsLogger.error("Unable to edit transaction")
        })
    }
    public getTransactions(){
        const uid = this.systemAuth.getCurrentUser().userID
        this.databaseController.runQuery(QUERY.GET_ALL_TRANSACTIONS(uid))
        .then( (result:TransactionType[]) =>{
            
             
            this.browserWindow.webContents.send("transactions", result)
        })
        .catch(error =>{
            this.eventsLogger.error("Unable to get transactions")
        })
        
    }

    public getDashboardTransactions(){
        const uid = this.systemAuth.getCurrentUser().userID
        this.databaseController.runQuery(QUERY.GET_ALL_TRANSACTIONS(uid))
        .then( (result:TransactionType[]) =>{
            
             
            this.browserWindow.webContents.send("dashboardTransactions", result)
        })
        .catch(error =>{
            this.eventsLogger.error("Unable to get transactions")
        })
        
    }

    public getExpectedTransactions(){
        const uid = this.systemAuth.getCurrentUser().userID


        this.databaseController.runQuery(QUERY.GET_ALL_TRANSACTIONS(uid))
        .then( result =>{
            
            this.browserWindow.webContents.send("transactions", result)
        })
        .catch(error =>{
            this.eventsLogger.error("Unable to get transactions")
        })
    }

    public getAccounts(){
        const uid = this.systemAuth.getCurrentUser().userID;
        this.databaseController.runQuery(QUERY.GET_ALL_ACCOUNTS(uid))
        .then( result =>{
            // 
            this.browserWindow.webContents.send("accounts", result)
        })
        .catch(error =>{
            this.eventsLogger.error("Unable to get transactions")
        })
        
    }

    public getCategories(){

        this.databaseController.runQuery(QUERY.GET_ALL_CATEGORIES)
        .then( result =>{
            
            this.browserWindow.webContents.send("categories", result)
        })
        .catch(error =>{
            this.eventsLogger.error("Unable to get categories list")
        })

 
        
    }
    public getCategoriesServerSide(){
        return new Promise( (resolve,reject)=>{
            this.databaseController.runQuery(QUERY.GET_ALL_CATEGORIES)
            .then( result =>{
                
                resolve(result)
            })
            .catch(error =>{
                this.eventsLogger.error("Unable to get categories list")
                reject("Error")
            })
        })
        

    }
   
    public getMonthlyTotal(month:number){//month is a number from the current month, 0 for this month, 1 for last month, etc
         // also returns the transactions as well.
         const uid = this.systemAuth.getCurrentUser().userID

            const dateVal = new Date();
            dateVal.setMonth(dateVal.getMonth() - month)
            dateVal.setDate(1)
            dateVal.setHours(0,0,0,0)
            
            const timeStampStart = dateVal.getTime()+"";
            dateVal.setMonth(dateVal.getMonth()+1)
            const timeStampEnd = dateVal.getTime()+""

            
            this.databaseController.runQuery(QUERY.GET_ALL_TRANSACTIONS_IN_RANGE(uid, timeStampStart, timeStampEnd))
            .then( (result:TransactionType[]) =>{
                 
                this.browserWindow.webContents.send("monthlyTransactions",{ status:"success",month:month,   result:result})
            })
            .catch(error =>{
                this.eventsLogger.error("Unable to get transactions in that range")
            })
        
    }

    public getSpendingOverview(){
        const uid = this.systemAuth.getCurrentUser().userID
        const dateVal = new Date();
        dateVal.setMonth(dateVal.getMonth())
        dateVal.setDate(1)
        dateVal.setHours(0,0,0,0)
        
        const timeStampStart = dateVal.getTime()+"";
        dateVal.setMonth(dateVal.getMonth()+1)
        const timeStampEnd = dateVal.getTime()+""

        this.databaseController.runQuery(QUERY.GET_CURRENT_MONTH_SPENDING(uid, timeStampStart, timeStampEnd))
        .then( result =>{
            
            this.browserWindow.webContents.send("receiveSpendingOverviewData", result)
        })
        .catch(error =>{
            this.eventsLogger.error("Unable to get spending overview")
        })
        
    }
    
    public getBudgetData(){
        const uid = this.systemAuth.getCurrentUser().userID
        const month = new Date().getMonth();
        
    

        this.databaseController.runQuery(QUERY.GET_ALL_BUDGETS(uid))
        .then( (result:any[]) =>{
            let resetNeeded = false;
            result.forEach(element => {
                if(element.currentMonth!=month){
                    
                    resetNeeded=true
                }
            });

            if(resetNeeded){
                this.databaseController.runQuery(QUERY.RESET_BUDGET_TOTALS_NEW_MONTH(uid,month))
                .then( result =>{
                    
                    this.updateTotals();
                })
                .catch( error =>{
                    
            })     
            }
                      
            this.browserWindow.webContents.send("budgetData", { status:"success",month:month,   result:result})

        })
        .catch(error =>{
            this.eventsLogger.error("Unable to get budget data")
        })
        
    }
    public getBudgetSummary(){
        const uid = this.systemAuth.getCurrentUser().userID
     
        
    

        this.databaseController.runQuery(QUERY.GET_BUDGET_SUMMARY(uid))
        .then( (result:any[]) =>{
            
            result.forEach(element => {
                element.remaining = Number(element.budget)-Number(element.actual)
            });
            this.browserWindow.webContents.send("budgetSummaryData", { status:"success",    result:result[0]})
        })
        .catch(error =>{
            this.eventsLogger.error("Unable to GET_BUDGET_SUMMARY data")
        })
        
    }

    public updateTotals(){
        
        const dateVal = new Date();
        dateVal.setMonth(dateVal.getMonth())
        dateVal.setDate(1)
        dateVal.setHours(0,0,0,0)
        
        const timeStampStart = dateVal.getTime()+"";
        dateVal.setMonth(dateVal.getMonth()+1)
        const timeStampEnd = dateVal.getTime()+""

        const user = this.systemAuth.getCurrentUser()
        if(user ==null ||user.userID==null){
            return
        }
      
        this.databaseController.runQuery(QUERY.GET_TRANSACTION_CATEGORY_SPENDING_IN_RANGE(user.userID,timeStampStart, timeStampEnd))
        .then( (result:any []) =>{
            
            try {
                
                if(result.length==0){
                    this.databaseController.runQuery(QUERY.UPDATE_BUDGET_TOTALS_WITH_ZERO(user.userID))

                }
                result.forEach(element =>{
                    this.databaseController.runQuery(QUERY.UPDATE_BUDGET_TOTALS(user.userID, element.categoryID, Number(element.actual).toFixed(2) ))
                })
            } catch (error) {
                
            }
            finally{
                
                this.browserWindow.webContents.send("updateStatus", {status:"success"})
            }


        })
        .catch(error =>{
            this.eventsLogger.error("Unable to get transactions")
        })


    }

  public deleteSingleTransaction(data:any){
    const uid = this.systemAuth.getCurrentUser().userID

        this.databaseController.runQuery(QUERY.DELETE_SINGLE_USER_TRANSACTION(uid, data.txnID))
        .then( result =>{
            
            this.browserWindow.webContents.send("updateStatus", {status:"success"})
        })
        .catch(error =>{
            this.eventsLogger.error("Unable to delete transaction", data.txnID)
        })
 
    }

    

  public deleteSingleBudget(data:any){
    const uid = this.systemAuth.getCurrentUser().userID

        this.databaseController.runQuery(QUERY.DELETE_SINGLE_USER_BUDGET(uid, data.budgetID))
        .then( result =>{
            
            this.browserWindow.webContents.send("updateStatus", {status:"success"})
        })
        .catch(error =>{
            this.eventsLogger.error("Unable to delete budget", data.budgetID)
        })

 
        
    }

    public deleteSingleAccountAndTransactions(data:any){
        const uid = this.systemAuth.getCurrentUser().userID
    
            this.databaseController.runQuery(QUERY.DELETE_USER_TRANSACTIONS_SINGLE_ACCOUNT(uid, data.accountID))
            .then( result =>{
                
 
                this.databaseController.runQuery(QUERY.DELETE_USER_SINGLE_ACCOUNT(uid, data.accountID))
                .then( result =>{
                    
                    this.browserWindow.webContents.send("editAccountStatus", {status:"success"})
                })
          
            })
            .catch(error =>{
                this.eventsLogger.error("Unable to delete account data", data.accountID)
            })
    
     
            
        }


        public editAccountBalance(data:any){
            const editAccountBalance = QUERY.EDIT_ACCOUNT_BALANCE(
                this.systemAuth.getCurrentUser().userID,
                data.accountID,
                data.newBalance 
            );
            
    
            this.databaseController.runQuery( editAccountBalance)
            .then( result =>{
                
                this.browserWindow.webContents.send("editAccountStatus", {status:"success"})
 
                this.updateTotals()
            })
            .catch(error =>{
               
                
                this.eventsLogger.error("Unable to edit transaction"+ editAccountBalance+ error)
            })
        }



}
