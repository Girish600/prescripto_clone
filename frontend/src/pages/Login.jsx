import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext';
import axios from 'axios'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const {token,setToken,backendUrl}= useContext(AppContext);

  const naviagte= useNavigate();

  const [state,setState]=useState('sign-up');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [name,setName]=useState('');

  const onSubmitHandler=async(event)=>{
    event.preventDefault();
    try {
      if (state==='sign-up') {
        const {data}= await axios.post(backendUrl+'/user/register', {name,email,password})
        if (data.success) {
          localStorage.setItem('token',data.token);
          setToken(data.token)
        }else{
          toast.error(data.message)
        }
      }else{
        const {data}= await axios.post(backendUrl+'/user/login', {email,password})
        if (data.success) {
          localStorage.setItem('token',data.token);
          setToken(data.token)
        }else{
          toast.error(data.message)
        }        
      }
    } catch (error) {
      toast.error(data.message);
    }
  }

  useEffect(()=>{
    if (token) {
      naviagte('/')
    }
  },[token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
    <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
      <p className='text-2xl font-semibold'>{state==='sign-up' ? 'Create Account' : 'Login'}</p>
      <p>Please {state==='sign-up'? 'sign-up': 'log-in'} to book appointment</p>
      {
        state==='sign-up' && 
        <div className='w-full'>
        <p>Full Name</p>
        <input className='border border-zinc-300 rounded w-full p-2 mt-1' type='text' onChange={(e)=>setName(e.target.value)} value={name}/>
      </div> 
      }
      <div className='w-full'>
        <p>Email</p>
        <input className='border border-zinc-300 rounded w-full p-2 mt-1' type='email' onChange={(e)=>setEmail(e.target.value)} value={email}/>
      </div>
      <div className='w-full'>
        <p>Password</p>
        <input className='border border-zinc-300 rounded w-full p-2 mt-1' type='password' onChange={(e)=>setPassword(e.target.value)} value={password}/>
      </div>
      <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>{state==='sign-up' ? 'Create Account' : 'Login'}</button>
      {
        state === 'sign-up'?
        <p>Already have an account? <span className='text-primary cursor-pointer underline' onClick={()=>setState('Login')}>Login here</span></p>
        : <p>Create an new account? <span className='text-primary cursor-pointer underline' onClick={()=>setState('sign-up')}>Click here</span></p>
      }
      <p>For Admin or Doctor's login ? <a href='http://43.204.96.141:4173/' className='text-primary cursor-pointer underline'>Click here</a></p>
    </div>
    </form>
  )
}

export default Login