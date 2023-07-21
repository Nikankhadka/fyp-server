

import {connect} from "mongoose"

import * as dotenv from "dotenv"
dotenv.config()
    //return type of async function is promise 
    // mongodb+srv://nick11444:${process.env.dbPassword}@fypnikan.bud3xcp.mongodb.net/test
  
const dbConnect=async()=>{
    try{
       // 
         await connect(`mongodb+srv://nick11444:${process.env.dbPassword}@fypnikan.bud3xcp.mongodb.net/test`)
         console.log("Database Connected")
        
         console.log("Next Called")
          
    }catch(e){
        console.log(e);
    }
}


export default dbConnect;


