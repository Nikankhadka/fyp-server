import {Schema,model} from "mongoose"


const conversationSchema=new Schema({

    //id will be used in message model to fetch all message betn user for the property
    user1:String,
    hostId:String,
    created_at:{
        type:Date,
        default:Date.now,
    },
    //this can be used for generating user defined bill 
    property_Id:{type:String,required:true},
    

})


//export the model instance for performing Query operations
export const conversationModel=model("Conversations",conversationSchema);


