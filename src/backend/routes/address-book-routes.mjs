import express from 'express';
import {asyncHandler} from '../api/requestHandler.mjs';
import addressBookService from '../db/address-book-service.mjs';
import accesController from '../controller/acess-controller.mjs';
const router = express.Router();


router.use(accesController.loggedInOnly);
router.get(
  '/',
  asyncHandler(async (req) => {
    return await addressBookService.getContacts(req.user.ethereumAddress);
  })
);

router.post(
  '/',
  asyncHandler(async req => {
    return await addressBookService.createContact(req.user.ethereumAddress, req.body);
  })
);

router.put(
  '/',
  asyncHandler(async req => {
    return await addressBookService.updateContact(req.user.ethereumAddress, req.body);
  })
);

router.delete(
  '/',
  asyncHandler(async req => {
    return await addressBookService.deleteContact(req.user.ethereumAddress, req.body.contactAddress);
  })
);

export default router;
