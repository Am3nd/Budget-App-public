

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
export const transactions =[]
 
export const categories = []
export const accounts = []

export const userValues = {
    set:false,
    name:"",
    email:"",
    userId:"",
    budgetStatus:"success",
    setupMode:false
}

export function lockSystemIfInSetupMode(){
    if(userValues.setupMode){
    var sPath = window.location.pathname;
    var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);
    if(sPage != "manage-account.html"  ){
        window.location.href = './manage-account.html';
    }
    
    
    const sidenav = document.getElementById('sidenav')
    const topnav = document.getElementById('topnav')
     
        
        sidenav.addEventListener("click", (e)=>{
            
            e.preventDefault()
            showModal("selectAccountFirst", "")

        })
        topnav.addEventListener("click", (e)=>{
            
            // e.preventDefault()
            // showModal("selectAccountFirst", "")

        })
      showModal("selectAccountFirst", "")

    }

  
}
export function addUserInfo(){
    const userName = document.getElementById("userName")
    
    if(userValues.set){
         userName.innerText += userValues.name
    }
    else{
        
    }
   
}
export function updateBudgetStatus(){
    const budgetStatus = document.getElementById("budgetStatus")
    
    if(userValues.set){
        if(userValues.budgetStatus == "success"){
            budgetStatus.classList = "text-success"
            budgetStatus.innerText ="Passing"
        }
        else if(userValues.budgetStatus == "failing"){
            budgetStatus.classList = "text-warning"
            budgetStatus.innerText ="Failing"

        }
        else if(userValues.budgetStatus == "failed"){
            budgetStatus.classList = "text-danger"
            budgetStatus.innerText ="Failed"

        }
        else{
          budgetStatus.classList = ""
          budgetStatus.innerText =""

      }
    }
    else{
        
    }
   
}

export function showModal(type, bodyText, data=null){
    var button = document.createElement("BUTTON")
    var closeButton = document.createElement("BUTTON")
    button.classList = "btn btn-primary"
    closeButton.classList =" btn btn-secondary"
    closeButton.setAttribute("data-dismiss","modal")
   
  
   
    var myShowModal = new bootstrap.Modal(document.getElementById('myModal'), {
      keyboard: false
    })
    myShowModal.toggle()
  
    if(type =="importSuccess"){
      document.getElementById("modalTitle").innerText="Successful Import"
      document.getElementById("modalText").innerText= "You have successfully imported "+bodyText+" transactions"
      button.innerText="View Transactions"
      button.onclick = function(){ window.location.href = './transactions.html'; }
      document.getElementById("modalFooter").innerHTML =""
      document.getElementById("modalFooter").appendChild(button)
    }
  
    else if (type == "importFailed"){
      document.getElementById("modalTitle").innerText="Failed Import"
      document.getElementById("modalText").innerText= "Unable to import transactions from that file."
      closeButton.innerText ="close window"
      closeButton.onclick = function(){ myShowModal.toggle() }
      document.getElementById("modalFooter").innerHTML =""
      document.getElementById("modalFooter").appendChild(closeButton)
    }
    else if (type == "selectAccountFirst"){
        document.getElementById("modalTitle").innerText="No account selected."
        document.getElementById("modalText").innerHTML= "Please follow these steps below fully interact with this application<br>1) Create an account  <br>2) Select the account <br>3) Import transactions"
        closeButton.innerText ="close window"
        closeButton.onclick = function(){ myShowModal.toggle() }
        document.getElementById("modalFooter").innerHTML =""
        document.getElementById("modalFooter").appendChild(closeButton)
      } 
      else if (type == "warningDelete"){
        document.getElementById("modalTitle").innerText="Warning!"
        document.getElementById("modalText").innerHTML= `All Data will be deleted!! <span class="text-danger"><i class="bi bi-file-earmark-x"></i> </span>`
        button.innerText="Delete Everything"
        button.classList="btn btn-danger"
        button.onclick = function(){ ipcRenderer.send('deleteEverything', "") }
        closeButton.innerText ="close window"
        closeButton.onclick = function(){ myShowModal.toggle() }
        document.getElementById("modalFooter").innerHTML =""
         document.getElementById("modalFooter").appendChild(closeButton);
         document.getElementById("modalFooter").appendChild(button)
       
      }
      else if (type == "warningAreYouSure"){
        document.getElementById("modalTitle").innerText="Warning!"
        document.getElementById("modalText").innerHTML= `Are you sure? Please make sure before proceed!! <span class="text-danger"><i class="bi bi-file-earmark-x"></i> </span>`
        button.innerText=data[2]
        button.classList="btn btn-danger"
        button.onclick = function(){   ipcRenderer.send(data[0], data[1]); }
        closeButton.innerText ="close window"
        closeButton.onclick = function(){ myShowModal.toggle();  }
        document.getElementById("modalFooter").innerHTML =""
         document.getElementById("modalFooter").appendChild(closeButton);
         document.getElementById("modalFooter").appendChild(button)
       
      }

    
  
  }

