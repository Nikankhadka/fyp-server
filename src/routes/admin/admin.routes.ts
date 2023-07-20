
import { Router } from "express";
import { banUnbanPropertyC, banUnbanUserC, getAllBookingsC, getAllPropertiesC, getAllUsersC, getDashBoardDataC, getKycRequestsC, getPropertyRequestsC, getUserKycC, registerAdminC, verifyKycRequestsC, verifyPropertyRequestsC } from "../../controllers/admin/admin.controller";
import { verifyaccessToken, verifyRole } from "../../middlewares/auth.middleware";
import { validateInput } from "../../middlewares/inputvalidation";

const router=Router();

router.use(verifyaccessToken(true));
router.use(verifyRole(true))

//will not get private information just some infos
router.get("/allUsers",getAllUsersC)

router.get("/allProperties",getAllPropertiesC)

router.get("/allBookings",getAllBookingsC)

router.get("/dashBoardData",getDashBoardDataC)


//will fetch users private information 
router.get("/getUser/:id",getUserKycC)


//ban unban user
router.patch('/banUnbanUser/:id',banUnbanUserC)

//now last ban unban for property then finished

router.patch('/banUnbanProperty/:id',banUnbanPropertyC)


//search api only left




router.post("/registerAdmin",validateInput,registerAdminC)



router.get("/kycRequests",getKycRequestsC)
router.patch("/kycRequests/:id",verifyKycRequestsC)
router.get("/propertyRequests",getPropertyRequestsC)
router.patch("/propertyRequests/:id",verifyPropertyRequestsC)








export default router;