import { Types } from "mongoose"
export interface updateProfile{
    userName:string,
    oldPassword:string,
    newPassword:string,
    profile_Img:{
        img_id:string,
        img_url:string
    }
}



export interface KycData{
    kycInfo:{
        firstName:string,
    lastName:string,
    gender:string,
    email?:string,
    country:string,
    state:string
    city:string
   
    img:{
        imgId:string,
        imgUrl:string
    },
    phoneNumber?:string,
    }
    
}


export interface BookingInput {
    startDate: Date;
    endDate: Date;
    guest: string;
    payerId: string;
    initialAmount: number;
    serviceCharge: number;
    totalAmount: number;
    paymentId: string;
    Stay: number;
    bill:string
  }
  