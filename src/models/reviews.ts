import {Schema,model, Types} from "mongoose"
import { IReview } from "../interfaces/dbInterface";


//document for eeach review wiill be generated
const reviewSchema=new Schema({
        userId:{type:Types.ObjectId,required:true,ref:"Users"},
        propertyId:{type:Types.ObjectId,required:true,ref:"Properties"},
        hostId:{type:Types.ObjectId,required:true,ref:"Users"},
        rating:{
                type:Number,
                default:0
        },
        review:{type:String,default:''},
        //this will allow adming to review and ban the user if possible only allowed to post by owner
       
        reportStatus:{
                type:Boolean,
                default:false
        },
        reportMessage:{
                type:String,
                default:""
        },
               
        
           
           //for admin to review whether to delete or leave it as it is also provide feed back to comment
        admin:{
        type:Types.ObjectId,
        ref:"Users"
        
        },
        adminReview:{
                type:String,
                default:""
        }
        
      
      
},{timestamps:true})

//export the model instance for performing Query operations
 export const reviewModel=model<IReview>("Reviews",reviewSchema);

