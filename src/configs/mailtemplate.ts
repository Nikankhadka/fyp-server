import { mailBody } from "../interfaces/mail"
import * as dotenv from "dotenv"
dotenv.config()


//create function which takes basic information and returns mail template 
export const signupMailTemplate=(userName:string,userEmail:string):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"New User Signup/Registration",
        text:"",
        html:`<html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    line-height: 1.5;
                    background-color: #f5f5f5;
                }
        
                h1 {
                    color: #4CAF50;
                    font-size: 32px;
                    margin-top: 0;
                }
        
                h3 {
                    color: #444;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
        
                p {
                    color: #555;
                    font-size: 18px;
                    margin-top: 0;
                }
        
                a {
                    color: #fff;
                    background-color: #4CAF50;
                    padding: 10px 20px;
                    border-radius: 5px;
                    text-decoration: none;
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to MeroGahr 👋 ${userName}</h1>
            <h3>We are excited to have you with us in your journey of renting and renting out property</h3>
            <p>If you have not verified yourself by filling KYC form, here it is:</p>
            <br>
            <a href="http://localhost:3000/kyc">KYC Form</a>
        </body>
        </html>
         `
    }
}


export const postEmailTemplate=(userEmail:string,token:string,):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"Verify Email Request",
        text:"",
        html:` <p>Verify Email by Clicking the link Given below.....</p>
        <a href="http://localhost:2900/user/v1/verifyEmail/${token}" >verify Email</a>
         `
    }
}


export const forgotPasswordTemplate=(userEmail:string,token:string,):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"forgot password/Change Password Request",
        text:"",
        html:` <p>Verify Email by Clicking the link Given below.....</p>
        <a href="http://localhost:2900/auth/v1/forgotPasswordPatch/${token}" >verify Email to Genrate New Password</a>
         `
    }
}

export const forgotPasswordPatchTemplate=(userEmail:string,password:string,):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"forgot Password/New Password",
        text:"",
        html:` <p>This is the new Password given below.....</p>
            <h1>${password} </h1>
         `
    }
}



export const verifyEmailTemplate=(userName:string,userEmail:string):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"Email Verification",
        text:"",
        html:`<h1> Email has been Sucessfully Verified  👋 ${userName}</h1>
        <h3>We are excited to have You with us in your Journey of renting and Renting out property </h3>
        <p>if u have not Verified Yourself by filling kyc form here it is ... </P>
        <br>
        <a href="http://localhost:3000/user/v1/kycVerification">Kyc Form </a>
         `
    }
}


export const verifyKycTemplate=(userName:string,userEmail:string,state:boolean,message?:string):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"Kyc Verification",
        text:"",
        html:state?`<h1> Kyc Successfully Verified 👋 ${userName}</h1>
        <h3>We are excited to have You with us in your Journey of renting and Renting out property </h3>
        <a href="http://localhost:3000/Home">Rent With Us</a>
         `:

        `<h1> Kyc Verification Failed  ${userName}</h1>
        <h3>Please Provide Proper kycinformation!!</h3>
        <h2>${message}</h2>
        <a href="http://localhost:3000/Home">Rent With Us</a>
         `
    }
}


export const banUnbanUserTemplate=(userName:string,userEmail:string,state:boolean,message?:string):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"Ban Activity",
        text:"",
        html:state?`<h1> U Have Been Banned</h1>
        <h3>due to some reasons such as  ${message} u have been banned ur properties posting has also been banned </h3>
        
         `:

        `<h1> U Have Been unBanned</h1>
        <h3>Hope U dont do the same mistakes again </h3>
         `
    }
}

export const banUnbanPropTemplate=(userName:string,userEmail:string,state:boolean,propId:string,img?:string,message?:string):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"Ban Activity",
        text:"",
        html:state?`<h1> Your Property Has been banned ${userName}</h1>
        <h2>${propId}</h2>
        <img src=${img} />
        <h3>due to misconduct${message} can only be unbanned by admin </h3>
      
         `:

         `<h1> Your Property Has been unbanned ${userName}</h1>
         <h2>${propId}</h2>
         <img src=${img} />
         <h3>do not repeat the same mistakes again </h3>
          `
    }
}









export const userPropTemplate=(userName:string,userEmail:string,state:boolean,propId:string,img?:string):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"Property Post/Delete Verification",
        text:"",
        html:state?`<h1> property Posted/updated Successfully! 👋 ${userName}</h1>
        <h2>${propId}</h2>
        <img src=${img} />
        <h3>Property Has been Posted/updated and send for further Verification/ you will be notified after it has been verified </h3>
      
         `:

         `<h1> property deleted Successfully! 👋 ${userName}</h1>
         <h2>${propId}</h2>
         <h3>Property Has been deleted thankYour for providing service</h3>
         <a href="http://localhost:3000/Home">Rent With Us</a>
          `
    }
}



export const adminPropTemplate=(userName:string,userEmail:string,state:boolean,propId:string,img?:string,message?:string):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"property Verification",
        text:"",
        html:state?`<h1> property Verified Successfully! 👋 ${userName}</h1>
        <h2>${propId}</h2>
        <img src=${img} />
        <h3>Property Has been verified now u can host property </h3>
      
         `:

         `<h1> property not Verified/Rejected ${userName}</h1>
         <h2>${propId}</h2>
         <img src=${img} />
         <h3>${message}</h3>
         <a href="http://localhost:3000/Home/listProperty">Rent With Us</a>
          `
    }
}

export const userBookingTemplate=(userName:string,userEmail:string,propId:string,bill:string,state:boolean,img?:string):mailBody=>{
    return {
        to:userEmail,
        from:"nikantest@zohomail.com",
        subject:"Property Hosted/booked",
        text:"",
        attachments: [
            {
              filename: 'bill.pdf',
              content: bill.split('base64,')[1], // Extract the base64-encoded PDF data
              encoding: 'base64'
            }
          ],
          html:state?`<h1> property Booked  Successfully!</h1>
          <h2>${propId}</h2>
          <img src="${img}" width="500" height="300" />

          <h3>Property Has been verified and Booked Your Bill is attched  </h3>
          <h4>Enjoy Your Stay!!! </h4>
      
       
      
         `:

         `<h1> property Booked  Successfully! by ${userName}</h1>
         <h2>'property Title:' ${propId}</h2>
         <img src=${img} />
         <h3>user Has been verified and Booked Your Bill is attched  </h3>
         <h4>Enjoy Hosting !!! </h4>
     
          `

    }
}


