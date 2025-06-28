import { useEffect, useState } from "react";
import { CheckCircle, Timer, ShieldCheck } from "lucide-react";
import {  useNavigate } from "react-router-dom";
import axios from "../lib/axios";

const VerifyCodePage = () => {
	const [code, setCode] = useState("");
	const [timeLeft, setTimeLeft] = useState(600);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (timeLeft <= 0) return;
		const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
		return () => clearInterval(timer);
	}, [timeLeft]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await axios.post("/payments/verification", { code });
			if(res){
            navigate("/purchase-success");
            }else{
                 navigate("/purchase-cancel")
            }
            
		} catch (err) {
			console.log("error occured it is invalid code")
            navigate("/purchase-cancel")
           return {"error":err}
		} finally {
			setLoading(false);
		}
	};

	const formatTime = (seconds) => {
		const m = Math.floor(seconds / 60).toString().padStart(2, "0");
		const s = (seconds % 60).toString().padStart(2, "0");
		return `${m}:${s}`;
	};

	return (
		<div className='h-screen flex items-center justify-center px-4'>
			<div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 relative z-10'>
				<div className='flex justify-center mb-4'>
					<ShieldCheck className='text-emerald-400 w-16 h-16' />
				</div>
				<h2 className='text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2'>
					Verify Your Order
				</h2>
				<p className='text-gray-300 text-center mb-4'>
					Enter the 6-digit code sent to your email to confirm your purchase.
				</p>

				<div className='flex items-center justify-center mb-6'>
					<Timer className='text-gray-400 mr-2' />
					<span className='text-sm text-gray-400'>Expires in: {formatTime(timeLeft)}</span>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<input
						type='text'
						value={code}
						onChange={(e) => setCode(e.target.value)}
						placeholder='Enter verification code'
						className='w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400'
						required
						maxLength={6}
						pattern="\d*"
					/>

					<button
						type='submit'
						disabled={loading || timeLeft <= 0}
						className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:opacity-50'
					>
						{loading ? "Verifying..." : "Verify Code"}
					</button>
				</form>

				{/* {message && (
					<div className='mt-4 text-green-400 flex items-center justify-center'>
						<CheckCircle className='mr-2' /> {message}
					</div>
				)} */}
{/* 
				{error && (
					<div className='mt-4 text-red-400 text-sm text-center'>
						{error}
					</div>
				)} */}
			</div>
		</div>
	);
};

export default VerifyCodePage;