export function startSharedListeners(){
  ipcRenderer.send('getBudgetSummaryData', "")

  window.addEventListener("mouseup", (e) => {
    if (e.button === 3 || e.button === 4)
       e.preventDefault();
 });
  /// start currency changer
  var currencyInput = document.querySelectorAll('input[type="currency"]')
 
 if(currencyInput != null){
    // format inital value
  // onBlur({target:currencyInput})
  
  // bind event listeners
  currencyInput.forEach(element => element.addEventListener('focus', onFocus))
  currencyInput.forEach(element => element.addEventListener('blur', onBlur))
 }
  ///

    ipcRenderer.send('pageLoad', "success")

    
    ipcRenderer.on("currentUser", function(event, data){
        
        userValues.set = true;
        userValues.name = data.name
        userValues.email = data.email
        userValues.userId = data.userId
        userValues.budgetStatus = data.budgetStatus
        userValues.setupMode = data.setupMode
        addUserInfo()
        updateBudgetStatus()
        lockSystemIfInSetupMode()
    })
    ipcRenderer.on("eventChange", function(event, status){
        
        if(status == "success"){
            window.location.reload();
          }
    })

    ipcRenderer.on("transactions", function(event, data){
    
        const txnTable = $('#transactionsTable').DataTable({
            iDisplayLength: 5,
            order: [4, 'desc'],

            // select: true,
            columns:[
              {data:"accountName", title:"Account"},
              {data:"description", title:"Description"},
              {data:"category", title:"Category"},
              {data:"amount", title:"Amount"},
              {data:"date", title:"Date", type:"date"},
              {data:null, defaultContent:"", title:"Edit"}
            ],
            "createdRow": function ( row, data, index ) {
               var editButton = document.createElement("a")
                editButton.classList="btn bi-pencil-square" 
                $(editButton).click(function(){editTransaction(data.txnID)})
                
                $('td', row).eq(5).append(editButton);
              
              if ( !data.cleared ) {
                  $('td', row).eq(2).addClass('highlight');
                  
              }
            }
          });
        if(data !=null){
             
            data.forEach(element => {
                element.amount= "$"+element.amount
                const dateVal = new Date(Number.parseInt(element.date)); 
                element.date = (dateVal.getMonth()+1)+"/"+dateVal.getDate()+"/"+dateVal.getFullYear()
             });
          transactions.push(...data)
          txnTable.rows.add(data).draw()
           
        }
         
      })

      ipcRenderer.on("categories", function(event, data){
    
        
        categories.push(...data)
    
      })
       
      ipcRenderer.on("updateStatus", function(event, data){
        
        if(data.status =="success"){
          if(!window.location.href.includes("manage-account")){
            window.location.reload(); 

          }
        }
        if(data.status =="logUserOut"){
          
          window.location.href = '../login.html';

        }
      })

      ipcRenderer.on("budgetSummaryData", function(event, data){
    
        if(data.status =="success"){
          
          const budgetRemaining = document.getElementById("budgetRemaining")
          if(budgetRemaining){
            document.getElementById("budgetRemaining").innerText = data.result.remaining=="0"? "$0.00":"$"+Number(data.result.remaining).toFixed(2);

          }
          
          if(Number(data.result.budget)==null || Number(data.result.budget)==0){
            userValues.budgetStatus =""
         }
          else if(Number(data.result.remaining)>(Number(data.result.budget)*0.10)){
             userValues.budgetStatus ="success"
          }
          else if(Number(data.result.remaining)>0){
            userValues.budgetStatus ="failing"
            

          }
          else{
            userValues.budgetStatus ="failed"

          }
          updateBudgetStatus()
          

            
        }
         
      })
     
}


