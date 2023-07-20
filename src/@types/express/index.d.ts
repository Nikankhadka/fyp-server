




//global type declaration merging for express 
declare namespace Express {
  export interface Request {
    //this is set during google login so that main controller has access to user information for further processing
    user:import("../../interfaces/Auth").googleProfile,
    
    // this data is set after the token is verified
    userData:{
      docId:string,
      userId:string,
      is_Admin:boolean,
      kycVerified:boolean
    }
  }    
}



/*
declare module is module based it does not declare merge in global scope 
the following merges new reuqest interface in global scope, when used in module ts the request can  be extended and can be used
make sure to provide the correct module where the interfaces is defined 

declare module "express-serve-static-core" {
    interface Request {
      user:{
        userId:string,
        is_Admin:boolean
      } }}



for extension
declare module "express-serve-static-core" {
    export interface myrequest extends Request {
      user:{
        userId:string,
        is_Admin:boolean
      } }}


  to use myreuest interface in request 
  const loginhandler=async(req:myrequest,res:Response,next:NextFunction)

  and function passed route will also pass the my request interface
  import both myrequest anbd login handler from the module to work

  app.get("/login",loginhandler())


*/












    


