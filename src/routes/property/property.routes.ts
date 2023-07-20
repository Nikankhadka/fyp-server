import { Router } from "express";
import { createPropertyC, deletePropertyC, getMyPropertiesC, getPropertiesC, getPropertyByIdC, updatePropertyC, updateViewCountC } from "../../controllers/property/property.controller";
import {  verifyaccessToken, verifyRole } from "../../middlewares/auth.middleware";
import { validatePropertyInput, validatePropertyUpdate } from "../../middlewares/inputvalidation";

//import other router related to property 
import reviewRoutes from "./review.routes"
import wishlistRoutes from './wishlist.routes'
import bookingRoutes from "./booking.routes"
const router=Router()

//register routes
router.use("/review",reviewRoutes);
router.use("/wishList",wishlistRoutes);
router.use("/booking",bookingRoutes)


router.get("/getProperty/:id",verifyaccessToken(false),getPropertyByIdC)
router.get("/getProperty",verifyaccessToken(false),getPropertiesC)
router.patch("/updateViewCount/:id",verifyaccessToken(false),verifyRole(false),updateViewCountC)

//this is used to fetch users listing in profile view and same can be used to fetch my properties 
router.get("/myProperties/:id",getMyPropertiesC)

router.use(verifyaccessToken(true));
router.use(verifyRole(false));
//view count sepeerate api for more accurate view count of the product

router.post("/createProperty",validatePropertyInput,createPropertyC)
router.patch("/updateProperty/:id",validatePropertyUpdate,updatePropertyC)
router.delete("/deleteProperty/:id",deletePropertyC)




//api to fetch user previously viwed property 
router.get('/getViewedProperty',)






export default router