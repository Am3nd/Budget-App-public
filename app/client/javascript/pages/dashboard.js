

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

import "../../packages/bootstrap-js/bootstrap.bundle.js";
import "../../packages/DataTables/datatables.js";


 
import {loadTemplate, startSharedListeners,addCurrentMonthAndYear, transactions} from "../config/shared-functions.js"

$(document).ready( function () {

 
  loadTemplate()
      .then(() =>{
        startSharedListeners()
        startLocalListeners()
         ipcRenderer.send('getSpendingOverview', "")
         addCurrentMonthAndYear("currentMonthAndYear")
         ipcRenderer.send('getMonthlyTotal', 0)
         ipcRenderer.send('getDashboardTransactions', "transactions")
         ipcRenderer.send('getBudgetSummaryData', "")


      })
    
  
    

     
    
  
    
    
} );
 
 

function startLocalListeners(){

  
  ipcRenderer.on("receiveSpendingOverviewData", function(event, data){
    

    
    displaySpendingPieChart(data)
    displayDashboardHistory(data)
     
  })

  ipcRenderer.on("0month", function(event, data){
    
    if(data !=null){
      displayCurrentMonthTotal(data)
    }
     
  })

  ipcRenderer.on("dashboardTransactions", function(event, data){
    
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
         ] 
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

 


}

function displayCurrentMonthTotal(data){

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


}
function displayDashboardHistory(categoryData){
   let currentSpendingSum = 0;

  
  const labelVals = []
  const dataVals = []
  categoryData.forEach(element => {
    if(element.actual>0){
      labelVals.push(element.category)
        dataVals.push(element.actual)
        currentSpendingSum+=element.actual 
    }
    
  });
  document.getElementById("currentSpend").innerText = "$"+Number(currentSpendingSum).toFixed(2)

 
  
  const data = {
    labels: labelVals,
    datasets: [{
      label: 'My First dataset',
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)',
        "green",
        "purple",
        "brown",
        "gray",
        "red"
      ],
      data: dataVals,
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      plugins:{
        legend:{
          position:"right",
          align:"start",
          display:false
        }
      } 
    }
  };

  const myChart = new Chart(
    document.getElementById('historyBar'),
    config
  );

}

function displaySpendingPieChart(spendingData){
  const labelVals = []
  const dataVals = []
  spendingData.forEach(element => {
    labelVals.push(element.category)
    dataVals.push(element.actual)
  });

  
  const data = {
    labels: labelVals,
    datasets: [{
      label: 'My First dataset',
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)',
        "green",
        "purple",
        "brown",
        "gray",
        "red"
      ],
      data: dataVals,
    }]
  };

  const config = {
    type: 'pie',
    data: data,
    options: {
      plugins:{
        legend:{
          position:"bottom",
          align:"start", 
        },
        
      
      } 
    }
  };

  const myChart = new Chart(
    document.getElementById('myChart'),
    config
  );

}