import { app } from "electron";
import path from 'path';
import { current_env } from "../main";

/*  Here we store all the paths to major files in order
    to support any changes down the path
*/

export const PATHS  =   {
    DB_PATH:   path.join(app.getAppPath(), "..","source","extraResources","user.db"),
    CLIENT_SOURCE: path.join(app.getAppPath(), "..","..","client","HTML","login.html") ,
    CLIENT_INDEX: path.join(app.getAppPath(), "..","..","client","HTML","pages","dashboard.html"),
    LOG_CONFIGURATIONS:path.join(__dirname,"..","..","source","configurations","LogConfigurations.json")
    
}

export const PROD_PATHS = {
    DB_PATH:   path.join(app.getAppPath(), "..","extraResources","user.db"),
    CLIENT_SOURCE: path.join(app.getAppPath(),"app", "client","HTML","login.html") ,
    CLIENT_INDEX: path.join(app.getAppPath(), "app" ,"client","HTML","pages","dashboard.html"),
    LOG_CONFIGURATIONS:path.join(app.getAppPath(), "app" ,"server","generated","configurations","LogConfigurations.json")
    
};

