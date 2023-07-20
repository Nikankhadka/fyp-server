import { Types } from "mongoose";
import { Property } from "../../interfaces/dbInterface";
import { propertyModel } from "../../models/property";
import { userModel } from "../../models/user";
import { bookingModel } from "../../models/booking";
import { sendMail } from "../../utils/zohoMailer";
import { userPropTemplate } from "../../configs/mailtemplate";
export interface queryParams{
    minRate:number,
    maxRate:number,
    propertyType:string,
    country:string,
    state:string,
    city:string,
    // startDate?:string,
    // endDate?:string,
    rating:number,
    amenities:string[],
  }


//property is not crated only request is send to admin for property post verification
export const createPropertyS=async(_id:string,propertyData:Partial<Property>):Promise<boolean>=>{
    try{
        console.log('imagges',propertyData)
        const newProperty=await propertyModel.create({
            ...propertyData,
            userId:_id,
            isVerified:{
            status:false,
            pending:true,
            message:""
            }
        })

        await newProperty.save(); 
        if(!newProperty) throw new Error("Property post failed")

        const userdata=await userModel.findOne({_id});
        const notify=sendMail(userPropTemplate(userdata!.userName,userdata!.email.mail,true,newProperty.name,newProperty.images[0].imgUrl))

        return true;
    }catch(e){
        console.log(e);
        throw e;
    }
}



export const getPropertyByIdS=async(id:string,userId:string):Promise<{property:Property,user:string,inWishList:boolean}>=>{
    try{
        if(userId!==""){
            console.log("indie user",userId)
            //check whether its a previous tennent 
            const userdocument=await userModel.findOne({_id:userId});


            const propertyData=await propertyModel.findOne({_id:id}).populate('userId','_id userName profileImg createdAt').populate("tennants",'_id  userName profileImg');
            if(!propertyData) throw new Error("No property with the given id")
            
            console.log("propertyData",propertyData)
            //copydata which can be manipulated
            let copyData=propertyData;
         

            //check whether property is in wishlist of the user
            const inWishList = userdocument!.wishList?.some((wish)=>wish.toString()==id) ?? false;

          //delete tennant informations in next js server if the user is not owner 
            if(propertyData.tennants.some((tennant)=>tennant._id?.toString()==userId)){
                copyData.tennants=[{}]
                console.log(copyData)
                return {property:copyData,user:"tennant",inWishList}
            } 

            //check whether it is the property owner 
         
            if(propertyData.userId._id?.toString()==userId) return {property:propertyData,user:"owner",inWishList};

            //now for normal user/admin 
            if(userdocument?.is_Admin){
                copyData.tennants=[{}]
                return {property:copyData,user:"admin",inWishList}
            }
            
            copyData.tennants=[{}]
            return {property:copyData,user:"user",inWishList}

            
        }
        console.log("no user inside service")
        const propertyData=await propertyModel.findOne({_id:id}).populate('userId','_id userName profileImg createdAt');
        if(!propertyData) throw new Error("Proper data fetching failed")
        return {property:propertyData,user:"",inWishList:false};
        
    }catch(e){
        console.log(e)
        throw e;
    }
}


//get properties for a  userid while viewing profile or my own properties
export const getMyPropertiesS=async(page:string,limit:string,userId:string):Promise<Property[]>=>{
    try{
        //since all admin have access to this simply fetch unverified property set in pending
        const newLimit=parseInt(limit);
        const newPage=parseInt(page) 
        const properties=await propertyModel.find({userId}).select('-tennants -tennantId ').limit(newLimit*1).skip((newPage-1)*newLimit).sort({createdAt:1})
        if(!properties) throw new Error("No property listedby the user")
        return properties

    }catch(e){
        console.log(e)
        throw e;
    }

}



