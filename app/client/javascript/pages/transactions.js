

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

import "../../packages/bootstrap-js/bootstrap.bundle.js";
import "../../packages/DataTables/datatables.js";

 
import {loadTemplate, startSharedListeners,addCurrentMonthAndYear, transactions, categories, accounts} from "../config/shared-functions.js"

 
 
$(document).ready( function () {

  
  loadTemplate()
      .then(() =>{
        startSharedListeners()
        startLocalListeners()
        ipcRenderer.send('getTransactions', "transactions")
        ipcRenderer.send('getCategories', "categories")
        ipcRenderer.send('getAccountData', "accounts")
        ipcRenderer.send('getMonthlyTotal', 0)
        addCurrentMonthAndYear("currentMonthAndYear")

      })
    
  
    

     
    
  
    
    
} );
 
 

function startLocalListeners(){
  const addTransactionButton = document.getElementById("addNewTransaction")

 
 

  

  ipcRenderer.on("monthlyTransactions", function(event, data){
    
    if(data.status == "success" && data.month ==0){
      displayCurrentMonthTotal(data.result)
    }
     
  })

  

  ipcRenderer.on("accounts", function(event, data){
    
    
    accounts.push(...data)

  })
  ipcRenderer.on("editTransactionCategoryStatus", function(event, status){
    
    if(status == "success"){
      window.location.reload();

    }

  })

   addTransactionButton.addEventListener("click", (e)=>{
     e.preventDefault()
     addNewTransaction()
   })

}


 function displayCurrentMonthTotal(data){
  // 
  let numberofTxns = 0;
  let numberOfClearedTxn = 0;
  let numberOfPendingTxn =0;
  let clearedTXNTotal = 0
  let pendingTXNTotal = 0
  
  let monthlyTotal = data.reduce((sum, element)=>{
    const amount = element.amount
    if(element.cleared){
      numberofTxns++
      numberOfClearedTxn++
      clearedTXNTotal+=Number(amount.replace(/[^0-9.-]+/g,""))
    }
   
    return sum+  Number(amount.replace(/[^0-9.-]+/g,""));
  },0)
  pendingTXNTotal = monthlyTotal-clearedTXNTotal

  monthlyTotal = Math.round((monthlyTotal + Number.EPSILON) * 100) / 100
  clearedTXNTotal = Math.round((clearedTXNTotal + Number.EPSILON) * 100) / 100
  pendingTXNTotal = Math.round((pendingTXNTotal + Number.EPSILON) * 100) / 100

  numberOfPendingTxn = data.length - numberOfClearedTxn;

  document.getElementById('clearedAmount').innerText = "$"+clearedTXNTotal
  document.getElementById('clearedTXN').innerText = numberOfClearedTxn

  document.getElementById('pendingAmount').innerText = "$"+pendingTXNTotal
  document.getElementById('pendingTXN').innerText = numberOfPendingTxn

  document.getElementById('totalAmount').innerText = "$"+monthlyTotal
  document.getElementById('totalNumberOfTXN').innerText = data.length

  if(numberOfPendingTxn == 0){
    document.getElementById("totalTransactionsRow").classList = "row text-success"
  }
  else{
    document.getElementById("totalTransactionsRow").classList = "text-warning"

  }


 }


 

 function addNewTransaction(){
   
  let defaultSelect = document.createElement("option");
   defaultSelect.value = ""
   defaultSelect.innerText = "Please select an option"
   defaultSelect.disabled=true;
    

   const selectCategories = document.getElementById("newCategory")
 
   selectCategories.replaceChildren()
   selectCategories.appendChild(defaultSelect.cloneNode(true))

   
   categories.forEach( each =>{
     let option = document.createElement("option");
     option.value = each.name 
     option.innerText = each.name
     selectCategories.appendChild(option)
   })
   selectCategories.value="" 

   const selectAccounts = document.getElementById("newAccount")
 
   selectAccounts.replaceChildren()
   selectAccounts.appendChild(defaultSelect.cloneNode(true))

   accounts.forEach( each =>{
     let option = document.createElement("option");
     option.value = each.accountID 
     option.innerText = each.name+" | "+each.account
     selectAccounts.appendChild(option)
   })
   selectAccounts.value=""

   var myModal = new bootstrap.Modal(document.getElementById('addNewTransactionModal'), {
    keyboard: false
  })
  myModal.toggle()


 
  const form = document.getElementById("newTransactionForm")

  form.addEventListener("submit", (e) =>{
    e.preventDefault()
    const accountID = document.getElementById("newAccount").value
    const description = document.getElementById("newDescription").value
    const category = document.getElementById("newCategory").value
    const amount = document.getElementById("newAmount").value
    const date = $("#newDate").val()
    const dateString =date.substring(5,7)+"/"+date.substring(8,10)+"/"+date.substring(0,4)
    const formattedDate = new Date(dateString).getTime()+""

    
    
    const accountElement = accounts.find((e)=> e.accountID == accountID)

    const newTransaction = {
      description:description,
      category:category,
      amount: amount.replaceAll("$","").replaceAll(",",""),
      date:formattedDate,
      accountID:accountID,
      accountName:accountElement.name,
      cleared:true,
      recurring:false
    }
    
    ipcRenderer.send('addNewTransaction', newTransaction)
   })
 }