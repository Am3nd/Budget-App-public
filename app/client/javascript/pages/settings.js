

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

import "../../packages/bootstrap-js/bootstrap.bundle.js";
import "../../packages/DataTables/datatables.js";


 
import {loadTemplate, showModal, startSharedListeners} from "../config/shared-functions.js"

$(document).ready( function () {

 
  loadTemplate()
      .then(() =>{
        startSharedListeners()
        startLocalListeners()
        ipcRenderer.send('getUserDetails', "")
        setDeleteReady()
        setUpdateReady()

      })
    
  
    

     
    
  
    
    
} );
 
 

function startLocalListeners(){
  ipcRenderer.on("updateStatus", function(event, data){
    
    if(data.status =="success"){
      window.location.reload(); 
    }
    if(data.status =="deleteSuccess"){
      window.location.href = './manage-account.html' 
    }
  })
  ipcRenderer.on("userDetails", function(event, data){
    const fname = document.getElementById("fnameInput")
    const lname = document.getElementById("lnameInput")
    const email = document.getElementById("emailAddressInput")
    if(data !=null){

      fname.value = data.fname
      lname.value = data.lname
      email.value = data.email
    }
  
  })
   

}



function setUpdateReady(){

  const form = document.getElementById("updateForm")

  form.addEventListener("submit", (e) =>{
    e.preventDefault()
 
    const fname = document.getElementById("fnameInput").value
    const lname = document.getElementById("lnameInput").value
    const newPassword = document.getElementById("newPasswordInput").value
    const verifyNewPassword = document.getElementById("verifyNewPasswordInput").value 
    if(verifyNewPassword === newPassword && newPassword!=""){
      
      const userObject = {
        fname: fname,
        lname:lname,
        password:newPassword
      }
      ipcRenderer.send('updateUserAccount', userObject)

    }
    else if (newPassword=="") {
      
      const userObject = {
        fname: fname,
        lname:lname,
        password:""
      }
      ipcRenderer.send('updateUserAccount', userObject)
    }
    else{
      
    }
  })
}



function setDeleteReady(){

  const button = document.getElementById("deleteButton")

  button.addEventListener("click", (e) =>{
    e.preventDefault()
    showModal("warningDelete","")
     
  })
}