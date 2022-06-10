import { validate } from "uuid"
import * as sqlite3 from "sqlite3"
 
export default class DatabaseController { 
    private dbConn : any; 
    private static instance:DatabaseController
  
    private constructor(appPaths:any) { 
 
        const dbFilePath = appPaths.DB_PATH 
 
        //// Database initialization
        this.dbConn = new sqlite3.Database(dbFilePath, (err :any ) => {
            if (err) {
                
              return console.error(err.message);
            }
            
          });
     }

    public  static  getInstance(appPaths:any): DatabaseController {
        if (!DatabaseController.instance) {
            DatabaseController.instance = new DatabaseController(appPaths);
        }
        return DatabaseController.instance
    }


  
    public runQueryWithData(query:string, data:any):Promise<any>{
        

        return new Promise( (resolve, reject) =>{
 
            const formattedData:any = []
 
            Object.keys(data)
                    .sort()
                     .forEach(function(v, i) {
                        formattedData.push(data[v])
                      });
                      
            this.dbConn.run(query, formattedData, function(err:any) {
                if (err) {
                    

                    reject(err)
                
                }
                else{
                    
                    resolve("success")
                }
                 
              
              });
    
            })
 

    }

    public runQueryWithMultipleData(query:string, data:any[]){
        return new Promise((resolve, reject) => {

           
            let count =0;
            for (let i = 0; i < data.length; i++){
                const formattedData:any = []
                Object.keys(data[i])
                .sort()
                 .forEach(function(v, ji) {
                      
                          formattedData.push(data[i][v] )
                  });
              this.dbConn.all(query, formattedData, (err:any , rows:[]) => {
                if (err) {
                  if(err.errno==19){
                    reject("alreadyExists"+err)
                  }
                  reject(err)
                    
                }
                else{
                    resolve("success")
                }
              });
            
          }


 
             
        })
        

    }
    public runQuery(query:string){

        return new Promise( (resolve, reject) =>{
            let data : [] = [];

            this.dbConn.all(query, [],(err:any, rows:[] ) => {
                // process rows here  
                
                if (err){ reject(err); }
                else{
                    if(rows!= undefined){
                        rows.forEach((row) => { data.push(row); });
                        }   
                    }
                
                resolve( data);
                
            });
    
            })
 
    }

   


 


}

 

 