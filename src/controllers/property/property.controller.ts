import { Request,Response } from "express";
import { updateViewCountS,createPropertyS,updatePropertyS, getPropertyByIdS, deletePropertyS, getMyPropertiesS, getPropertiesS} from "../../services/property/property.service";





export const createPropertyC=async(req:Request,res:Response)=>{
    try{
        // check kyc verifcation 
        if(!req.userData.kycVerified) return res.status(403).json({success:false,error:"Kyc not Verified/Unauthorized user"});
        console.log(req.body)
        const newProperty=await createPropertyS(req.userData.docId,req.body)
        if(newProperty)return res.status(200).json({success:true,message:"Property sent for further verification"})
    }catch(e:any){
        console.log(e);
        res.status(400).json({success:false,error:e.message})
    }
}

export const getPropertyByIdC=async(req:Request,res:Response)=>{
    try{
        if(req.userData.docId==""){
            const propertyData=await getPropertyByIdS(req.params.id,"");
            return res.status(200).json({success:true,propertyData})
        }
        const propertyData=await getPropertyByIdS(req.params.id,req.userData.docId);
        return res.status(200).json({success:true,propertyData})
    }catch(e:any){
        console.log(e);
        res.status(400).json({success:false,error:e.message})
    }
}

//for search or random query something like that
export const getPropertiesC=async(req:Request,res:Response)=>{
    try{
        let queryParams: any = {};

            if (req.query.minRate !== undefined) {
            queryParams.minRate = parseInt(req.query.minRate as string);
            }

            if (req.query.maxRate !== undefined) {
            queryParams.maxRate = parseInt(req.query.maxRate as string);
            }

            if (req.query.propertyType !== undefined) {
            queryParams.propertyType = req.query.propertyType as string;
            }

            if (req.query.country !== undefined) {
            queryParams.country = req.query.country as string;
            }

            if (req.query.state !== undefined) {
            queryParams.state = req.query.state as string;
            }

            if (req.query.city !== undefined) {
            queryParams.city = req.query.city as string;
            }

            if (req.query.rating !== undefined) {
            queryParams.rating = parseInt(req.query.rating as string);
            }

            if (req.query.amenities !== undefined) {
            queryParams.amenities = req.query.amenities as string[];
            }

        
        console.log("req.query",queryParams);


        const propertyData=await getPropertiesS(req.query.page as string,req.query.limit as string,queryParams);
        return res.status(200).json({success:true,propertyData})
    }catch(e:any){
        console.log(e);
        res.status(400).json({success:false,error:e.message})
    }
}


//get properties for id 
export const getMyPropertiesC=async(req:Request,res:Response)=>{
    try{

        const propertyData=await getMyPropertiesS(req.query.page as string,req.query.limit as string,req.params.id)
        return res.status(200).json({success:true,propertyData})
    }catch(e:any){
        console.log(e);
        res.status(400).json({success:false,error:e.message})
    }
}



export const updatePropertyC=async(req:Request,res:Response)=>{
    try{
        //check kyc verifcation 
        if(!req.userData.kycVerified) return res.status(401).json({success:false,error:"Kyc not Verified/Unauthorized user"});
        const updatedProperty=await updatePropertyS(req.userData.docId,req.params.id,req.body)
        return res.status(200).json({success:true,message:"Property updated and  sent for further verification",updatedProperty})
    }catch(e:any){
        console.log(e);
        res.status(400).json({success:false,error:e.message})
    }
}

export const deletePropertyC=async(req:Request,res:Response)=>{
    try{
        if(!req.userData.kycVerified) return res.status(401).json({success:false,error:"Kyc not Verified/Unauthorized user"});;

        //since user verified now unto to delete
        const deleteProperty=await deletePropertyS(req.userData.docId,req.params.id)
        if(deleteProperty) return res.status(200).json({success:true,message:`Property deleted successfully`})
    }catch(e:any){
        console.log(e)
        res.status(400).json({success:false,error:e.message})
    }
}












export const updateViewCountC=async(req:Request,res:Response)=>{
    try{
        //check if there is userdata
        if(req.userData.userId==""){
            const updateViewCount=await updateViewCountS("",req.params.id)
            if(updateViewCount) return res.status(200).json({success:true,message:"view count updated"})
        }

        //since user is authenticated
        const updateViewCount=await updateViewCountS(req.userData.docId,req.params.id)
        if(updateViewCount) return res.status(200).json({success:true,message:"view count updated/user recent product view Updated"})

        //if user has already viewed property then 
        return res.status(500).json({success:false,message:"view count not updated/user has already viewd product"})
    }catch(e:any){
        console.log(e)
        res.status(400).json({success:false,error:e.message})
    }
}