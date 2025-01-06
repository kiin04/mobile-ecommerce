import { Carousel } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config";
import PathNames from "../../PathNames.js";
import Button from "../../shared/Button.jsx";

// const HeroPlaceholderData = [
//     {
//         id: 1,
//         image: Img1,
//         title: "Wireless",
//         title2: "Heaphones",
//         description: "Beats Solo",
//     },
//     {
//         id: 2,
//         image: Img2,
//         title: "Wireless",
//         title2: "Virtual",
//         description: "Beats Duo",
//     },
// ];

const Hero = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/api/products/"
                );
                const productsData = response.data;
                setProducts(productsData);
            } catch (error) {
                console.error(error);
            }
        };
        fetchProducts();
    }, []);

    const getProductsById = (ids) => {
        return products.filter((product) => ids.includes(product.id));
    };
    const heroProducts = getProductsById(["SP023", "SP035"]);

    const handleHeroClick = (productId) => {
        navigate(`${PathNames.PRODUCT_DETAILS}/${productId}`);
    };

    useEffect(() => {
        console.log("Logged hero products id" + handleHeroClick.productId);
    }, [handleHeroClick.productId]);

    return (
        <div className="container">
            <div className="overflow-hidden rounded-3xl min-h-[550px] sm:min-h-[650px] hero-bg-color flex justify-center items-center mb-11">
                <div className="container pb-8 sm:pb-0">
                    <Carousel
                        dots={false}
                        arrows={false}
                        infinite={true}
                        speed={800}
                        draggable={true}
                        autoplay={true}
                        autoplaySpeed={4000}
                        easing="ease-in-out"
                    >
                        {heroProducts.map((product) => (
                            <div key={product.id}>
                                <div className="grid grid-cols-1 sm:grid-cols-2">
                                    {/* text content section */}
                                    <div className="flex flex-col justify-center gap-4 sm:pl-3 pt-12 sm:pt-0 text-center sm:text-left order-2 sm:order-1 relative z-10">
                                        {/* <h1 className="text-2xl sm:text-6xl lg:text-2xl font-bold">
                                            {product.description}
                                        </h1> */}
                                        <h1
                                            className="text-3xl sm:text-4xl lg:text-5xl font-bold"
                                            data-aos="zoom-out"
                                            data-aos-duration="500"
                                            data-aos-once={false}
                                        >
                                            {product.brand}
                                        </h1>
                                        <h1
                                            className="text-3xl uppercase text-white dark:text-white/5 sm:text-[50px] md:text-[70px] xl:text-[100px] font-bold leading-none"
                                            data-aos="zoom-out"
                                            data-aos-duration="500"
                                            data-aos-once={false}
                                        >
                                            {product.name}
                                        </h1>
                                        <div
                                            data-aos="fade-up"
                                            data-aos-duration="500"
                                            data-aos-delay="300"
                                            data-aos-once={false}
                                        >
                                            <Button
                                                text="Khám phá"
                                                bgColor="bg-primary"
                                                textColor="text-white"
                                                onClick={() =>
                                                    handleHeroClick(product.id)
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Img section */}
                                    <div className="order-1 sm:order-2">
                                        <div data-aos="fade-left"
                                            data-aos-duration="500"
                                            data-aos-once={false}>
                                            <img
                                                src={`${BASE_URL}/${product.image}`}
                                                alt=""
                                                className="w-[300px] sm:w-[450px] h-[320px] sm:h-[470px] sm:scale-105 lg:scale-110 object-contain mx-auto drop-shadow-[-8px_4px_6px_rgba(0,0,0,.4)] relative z-40"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>
            </div>
        </div>
    );
};

export default Hero;
