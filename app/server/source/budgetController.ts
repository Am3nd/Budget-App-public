import { ipcMain,BrowserWindow, app } from "electron";
import { getLogger, Logger } from "log4js";
import SystemAuth from "./auth";
import { PATHS, PROD_PATHS } from "./configurations/CustomPaths";
import { QUERY } from "./configurations/queries";
import DatabaseController from "./databaseController";
import { APPPATH } from "./main";
import Transactions from "./transactionManager";
 


export default class BudgetController {

    private static instance: BudgetController;
    private transactionManager:Transactions
    private browserWindow: BrowserWindow
    private systemAuth:SystemAuth 
    private errorLogger : Logger
    private eventsLogger : Logger
    private accessLogger : Logger
    private appPathObject:any

    private constructor() {  }

    /**
     * BudgetController is a singleton only one should exists since
     * we are using multiple event listeners so we can avoid a memory leak.
     * @returns instance of BudgetController 
     */
    public  static  getInstance( window:BrowserWindow,appPaths:any): BudgetController {
          if (!BudgetController.instance) {
            BudgetController.instance = new BudgetController();
            BudgetController.instance.browserWindow = window;
            BudgetController.instance.systemAuth = SystemAuth.getInstance(appPaths)
            BudgetController.instance.errorLogger =  getLogger("Error") 
            BudgetController.instance.eventsLogger = getLogger("App")
            BudgetController.instance.accessLogger = getLogger("Access")
            BudgetController.instance.transactionManager = new Transactions(window, appPaths)
            BudgetController.instance.appPathObject = appPaths;
          }
          return BudgetController.instance;
      }


    private signUserUp(data:userDetails){
        const accessLogger =BudgetController.instance.accessLogger

        if( data.email == null || data.password==null){  return }

        
        const signUpAttempt = this.systemAuth.signup(data)
        signUpAttempt.then((result) =>{
            
            accessLogger.info("Successfull Signup for "+data.email)
            this.browserWindow.webContents.send('signupStatus', {status:"success"})

        }).catch( (errorCode) =>{
            
            accessLogger.error("Sign Up Error/" + errorCode)
            this.browserWindow.webContents.send('signupStatus',{status:"failed", code:errorCode})

 
        })
    
    }
    private logUserIn(data:userDetails){
          const accessLogger =BudgetController.instance.accessLogger
        if( data.email == null || data.password==null){  return }
            

            const loginAttempt =   this.systemAuth.login(data.email, data.password)
            loginAttempt.then((result:currentUserType) =>{
                accessLogger.info("Successfull Login for user"+data.email)
                
                BrowserWindow.getFocusedWindow().webContents.send('loginStatus',{status:"success"})
             
             }).catch( (error:any)=>{
                
                accessLogger.error("Login Error" + JSON.stringify(error))
                this.browserWindow.webContents.send('loginStatus',{status:"failed"})
            })
              

      }

