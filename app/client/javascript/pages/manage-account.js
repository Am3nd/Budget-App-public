



const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

import "../../packages/bootstrap-js/bootstrap.bundle.js";
import "../../packages/DataTables/datatables.js";


 
import {loadTemplate, lockSystemIfInSetupMode, startSharedListeners, showModal} from "../config/shared-functions.js"

const accountsList = []
const selectedAccount = {
  selected:false,
  accountID:"",
  accountName:""
}
$(document).ready( function () {
    
  loadTemplate()
  .then(() =>{
    startSharedListeners()
    startLocalListeners()
 
    
    ipcRenderer.send('getAccountData', "transactions")

       

  }) // End of Load Template

});
 
function editAccount(accountID){
  
  
//  const totalBudget = document.getElementById("editBudgetTotal")
//  const remainingTotal = document.getElementById("editRemaining")
//  totalBudget.addEventListener('blur', (e)=>{
//   const totalBalance = document.getElementById("editBudgetTotal").value
//   const actualBalance = document.getElementById("editActual").value
//   const remainValue = Number(totalBalance.replaceAll("$","").replaceAll(",","")) -Number(actualBalance.replaceAll("$","").replaceAll(",",""))  
//   remainingTotal.value = "$"+remainValue.toFixed(2)
//   })


  const selectedAccount = accountsList.find((e)=> e.accountID == accountID)
   
  
  document.getElementById("editAccount").value = selectedAccount.account
  document.getElementById("editAccountName").value = selectedAccount.name
  document.getElementById("editAccountType").value = selectedAccount.type
  document.getElementById("editAccountBalance").value = selectedAccount.balance

   
  var myModal = new bootstrap.Modal(document.getElementById('editAccountModal'), {
    keyboard: false
  })
  myModal.toggle()

  const form = document.getElementById("editAccountForm")
  const deleteButton = document.getElementById("deleteAccount")
  
  form.addEventListener("submit", (e) =>{
    e.preventDefault()
    const newBalance = document.getElementById("editAccountBalance").value
    
    const editAccount = {
      accountID: accountID,
      newBalance: newBalance.replaceAll("$","").replaceAll(",",""),
     }

    
    ipcRenderer.send('editAccountBalance', editAccount)
   })
   
   deleteButton.addEventListener("click", (e)=>{
    e.preventDefault()
    
    myModal.toggle()
    showModal("warningAreYouSure","", [
      "deleteSingleAccount",
      {accountID:accountID},
      "Delete Account"
    ])

   })
   
}

function startLocalListeners(){
  const addNewAccountButton = document.getElementById("addNewAccount")

  ipcRenderer.on("editAccountStatus", function(event, data){
    
    if(data.status =="success"){
      
        window.location.reload(); 
 
    }
 
  })
  ipcRenderer.on("accounts", function(event, data){
    const accountsTable = $('#accountsTable').DataTable({
   
      lengthChange: false,
      order: [1],
      columnDefs: [ { 
        className: 'select-checkbox',
        targets:   1
    } ],
    select: {
        style:    'os',
        selector: 'td'
    },
      columns:[
        
         {data:"accountID",visible:false },
         { name:"a", title:"Select", defaultContent:""},
         
       
        {data:"account", title:"Account", defaultContent:""},
        {data:"name", title:"Name"},
        {data:"type", title:"Type"},
        {data:"last_updated", title:"Last Updated"},
        {data:"balance", title:"Balance"}, 
        {data:null, defaultContent:"", title:"Edit"} 
      ],
      "createdRow": function ( row, data, index ) {
         var editButton = document.createElement("a")
          editButton.classList="btn bi-pencil-square" 
          $(editButton).click(function(){editAccount(data.accountID)})
          
          $('td', row).eq(6).append(editButton);
    

          
        
      }
    });

    accountsTable
    .on( 'deselect', function ( e, dt, type, indexes ) {
       
      var data = accountsTable.rows( indexes ).data()  ;
      selectedAccount.selected = false;
      selectedAccount.accountID = ""

    } );

    accountsTable
    .on( 'select', function ( e, dt, type, indexes ) {
       
      var data = accountsTable.rows( indexes ).data()  ;
      selectedAccount.selected = true;
      selectedAccount.accountID = data[0].accountID
      selectedAccount.accountName = data[0].name

    } );
     
    if(data !=null){
      
      data.forEach(element => {
        element.balance= "$"+element.balance
       
     });
     accountsList.push(...data)

      accountsTable.rows.add(data).draw()
    }
     
  })

  ipcRenderer.on("importTransactionsResult", function(event, data){
    if(data.status == "success"){
      showModal("importSuccess", data.results)

     
  
    }
    else{ 
      
      showModal("importFailed", data.results)
     }

    
  
   
  
  
  })
  const importFileButton = document.getElementById('importTransactionsFile');
  importFileButton.addEventListener('click', (e) =>{
    e.preventDefault();
    importTransactions()
  })


  addNewAccountButton.addEventListener("click", (e)=>{
    e.preventDefault()
    addNewAccount()
  })

}

function importTransactions(){
 
   
  if(selectedAccount.selected){
    
    ipcRenderer.send('importTransactions', selectedAccount)
  }
  else{
    showModal("selectAccountFirst", "")

  }
}


function addNewAccount(){
  

 

  var myModal = new bootstrap.Modal(document.getElementById('addNewAccountModal'), {
   keyboard: false
 })
 myModal.toggle()



 const form = document.getElementById("newAccountForm")

 form.addEventListener("submit", (e) =>{
   e.preventDefault()
   const accountNumber = document.getElementById("newAccount").value
   const accountName = document.getElementById("newName").value
   const accountType = document.getElementById("newType").value
   const accountAmount = document.getElementById("newBalance").value


   

   const d = new Date()

   const newAccount = {
    account:"********"+accountNumber,
    name:accountName,
    type:accountType,
    last_updated: d.getMonth()+"/"+ d.getDate()+"/"+d.getFullYear(),
    balance:accountAmount.replaceAll("$","").replaceAll(",","")
   }
   
   ipcRenderer.send('addNewAccount', newAccount)
  })
}