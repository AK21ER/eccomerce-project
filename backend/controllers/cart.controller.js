import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    // 1️⃣ Find all products whose _id is in the user's cartItems array
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    // 2️⃣ For each product found, attach the correct quantity from the user's cartItems
    const cartItems = products.map((product) => {
      // Find the matching cartItem in the user's cartItems
      const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
      // Return the product JSON with the quantity added
      return { ...product.toJSON(), quantity: item.quantity };
    });

    // 3️⃣ Respond with the cartItems array
    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		const existingItem = user.cartItems.find((item) => item.id === productId);
		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push(productId);
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;
		if (!productId) {  // if the front end does not send any rew.body or gives the backend any product id it will clear all the products from the cartitems array 
			user.cartItems = [];
		} else {
			user.cartItems = user.cartItems.filter((item) => item.id !== productId);
		}
		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const { quantity } = req.body;
		const user = req.user;
		const existingItem = user.cartItems.find((item) => item.id === productId);

		if (existingItem) {
			if (quantity === 0) {
				user.cartItems = user.cartItems.filter((item) => item.id !== productId);  /// here it will do if the quantity of that item is 0 in the display we are saying that it must be removed feom the cart as aresult we will display every item that are diffrent from the seleceted item
				await user.save();
				return res.json(user.cartItems);
			}

			existingItem.quantity = quantity; // otherwise it willl be the quantity that would be send from the front end am talking abiut the exsisting item.quantity
			await user.save();
			res.json(user.cartItems);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};