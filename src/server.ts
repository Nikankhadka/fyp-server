//import express function and creare app instance 
import express from "express"
const app=express()

import { Request,Response } from "express"
//necessary imports 
import * as dotenv from "dotenv"
import session from "express-session"
import cookieParser from "cookie-parser"
import cors from "cors"
import passport from "passport"
import morgan from "morgan"
import swaggerUi from "swagger-ui-express"
import helmet from  'helmet'
import axios from "axios"
import YAML from "yamljs"



//importing routes
import indexRouter from "./routes/index.routes"
import { clearUser } from "./middlewares/auth.middleware"
import dbConnect from "./configs/db"
import cron from 'node-schedule'
import nodeCron from 'node-cron'
// import helmet from 'helmet'


//helemt 
app.use(helmet());


//app level middleware setup
dotenv.config() 
// app.use(helmet());
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true,limit:'10mb'}))
app.use(cors({
    //defines the origin of the request
    origin:["https://fyp-mero-ghar.vercel.app","https://fyp-sever.onrender.com","http://localhost:3000"],
    //headers can be accessed and modified else cant
    credentials:true
}))

app.use(session({
    secret:process.env.sessionSecret!,
    resave:false,
    saveUninitialized:false,
    cookie:{    
        maxAge:1000*60*60*24*7,
        //session data saved in http cookie which is only acessed in server
        httpOnly:true,
        //only accepts request from the https 
        secure:false,
    }

    //can store session data in db incase server crash the data is not lost
//  store:
}))



//attaches cookie from header to req object
app.use(cookieParser())

//imp middleware for using passport 
app.use(passport.initialize())

//this is not needed since i am using token based authentication 
//app.use(passport.session())


//database connection 
dbConnect();

//basic logging will only log request to thr console
app.use(morgan('dev'))



//for swagger APi documentation 
const apiDocumentation = YAML.load("./src/utils/swagger.yml")
app.use("/apiDocs",swaggerUi.serve,swaggerUi.setup(apiDocumentation)) //the obj returned by docs using option will  be used ot loap apiDocumentation


//custom middle ware function which will clear req obj on evry api request before storing the actual data 
app.use(clearUser)

//routes registration  before defning any routes 
//define prefix else nothing but the routepath should be uniqe
app.use(indexRouter)







// run this cron job every 8 minutes
nodeCron.schedule('*/8 * * * *', () => {
    try{
        console.log("cron job started api calling using nodecron ")
        const res=axios.get('https://fyp-sever.onrender.com/property/v1/getProperty?limit=10&page=1',{withCredentials:true}).then(res=>console.log("response ayo hai")).catch(e=>console.log(e))

        console.log("cron job end api called successfully using nodecron")

        

    }catch(e){
        console.log(e);
        
    }
});
app.get('/',(req:Request,res:Response)=>{
    res.send("heloo world")
})

//listen to server on ports
app.listen(2900,
    async()=>console.log("server started at port 2900")
)







