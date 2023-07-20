import { Router } from "express";
import { addEmailC, getPhoneC, getUserC,getMeC, postKycC, updateProfileC, verifyEmailC,postPhoneC } from "../../controllers/user/user.controller";
import { verifyaccessToken,verifyRole } from "../../middlewares/auth.middleware";
import { validateKyc, validateProfile } from "../../middlewares/inputvalidation";

const router=Router();

//email link should be verified by mail 
router.get("/verifyEmail/:token",verifyEmailC)

//get user data for normal as well as currrent user/admin
router.get('/getUser/:id',getUserC)


router.use(verifyaccessToken(true));
//get user data for account setting
router.get('/getMe',getMeC)

router.post("/addEmail",addEmailC)

router.patch("/updateProfile",validateProfile,updateProfileC)

//use the same api end point to update kyc information
router.post("/postKyc",validateKyc,postKycC)



//add middleware for both of these
router.get("/verifyPhone/:phone",getPhoneC)
router.post("/verifyPhone/:phone",postPhoneC)




export default router;