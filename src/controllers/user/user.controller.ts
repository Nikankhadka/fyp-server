import { Request,Response } from "express"
import joi from "joi"
import {addEmailS,getMeS, verifyEmailS,updateProfileS,postKycS, getUserS, getPhoneS,postPhoneS} from "../../services/user/user.service"
import { refreshTokenC } from "../auth/auth.controller";



export const getUserC=async(req:Request,res:Response)=>{
    try{
        const userData=await getUserS(req.params.id);
        if(userData) return res.status(200).json({success:true,userData})
    }catch(e:any){
        console.log(e)
        return res.status(400).json({success:false,error:e.message})
    }
}

export const getMeC=async(req:Request,res:Response)=>{
    try{
        const userData=await getMeS(req.userData.docId);
        if(userData) return res.status(200).json({success:true,userData})
    }catch(e:any){
        console.log(e)
        return res.status(400).json({success:false,error:e.message})
    }
}


export const addEmailC=async(req:Request,res:Response)=>{
    try{
        //validate the email input passed in the body
        console.log("validation")
        const emailSchema=joi.object({
            email:joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        })
        const{error,value}=emailSchema.validate(req.body,{abortEarly:false})
        if(error) return res.status(400).json({success:false,message:error.message})

        console.log("email successfully in controller")
        const postEmail=await addEmailS(req.userData.userId,req.body.email)
        if(postEmail) return res.status(200).json({success:true,message:"Email addes Please Verify Email"})

    }catch(e:any){
        console.log(e)
        return res.status(400).json({success:false,error:e.message})
    }
}


export const verifyEmailC=async(req:Request,res:Response)=>{
    try{
        const emailVerified=await verifyEmailS(req.params.token);
        if(emailVerified) return res.status(200).redirect("http://localhost:3000/Home")

    }catch(e:any){
        console.log(e)
        return res.status(400).json({success:false,error:e.message})
    }
} 


//just to change profile when user updates the profile i am going to refresh 
export const updateProfileC=async(req:Request,res:Response)=>{
    try{
        console.log('inside controller',req.cookies.session)
        
        const profileUpdated=await updateProfileS(req.userData.userId,req.body);
        if(profileUpdated){
           return refreshTokenC(req,res)
        }
        return res.status(400).json({success:false,message:"Profile update failed"})

    }catch(e:any){
        console.log(e)
        return res.status(400).json({success:false,error:e.message})
    }
}


export const postKycC=async(req:Request,res:Response)=>{

    try{
        const kycPosted=await postKycS(req.userData.userId,req.body);
        if(kycPosted) return res.status(200).json({success:true,message:"User Kyc infromation successfully added wait for admin verification"})

    }catch(e:any){
        console.log(e)
        return res.status(400).json({success:false,error:e.message})
    }
}



export const getPhoneC=async(req:Request,res:Response)=>{
    try{
        console.log(req.params.phone)
        const getPhone=await getPhoneS(req.params.phone)
        if(getPhone) return res.status(200).json({success:true,message:'Add phone/Phone number does not exist'})
    }catch(e:any){
        console.log(e)
        return res.status(409).json({success:false,error:e.message})
    }
}

export const postPhoneC=async(req:Request,res:Response)=>{
    try{
        const postPhone=await postPhoneS(req.userData.userId,req.params.phone)
        if(postPhone) return res.status(200).json({success:true,message:'Phone Number Successfully Verfied and Posted'})
    }catch(e:any){
        console.log(e)
        return res.status(409).json({success:false,error:e.message})
    }
}



