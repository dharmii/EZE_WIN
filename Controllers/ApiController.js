const Contest = require("../Models/Contest.js");
const Winning = require("../Models/Winning.js");
const User = require("../Models/userModel.js");
const Setting = require("../Models/Setting.js");
const Transaction = require("../Models/Setting.js");
const Quiz = require("../Models/Quiz.js");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../utlis/generateToken.js");
const AWS = require('aws-sdk');
const { UniqueString, UniqueNumber, UniqueStringId,UniqueNumberId,
        UniqueOTP,UniqueCharOTP,HEXColor,uuid } = require('unique-string-generator');

module.exports = {
	register : async (req, res) => {
		
	},
	login : async (req, res) => {
		const{email,password} = req.body;
		const user = await User.findOne({Email:email});
		if(user && await bcrypt.compare(password, user.Password)){
			const token = generateToken(user._id);
	        res.status(200).json({token : token});
		}

	},
	forget_password : async (req, res) => {
		
	},
	reset_password : async (req, res) => {
		
	},

	profile : async (req, res) => {
		const user = await User.findById(req.user.id);
		res.status(200).json({user : user});
	},
	update_profile : async (req, res) => {
		const user = await User.findById(req.user.id);
		var photo = user.photo;
		if(req.files){
			AWS.config.update({
		        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Access key ID
		        secretAccesskey: process.env.AWS_SECRET_ACCESS_KEY, // Secret access key
		        region: process.env.AWS_REGION //Region
		    });
		    const s3 = new AWS.S3();
		    if(req.files.profile_pic){
		    	var params = {
				Bucket: 'ezewin-files',
			    Key: photo,
			}
			s3.deleteObject(params, function(err, data) {
                 		// deleted
			});
			var str = req.files.profile_pic.mimetype;
			var extension = str.substring(str.indexOf("/") + 1);
			profile_pic = UniqueString() + "." + extension;
			// Binary data base64
		    	var fileContent  = Buffer.from(req.files.profile_pic.data, 'binary');
			// Uploading files to the bucket
			var params = {
		        	Bucket: 'ezewin-files',
		        	Key: profile_pic,
		        	Body: fileContent
		    	};
			await s3.upload(params, function(err, data) {
				if (err) {
			            throw err;
			        }
			});
			photo = profile_pic;
		    }
		}
		const result = await User.findByIdAndUpdate(user._id,{
			Name:req.body.name,
			Email:req.body.email,
			Phone_Number:req.body.phone,
			Gender:req.body.gender,
			address:req.body.address,
			photo:photo,
		});

		res.status(200).json({message : "Profile Updated"});

	},
	change_password : async (req, res) => {
		const user = await User.findById(req.user.id);
		const {old_password, new_password} = req.body;
		if(user.matchPassword(old_password)){
			user.Password = new_password;
			user.save();
			res.status(200).json({message : "Password Updated"});
		}else{
			res.status(200).json({message : "Profile Updated"});
		}
	},

	setting : async (req, res) => {
		const setting = await Setting.findOne().skip(0);
		res.status(200).json({data : setting});
	},

	create_razorpay_order : async (req, res) => {
		
	},
	verify_signature : async (req, res) => {
		
	},
	withdraw_request : async (req, res) => {
		
	},

	upcoming_contest : async (req, res) => {
		const contests = await Contest.find({status:'Upcoming'}).populate('winnings');
		res.status(200).json({data : contests});
	},

	join_contest : async (req, res,next) => {
		const contest = await Contest.findById(req.body.contest_id);
		const user = await User.findById(req.user.id);
		const quiz = await Quiz.findOne({contest:req.body.contest_id,user:req.user.id});
		if(contest.status != 'Upcoming'){
			res.status(400).json({message : "Joining is unavailable"});
		}else{
			if(quiz){
				res.status(400).json({message : "Contest Allready joined"});
			}else{
				if(user.wallet >= contest.entry_fee){
					user.wallet = user.wallet - contest.entry_fee;
					await user.save();
					await contest.users.push(user);
					const quiz = await new Quiz();
					quiz.contest = contest._id;
					quiz.user = req.user.id;
					await quiz.save();
					await contest.quizzes.push(quiz);
					await contest.save();
					res.status(200).json({message : "Contest joined"});
				}else{
					res.status(400).json({message : "Insufficient Balance, Please add cash"});
				}
			}
		}
		
	},
	open_quiz : async (req, res) => {
		const contest = await Contest.findById(req.body.contest_id).populate('question').populate('winnings').populate('quizzes').populate('users');
		const quizExists = await Quiz.findOne({contest:req.body.contest_id,user:req.user.id}).populate('user');
		res.status(200).json({contest,quizExists});
	},
	save_answer : async (req, res) => {
		const contest = await Contest.findById(req.body.contest_id);
		const quiz = await Quiz.findOne({contest:req.body.contest_id,user:req.user.id});
		if(quiz.answered_option != ''){
			res.status(400).json({message : "Answer allready saved"});
		}else{
			quiz.answered_option = req.body.answered_option;
			await quiz.save();
			res.status(200).json({message : "Answer Saved,Please wait for result"});
		}
	},

	quiz_details : async (req, res) => {
		const contest = await Contest.findById(req.body.contest_id).populate('question').populate('winnings').populate('quizzes').populate('users');
		const quizExists = await Quiz.findOne({contest:req.body.contest_id,user:req.user.id}).populate('user');
		res.status(200).json({contest,quizExists});
	},
	my_contests : async (req, res) => {
		const contests = await Contest.find();
		res.status(200).json({data : contests});
	},
	transactions : async (req, res) => {
		const transactions = await Transaction.find('user_id',req.session.user._id)
		res.status(200).json({data : transactions});
	},

	logout : async (req, res) => {
		req.session.destroy();
		res.status(200).json({msg:'Logged out'});
	},
}