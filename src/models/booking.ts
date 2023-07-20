import {Schema,model,Types} from "mongoose"
import { IBooking } from "../interfaces/dbInterface"

const bookingSchema=new Schema({
    userId:{type:Types.ObjectId,ref:"Users",required:true},
    propertyId:{type:Types.ObjectId,ref:"Properties",required:true},
    hostId:{
        type:Types.ObjectId,
        ref:"Users",
        required:true
    },
    status:{
        type: String,
        enum: ['Booked', 'ownerCancelled','Completed','tenantCancelled'],
        default: 'Booked'
    },
    startDate:Date,
    endDate:Date,
    guest:Number,
   paymentId:{type:Types.ObjectId,ref:"Payments"},

    //check in and check out  
    checkInStatus: {
      type:Boolean,
      default: false,
    },
    checkOutStatus: {
      type:Boolean,
      default: false,
    }


    //like pending or verified something like that
    //inspesction_status:{type:String,required:true},

},{timestamps:true})

export const bookingModel=model<IBooking>("Booking",bookingSchema)


  