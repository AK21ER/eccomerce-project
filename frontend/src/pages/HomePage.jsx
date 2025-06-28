import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
	{ href: "/jeans", name: "Jeans", imageUrl: "/photos/jeans.jpg" },
	{ href: "/t-shirts", name: "T-shirts", imageUrl: "/photos/t-shirt.jpg" },
	{ href: "/shoes", name: "Shoes", imageUrl: "/photos/shoes.jpg" },
	{ href: "/glasses", name: "Glasses", imageUrl: "/photos/glass.jpg" },
	{ href: "/jackets", name: "Jackets", imageUrl: "/photos/jacket.jpg" },
	{ href: "/suits", name: "Suits", imageUrl: "/photos/suit.jpg" },
	{ href: "/bags", name: "Bags", imageUrl: "/photos/bag.jpg" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
					Explore Our Categories
				</h1>
				<p className='text-center text-xl text-gray-300 mb-12'>
					Discover the latest trends in eco-friendly fashion
				</p>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<CategoryItem categorys={category} /> // here we are giving the catagory item componnent each catagory as a catagorys which is a prop which enables it to use the array from another componenet as a protected in java
					))}
				</div>

				{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			</div>
		</div>
	);
};
export default HomePage;