//get properties in home page and also support search
export const getPropertiesS=async(page:string,limit:string,queryParams:queryParams):Promise<Property[]>=>{
    try{
        //since all admin have access to this simply fetch unverified property set in pending
        const newLimit=parseInt(limit);
        const newPage=parseInt(page) 


        
        // Define the query conditions based on the provided inputs
        let matchConditions:any = {};
        
        if (queryParams.maxRate>0) {


            matchConditions.rate = { $gte: queryParams.minRate,$lte: queryParams.maxRate};
        }
        
        if (queryParams.propertyType&&queryParams.propertyType !='') {
          matchConditions.propertyType = queryParams.propertyType;
        }
        
        if (queryParams.country&&queryParams.country !='') {
          matchConditions.country = queryParams.country;
        }
        
        if ( queryParams.state&&queryParams.state !='') {
          matchConditions.state = queryParams.state;
        }
        
        if (queryParams.city&& queryParams.city !='') {
          matchConditions.city = queryParams.city;
        }
        
        if (queryParams.rating && queryParams.rating >= 1) {
          matchConditions.avgRating = { $gte: queryParams.rating};
        }
        
        if (queryParams.amenities && queryParams.amenities.length > 0) {
          matchConditions.amenities = { $all: queryParams.amenities };
        }
        
        

      

        console.log('match conditian',matchConditions)
        // Calculate the skip value for pagination
        const skip = (newPage - 1) * newLimit;
        
       // Perform the query using Mongoose
            const properties = await propertyModel.find({...matchConditions,'isBanned.status':false,'isVerified.status':true})
            .sort({ avgRating: -1, ratingCount: -1, createdAt: -1 })
            .select('-tennants')
            .limit(newLimit)
            .skip(skip);
        // Use the retrieved properties as needed
        console.log(properties);
        
        return properties;


    }catch(e){
        console.log(e)
        throw e;
    }

}





export const updatePropertyS=async(userId:string,id:string,updateData:Partial<Property>):Promise<Property>=>{
    try{
        //check property ownership before modification 
        const checkProperty=await propertyModel.findOne({_id:id,userId})
        if(!checkProperty) throw new Error("Invalid request credential/unAuthorized user");

        //now update the property information 
        const updatedProperty=await propertyModel.findOneAndUpdate({_id:id,userId},{...updateData,
        isVerified:{status:false,pending:true,message:"Update needs reverification"}},{new:true});
        
        
       /* updatedProperty!.is_verified.status=false,
        updatedProperty!.is_verified.pending=true,
        updatedProperty!.is_verified.message="Property updated so need Reverification"**/

        if(!updatedProperty) throw new Error("Property Update Failed")


        const userdata=await userModel.findOne({_id:userId});
        const notify=sendMail(userPropTemplate(userdata!.userName,userdata!.email.mail,true,updatedProperty.name,updatedProperty.images[0].imgUrl))

        return updatedProperty

    }catch(e){
        console.log(e);
        throw e;
    }
}





export const deletePropertyS=async(userId:string,propertyId:string):Promise<boolean>=>{
    try{
        const checkProperty=await propertyModel.findOne({_id:propertyId,userId});
        if(!checkProperty) throw new Error("Invalid Delete Request/No property with the User exist");


        //check if booking for the property exist if then cant delete 
        const currentDate = new Date();
        const bookingExist=await bookingModel.findOne({
            propertyId,
            status:"Booked",
            $or: [
                {
                    startDate: {$gt: currentDate},
                    endDate: {$gt: currentDate},
                },
                {
                    startDate: {$lt: currentDate},
                    endDate: {$gte: currentDate},
                },
            ],
        }).exec();

        if(bookingExist) throw new Error("Property cant be removed/Booking Exist");
        
        //now delete
        const deleteProperty=await propertyModel.findOneAndDelete({_id:propertyId,userId});
        if(!deleteProperty) throw new Error("Propery Delete failed");

        //now property delete so decrease listing count from user profile
        const decreaseCount=await userModel.updateOne({userId},{
            $inc:{
                listingCount:-1
            }
        })

        //also decrese ratinf rating-1/2 and also rating count 

        if(!decreaseCount) throw new Error("Propety deleted failed to decrease listing count");

        //send property deleted notification
        const userdata=await userModel.findOne({_id:userId});
        const notify=sendMail(userPropTemplate(userdata!.userName,userdata!.email.mail,false,checkProperty.name,checkProperty.images[0].imgUrl))


        return true;
    }catch(e){
        console.log(e);
        throw e;
    }
}





