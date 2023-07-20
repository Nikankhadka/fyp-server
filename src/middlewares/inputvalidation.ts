//interface/type for response and request/next object

import{Request,Response,NextFunction} from 'express'
import joi, { string } from 'joi'


export const validateInput=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        //defined joi schema for input validation of requet body
        const registerSchema=joi.object({
            userId:joi.string().required(),
            // Minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character:
            password:joi.string().required(),
            // .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$'))
        })

        //calls the validate method to check the value with schema  and validates both property to generate error response
        const{error,value}=registerSchema.validate(req.body,{abortEarly:false})
        if(error) return res.status(400).json({success:false,message:error.message})
        
        console.log(value)
        next()

    }catch(err){
        return res.status(400).json(err)
    }
}


export const validateProfile=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        // .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$'))
        console.log("validation input")
        console.log(req.body)
        //defined joi schema for input validation of requet body
        const updateProfileSchema=joi.object({
            userName:joi.string().optional(),
            oldPassword:joi.string().optional(),
            newPassword:joi.string().optional(),
            profileImg:joi.object({
                imgId:joi.string().optional(),
                imgUrl:joi.string().optional()
            }).optional(),
            about:joi.string().optional()
        })

      
        //calls the validate method to check the value with schema  and validates both property to generate error response
        const{error,value}=updateProfileSchema.validate(req.body,{abortEarly:false})
        if(error) return res.status(400).json({success:false,message:error.message})
        
        console.log(value)
        next()

    }catch(err){
        return res.status(400).json({err:'nihgga'})
    }
}

export const validateBooking=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        console.log("validation input")
        console.log(req.body)
        //defined joi schema for input validation of requet body
        const bookingSchema=joi.object({
            startDate:joi.date().required(),
            endDate:joi.date().required(),
            guest:joi.number().required(),
            payerId:joi.string().required(),
            // imgId:joi.string().required(),
            // imgUrl:joi.string().required(),
            initialAmount:joi.number().required(),
            serviceCharge:joi.number().required(),
            totalAmount:joi.number().required(),
            paymentId:joi.string().required(),
            //for how many days
            stay:joi.number().required(),
            bill:joi.string().required(),
           // propertyId:joi.string().required(), in route param


        })

      
        //calls the validate method to check the value with schema  and validates both property to generate error response
        const{error,value}=bookingSchema.validate(req.body,{abortEarly:false})
        if(error) return res.status(400).json({success:false,message:error.message})
        
        console.log(value)
        next()

    }catch(err){
        return res.status(400).json({err:'nihgga'})
    }
}



export const validateKyc=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        //defined joi schema for input validation of requet body
        const KycSchema=joi.object({
            firstName:joi.string().required(),
            lastName:joi.string().required(),
            gender:joi.string().required(),
            // email is not compulsory dynamically render email input in front end
            email:joi.string().allow('').email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','np'] } }).optional(),
           
            country:joi.string().required(),
            state: joi.string().required(),
            city: joi.string().required(),
            

            //when defining complex tyope can use joi.object to define schema,or can simply create object and nest 
            //or like below define array and for its items pass object schema , or direct obj property
            img:{
                imgId:joi.string().required(),
                imgUrl:joi.string().required()
            },
            phoneNumber:joi.string().allow('').optional()

        })

        //calls the validate method to check the value with schema  and validates both property to generate error response
        const{error,value}=KycSchema.validate(req.body.kycInfo,{abortEarly:false})
        if(error) return res.status(400).json({success:false,message:error.message})
        
        console.log(value)
        next()

    }catch(err){
        return res.status(400).json(err)
    }
}


export const validatePropertyInput = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const PropertySchema = joi.object({
            name: joi.string().required(),
            
            country:joi.string().required(),
            state: joi.string().required(),
            city: joi.string().required(),
            
            discription: joi.string().min(15).required(),
            propertyType: joi.string().required(),
            rules: joi.string().required(),
            amenities: joi.array().items(joi.string()).required(),
            rate: joi.number().required(),
            images: joi.array().items(
                {
                    imgId: joi.string().required(),
                    imgUrl: joi.string().required(),
                }
            ).required()
        });

        const { error, value } = PropertySchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ success: false, message: error.message });

        next();
    } catch (err) {
        return res.status(400).json(err);
    }
};

export const validatePropertyUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {

        console.log(req.body)
        const PropertySchema = joi.object({
            name: joi.string().optional(),
            country:joi.string().optional(),
            state: joi.string().optional(),
            city: joi.string().optional(),
            discription: joi.string().optional(),
            propertyType: joi.string().optional(),
            rules:joi.string().optional(),
            amenities: joi.array().items(joi.string()).optional(),
            rate: joi.number().optional(),
            images:joi.array().items(
                {
                    imgId: joi.string().optional(),
                    imgUrl: joi.string().optional(),
                    _id:joi.string().optional()
                }
            ).optional()
        });

        const { error, value } = PropertySchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ success: false, message: error.message });

        next();
    } catch (err) {
        return res.status(400).json(err);
    }
};



export const validateReviewInput=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        //defined joi schema for input validation of requet body
        console.log('reviewInput',req.body)
        const reviewSchema=joi.object({
            // rating:{
            //     property:joi.number().min(1).max(5).optional(),
            //     host:joi.number().min(1).max(5).optional(),
            //     value:joi.number().min(1).max(5).optional()
            // },
            rating:joi.number().min(1).max(5).required(),
            review:joi.string().min(5).max(50).required()  
        }).required()

        const{error,value}=reviewSchema.validate(req.body,{abortEarly:false})
        if(error) return res.status(422).json({success:false,message:error.message})
        
        console.log(value)
        next()

    }catch(err){
        return res.status(400).json(err)
    }
}


export const validateReviewUpdate=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        //defined joi schema for input validation of requet body
        const reviewSchema=joi.object({
            // rating:{
            //     property:joi.number().min(1).max(5).optional(),
            //     host:joi.number().min(1).max(5).optional(),
            //     value:joi.number().min(1).max(5).optional()
            // },
            rating:joi.number().min(1).max(5).optional(),
            review:joi.string().min(5).max(50).optional()  
        }).xor('rating','overallRating','review')

        const{error,value}=reviewSchema.validate(req.body,{abortEarly:false})
        if(error) return res.status(422).json({success:false,message:error.message})
        
        console.log(value)
        next()

    }catch(err){
        return res.status(400).json(err)
    }
}