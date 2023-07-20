import { propertyModel } from "../../models/property";
import { userModel } from "../../models/user";
import { IUser } from "../../interfaces/dbInterface";



// setup condion for number of list and property per list if it is large number create different model 
export const addPropertyWishS=async(userId:string,id:string):Promise<boolean>=>{
    try{


        const checkpropertyOwner=await propertyModel.findOne({_id:id,userId});
        if(checkpropertyOwner) throw new Error("Property owner not allowed add owned property in wishlist")

        //check whether this user already has added property to wishli
        const checkWishList=await userModel.findOne({_id:userId,wishList:id});
        if(checkWishList) throw new Error("Property already in the wishlist");

        //now add property in the users wishlist
        const updateWishList=await userModel.findOneAndUpdate({_id:userId},{$push:{
            'wishList':id
        }},{new:true})

        if(!updateWishList) throw new Error("Property failed to add in the wish List");
        return true;
    }catch(e){
        console.log(e)
        throw e;
    }
}


export const getWishListS=async(userId:string,page:number,limit:number):Promise<Partial<IUser>>=>{
    try{
        const skip = (page - 1) * limit;
        const wishList = await userModel.findOne({userId})
            .select('wishList')
            .populate({
                path: 'wishList',
                select: '-tennants -isBanned -isVerified',
                options: {
                    skip,
                    limit
                }
            });

        if(!wishList) throw new Error("Wish List not avialable for the given user");
        return wishList;
    }catch(e){
        console.log(e);
        throw e;
    }
}



//for get property by id use same as property but return the wishlist status on response to highlight the status

export const removePropertyS=async(userId:string,id:string):Promise<boolean>=>{
    try{
        //validate property id 
        const propertyExist =await propertyModel.findOne({_id:id})
        if(!propertyExist) throw new Error("Invalid property Id/Property with the given id does not Exist!")

        const removeProperty=await userModel.findOneAndUpdate({userId},{$pull:{
            wishList:id
        }})

        if(!removeProperty) throw new Error("Property remove Failed/Invalid property Credential for the user!");
        return true

    }catch(e){
        console.log(e);
        throw e;
    }
}