
import "../../packages/bootstrap-js/bootstrap.bundle.js";
const electron = window.require('electron');
const {ipcRenderer} = electron;

const loginForm = document.getElementById('loginForm');
const resetButton = document.getElementById("resetButton")


loginForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = document.getElementById('loginEmail').value
  const password = document.getElementById('loginPassword').value

  

  ipcRenderer.send('userLogin', {email:email, password:password})
  document.getElementById('loginEmail').value = "";
  document.getElementById('loginPassword').value = "";

}) 

ipcRenderer.on("emailResetStatus", function(event, data){
  
  if(data.result =="success"){
    const modalBody = document.getElementById("resetModalBody")
    modalBody.innerHTML=""
    const par = document.createElement("p")
    par.innerText="Please check your email for the reset password link"
    modalBody.appendChild(par)
    resetButton.style.display ="none"
  }
})

 
ipcRenderer.on("status", function(event, data){
  

  if(data.status =="passwordResetSuccess"){
    $('#forgotPasswordModal').modal('hide')
  }
})

ipcRenderer.on("loginStatus", function(event, data){
    if(data.status === "failed"){
      
      var myModal = new bootstrap.Modal(document.getElementById('loginModal'), {
        keyboard: false
      })
      myModal.toggle()
    }
    else{
      window.location.href = './pages/dashboard.html';

    }
  
  })

  window.addEventListener("mouseup", (e) => {
    if (e.button === 3 || e.button === 4)
       e.preventDefault();
 });

let forgotPassword = document.getElementById("forgotPasswordLink")

forgotPassword.addEventListener('click', e =>{
  e.preventDefault()
  var myModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'), {
    keyboard: false
  })
  myModal.toggle()
  resetButton.style.display ="block"

  const resetForm = document.getElementById("passwordResetForm")

  resetForm.addEventListener("submit", e=>{
    e.preventDefault()
    const email = document.getElementById("emailToReset").value
    ipcRenderer.send('forgotPassword', {email:email})

  })
})