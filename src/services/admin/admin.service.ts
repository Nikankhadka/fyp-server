import { userModel } from "../../models/user";
import {hash} from "bcrypt"
import { IBooking, IUser, Property } from "../../interfaces/dbInterface";
import { verifyKyc } from "../../interfaces/admin";
import { propertyModel } from "../../models/property";
import { sendMail } from "../../utils/zohoMailer";
import { adminPropTemplate, banUnbanPropTemplate, banUnbanUserTemplate, verifyKycTemplate } from "../../configs/mailtemplate";
import { bookingModel } from "../../models/booking";


interface Dash{
    totalUsers:number,
    activeUsers:number,
    totalProperties:number,
    activeProperties:number,
    totalBookings:number,
    activeBookings:number,
    properties:Partial<Property>[]
}

export const getDashBoardDataS=async():Promise<Dash>=>{
    try{
        const [totalUsers, activeUsers, totalProperties,activeProperties, totalBookings,activeBookings,properties] = await Promise.all([
            userModel.countDocuments({is_Admin:false}),
            userModel.countDocuments({ 'isBanned.status': false,is_Admin:false }),
            propertyModel.countDocuments({}),
            propertyModel.countDocuments({'isBanned.status':false,'isVerified.status':true}),
            bookingModel.countDocuments({}),
            bookingModel.countDocuments({status:{ $nin: ['ownerCancelled', 'tenantCancelled'] }}),
            propertyModel.find({'isBanned.status':false}).select("_id userId images name rate ratingCount tennants").populate('userId','_id userName').sort({avgRating:-1,ratingCount:-1})
          ])

          //

          return {
            totalUsers,
            activeUsers,
            totalProperties,
            activeProperties,
            totalBookings,
            activeBookings,
            properties
            
          }

          


    }catch(e){
        console.log(e);
        throw e;
    }
}











// paginated kyc requests and also saerch 
export const getAllUserS=async(page:string,limit:string,search?:string):Promise<IUser[]>=>{
    try{

        if(search! !==''){
            const users=await userModel.find({userName:{$regex:search,$options:'i'},is_Admin:false}).select('userName _id profileImg about isBanned');
            return users;
        }

        const newlimit=parseInt(limit)
        const newpage=parseInt(page)

        //since all admin have access to this simply fetch unverified property set in pending  .limit(newlimit*1).skip((newpage-1)*newlimit).sort({userId:"asc"}).
        const users=await userModel.find({is_Admin:false}).select('userName _id profileImg about isBanned').sort({createdAt:-1,userName:'asc'}).skip((newpage-1)*newlimit).limit(newlimit*1);
        if(!users) throw new Error("No user found")
        return users

    }catch(e){
        console.log(e)
        throw e
    }
}


// paginated kyc requests
export const getAllPropertiesS=async(page:string,limit:string,search?:string):Promise<Property[]>=>{
    try{

        if(search! !==''){
            const properties=await propertyModel.find({name:{$regex:search,$options:'i'},'isVerified.status':true}).select('name userId images avgRating isBanned').populate('userId','userName _id profileImg').sort({createdAt:-1,avgRating:-1 ,ratingCount:-1});
            return properties;
        }

        
        const newlimit=parseInt(limit)
        const newpage=parseInt(page)

        //since all admin have access to this simply fetch unverified property set in pending  .limit(newlimit*1).skip((newpage-1)*newlimit).sort({userId:"asc"}).
        const properties=await propertyModel.find({'isVerified.status':true}).select('name userId images avgRating isBanned').populate('userId','userName _id profileImg').sort({createdAt:-1,userName:'asc',avgRating:-1 ,ratingCount:-1}).skip((newpage-1)*newlimit).limit(newlimit*1);
        if(!properties) throw new Error("No properties Found")
        return properties

    }catch(e){
        console.log(e)
        throw e
    }
}


export const getAllBookingS=async(page:string,limit:string):Promise<IBooking[]>=>{
    try{

        const newlimit=parseInt(limit)
        const newpage=parseInt(page)

        const reservations=await bookingModel.find({}).skip((newpage! - 1) * newlimit!)
        .limit(newlimit!).populate('propertyId','name _id images avgRating').populate('paymentId').populate('userId','_id userName profileImg').populate('hostId','_id userName profileImg').sort({createdtAt:-1}).exec()
        if(!reservations) throw new Error("Failed to Fetch reservation");
        return reservations;

    }catch(e){
        console.log(e)
        throw e
    }
}



