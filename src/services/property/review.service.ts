import { IReview } from "../../interfaces/dbInterface";
import { bookingModel } from "../../models/booking";
import { propertyModel } from "../../models/property";
import { reviewModel } from "../../models/reviews";
import { userModel } from "../../models/user";


export const getReviewS=async(id:string,newPage:number,newLimit:number):Promise<IReview[]>=>{
    try{
        const propertyExist=await propertyModel.findOne({_id:id});
        if(!propertyExist) throw new Error("Invalid property id");

        const reviews=await reviewModel.find({propertyId:id}).limit(newLimit*1).skip((newPage-1)*newLimit).populate("userId",'_id userName profileImg createdAt').sort({createdAt:-1}).exec();
        if(!reviews) throw new Error("failed to Fetch reviews");

        return reviews
    }catch(e){
        console.log(e)
        throw e;
    }
}









export const postReviewS=async(userId:string,id:string,reviewData:Partial<IReview>):Promise<boolean>=>{
    try{
        //check if user is actually tennant
        const propertyExist=await propertyModel.findOne({_id:id});
        if(!propertyExist) throw new Error("Invalid Property Id")

        //if not tennant 
      if(propertyExist.tennants.some((tennant)=>tennant!=userId)) throw new Error("No user allowed to Review Except tennant!");


        // check review per booking user is only allowed to provide  a review per booking
        const bookingCount=await bookingModel.countDocuments({propertyId:id,userId:userId,status:'Completed'});
        if(!bookingCount) throw new Error("User Has not Completed any bookings/not Eligible to provide review");

        //now get review count:
        let reviewCount=await reviewModel.countDocuments({userId,propertyId:id});
        if(!reviewCount) {
            reviewCount=0;
        }

        if(reviewCount>=bookingCount) throw new Error("Tennant already has provided Review For the booking");

    const newReview =await reviewModel.create({userId,propertyId:id,...reviewData,hostId:propertyExist.userId})
    if(!newReview) throw new Error("failed to post Review")

            //now update rating for user and property if overall rating is provided 
        
            //calculate newrating 
            if(propertyExist.avgRating==0&&propertyExist.ratingCount==0){
                propertyExist.avgRating=reviewData.rating!;
                propertyExist.ratingCount=1;
                await propertyExist.save()
            }else{
                propertyExist.$inc('ratingCount',1).set('avgRating',Math.round((propertyExist.avgRating+reviewData.rating!)/2)<0?0:Math.round((propertyExist.avgRating+reviewData.rating!)/2))
                await propertyExist.save();
            }

           
          


            const user = await userModel.findOne({_id:propertyExist.userId});
            //now change userrating
            if(user?.avgRating==0&&user?.recievedReviewcount==0){
              user.avgRating=newReview.rating;
              user.recievedReviewcount=1;
              await user.save();
              return true;
            }

            //else 
            user!.avgRating=Math.round((user!.avgRating+newReview.rating)/ 2);
            user!.recievedReviewcount=user!.recievedReviewcount+1;
            await user?.save();
            return true;

        }

      

    catch(e){
        console.log(e)
        throw e;
    }
}



export const updateReviewS=async(userId:string,id:string,reviewData:Partial<IReview>):Promise<boolean>=>{
    try{
       // Get the old review that needs to be updated
    const oldReview = await reviewModel.findOne({_id:id});
    if (!oldReview) throw new Error("Invalid Review Id");

    // Check if the user is the same as the one who posted the old review
    if (oldReview.userId.toString() !== userId) throw new Error("Unauthorized");

    // Get the property that the review belongs to
    const property = await propertyModel.findById(oldReview.propertyId);
    if (!property) throw new Error("Invalid Property Id");

    // Calculate the new average rating for the property
    const newAvgRating = Math.round(
        
          ((property.avgRating! - oldReview.rating!) * 2) <= 0
            ? reviewData.rating!
            :(((property.avgRating - oldReview.rating) * 2) +reviewData.rating!)/2
      );
      
      

    // Update the rating count and average rating for the property
    property.avgRating=newAvgRating<0?0:newAvgRating;
    await property.save()

    // Update the average rating for the user
    const user = await userModel.findById(oldReview.hostId);
    if (user) {
      const updatedAvgRating =Math.round((((user.avgRating-oldReview.rating)*2)+reviewData.rating!)/2);
      user.avgRating=updatedAvgRating<0?0:updatedAvgRating;
      await user.save();
    }

    // Update the review
    const updatedReview = await reviewModel.findOneAndUpdate({_id:id},{
     ...reviewData
    }, { new: true});

    if(!updatedReview) throw new Error("Failed to update Review");
    return true;

} 

catch(e){
        console.log(e)
        throw e;
}

}



export const deleteReviewS=async(userId:string,id:string):Promise<boolean>=>{
    try{
      
    const oldReview = await reviewModel.findOne({_id:id});
    if (!oldReview) throw new Error("Invalid Review Id");

  
    if (oldReview.userId.toString() !== userId) throw new Error("Unauthorized");

   
    const property = await propertyModel.findById(oldReview.propertyId);
    if (!property) throw new Error("Invalid Property Id");

   
    const newAvgRating = Math.round(((property.avgRating-oldReview.rating)*2));

    // Update the rating count and average rating for the property
    property.avgRating=newAvgRating<0? 0:newAvgRating;
    property.ratingCount=property.ratingCount-1
    await property.save()
    

    // Update the average rating for the user
    const user = await userModel.findById(oldReview.hostId);
    if (user) {
      const updatedAvgRating =Math.round((user.avgRating-oldReview.rating)*2);
      user.avgRating=updatedAvgRating<0? 0:updatedAvgRating;
      user.recievedReviewcount=user.recievedReviewcount-1
      await user.save();
    }

    // Update the review
    const deleteReview=await reviewModel.findOneAndDelete({_id:id}).exec();
    if(!deleteReview) throw new Error("Failed to delete Review");
    return true;

} 

catch(e){
        console.log(e)
        throw e;
}

}
