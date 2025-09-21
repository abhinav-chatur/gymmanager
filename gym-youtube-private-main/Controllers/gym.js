const Gym = require('../Modals/gym')
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const nodemailer = require("nodemailer")
const jwt = require('jsonwebtoken');

exports.register = async(req,res)=>{
    try{
        const {userName ,password, gymName, profilePic,email} = req.body;

        const isExist = await Gym.findOne({userName});

        if(isExist){
            res.status(400).json({
                error:"Username Already Exist ,Please try with other username"
            })
        }else{
            const hashedPassword = await bcrypt.hash(password, 10)
            console.log(hashedPassword)
            const newGym = new Gym({userName ,password : hashedPassword, gymName, profilePic,email});
            await newGym.save();

            res.status(201).json({ message: 'User registered successfully', success: "yes",data:newGym });

        }
    }catch(err){
        res.status(500).json({
            error:"Server Error"
        })
    }
}

const cookieOptions = {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: 'Lax'
  
};

exports.login = async(req,res)=>{
    try{
        const {userName,password} = req.body;

        
        const gym = await Gym.findOne({ userName });
        console.log(req.body)

        if(gym && await bcrypt.compare(password,gym.password)){

            const token = jwt.sign({gym_id:gym._id},process.env.JWT_SecretKey);

            res.cookie("cookie_token",token,cookieOptions)

            res.json({ message: 'Logged in successfully', success: "true",gym,token});

        }else{
            res.status(400).json({ error: 'Invalid credentials' });
        }


    }catch(err){
        res.status(500).json({
            error:"Server Error"
        })
    }
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});



exports.sendOtp = async (req,res)=>{
    try{

        const {email} = req.body;
        const gym = await Gym.findOne({email});
        if(gym){

            const buffer = crypto.randomBytes(4); // Get random bytes
            const token = buffer.readUInt32BE(0) % 900000 + 100000; // Modulo to get a 6-digit number
            gym.resetPasswordToken = token;
            gym.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry date

            await gym.save();

            // for email Sending
            const mailOptions = {
                from: 'mashhooddanish1234@gmail.com',
                to: email,
                subject: 'Password Reset',
                text: `You requested a password reset. Your OTP is : ${token}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(500).json({ error: 'Server error',errorMsg:error });
                } else {
                    res.status(200).json({message:"OTP Sent to your email"})
    
                }
            });
  
        }else{
            return res.status(400).json({ error: 'Gym not found' });
        }

    }catch(err){
        res.status(500).json({
            error:"Server Error"
        })
    }
}


exports.checkOtp = async(req,res)=>{
    try{
        const {email,otp} = req.body;
        const gym = await Gym.findOne({ 
            email,
            resetPasswordToken: otp,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!gym) {
            return res.status(400).json({ error: 'Opt is invalid or has expired' });
        }
        res.status(200).json({message:"OTP is Successfully Verified"})

    }catch(err){
        res.status(500).json({
            error:"Server Error"
        })
    }
}


exports.resetPassword=async(req,res)=>{
    try{
        const {email,newPassword} = req.body;

        const gym = await Gym.findOne({email});

        if(!gym){
            return res.status(400).json({ error: 'Some Technical Issue , please try again later' });
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);
        gym.password = hashedPassword;
        gym.resetPasswordToken= undefined;
        gym.resetPasswordExpires= undefined;

        await gym.save();

        res.status(200).json({message:"Password Reset Successfully"})

    }catch(err){
        res.status(500).json({
            error:"Server Error"
        })
    }
}


exports.logout = async(req,res)=>{
    res.clearCookie('cookie_token', cookieOptions).json({ message: 'Logged out successfully' });
}