export const banUnbanUserS=async(id:string,ban:boolean,message?:string)=>{
    try{

        const userExist=await userModel.findOne({_id:id});
        if(!userExist) throw new Error("User Does not Exist");

        if(ban){
            userExist.isBanned.status=true;
            userExist.isBanned.message=message!;
            await userExist.save()

            //now ban users all property
            const banProperties=await propertyModel.updateMany({userId:id},{
                $set:{
                    'isBanned.status':true,
                    'isBanned.message':message
                }
            },{new:true});

            

            //send mail indicating user has been banned
           if(userExist.email.isVerified){
            const mail=sendMail(banUnbanUserTemplate(userExist.userName,userExist.email.mail,true,message!))

           }
            //also freeze ban all bookings

            // const banBookings=await bookingModel.findOneAndUpdate({})

            return true;
        }

            userExist.isBanned.status=false;
            userExist.isBanned.message='';
            await userExist.save()

            //now ban users all property
            const unbanProperties=await propertyModel.updateMany({userId:id},{
                $set:{
                    'isBanned.status':false,
                    'isBanned.message':''
                }
            },{new:true});

            if(!unbanProperties) throw new Error("user unBanning Failed")
            
            if(userExist.email.isVerified){
                const mail=sendMail(banUnbanUserTemplate(userExist.userName,userExist.email.mail,false))
    
            }

            //also freeze ban all bookings

            // const banBookings=await bookingModel.findOneAndUpdate({})

            return true;


    }catch(e){
        console.log(e);
        throw e;
    }
}



export const banUnbanPropertyS=async(id:string,ban:boolean,message?:string)=>{
    try{

        const propertyExist=await propertyModel.findOne({_id:id,'isVerified.status':true});
        if(!propertyExist) throw new Error("User Does not Exist");

        //get host information 
        const host=await userModel.findOne({_id:propertyExist.userId});
        if(!host) throw new Error("No Host for the property")

        if(ban){
            propertyExist.isBanned.status=true;
            propertyExist.isBanned.message=message!;
            await propertyExist.save()

            //send mail 
            if(host.email.isVerified){
                const mail =sendMail(banUnbanPropTemplate(host.userName,host.email.mail,true,id,propertyExist.images[0].imgUrl,message))
            }
           

            //should i also freeze booking


            return true;
        }

            propertyExist.isBanned.status=false;
            propertyExist.isBanned.message='';
            await propertyExist.save()

            if(host.email.isVerified){
                const mail =sendMail(banUnbanPropTemplate(host.userName,host.email.mail,false,id,propertyExist.images[0].imgUrl,message))
            }
          

            //also freeze ban all bookings

            // const banBookings=await bookingModel.findOneAndUpdate({})

            return true;


    }catch(e){
        console.log(e);
        throw e;
    }
}




export const registerAdminS=async(userId:string,password:string):Promise<boolean>=>{
    try{
        
        const userExist=await userModel.findOne({userId:userId});
        if(userExist) throw new Error("User with id Already Exist,please enter new userId")
       
        //since no user create new user
        const newUser=await userModel.create({
            userId:userId,
            userName:userId,
            password:await hash(password,process.env.salt_rounds!),
            is_Admin:true
        })

        //not necessary to call but call
        await newUser.save(); 
        if(!newUser) throw new Error("User failed to register")
        console.log(newUser._id);
        return true;

    }catch(e){
        console.log(e)
        throw e
        
    }
}


export const getUserKycS=async(id:string):Promise<Partial<IUser>>=>{
    try{
    
        const userData=await userModel.findOne({$or:[{_id: id },{ userId:id }]}).select("-password -token  -refreshToken  -is_Admin -wishList  -viewedProperty  ");
        if(!userData) throw new Error("Failed to fetch userData")
        return userData;
    }catch(e){
        console.log(e)
        throw e;    
    }
}




// paginated kyc requests
export const getKycRequestsS=async(page:string,limit:string):Promise<IUser[]>=>{
    try{

        const newlimit=parseInt(limit)
        const newpage=parseInt(page)

        //since all admin have access to this simply fetch unverified property set in pending  .limit(newlimit*1).skip((newpage-1)*newlimit).sort({userId:"asc"}).
        const kycRequests=await userModel.find({"kyc.isVerified":false,"kyc.pending":true}).select('userId userName _id profileImg about').sort({userId:"asc",createdAt:-1}).skip((newpage-1)*newlimit).limit(newlimit*1);
        if(!kycRequests) throw new Error("No user need to be verified right now")
        return kycRequests

    }catch(e){
        console.log(e)
        throw e
    }
}


