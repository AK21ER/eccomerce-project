import { sendVerificationEmail,emailSender } from "../mailTrap/email.js";
import CheckoutVerification from "../models/checkoutVerification.model.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;
		const user = req.user;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;
		products.forEach((product) => {
			const amount = Math.round(product.price * 100);
			totalAmount += amount * (product.quantity || 1);
		});

		let discount = 0;
		let appliedCoupon = null;

		if (couponCode) {
			const coupon = await Coupon.findOne({
				code: couponCode,
				userId: req.user._id,
				isActive: true,
			});

			if (coupon) {
				discount = Math.round((totalAmount * coupon.discountPercentage) / 100);
				totalAmount -= discount;
				appliedCoupon = coupon;
			}
		}

		if (appliedCoupon) {
			await Coupon.findOneAndUpdate(
				{ code: appliedCoupon.code, userId: req.user._id },
				{ isActive: false }
			);
		}

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}

		const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

		// const productDisplay = products.map((product) => ({
		// 	product: product.name,
		// 	quantity: product.quantity,
		// 	totalmoney: Math.round(product.price) * product.quantity,
		// 	coupon: appliedCoupon ? "with coupon" : "without coupon",
		// }));

		// Send the verification email with code
		
		const customerEmail=await sendVerificationEmail(user,verificationCode);

		if (!customerEmail) {
			return res.status(500).json({ error: "Failed to send email" });
		}

		// Store the verification in DB
		await CheckoutVerification.findOneAndDelete({ userId: req.user._id }); // clear old

		await new CheckoutVerification({
			userId: req.user._id,
			products,
			totalAmount,
			code: verificationCode,
			expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
			withCoupon: !!appliedCoupon, // 👈 Add this field
		}).save();

		res.status(200).json({ message: "Verification code sent. Please enter it to complete your order." });

	} catch (error) {
		console.error("Error in createCheckoutSession:", error);
		res.status(500).json({ message: "Checkout failed", error: error.message });
	}
};


export const verifyCheckoutCode = async (req, res) => {
	try {
		const { code } = req.body;
		const userId = req.user._id;

		const record = await CheckoutVerification.findOne({ userId, code });
		console.log(record)

		if (!record) {
       return res.status(400).json({ error: "Invalid verification code" });
         }

     if (record.expiresAt && new Date() > new Date(record.expiresAt)) {
     return res.status(400).json({ error: "Verification code expired" });
        }

		const newOrder = new Order({
			user: userId,
			products: record.products.map(p => ({
				product: p._id,
				quantity: p.quantity,
				price: p.price
			})),
			totalAmount: record.totalAmount / 100,
			
		});

		await newOrder.save();
		await CheckoutVerification.deleteOne({ _id: record._id });

				
			const productDisplay = record.products.map(p => ({
			product: p.name || p.product?.name || "Unknown",
			quantity: p.quantity,
			totalmoney: (Math.round(p.price * p.quantity)).toFixed(2),
			coupon: record.withCoupon ? "with coupon" : "without coupon", 
			}));

         await emailSender(req.user, productDisplay, (record.totalAmount.toFixed(2))/100);

		return res.status(200).json({
			success: true,
			message: "Order verified and created successfully",
			orderId: newOrder._id,
		});
	} catch (error) {
		console.error("Error verifying code:", error);
		res.status(500).json({ message: "Verification failed", error: error.message });
	}
};






// import { response } from "express";
// import { emailSender } from "../mailTrap/email.js";
// import Coupon from "../models/coupon.model.js";
// import Order from "../models/order.model.js";

// export const createCheckoutSession = async (req, res) => {
// 	try {
// 		const { products, couponCode } = req.body;
// 		const user = req.user

// 		if (!Array.isArray(products) || products.length === 0) {
// 			return res.status(400).json({ error: "Invalid or empty products array" });
// 		}

// 		let totalAmount = 0;

// 		products.forEach((product) => {
// 			const amount = Math.round(product.price * 100);
// 			totalAmount += amount * (product.quantity || 1);
// 		});

