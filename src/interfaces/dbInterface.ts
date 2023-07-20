import { Types } from "mongoose"



interface kycSchema{
    firstName: string
    lastName: string
    gender: string
    email: string
    phoneNumber: string
    country: string,
    state:string,
    city: string
    img: {
      imgId: string
      imgUrl: string
    };
  
}

 export interface IUser {
  _id: Types.ObjectId;
    userId: string
    userName: string
    password: string
    profileImg: {
      imgId: string
      imgUrl: string
    }
    about:string
    email: {
      mail: string
      isVerified: boolean
    };
    token: string
    refreshToken: string[]
    is_Admin: boolean
    kycInfo:kycSchema,
    kyc: {
      isVerified: boolean
      message: string
      approvedBy: string
      pending:boolean
    };
    listingCount: number
    avgRating: number
    recievedReviewcount: number
    wishList:[Types.ObjectId],
    isBanned: {
      status:boolean,
      message:string
    }
    viewedProperty: Types.ObjectId[]
    createdAt: Date;
    updatedAt: Date;
    
 }
 

 export interface Property{
    _id: Types.ObjectId;
    userId:Types.ObjectId|Partial<IUser>
    name: string;
    url: string;
    country: string;
    state: string;
    city: string;
    discription: string;
    propertyType: string;
    rules:string;
    amenities:string[];
    rate:number;
    images:{
      imgId: string;
      imgUrl: string;
    }[];
    tennants:[Types.ObjectId]|[Partial<IUser>]
    ratingCount: number;
    viewCount: number;
    avgRating: number;
    isBanned: {
      status: boolean;
      message: string;
    };
    isBooked:boolean

    isVerified: {
      status: boolean;
      pending: boolean;
      message: string;
      approvedBy: string | Types.ObjectId;
    };
    createdAt: Date;
    updatedAt: Date;
  
}



export interface IReview{
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  hostId: Types.ObjectId;
  propertyId: Types.ObjectId;
  rating: number;
  review: string;
  
    reportStatus: boolean;
    reportMessage: string;
    admin: Types.ObjectId;
    adminReview: string;
  
  createdAt: Date;
  updatedAt: Date;
}


export interface IBooking{
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  propertyId: Types.ObjectId;
  hostId: Types.ObjectId;
  paymentId:Types.ObjectId
  status: string
  startDate: Date;
  endDate: Date;
  guest: number;
  checkInStatus: boolean
  checkOutStatus: boolean
  createdAt: Date;
  updatedAt: Date;
}


export interface Payment {
  _id: Types.ObjectId;
    payerId: string;
    bookingId:Types.ObjectId;
    paymentDate: Date;
    initialAmount:number;
    serviceCharge:number;
    totalAmount:number;
    stay: number;
    id: string;
    createdAt: Date;
    updatedAt: Date;
  // billImg?: string;
  // billId?: string;
}