export const verifyKycRequestsS=async(adminId:string,id:string,kycData:verifyKyc):Promise<boolean>=>{
    try{
        //perform action according to verification status 
        if(kycData.isVerified){
            //check if the user has kyc info and not empty
            const checkKycData=userModel.findOne({_id:id,kycInfo:{$exist:true,$ne:{}}});
            if(!checkKycData) throw new Error("Invalid id and Misuse of admin detected")

            //since admin has verified and data is also valid now update the userDocument 
            const verifyUser=await userModel.findOneAndUpdate({_id:id},{
                "$set":{
                    "kyc.isVerified":true,
                    "kyc.message":"",
                    "kyc.approvedBy":adminId,
                    'kyc.pending':false
                }
            },{new:true})
            if(!verifyUser) throw new Error("user not able to verify")

            if(verifyUser.email.isVerified){
            const notifyUser=sendMail(verifyKycTemplate(verifyUser.userName,verifyUser.email.mail,true))
            }

           

            
          

            return true;
        }

        
        
            //since admin deemed kyc info to be invalid just provide the message to the user 

            //just make sure the user account is not verified
            const userCheck=await userModel.findOne({_id:id,kyc:{isVerified:true}})
            if(userCheck) throw new Error("User cant be done unverified since User is already verified")

            const declineUser=await userModel.findOneAndUpdate({_id:id},{
                "$set":{
                    "kyc.isVerified":false,
                    "kyc.message":kycData.message,
                    "kyc.approvedBy":adminId,
                    'kyc.pending':false
                }
            })
            if(!declineUser) throw new Error("User kyc Decline failed")

            if(declineUser.email.mail){
                const notifyUser=sendMail(verifyKycTemplate(declineUser.userName,declineUser.email.mail,false,kycData.message))
            }
        
            return true;
        //the default task would be clear admin kyc request either way 
        // const deleteKycRequests=await userModel.updateMany({is_Admin:true},{
        //     "$pull":{
        //         "kycVerificationRequests":id
        //     }
        // })

        // if(!deleteKycRequests) throw new Error("Kyc Request delete failed")
       

    }catch(e){
        console.log(e);
        throw e;
    }
}



export const getPropertyRequestsS=async(page:string,limit:string):Promise<Property[]>=>{
    try{
        //since all admin have access to this simply fetch unverified property set in pending
        const newLimit=parseInt(limit);
        const newPage=parseInt(page) 
        const propertyRequests=await propertyModel.find({'isVerified.status': false, 'isVerified.pending': true}).select('-tennants ').limit(newLimit*1).skip((newPage-1)*newLimit).sort({userId:"asc"})
        if(!propertyRequests) throw new Error("No property to be verified right now")
        return propertyRequests

    }catch(e){
        console.log(e)
        throw e;
    }

}

export const verifyPropertyRequestsS=async(adminId:string,propertyId:string,status:boolean,message:string):Promise<boolean>=>{
    try{

        //if kyc is to be unverifed just update the document 
        if(!status){
            const declineProperty=await propertyModel.findOneAndUpdate({_id:propertyId},{
                "$set":{
                    "isVerified.status":status,
                    "isVerified.pending":false,
                    "isVerified.message":message,
                    "isVerified.approvedBy":adminId
                }},{new:true})

            if(!declineProperty) throw new Error("Property decline failed");
            
            const user=await userModel.findOne({_id:declineProperty.userId});
            const notify=sendMail(adminPropTemplate(user!.userName,user!.email.mail,false,declineProperty.name,declineProperty.images[0].imgUrl,message))

            return true;
        }

        
        const verifyProperty=await propertyModel.findOneAndUpdate({_id:propertyId},{
            "$set":{
                "isVerified.status":status,
                "isVerified.pending":false,
                "isVerified.message":'',
                "isVerified.approvedBy":adminId,
                
            }},{new:true})

        if(!verifyProperty) throw new Error("Property verification failed");
        
        const user=await userModel.findOne({_id:verifyProperty.userId});
        const notify=sendMail(adminPropTemplate(user!.userName,user!.email.mail,true,verifyProperty.name,verifyProperty.images[0].imgUrl))

            
        //increase the property post count for user
          const updateCount=await userModel.updateOne({userId:verifyProperty.userId},{
            "$inc":{
                listingCount:1
            }
          })

          if(!updateCount) throw new Error("Property verified but failed to update user posting count")
        return true;

    }catch(e){
        console.log(e);
        throw e;
    }
}