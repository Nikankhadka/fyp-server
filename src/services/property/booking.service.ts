import { userBookingTemplate } from "../../configs/mailtemplate";
import { IBooking } from "../../interfaces/dbInterface";
import { BookingInput } from "../../interfaces/inputInterface";
import { bookingModel } from "../../models/booking";
import paymentModel from "../../models/payment";
import { propertyModel } from "../../models/property";
import { userModel } from "../../models/user";
import { sendMail } from "../../utils/zohoMailer";


export const checkBookingS=async(propId:string,startDate:Date,endDate:Date)=>{
  try{
    
    const checkProperty=await propertyModel.findOne({_id:propId});
    if(!checkProperty) throw new Error("invalid Property Id/Does not Exist");
    
    const existingBooking = await bookingModel.findOne({
        $and: [
          { propertyId: propId },
          {
            $or: [
              { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
              { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
              { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
            ]
          }
        ]
      });
    if(existingBooking) return true;
    return false;
  }catch(e){
    console.log(e);
    throw e;
  }
}


//modify query later to only work on verified proeprty and verified user
export const postBookingS=async(propId:string,userId:string,bookingDetail:Partial<BookingInput>):Promise<boolean>=>{
    try{
        const{startDate,endDate,guest,payerId,initialAmount,serviceCharge,totalAmount,paymentId,Stay,bill}=bookingDetail
        const checkProperty=await propertyModel.findOne({_id:propId});
        if(!checkProperty) throw new Error("invalid Property Id/Does not Exist");
        
        const existingBooking = await bookingModel.findOne({
            $and: [
              { propertyId: propId },
              {status:'Booked'},
              {
                $or: [
                  { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
                  { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
                  { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
                ]
              }
            ]
          });
        if(existingBooking) return false;


       
        const newBooking=await bookingModel.create({
            propertyId:propId,
            userId,
            hostId:checkProperty.userId,
            startDate,
            endDate,
            guest,
            
        });

        await newBooking.save();
       
        //now also create a paymentdoc

        const newPayment=await paymentModel.create({
          bookingId:newBooking._id,
          payerId,
          Stay,
          paymentDate:new Date(),
          initialAmount,
          serviceCharge,
          totalAmount,
          id:paymentId,
        });

        await newPayment.save();

        //now modify the booking doc to store payment id 
         newBooking.paymentId=newPayment._id;
         await newBooking.save()
        if(!newPayment)  throw new Error("failed to store Payment Information");

        //send mail with billing 
        const user=await userModel.findOne({_id:newBooking.userId});
        const host=await userModel.findOne({_id:checkProperty.userId});

        const usermail=sendMail(userBookingTemplate(user!.userName,user!.email.mail,checkProperty.name,bill!,true,checkProperty.images[0].imgUrl))
        const hostmail=sendMail(userBookingTemplate(user!.userName,host!.email.mail,checkProperty.name,bill!,false,checkProperty.images[0].imgUrl))
        
      return true

    }catch(e){
        console.log(e);
        throw e;
    }
}

//get bookings for property calender
export const getBookingS=async(propId:string):Promise<Partial<IBooking>[]>=>{
    try{
      //   console.log("ins serbce") userId:string,page?:number,limit?:number

      //  if(userId!=''){
      //   const reservations=await bookingModel.find({propertyId:propId,hostId:userId}).skip((page! - 1) * limit!)
      //   .limit(limit!);
      //   if(!reservations) throw new Error("Failed to Fetch reservation for user");
      //   return reservations;
      //  }
      console.log('inside getbooking',propId)
       const reservations=await bookingModel.find({
        propertyId:propId,
        status:'Booked'
       }).select('startDate endDate').exec();

       if(!reservations) throw new Error("failed to get Reservation details");

       return reservations;
    }catch(e){
        console.log(e);
        throw e;
    }
}

//bookings i did
export const getMyBookingS=async(userId:string,page?:number,limit?:number):Promise<Partial<IBooking>[]>=>{
    try{
      console.log("inside my bookings service")
        const reservations=await bookingModel.find({userId}).skip((page! - 1) * limit!)
        .limit(limit!).populate('propertyId','-tennants').populate('paymentId').populate('hostId','_id userName profileImg userId').sort({createdtAt:-1}).exec()
        if(!reservations) throw new Error("Failed to Fetch reservation for user");
        return reservations;
     
    }catch(e){
        console.log(e);
        throw e;
    }
}


//bookings on my property
export const getOnBookingS=async(hostId:string,page?:number,limit?:number):Promise<Partial<IBooking>[]>=>{
  try{
      const reservations=await bookingModel.find({hostId}).skip((page! - 1) * limit!)
      .limit(limit!).populate("propertyId").populate('userId','_id userName profileImg userId').populate('paymentId').sort({createdtAt:-1}).exec();
      if(!reservations) throw new Error("Failed to Fetch reservation for user");
      return reservations;
   
  }catch(e){
      console.log(e);
      throw e;
  }
}

export const confirmCheckInS=async(userId:string,bookingId:string):Promise<boolean>=>{
  try{
      
      const booking=await bookingModel.findOne({_id:bookingId,hostId:userId})
      if(!booking) throw new Error("invalid booking id")

      if(booking.checkInStatus) throw new Error ("Check in status True Verified!");

      //validate check in date but since this owner controlled i will not do that 
      //update the booking status for property for the current date 
      const booked=await propertyModel.findOneAndUpdate({_id:booking.propertyId},{
        $set:{
          isBooked:true
        }
      },{new:true});
      if(!booked) throw new Error("failed to Chnage the booking status of the property")
      

      booking.checkInStatus=true;
      await booking.save();
      return true;
  }catch(e){
      console.log(e);
      throw e;
  }
}

export const confirmCheckOutS=async(userId:string,bookingId:string):Promise<boolean>=>{
  try{
      
    const booking=await bookingModel.findOne({_id:bookingId,hostId:userId})
    if(!booking) throw new Error("invalid booking id")

    if(!booking.checkInStatus) throw new Error ("First verify check In");
    if(booking.checkOutStatus) throw new Error ("ALready Checked Out!");

    booking.checkOutStatus=true;
    booking.status='Completed'
    await booking.save();

    //now simply add user to the tennats list in the property 
    const tennantExist=await propertyModel.findOne({_id:booking.propertyId,tennants:booking.userId});
    if(tennantExist) return true;

    const newTennant=await propertyModel.findOneAndUpdate({_id:booking.propertyId},{
      $push:{
        tennants:booking.userId
      },
      $set:{
        isBooked:false
      }
    },{new:true});

    if(!newTennant) throw new Error("failed to add tennat after checkout");
    return true
    
  }catch(e){
      console.log(e);
      throw e;
  }
}



export const cancelBookingS=async(userId:string,bookingId:string):Promise<boolean>=>{
  try{
      
    const booking=await bookingModel.findOne({_id:bookingId})
    if(!booking) throw new Error("invalid booking id")

    if(booking.hostId.toString()==userId){
      //now cancel bookign through host 
      booking.status='ownerCancelled';
      await booking.save();
      return true;
    }

    //else throw tennanat
    booking.status='tenantCancelled';
    await booking.save();
    return true;
    
  }catch(e){
      console.log(e);
      throw e;
  }
}