// 		let discount = 0;
// 		let appliedCoupon = null;

// 		if (couponCode) {
// 			const coupon = await Coupon.findOne({
// 				code: couponCode,
// 				userId: req.user._id,
// 				isActive: true,
// 			});

// 			if (coupon) {
// 				discount = Math.round((totalAmount * coupon.discountPercentage) / 100);
// 				totalAmount -= discount;
// 				appliedCoupon = coupon;
// 			}
// 		}

// 		if (appliedCoupon) {
// 			await Coupon.findOneAndUpdate(
// 				{ code: appliedCoupon.code, userId: req.user._id },
// 				{ isActive: false }
// 			);
// 		}

// 		if (totalAmount >= 20000) {
// 			await createNewCoupon(req.user._id);
// 			console.log ("coopon created now")
// 		}

// 		const productdisplay = products.map((product) => {
// 			return {
// 				product: product.name,
// 				quantity: product.quantity,
// 				totalmoney: Math.round(product.price) * product.quantity,
// 				coupon: appliedCoupon ? "with coupon" : "without coupon"
// 			};
// });

        
// 		const responses = emailSender(user,productdisplay,totalAmount.toFixed(2))
		
// 		return (responses , totalAmount)
           
// 			} catch (error) {
// 		res.status(500).json({ message: "Error processing checkout", error: error.message });
// 	}
// };

// export const checkoutSuccess = async (req, res) => {
// 	try {

    
// 		const newOrder = new Order({
// 			user: req.user._id,
// 			products: products.map((product) => ({
// 				product: product._id,
// 				quantity: product.quantity,
// 				price: product.price,
// 			})),
// 			totalAmount: totalAmount / 100,
// 			stripeSessionId: null,
// 		});

// 		await newOrder.save();

// 		res.status(200).json({
// 			success: true,
// 			message: "Order created successfully",
// 			orderId: newOrder._id,
// 			redirectTo: "mailto:support@yourcompany.com",
// 		});
	
// 	}
// 	catch(error){
// 			console.error("Error processing successful checkout:", error);
// 		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
// 	}
// }
// async function createNewCoupon(userId) {
// 	await Coupon.findOneAndDelete({ userId });

// 	const newCoupon = new Coupon({
// 		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
// 		discountPercentage: 10,
// 		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
// 		userId,
// 	});

// 	await newCoupon.save();
// }







// import { stripe } from "../lib/stripe.js";

// export const createCheckoutSession = async (req, res) => {
// 	try {
// 		const { products, couponCode } = req.body;

// 		if (!Array.isArray(products) || products.length === 0) {
// 			return res.status(400).json({ error: "Invalid or empty products array" });
// 		}

// 		let totalAmount = 0;

// 		const lineItems = products.map((product) => {
// 			const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
// 			totalAmount += amount * product.quantity;

// 			return {
// 				price_data: {
// 					currency: "usd",
// 					product_data: {
// 						name: product.name,
// 						images: [product.image],
// 					},
// 					unit_amount: amount,
// 				},
// 				quantity: product.quantity || 1,
// 			};
// 		});

// 		let coupon = null;
// 		if (couponCode) {
// 			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
// 			if (coupon) {
// 				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
// 			}
// 		}






		/*const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});
*/
// 		if (totalAmount >= 20000) {
// 			await createNewCoupon(req.user._id);
// 		}
// 		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
// 	} catch (error) {
// 		console.error("Error processing checkout:", error);
// 		res.status(500).json({ message: "Error processing checkout", error: error.message });
// 	}
// };
/*
export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// create a new Order
			const products = JSON.parse(session.metadata.products);
			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: session.amount_total / 100, // convert from cents to dollars,
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
};

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
} */

// async function createNewCoupon(userId) {
// 	await Coupon.findOneAndDelete({ userId });

// 	const newCoupon = new Coupon({
// 		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
// 		discountPercentage: 10,
// 		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
// 		userId: userId,
// 	});

// 	await newCoupon.save();

// 	return newCoupon;
// }


//this is with out session and stripe


