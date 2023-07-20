import { Request,Response } from "express";
import { getBookingS, postBookingS,getMyBookingS, confirmCheckOutS, checkBookingS,getOnBookingS, confirmCheckInS,cancelBookingS} from "../../services/property/booking.service";


export const postBookingC=async(req:Request,res:Response)=>{
    try{
        // check kyc verification first from req.userdata.kyc

        const newBooking=await postBookingS(req.params.id,req.userData.docId,req.body)
        if(newBooking) return res.status(200).json({success:true,message:"Property Sucessfully Booked"});
        return res.status(409).json({success:false,error: "Booking already exists for the given property and dates."})
    }catch(e:any){
        res.status(500).json({success:false,error:e.message})
    }
}

export const checkBookingC=async(req:Request,res:Response)=>{
    try{
        // check kyc verification first from req.userdata.kyc

        const bookingExist=await checkBookingS(req.params.id,req.body.startDate,req.body.endDate)
        if(!bookingExist) return res.status(200).json({success:true,message:"booking does not Exist"});
        return res.status(409).json({success:false,error: "Booking already exists for the given property and dates."})
    }catch(e:any){
        res.status(500).json({success:false,error:e.message})
    }
}

export const getBookingC=async(req:Request,res:Response)=>{
    try{
        console.log("controllerlevel bookingid check",req.params.id)
        const reservations=await getBookingS(req.params.id);
       
       
        if(reservations)  return res.status(200).json({success:true,reservations})
        return res.status(400).json({success:false,error: "Please provide proper information of Host Id and property Id"})
    }catch(e:any){
        res.status(500).json({success:false,error:e.message})
    }
}

export const getMyBookingC=async(req:Request,res:Response)=>{
    try{
        const page=Number(req.query.page||1);
        const limit=Number(req.query.limit||10);
        console.log('inside controller')
        const reservations=await getMyBookingS(req.userData.docId,page,limit);
       
        if(reservations)  return res.status(200).json({success:true,reservations})
        return res.status(400).json({success:false,error: "Please provide proper information of Host Id and property Id"})
    }catch(e:any){
        res.status(500).json({success:false,error:e.message})
    }
}

export const getOnBookingC=async(req:Request,res:Response)=>{
    try{
        const page=Number(req.query.page||1);
        const limit=Number(req.query.limit||10);
        const reservations=await getOnBookingS(req.userData.docId,page,limit);
       
        if(reservations)  return res.status(200).json({success:true,reservations})
        return res.status(400).json({success:false,error: "Please provide proper information of Host Id and property Id"})
    }catch(e:any){
        res.status(500).json({success:false,error:e.message})
    }
}


export const confirmCheckInC=async(req:Request,res:Response)=>{
    try{
        
        const checkInConfirmed=await confirmCheckInS(req.userData.docId,req.params.id);
        if(checkInConfirmed)  return res.status(200).json({success:true,message:"Check in confirmed"})
        return res.status(400).json({success:false,error: "Check In confirmation failed"})
    }catch(e:any){
        res.status(500).json({success:false,error:e.message})
    }
}

export const confirmCheckOutC=async(req:Request,res:Response)=>{
    try{
        
        const checkOutConfirmed=await confirmCheckOutS(req.userData.docId,req.params.id);
        if(checkOutConfirmed)  return res.status(200).json({success:true,message:"Check Out confirmed"})
        return res.status(400).json({success:false,error: "Check Out confirmation failed"})
    }catch(e:any){
        res.status(500).json({success:false,error:e.message})
    }
}


export const cancelBookingC=async(req:Request,res:Response)=>{
    try{
        
        const cancelConfirmed=await cancelBookingS(req.userData.docId,req.params.id)
        if(cancelConfirmed)  return res.status(200).json({success:true,message:"booking cancelled sucessfully!"})
        return res.status(400).json({success:false,error: "booking cancellation failed"})
    }catch(e:any){
        res.status(500).json({success:false,error:e.message})
    }
}