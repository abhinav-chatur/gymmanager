import React, { useState } from 'react'
import Loader from '../Loader/loader'
import axios from 'axios'
import { ToastContainer,toast } from 'react-toastify'
const ForgotPassword = () => {
    const [emailSubmit, setEmailSubmit] = useState(false)
    const [otpValidate,setOtpValidate] = useState(false);
    const [loader,setLoader] = useState(false)
    const [contentVal,setContentValue] = useState("Submit Your Email")

    const [inputField, setInputField] = useState({ email: "", otp: "", newPassword: "" });

    const handleSubmit = () => {
        if (!emailSubmit) {

            sendOtp();
        }else if(emailSubmit && !otpValidate){
            
            verifyOTP();

        }else{
            changePassword()
        }
    }

    const changePassword = async()=>{
        setLoader(true)
        await axios.post('http://localhost:4000/auth/reset-password',{email:inputField.email,newPassword:inputField.newPassword}).then((response)=>{
            toast.success(response.data.message);
            setLoader(false)
        }).catch(err=>{
            toast.error("Some technical issue while sending Mail")
            console.log(err);
            setLoader(false)

        })
    }


    const verifyOTP = async()=>{
        setLoader(true);
        await axios.post('http://localhost:4000/auth/reset-password/checkOtp',{email:inputField.email,otp:inputField.otp}).then((response)=>{
            setOtpValidate(true)
            setContentValue("Submit Your New password")
            toast.success(response.data.message);
            setLoader(false)

        }).catch(err=>{
            toast.error("Some technical issue while sending Mail")
            console.log(err);
            setLoader(false)

        })
    }

    const sendOtp = async()=>{
        setLoader(true);
        await axios.post('http://localhost:4000/auth/reset-password/sendOtp',{email:inputField.email}).then((response)=>{
            setEmailSubmit(true)
            setContentValue("Submit Your OTP")
            toast.success(response.data.message);
            setLoader(false)
        }).catch(err=>{
            toast.error("Some technical issue while sending Mail")
            console.log(err);
            setLoader(false)

        })
    }



    const handleOnChange =(event,name)=>{
        setInputField({...inputField,[name]:event.target.value})
    }
    return (
        <div className='w-full'>
            <div className='w-full mb-5'>
                <div>Enter Your Email</div>
                <input type='text' value={inputField.email} onChange={(event)=>{handleOnChange(event,"email")}} className='w-1/2 p-2 rounded-lg border-2 border-slate-400' placeholder='Enter Email' />
            </div>
            {
                emailSubmit && <div className='w-full mb-5'>
                    <div>Enter Your OTP</div>
                    <input type='text' value={inputField.otp} onChange={(event)=>{handleOnChange(event,"otp")}} className='w-1/2 p-2 rounded-lg border-2 border-slate-400' placeholder='Enter OTP' />
                </div>
            }
            {
                otpValidate && <div className='w-full mb-5'>
                    <div>Enter Your New password</div>
                    <input type='password' value={inputField.newPassword} onChange={(event)=>{handleOnChange(event,"newPassword")}} className='w-1/2 p-2 rounded-lg border-2 border-slate-400' placeholder='Enter new password' />
                </div>
            }

            <div className='bg-slate-800 text-white mx-auto w-2/3 p-3 rounded-lg text-center font-semibold cursor-pointer border-2 hover:bg-white hover:text-black' onClick={() => handleSubmit()}>{contentVal}</div>
            {loader && <Loader />}
            <ToastContainer/>
        </div>
    )
}

export default ForgotPassword