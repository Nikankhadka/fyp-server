import { Router } from "express";
import { addPropertyWishC, getWishListC, removeProperyC } from "../../controllers/property/wishlist.controller";
import {verifyaccessToken,verifyRole} from "../../middlewares/auth.middleware"



const router=Router()
router.use(verifyaccessToken(true));
router.use(verifyRole(false));

router.get('/',getWishListC)

//get specific property is going to use same api as the get products by id 
router.post("/:id",addPropertyWishC)

//only use property id since wishlist can be removed from anywhere from home page or wishlist or direct property
router.delete("/:id",removeProperyC)






export default router