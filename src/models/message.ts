import mongoose from "mongoose"


//a new document will be generated for each message try to sort all the documents while wrting
export const messageSchema=new mongoose.Schema({
    sender_id:String,
    reciever_id:String,
    message:String,
    conversation_Id:String,
    //property_Id:{type:String,required:true},
    created_at:{type:Date,default:Date.now},
})


