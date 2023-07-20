import {Schema,model, Types, SchemaTypes} from "mongoose"
import { Property } from "../interfaces/dbInterface";


const propertySchema=new Schema({

    //if id is defined in schema u need to pass on intialize in manually
    // _id:{
    //     type:Types.ObjectId,
    //     required:false
    // },
    userId:{type:Types.ObjectId,
        ref:"Users",
        required:true,
        immutable:true
    },

    //this will be default generated
    name:{type:String,required:true},
    url:String,
    country:String,
    state:String,
    city:String,
    discription:{type:String,required:true},
    propertyType:{type:String,required:true},
    rules:String,
    amenities:[String],

    rate:Number,
    images:[{
        imgId:String,
        imgUrl:String
    }],

    //id of previus tennats
    tennants:{
        type:[{type:Schema.Types.ObjectId,ref:"Users"}],
        default:[]
    },

    //calculate these on write
    ratingCount:{type:Number,default:0},
    viewCount:{type:Number,default:0},
    avgRating:{type:Number,default:0},

    //admin can bacn the post
    isBanned:{
        status:{type:Boolean,default:false},
        message:{type:String,default:""}
    },
    isBooked:{type:Boolean,default:false},

    //admin verification check
    isVerified:{
        status:{
            type:Boolean,
            default:false
        },
        pending:Boolean,
        message:String,

        //can be string or obj id can modify later
        approvedBy:{
            type:Types.ObjectId,
            ref:"Users"
        }
    },

},{timestamps:true})


//export the model instance for performing Query operations
 export const propertyModel=model<Property>("Properties",propertySchema);