export function loadTemplate(){
    return new Promise((resolve, reject) => {
        fetch('../templates/template.html')
            .then(function(response) {

                return response.text()
            })
            .then(function(html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, "text/html");

                document.getElementById("sidenav").replaceWith (  doc.getElementById("sidenavTemplate").content)
                document.getElementById("topnav").replaceWith (  doc.getElementById("topnavTemplate").content)
                document.getElementById("modalTemplate").replaceWith (  doc.getElementById("modalsTemplate").content)
                
              resolve()
            })
            .catch(function(err) {  
                
                ipcRenderer.send("clientError", "Unable to load Templates")
                reject()
            });        
    })
    

    
}

export function addCurrentMonthAndYear(elementID){
    const date = new Date()
    const element = document.getElementById(elementID)

    element.innerText = date.toLocaleString('default', { month: 'long' })+", "+date.getFullYear()
}

function editTransaction(txnID){
    
    let defaultSelect = document.createElement("option");
    defaultSelect.value = ""
    defaultSelect.innerText = "Please select an option"
    defaultSelect.disabled=true
    
  
    const txn = transactions.find((e)=> e.txnID == txnID)
     
    
    document.getElementById("transactionID").value = txnID
    document.getElementById("editAccount").value = txn.accountName
    document.getElementById("editDescription").value = txn.description
    document.getElementById("editAmount").value = txn.amount
    document.getElementById("editDate").value = txn.date
 
    const selectCategories = document.getElementById("editCategory")
    selectCategories.replaceChildren()
    selectCategories.appendChild(defaultSelect.cloneNode(true))

    categories.forEach( each =>{
      let option = document.createElement("option");
      option.value = each.name 
      option.innerText = each.name
      selectCategories.appendChild(option)
    })
    selectCategories.value=""

  
   
    var myModal = new bootstrap.Modal(document.getElementById('editTransactionsModal'), {
      keyboard: false
    })
    myModal.toggle()
 
    const deleteButton = document.getElementById("deleteTransactionButton")
    const form = document.getElementById("editTransactionForm")
   
    form.addEventListener("submit", (e) =>{
      e.preventDefault()
 
      
      const editTransaction = {
        txnID: txn.txnID,
        category: selectCategories.value
      }
 
      ipcRenderer.send('editTransactionCategory', editTransaction)
     })

     deleteButton.addEventListener("click", (e)=>{
      e.preventDefault()
      
      myModal.toggle()
      showModal("warningAreYouSure","", [
        "deleteSingleTransaction",
        {txnID:txnID},
        "Delete Transaction"
      ])
  
     })
     
     
  }


  
 

const currency = 'USD' // https://www.currency-iso.org/dam/downloads/lists/list_one.xml

function localStringToNumber( s ){
  return Number(String(s).replace(/[^0-9.-]+/g,""))
}

function onFocus(e){
  

  var value = e.target.value;
  e.target.value = value ? localStringToNumber(value) : ''
}

function onBlur(e){
  
  var value = e.target.value

  var options = {
      maximumFractionDigits : 2,
      currency              : currency,
      style                 : "currency",
      currencyDisplay       : "symbol"
  }
  
  e.target.value = (value || value === 0) 
    ? localStringToNumber(value).toLocaleString(undefined, options)
    : ''
}