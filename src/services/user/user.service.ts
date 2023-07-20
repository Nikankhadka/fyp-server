import { userModel } from "../../models/user"
declare module 'jsonwebtoken' {
    export interface verifyEmailPayload extends JwtPayload {
        userId: string,
        Email:string
}
}


import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv"
import { sendMail } from "../../utils/zohoMailer";
import {postEmailTemplate,verifyEmailTemplate } from "../../configs/mailtemplate";
import { KycData, updateProfile } from "../../interfaces/inputInterface";
import { compare, hash } from "bcrypt";
import { IUser } from "../../interfaces/dbInterface";
import { returnUserData } from "../../interfaces/userResponse";
dotenv.config()


//get user for basiclly not for admin and acutal usser
export const getUserS=async(id:string):Promise<Partial<returnUserData>>=>{
    try{
        
        const validId = /^[a-f\d]{24}$/i.test(id) ? id : null;
        const query = validId? { $or: [{ _id: validId }, { userId: validId }] }:{ userId:id };
        const userData=await userModel.findOne(query).select("-password -Token -userId -refreshToken -updated_At -is_Admin -wishList  -isBanned -rentedProperty -viewedProperty -recommendation ").select("kyc.isVerified kycInfo.phoneNumber");
        
        
        if(!userData) throw new Error("Failed to fetch userData")
        const phoneNumber=userData?.kycInfo.phoneNumber!;
        // delete kyc info from copy document
        
        let Data = { ...userData.toObject(),kycInfo:{phoneNumber}};
        console.log(Data)
        return Data;

    }catch(e){
        console.log(e)
        throw e;
    }
}


//get my data 
export const getMeS=async(_id:string):Promise<Partial<IUser>>=>{
    try{
        const userData=await userModel.findOne({_id}).select(" -token  -refreshToken  -wishList   -viewedProperty ");
        if(!userData) throw new Error("Failed to fetch userData")
        return userData;

    }catch(e){
        console.log(e)
        throw e;
    }
}


//same api for post and update email
export const addEmailS=async(userId:string,Email:string):Promise<boolean>=>{
    try{
        //first check whethe this email exist or not in our system 
        const emailExist =await userModel.findOne({"email.mail":Email,'email.isVerified':true});
        if(emailExist) throw new Error("Account with this email already Exist in the System")


         //send verification or request mail to change mail and also store token in db to avoid misuse
        const token=await jwt.sign({
            userId,
            Email,  
    },process.env.mailSecret!,{expiresIn:"10h"});

        const emailUpdate=await userModel.updateOne({userId},{ "$set": {
             "email.mail":Email,
             "email.isVerified":false,
             "token":token
        }})

        if(!emailUpdate) throw new Error("Email update failed")
        //now pass this token to mail and send it to verify the userMail Update request
        const updateMailRequest=sendMail(postEmailTemplate(Email,token))
        
        return true;

    }catch(e){
        console.log(e)
        throw e
        
    }
}

//verufy emial
export const verifyEmailS=async(token:string):Promise<boolean>=>{
    try{
        //first match the token in db 
        const tokenMatch=await userModel.findOne({token})
        if(!tokenMatch) throw new Error("Invalid Token,Token not found in db")

        
        const {userId,Email}= <jwt.verifyEmailPayload>jwt.verify(token,process.env.mailSecret!)
        //if token expired error is throw catched and send back 
        if(tokenMatch.userId!==userId) throw new Error("Token Data not matched with acutal users Token")
        
        //since user token is verified now update document and verify email 
        const emailUpdate=await userModel.findOneAndUpdate({userId},{ "$set": {
            "email.isVerified":true,
            "kycInfo.email":tokenMatch.email?.mail
            }},{new:true});
        
        if(!emailUpdate) throw new Error("Email verification failed")

        const verifyMailRequest=sendMail(verifyEmailTemplate(emailUpdate.userName,Email))
        return true;

    }catch(e){
        throw e
       
    }
}

//update
export const updateProfileS=async(userId:string,profileData:Partial<updateProfile>):Promise<boolean>=>{
    try{

        //special condition for password cant change into old password and also hash password before saving into db
        if(profileData.oldPassword){
            const user=await userModel.findOne({userId});
            if(!await compare(profileData.oldPassword,user?.password!)) throw new Error("Please Enter Valid Old Password");
            if(await compare(profileData.newPassword!,user?.password!)) throw new Error("Please Enter Valid New Password");

            //now simple has and save the new password
            user!.password=await hash(profileData.newPassword!,8);
            await user?.save();
            return true
        }

        console.log('ready to update profile')
        const updatedUserProfile=await userModel.updateOne({userId},{...profileData},{new:true});
        if(!updatedUserProfile) throw new Error("User profile update failed")
        return true

    }catch(e){
        console.log(e)
        throw e;
    }
}

export const postKycS=async(userId:string,KycData:KycData):Promise<boolean>=>{
    try{
        //check if user has already verified kyc or not 
        const kycVerified=await userModel.findOne({userId,"kyc.isVerified":true})
        if(kycVerified) throw new Error("kyc is already verified cant post new kyc information")

        const postKyc=await userModel.findOneAndUpdate({userId},{...KycData,kyc:{isVerified:false,
            pending:true,
            message:"",
            //approved by paxi halnu
            }},{new:true})

        if(!postKyc) throw new Error("Kyc post failed")

        return true;

    }catch(e){
        console.log(e);
        throw e;
    }
}


export const getPhoneS=async(phoneNumber:string):Promise<boolean>=>{
    try{
        console.log("check Phone")
        const checkPhone=await userModel.findOne({'kycInfo.phoneNumber':phoneNumber});
        if(checkPhone) throw new Error("user With provided Phone Number Exist please try new Number");

        console.log('phone checked')
        //now simply return true and dont throw error from front end
        return true
    }catch(e){
        console.log(e);
        throw e;
    }
}


// this same api can be used to update phone number
export const postPhoneS=async(userId:string,phoneNumber:string):Promise<boolean>=>{
    try{
        const checkPhone=await userModel.findOne({'kycInfo.phoneNumber':phoneNumber});
        if(checkPhone) throw new Error("user With provided Phone Number Exist please try new Number");

        const postPhone=await userModel.findOneAndUpdate({userId}, { $set: { 'kycInfo.phoneNumber':phoneNumber} },{new:true});

        if(!postPhone) throw new Error("Phone number Post Failed");

        return true;
    }catch(e){
        console.log(e);
        throw e;
    }
}



