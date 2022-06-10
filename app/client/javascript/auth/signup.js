import "../../packages/bootstrap-js/bootstrap.bundle.js";
const electron = window.require('electron');
const {ipcRenderer} = electron;

const signupForm = document.getElementById('signupForm');
 
signupForm.addEventListener('submit', (e)=>{
  
  e.preventDefault();
  if(! checkPasswordMatch()){
      return;
  }
  const email = document.getElementById('signupEmail').value
  const password = document.getElementById('signupPassword').value
  const fname = document.getElementById('fname').value;
  const lname =document.getElementById('lname').value


 

  ipcRenderer.send('userSignup', {email:email, password:password, fname:fname, lname:lname })
  document.getElementById('signupEmail').value = "";
  document.getElementById('signupPassword').value = "";
  document.getElementById('signupPasswordVerify').value = "";
  document.getElementById('fname').value = "";
  document.getElementById('lname').value = "";

}) 


ipcRenderer.on("signupStatus", function(event, data){
    if(data.status === "failed"){
      
      const warningMessage = document.getElementById('warningMessage')
      
      var myModal = new bootstrap.Modal(document.getElementById('errorModal'), {
        keyboard: false
      })
  
      myModal.toggle()

      if(data.code =="auth/invalid-email"){
        warningMessage.innerHTML ="Invalid Email Entered! <br> Please verify that the email follows this pattern: John.Smith@XXXX.com"
      }
      else if(data.code =="auth/email-already-in-use"){
        warningMessage.innerHTML ="<p>The email is already registered!  </p>  <p>Please login or use a different one.</p>"
      }
      else{
        warningMessage.innerHTML ="<p>There is has been an error please trying signing up with valid information.</p>"

      }
       
    }
    else{
        
        var myModal = new bootstrap.Modal(document.getElementById('signUpModal'), {
          keyboard: false
        })
        myModal.toggle()
        const loginButton = document.getElementById("loginButton")
        loginButton.addEventListener('click', e =>{
          e.preventDefault()
          window.location.href = './login.html';
        })


    }
  
  })

  function checkPasswordMatch(){
      const password = document.getElementById('signupPassword').value
      const passwordVerify = document.getElementById('signupPasswordVerify').value
      const warningLabel = document.getElementById("warningLabel")
      const passwordMatch = password === passwordVerify;

      document.getElementById('signupPassword').addEventListener("keypress", e=>{
   
        warningLabel.hidden = true;
      })

      if(!passwordMatch){
          warningLabel.innerText= "Passwords do not match!";  
          warningLabel.hidden = false;
          return false;
      }
 
      
       
      if (password.length < 6) {
        

         warningLabel.innerText= "Your password must be at least 6 characters"; 
        warningLabel.hidden = false;

        
        return false;
      }
      if (password.search(/[a-z]/i) < 0) {
        warningLabel.innerText= "Your password must contain at least one letter."; 
        warningLabel.hidden = false;
        return false;

       }
      if (password.search(/[0-9]/) < 0) {
           warningLabel.innerText= "Your password must contain at least one digit."; 
           warningLabel.hidden = false;
           return false;
      }
 

     
 
       // passwordVerify.addEventListener()/// remove warning if match
      return passwordMatch;
  }

 