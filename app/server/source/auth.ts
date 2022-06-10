import {initializeApp, } from 'firebase/app'
import { Auth,sendPasswordResetEmail, updateCurrentUser, getAuth, onAuthStateChanged,updateProfile , signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword  } from "firebase/auth";
import { FIREBASE_CONFIG2 } from './configurations/env'; 
import { QUERY } from './configurations/queries';
import DatabaseController from './databaseController';
import {  BrowserWindow    } from "electron";
import { APPPATH } from './main';

export default class SystemAuth {
    
     
    public static instance: SystemAuth;
    private firebaseConfig: object
    private currentUser : currentUserType
    private auth: Auth
    private databaseController:DatabaseController
    private userStatus: {uid:string,setupMode:boolean, budgetStatus:string }[]
    private timeout:number
    private appPathOBJ:any

    private constructor(appPaths:any) {
        this.currentUser = {
            userID:null,
            lastActivity:null,
            name:null,
            email:null,
            budgetStatus:null,
            setupMode:null
        }       
         this.firebaseConfig =  FIREBASE_CONFIG2 ;
         this.timeout =300000

        initializeApp(this.firebaseConfig);
        this.auth = getAuth();
        this.databaseController = DatabaseController.getInstance(appPaths)
        this.userStatus = []
        this.appPathOBJ=appPaths

        
     }

    /**
     * BudgetController is a singleton only one should exists since
     * we are using multiple event listeners so we can avoid a memory leak.
     * @returns instance of BudgetController 
     */
    public  static  getInstance(appPaths:any  ): SystemAuth {
          if (!SystemAuth.instance) {
            SystemAuth.instance = new SystemAuth(appPaths);
           }
          return SystemAuth.instance;
      }

    public  login(email:string, password:string ): Promise<object> {
        return new Promise( (resolve, reject)=>{
                signInWithEmailAndPassword(this.auth, email, password)
                .then( (userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                
                    // 
                    this.databaseController.runQuery(QUERY.GET_USER_DATA(user.uid))
                    
                    .then( (result:any[]) =>{
                        this.currentUser.userID = user.uid
                        this.currentUser.lastActivity = Date.now()
                        this.currentUser.name = result[0].fname+" "+result[0].lname
                        this.currentUser.email = result[0].email
                        this.currentUser.budgetStatus = result[0].budgetStatus
                        this.currentUser.setupMode = result[0].setupMode==1?true:false
                        
                        resolve(this.currentUser)
                    })
                    
                    // ...
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    
                    reject("Error Unable to sign in with that Combo")
                    // ..
                 });
        
              
        })
        

    }

    public signup(data:userDetails ): Promise<string>  {

        return new Promise( (resolve, reject) =>{
             
            createUserWithEmailAndPassword(this.auth, data.email, data.password)
            .then( (userCredential) =>{
                const user = userCredential.user
                updateProfile(user, {
                    displayName:data.fname+" "+data.lname
                }).then(()=>{

                    this.userStatus.push({uid:user.uid, budgetStatus:"success",setupMode:true })
                    this.databaseController.runQueryWithData(QUERY.ADD_NEW_USER,{
                        userID:user.uid,
                        email: data.email,
                        fname:data.fname,
                        lname:data.lname,
                        budgetStatus:"success",
                        setupMode:true,
                        lastActive:""+Date.now()
                     
                    })
                    .then((result) =>{
                         
                         resolve("success")
                    })
                    
                   
                })
            })
            .catch((error) =>{
                
                
                reject(error.code)
            })
        }) 
    }

    public updateUserDetails(data: userDetails) {
        const auth = getAuth();
        this.databaseController.runQuery(QUERY.UPDATE_USER_PROFILE(this.currentUser.userID, data.fname,data.lname))
        this.currentUser.name =data.fname+" "+ data.lname
        updateProfile(auth.currentUser, {
                displayName: data.fname+" "+ data.lname
        }).then(() => {
            auth.currentUser.reload()
            const user = auth.currentUser;
            if(data.password!=null || data.password!=""){
                updatePassword(user, data.password).then(() => {
                    
                    
                    BrowserWindow.getFocusedWindow().webContents.send("updateStatus", {status:"success"})

                     }
                ).catch((error) => {
                
                });
            }
            else{
                BrowserWindow.getFocusedWindow().webContents.send("updateStatus", {status:"success"})
            }
             

        }).catch((error) => {
                 
        });
    }
    public getCurrentUser() :currentUserType{
        try {
            
         
        if(Date.now()- this.currentUser.lastActivity >this.timeout){
            
            BrowserWindow.getFocusedWindow().webContents.send("updateStatus",{status:"logUserOut"})
            // BrowserWindow.getFocusedWindow().loadURL(this.appPathOBJ.CLIENT_SOURCE)
            this.currentUser={
                userID:null,
                lastActivity:null,
                name:null,
                email:null,
                budgetStatus:null,
                setupMode:null
            }  
        }
        else{
            this.currentUser.lastActivity=Date.now()
        }
        return this.currentUser
        } catch (error) {
            
        }
        
        
    }

    public passwordReset(email:string){
        return new Promise( (resolve, reject)=>{
            var actionCodeSettings = {
                // After password reset, the user will be give the ability to go back
                // to this page.
                url: `https://www.budgetplusnow.com?type=passwordReset&email=${email}` 
              };
            sendPasswordResetEmail(this.auth, email, actionCodeSettings)
            .then(() => {
              // Password reset email sent!
              // ..
              
              resolve("success")
            })
            .catch((error) => {
              var errorCode = error.code;
              var errorMessage = error.message;
              
              reject("Error Unable to sign in with that Combo")

            });
     
        })

    }
     

    
 }


  
 