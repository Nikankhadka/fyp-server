import { createTransport } from "nodemailer";
import * as dotenv from "dotenv"
import { mailBody } from "../interfaces/mail";

dotenv.config()

const transporter=createTransport({
    host:"smtp.zoho.com",
    secure:true,
    port:465,
    auth:{
        user:process.env.user,
        pass:process.env.pass
    }
})


export const sendMail=(mailOptions:mailBody):boolean=>{
    try{
       
        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.log(err)
            }else{
                
            console.log("mail send succesfully using zoho ")
            }
        })
        return true;

    }catch(e){
        console.log("Maid send failed")
        throw e;
        
        
    }
}