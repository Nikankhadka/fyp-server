import { Request,Response } from "express"
import { getReviewS, postReviewS ,updateReviewS,deleteReviewS} from "../../services/property/review.service"
import { number } from "joi";

export const postReviewC=async(req:Request,res:Response)=>{
    try{
        const postReview=await postReviewS(req.userData.docId,req.params.id,req.body);
        if(postReview) return res.status(200).json({success:true,message:"Review Posted successfully"})
        
    }catch(e:any){
        console.log(e)
        res.status(400).json({success:false,error:e.message})
    }
}

export const updateReviewC=async(req:Request,res:Response)=>{
    try{
        const updateReview=await updateReviewS(req.userData.docId,req.params.id,req.body);
        if(updateReview) return res.status(200).json({success:true,message:"Review updated successfully"})
        
    }catch(e:any){
        console.log(e)
        res.status(400).json({success:false,error:e.message})
    }
}


export const deleteReviewC=async(req:Request,res:Response)=>{
    try{
        const deleteReview=await deleteReviewS(req.userData.docId,req.params.id);
        if(deleteReview) return res.status(200).json({success:true,message:"Review deleted successfully"})
        
    }catch(e:any){
        console.log(e)
        res.status(400).json({success:false,error:e.message})
    }
}

export const getReviewsC=async(req:Request,res:Response)=>{
    try{
        const reviews=await getReviewS(req.params.id,Number(req.query.page),Number(req.query.limit));
        if(reviews) return res.status(200).json({success:true,reviews})
        
    }catch(e:any){
        console.log(e)
        res.status(400).json({success:false,error:e.message})
    }
}