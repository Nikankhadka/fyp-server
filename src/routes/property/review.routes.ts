import { Router } from "express";
import { deleteReviewC, getReviewsC, postReviewC,updateReviewC } from "../../controllers/property/review.controller";
import { verifyaccessToken, verifyRole } from "../../middlewares/auth.middleware";
import { validateReviewInput } from "../../middlewares/inputvalidation";

const router=Router()

//review for the property
router.get("/:id",getReviewsC)

//crud opeartion except for read needs user access 
router.use(verifyaccessToken(true));
router.use(verifyRole(false))

router.post("/:id",validateReviewInput,postReviewC)


//pass review id here
router.patch("/:id",validateReviewInput,updateReviewC)
router.patch("/reportReview/:id",validateReviewInput,updateReviewC)
router.delete("/:id",deleteReviewC)






export default router;