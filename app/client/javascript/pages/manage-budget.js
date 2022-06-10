

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

import "../../packages/bootstrap-js/bootstrap.bundle.js";
import "../../packages/DataTables/datatables.js";


 
import {loadTemplate, startSharedListeners,addCurrentMonthAndYear,showModal} from "../config/shared-functions.js"

 
const categories = []
const budgetsList = []
const accounts = []

$(document).ready( function () {

 
  loadTemplate()
      .then(() =>{
        startSharedListeners()
        startLocalListeners()
 
         addCurrentMonthAndYear("currentMonthAndYear")
         ipcRenderer.send('getCategories', "categories")
         ipcRenderer.send('getBudgetData', "")
 
     


      })
    
  
    

     
    
  
    
    
} );
 
 

function startLocalListeners(){
  const addBudgetButton = document.getElementById("addNewBudget")
  const addCategorytButton = document.getElementById("addNewCategory")

  addBudgetButton.addEventListener("click", (e)=>{
    e.preventDefault()
    addNewBudget()
  }) 
  addCategorytButton.addEventListener("click", (e)=>{
    e.preventDefault()
    addNewCategory()
  }) 

  


    ipcRenderer.on("categories", function(event, data){
    
        
        categories.push(...data)
    
    
      })

  
  ipcRenderer.on("budgetData", function(event, data){
    
    if(data.status =="success"){
      
      displayBudgetData(data.result)
      budgetsList.push(...data.result)

    }
     
  })

  ipcRenderer.on("budgetSummaryData", function(event, data){
    
    if(data.status =="success"){
      
       
      displayBudgetSummary(data.result)
    }
     
  })


}

function displayBudgetSummary(data){

   document.getElementById("totalBudget").innerText = "$"+Number(data.budget).toFixed(2)
   document.getElementById("actualBudget").innerText =  "$"+Number(data.actual).toFixed(2)
   document.getElementById("remainingBudget").innerText = "$"+Number(data.remaining).toFixed(2)


}
 
function displayBudgetData(budgetData){
    const budgetTable = $('#budgetTable').DataTable({
        iDisplayLength: 5,
        // select: true,
        columns:[
          {data:"categoryName", title:"Category"},
          {data:"totalBalance",defaultContent:"", title:"Budget"},
          {data:"actualBalance", defaultContent:"",title:"Actual"},
          {data:"remainingBalance",defaultContent:"", title:"Remaining"},
          {data:null, defaultContent:"", title:"Edit"}
        ],
        "createdRow": function ( row, data, index ) {
           var editButton = document.createElement("a")
            editButton.classList="btn bi-pencil-square" 
            $(editButton).click(function(){editBudget(data.budgetID)})
            
            $('td', row).eq(4).append(editButton);
      

            
          
        }
      });
    if(budgetData !=null){
         
        budgetData.forEach(element => {
            element.totalBalance= "$"+Number(element.totalBalance).toFixed(2)
            element.actualBalance= "$"+Number(element.actualBalance).toFixed(2)
            element.remainingBalance= "$"+Number(element.remainingBalance).toFixed(2)
        });
    //   transactions.push(...budgetData)
    
    budgetTable.rows.add(budgetData).draw()
    }
}

function editBudget(budgetID){
  
  
 const totalBudget = document.getElementById("editBudgetTotal")
 const remainingTotal = document.getElementById("editRemaining")
 totalBudget.addEventListener('blur', (e)=>{
  const totalBalance = document.getElementById("editBudgetTotal").value
  const actualBalance = document.getElementById("editActual").value
  const remainValue = Number(totalBalance.replaceAll("$","").replaceAll(",","")) -Number(actualBalance.replaceAll("$","").replaceAll(",",""))  
  remainingTotal.value = "$"+remainValue.toFixed(2)
  })


  const budget = budgetsList.find((e)=> e.budgetID == budgetID)
   
  
  document.getElementById("editBudgetCategory").value = budget.categoryName
  document.getElementById("editBudgetTotal").value = budget.totalBalance
  document.getElementById("editActual").value = budget.actualBalance
  document.getElementById("editRemaining").value = budget.remainingBalance

   
  var myModal = new bootstrap.Modal(document.getElementById('editBudgetModal'), {
    keyboard: false
  })
  myModal.toggle()

  const form = document.getElementById("editBudgetForm")
  const deleteButton = document.getElementById("deleteBudget")
  
  form.addEventListener("submit", (e) =>{
    e.preventDefault()
    const totalBalance = document.getElementById("editBudgetTotal").value
    const remainingBalance = document.getElementById("editRemaining").value
    
    const editBudget = {
      budgetID: budgetID,
      totalBalance: totalBalance.replaceAll("$","").replaceAll(",",""),
      remainingBalance:remainingBalance.replaceAll("$","").replaceAll(",","")
    }

    
    ipcRenderer.send('editBudgetTotal', editBudget)
   })
   
   deleteButton.addEventListener("click", (e)=>{
    e.preventDefault()
    
    myModal.toggle()
    showModal("warningAreYouSure","", [
      "deleteSingleBudget",
      {budgetID:budgetID},
      "Delete Budget"
    ])

   })
   
}

 
 function addNewBudget(){
   

   const selectCategories = document.getElementById("newBudgetCategory")
   let defaultSelect = document.createElement("option");
   defaultSelect.value = ""
   defaultSelect.innerText = "Please select an option"
   selectCategories.replaceChildren()
   selectCategories.appendChild(defaultSelect)
   categories.forEach( each =>{
     let option = document.createElement("option");
     option.value = each.categoryID 
     option.innerText = each.name
     selectCategories.appendChild(option)
   })

 


   var myModal = new bootstrap.Modal(document.getElementById('addNewBudgetModal'), {
    keyboard: false
  })
  myModal.toggle()


 
  const form = document.getElementById("newBudgetForm")

  form.addEventListener("submit", (e) =>{
    e.preventDefault() 
    const categoryID = document.getElementById("newBudgetCategory").value
    const newBudgetTotal = document.getElementById("newBudgetTotal").value
 
    const newBudget = { 
      categoryID:categoryID,
      totalBalance:newBudgetTotal.replaceAll("$","").replaceAll(",","")
     
    }
    
    ipcRenderer.send('addNewBudget', newBudget)
   })
 }
 function addNewCategory(){
   
 
   var myModal = new bootstrap.Modal(document.getElementById('addNewCategoryModal'), {
    keyboard: false
  })
  myModal.toggle()


 
  const form = document.getElementById("newCategoryForm")

  form.addEventListener("submit", (e) =>{
    e.preventDefault() 
    const categoryName = document.getElementById("newCategoryName").value
    
 
    const newCategory = { 
      categoryName:categoryName 
    }
    
    ipcRenderer.send('addNewCategory', newCategory)
   })
 }