

import {Schema,model,Types} from "mongoose"
import { IUser } from "../interfaces/dbInterface";

export const userSchema=new Schema({

    //the length and pattern for the properties below will be validated in the client side so no need for server side error handling

        userId:{
            type:String,
            required:true,
            unique:true
        },
        //usename in default can be user id and acts as display name 
        userName:{
            type:String,
            required:true,
        },
        //only necessary for local login
        password:{type:String},
        //userid__profile
        profileImg:{
            imgId:{
                type:String,
                default:""
            },
            imgUrl:{
                type:String,
                default:""
            }
        },
        
        about:{
            type:String,
            default:""
        },
        
        //can be manually updated or if user logs in with google then it will be updated automatically
        email:{
            mail:{type:String,default:""},
            isVerified:{type:Boolean,default:false}
        },

        //since i will be usig jwt for most of the verificaion purpose rather than generate own token
        token:String,
        //will contain the token value for token rotation
        refreshToken:[String],
        is_Admin:{type:Boolean,default:false},
        kycInfo:{
            firstName:{
                type:String,
                default:""
            },
            lastName:{
                type:String,
                default:""
            },
            gender:{
                type:String,
                default:""
            },

            // if email is verified then this will be automatically updated
            email:{
                type:String,
                default:""
            },
            // phone number will be added here as its verified 
            phoneNumber:{
                type:String,
                default:""
            },

            country:{
                    type:String,
                    default:""
                },
            state:{
                    type:String,
                    default:""
                },

            city:{
                    type:String,
                    default:""
                },
            
            //multiple images of user, citizenship for manual verification
            img:{
                
                    //userId_img1/2
                    imgId:{
                        type:String,
                        default:""
                    },
                    imgUrl:{
                        type:String,
                        default:""
                    },
                
                
            }

        },
        
        //kyc verification status
        kyc:{
            isVerified:{type:Boolean,default:false},

            // can be used to fetch information and other things
            pending:{
                type:Boolean,
                default:false
            },
            message:String,
            approvedBy:{
                type:Types.ObjectId,
                ref:"Users"
            },
        },

        //no of property posted by user
        listingCount:{type: Number,default:0},

        //rating and review count will be updated on write every time user property is reviewd
        avgRating:{type: Number,default:0}, 
        recievedReviewcount:{type: Number,default:0},

        //document id of refrenced product donot create new document in different collection
        wishList:{type:[{type:Schema.Types.ObjectId,ref:"Properties"}],
        default:[]
        }
        ,
           
        

        //can be modified by admin to ban user for certain time or permanently
        isBanned:{
            // strikes:{
            //     type:Number,
            //     default:0
            // },
            // banStart:Date,
            // banEnd:Date,
            status:{
                type:Boolean,
                default:false
            },
            message:String
        },
        viewedProperty:{
            type:[{type:Schema.Types.ObjectId,ref:"Properties"}],
            default:[]
        },

        


},{timestamps:true})



export const userModel=model<IUser>("Users",userSchema);