    private importTransactions(accountID:string, accountName:string){
        const eventsLogger =BudgetController.instance.eventsLogger
        const transactionController = new Transactions(this.browserWindow,this.appPathObject);
        eventsLogger.info("Importing transactions for user: "+SystemAuth.instance.getCurrentUser().userID)
        const transactions = transactionController.importTransactions(accountID, accountName)
        transactions.then((result) =>{
             
            this.browserWindow.webContents.send('importTransactionsResult',{status:"success",results:result})
        }).catch((err)=>{
            
        })
    }
    private getTransactions(data:userDetails){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("retrieving transactions for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.getTransactions()

    }

    private getDashboardTransactions(data:userDetails){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("retrieving transactions for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.getDashboardTransactions()

    }

    private getBudgetData( ){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("retrieving budget data for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.getBudgetData()

    }
    private getBudgetSummaryData( ){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("retrieving budget Summary data for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.getBudgetSummary()

    }
    private getSpendingOverview(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("retrieving spending over for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.getSpendingOverview()

    }
    private getCategories(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("retrieving categories for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.getCategories()

    }

    private getAccountData(data:userDetails){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("retrieving account data for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.getAccounts()

    }
    private monthlyTotal(month:number){ //month is a number from the current month, 0 for this month, 1 for last month
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("retrieving account data for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.getMonthlyTotal(month)

    }
    private getCurrentUser(){
        const eventsLogger =BudgetController.instance.eventsLogger
        const currentUser = this.systemAuth.getCurrentUser()
        if(currentUser.userID !=null){
            this.browserWindow.webContents.send("currentUser", this.systemAuth.getCurrentUser())
        }
        else{
            this.eventsLogger.error("User is not signed in but is accessing key areas")
        }
        
    }

    private editTransactionCategory(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("Editing transaction for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.editTransactionCategory(data)

    }

    private editBudgetTotal(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("Editing transaction for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.editBudgetTotal(data)

    }

    private addNewTransaction(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("adding new transaction for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.addNewTransaction(data)

    }

    private addNewBudget(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("adding new addNewBudget for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.addNewBudget(data)

    }
    private addNewCategory(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("adding new addNewCategory for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.addNewCategory(data)

    }

    private addNewAccount(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("adding new account for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.addNewAccount(data)
    }
   
    private getUserDetails(){
        try {
            const eventsLogger =BudgetController.instance.eventsLogger
            eventsLogger.info("adding new account for user: "+SystemAuth.instance.getCurrentUser().userID)
            const currentUser = BudgetController.instance.systemAuth .getCurrentUser()
            const name = this.getNameFromString(currentUser.name);
            const userDetails = {
                fname:name.fname  ,
                lname:name.lname  ,
                email: currentUser.email
            }
            this.browserWindow.webContents.send("userDetails", userDetails)
        } catch (error) {
            
        }
        
    }

    private updateUserDetails( data:userDetails){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("updating user details for user: "+SystemAuth.instance.getCurrentUser().userID)
        
        BudgetController.instance.systemAuth .updateUserDetails(data) 
    }
    private deleteEverything(  ){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("Deleting all user data: "+SystemAuth.instance.getCurrentUser().userID)
        const userID = BudgetController.instance.systemAuth .getCurrentUser().userID
        const deleteTransactions =   DatabaseController.getInstance(this.appPathObject).runQuery(QUERY.DELETE_USER_TRANSACTIONS(userID))
        const deleteBudget =   DatabaseController.getInstance(this.appPathObject).runQuery(QUERY.DELETE_USER_BUDGETS(userID))
        const deleteAccount =   DatabaseController.getInstance(this.appPathObject).runQuery(QUERY.DELETE_USER_ACCOUNTS(userID))
         const resetToSetupMode =   DatabaseController.getInstance(this.appPathObject).runQuery(QUERY.RESET_USER_SETUP_MODE(userID))
        SystemAuth.instance.getCurrentUser().setupMode=true;
        const promiseList = [deleteAccount, deleteBudget, deleteTransactions]

        Promise.all(promiseList) .then( result =>{
            
            this.browserWindow.webContents.send("updateStatus", {status:"success"})
        })
        .catch( error =>{
            
        })
    }
     private deleteSingleTransaction(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("Deleting single transactions"+data.txnID+" for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.deleteSingleTransaction(data)
        this.transactionManager.updateTotals()
    }
     private deleteSingleBudget(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("Deleting single transactions"+data.budgetID+"t for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.deleteSingleBudget(data)
        this.transactionManager.updateTotals()
    }

    private deleteSingleAccount(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("Deleting single account for "+data.accountID+" for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.deleteSingleAccountAndTransactions(data)
        this.transactionManager.updateTotals()
    }

    private editAccountBalance(data:any){
        const eventsLogger =BudgetController.instance.eventsLogger
        eventsLogger.info("Editing account balance for user: "+SystemAuth.instance.getCurrentUser().userID)
        this.transactionManager.editAccountBalance(data)

    }

    public startListeners(window: BrowserWindow):void { // Listeners
     
        ipcMain.on('userLogin',function(event, data){
            BudgetController.instance.logUserIn(data)
            
        });//end of user Login


        ipcMain.on('userSignup',function(event, data){ 
             
            BudgetController.instance.signUserUp(data)
        });// End of Signup

        ipcMain.on('importTransactions',function(event, data){ 
             
           BudgetController.instance.importTransactions(data.accountID, data.accountName)
            
        });// End of Import Transactions

        ipcMain.on('getTransactions',function(event, data){ 
            // 
          BudgetController.instance.getTransactions(data)
           
        });// End of get Transactions
        ipcMain.on('getDashboardTransactions',function(event, data){ 
            // 
          BudgetController.instance.getDashboardTransactions(data)
           
        });// End of get Transactions

        ipcMain.on('getSpendingOverview',function(event, data){ 
            // 
          BudgetController.instance.getSpendingOverview(data)
           
        });// End of get Transactions

        ipcMain.on('getCategories',function(event, data){ 
            // 
          BudgetController.instance.getCategories(data)
           
        });// End of get categories

        ipcMain.on('getAccountData',function(event, data){ 
            // 
          BudgetController.instance.getAccountData(data)
           
        });// End of get accounts

        ipcMain.on('clientError',function(event, data){ 
            // 
            BudgetController.instance.errorLogger.error("ClientSide Error"+data)
       
        });// End of Errors

        ipcMain.on('pageLoad',function(event, data){ 
            // 
            BudgetController.instance.getCurrentUser()
       
        });// End of PageLoad

        ipcMain.on('getMonthlyTotal',function(event, data){ 
            // 
          BudgetController.instance.monthlyTotal(data)
           
        });// End of get getMonthlyTotal

        ipcMain.on('editTransactionCategory',function(event, data){ 
            // 
          BudgetController.instance.editTransactionCategory(data)
           
        });// End of get editTransactionCategory

        ipcMain.on('addNewTransaction',function(event, data){ 
            // 
          BudgetController.instance.addNewTransaction(data)
           
        });// End of get addNewTransaction

        ipcMain.on('addNewAccount',function(event, data){ 
            // 
          BudgetController.instance.addNewAccount(data)
           
        });// End of get addNewAccount

        ipcMain.on('getUserDetails',function(event, data){ 
            // 
          BudgetController.instance.getUserDetails()
           
        });// End of get getUserDetails

        ipcMain.on('updateUserAccount',function(event, data){ 
            // 
          BudgetController.instance.updateUserDetails(data)
           
        });// End of get getUserDetails

        ipcMain.on('getBudgetData',function(event, data){ 
            // 
          BudgetController.instance.getBudgetData()
           
        });// End of get budget data

        ipcMain.on('getBudgetSummaryData',function(event, data){ 
            // 
          BudgetController.instance.getBudgetSummaryData()
           
        });// End of get budget data

        ipcMain.on('editBudgetTotal',function(event, data){ 
            // 
          BudgetController.instance.editBudgetTotal(data)
           
        });// End of get budget data

        ipcMain.on('addNewBudget',function(event, data){ 
            // 
          BudgetController.instance.addNewBudget(data)
           
        });// End of addNewBudget data

        ipcMain.on('addNewCategory',function(event, data){ 
            // 
          BudgetController.instance.addNewCategory(data)
           
        });// End of addNewCategory data

        ipcMain.on('deleteEverything',function(event, data){ 
            
          BudgetController.instance.deleteEverything()
           
        });// End of deleteEverything data

        ipcMain.on('deleteSingleTransaction',function(event, data){ 
            
            BudgetController.instance.deleteSingleTransaction(data)
             
          });// End of deleteEverything data

        ipcMain.on('deleteSingleBudget',function(event, data){ 
            
            BudgetController.instance.deleteSingleBudget(data)
             
          });// End of deleteEverything data

        ipcMain.on('deleteSingleAccount',function(event, data){ 
        
        BudgetController.instance.deleteSingleAccount(data)
            
        });// End of single account data

        ipcMain.on('editAccountBalance',function(event, data){ 
            
            BudgetController.instance.editAccountBalance(data)
                
        });// End of editAccountBalance data

          ipcMain.on('forgotPassword',function(event, data){ 
           
            BudgetController.instance.systemAuth.passwordReset(data.email)
            .then( result=>{
                BrowserWindow.getFocusedWindow().webContents.send(
                    "emailResetStatus",
                    {
                        result:"success"
                    }
                )
            })
            .catch(error =>{
                BrowserWindow.getFocusedWindow().webContents.send(
                    "emailResetStatus",
                    {
                        result:"failed"
                    }
                )
            })
             
          });// End of deleteEverything data

    }/// End of Listeners
  

    public getNameFromString(name:string):{fname:string,lname:string} {

        const nameArr = name.split(" ").filter(String);
        let fname, lname;
        return {
            fname:nameArr[0],
            lname:nameArr[1]
        }
    }
}