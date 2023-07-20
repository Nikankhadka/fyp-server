import { Request,Response } from "express";
import { addPropertyWishS, getWishListS, removePropertyS } from "../../services/property/wishlist.service";


export const addPropertyWishC=async(req:Request,res:Response)=>{
    try{
        const addWishList=await addPropertyWishS(req.userData.docId,req.params.id);
       if(addWishList) return res.status(200).json({success:true,message:"property added to wish list successfully"})
    }catch(e:any){
        console.log(e);
        res.status(400).json({success:false,error:e.message})
    }
}

export const getWishListC=async(req:Request,res:Response)=>{
    try{
        const page=Number(req.query.page as string)
        const limit=Number(req.query.limit as string)
        const wishList=await getWishListS(req.userData.userId,page,limit);
        if(wishList) return res.status(200).json({success:true,wishList})
    }catch(e:any){
        console.log(e);
        res.status(400).json({success:false,error:e.message})
    }
}



export const removeProperyC=async(req:Request,res:Response)=>{
    try{
        const propertyRemove=await removePropertyS(req.userData.userId,req.params.id)
        if(propertyRemove) return res.status(200).json({success:true,message:`Property ${req.params.id} removed successfully from the wishlist`})
    }catch(e:any){
        console.log(e)
        res.status(400).json({success:false,error:e.message})
    }
}