export const updateViewCountS=async(userId:string,propertyId:string):Promise<boolean>=>{
    try{
        //if not empty append the product into viewed product
        if(userId!==""){

            //check if its property owner then dont count 
            const propertyOwner=await propertyModel.findOne({_id:propertyId,userId});
            if(propertyOwner) return false;
            
            const checkViewed=await userModel.findOne({_id:userId,viewedProperty:propertyId});
            //donot update view if same user views the property
            if(checkViewed) return false;

            //now append the product
            const updateViewedProperty= await userModel.findOneAndUpdate({_id:userId},{$push:{viewedProperty:propertyId}},{new:true})
            if(!updateViewedProperty) throw new Error("view update failed")
            //now since appended check the array size of morethan 10 remove first property
            if(updateViewedProperty.viewedProperty.length! >10) {
                updateViewedProperty?.viewedProperty.shift() 
                await updateViewedProperty?.save()
            }
        }

        //now increment propery view count
        const updateViewCount=await propertyModel.updateOne({_id:propertyId},{
            $inc:{
                viewCount:1
            }
        })
        if(!updateViewCount) throw new Error("update view count failed")
        return true;

    }catch(e){
        console.log(e);
        throw e;
    }
}



// const mongoose = require('mongoose');

// // Define the schema for the property collection
// const PropertySchema = new mongoose.Schema({
//   title: String,
//   rate: Number,
//   propertyType: String,
//   country: String,
//   state: String,
//   city: String,
//   rating: Number,
//   amenities: [String]
//   // ... other property fields
// });

// // Define the schema for the booking collection
// const BookingSchema = new mongoose.Schema({
//   propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
//   startDate: Date,
//   endDate: Date
// });

// // Create the models based on the schemas
// const Property = mongoose.model('Property', PropertySchema);
// const Booking = mongoose.model('Booking', BookingSchema);

// // Search properties available on certain dates with additional filters
// const searchProperties = async (
//   startDate,
//   endDate,
//   minRate,
//   maxRate,
//   propertyType,
//   country,
//   state,
//   city,
//   rating,
//   amenities
// ) => {
//   const matchConditions = {};

//   if (minRate !== undefined && maxRate !== undefined) {
//     matchConditions.rate = { $gte: minRate, $lte: maxRate };
//   }

//   if (propertyType) {
//     matchConditions.propertyType = propertyType;
//   }

//   if (country) {
//     matchConditions.country = country;
//   }

//   if (state) {
//     matchConditions.state = state;
//   }

//   if (city) {
//     matchConditions.city = city;
//   }

//   if (rating !== undefined) {
//     matchConditions.rating = { $gte: rating };
//   }

//   if (amenities && amenities.length > 0) {
//     matchConditions.amenities = { $all: amenities };
//   }

//   const properties = await Property.aggregate([
//     // Match properties that satisfy the filtering conditions
//     {
//       $match: matchConditions
//     },
//     // Lookup bookings and filter properties with overlapping bookings
//     {
//       $lookup: {
//         from: 'bookings',
//         let: { propertyId: '$_id' },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ['$propertyId', '$$propertyId'] },
//                   { $lt: ['$endDate', startDate] },
//                   { $gt: ['$startDate', endDate] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: 'bookings'
//       }
//     },
//     // Filter properties with no overlapping bookings
//     {
//       $match: {
//         bookings: { $size: 0 }
//       }
//     }
//   ]);

//   return properties;
// };

// // Usage
// const providedStartDate = new Date('2023-05-01');
// const providedEndDate = new Date('2023-05-10');
// const minRate = 0;
// const maxRate = 1000;
// const propertyType = 'Apartment';
// const country = 'USA';
// const state = 'California';
// const city = 'Los Angeles';
// const rating = 4.5;
// const amenities = ['Swimming Pool', 'Gym'];

// searchProperties(
//   providedStartDate,
//   providedEndDate,
//   minRate,
//   maxRate,
//   propertyType,
//   country,
//   state,
//   city,
//   rating,
//   amenities
// )
//   .then(properties => {
//     console.log('Available properties:', properties);
//   })
//   .catch(err => {
//     console.error('Error searching properties:', err);
//   });
