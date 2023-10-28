
const express = require("express");
const router = express.Router();

const User = require("../Models/userModel.js");

const { verifyToken } = require("../utlis/generateToken.js");

const ApiController = require('../Controllers/ApiController');

//Guest 
router.post('/register',ApiController.register);                              // name, email, phone, gender, password
router.post('/login',ApiController.login);                                    // email/phone, password/otp
router.post('/forget-password',ApiController.forget_password);                // email/phone
router.post('/reset-password',ApiController.reset_password);                 // email/phone, otp

//Auth User  -- required token
router.post('/profile',ApiController.profile);                                //                
router.post('/update-profile',ApiController.update_profile);                  // name, email, phone, gender, address, photo
router.post('/change-password',ApiController.change_password);                // old_password, new_password

router.post('/setting',ApiController.setting);                                //

router.post('/create-razorpay-order',ApiController.create_razorpay_order);    //
router.post('/verify-signature',ApiController.verify_signature);              //
router.post('/withdraw-request',ApiController.withdraw_request);              // amount, bank_detail

router.post('/upcoming-contest',ApiController.upcoming_contest);              //
router.post('/join-contest',ApiController.join_contest);                      // contest_id 
router.post('/open-quiz',ApiController.open_quiz);                            // contest_id - response{question and video details} (timer starts)
router.post('/save-answer',ApiController.save_answer);                        // contest_id, option, time (timer stop)

router.post('/quiz-details',ApiController.quiz_details);                      // contest_id 
router.post('/my-contests',ApiController.my_contests);                        //
router.post('/transactions',ApiController.transactions);					  // debit/ credit

router.post('/logout',ApiController.logout);                                  //

module.exports = router;
