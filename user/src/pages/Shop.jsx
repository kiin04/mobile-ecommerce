import { notification, Popover, Select } from "antd";
import axios from "axios";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import PathNames from "../PathNames.js";
import Heading from "../shared/Heading";

const { Option } = Select;

const Shop = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [brands, setBrands] = useState([]);

    const [selectedBrands, setSelectedBrands] = useState(
        location.state?.brand ? [location.state.brand] : []
    );
    const [priceRange, setPriceRange] = useState([0, 50000000]);
    const [maxPrice, setMaxPrice] = useState(50000000);

    const [isBrandOpen, setIsBrandOpen] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 20;
    let filtered = products;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Products`);
                setProducts(response.data);
                setFilteredProducts(response.data);

                // Calculate the maximum price
                const highestPrice =
                    Math.ceil(
                        Math.max(...response.data.map((item) => item.price)) /
                            1000
                    ) * 1000;
                setMaxPrice(highestPrice);
                setPriceRange([0, highestPrice]);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchBrands = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Categories`);
                setBrands(response.data.map((category) => category.name));
            } catch (error) {
                console.error(error);
            }
        };

        fetchAllProducts();
        fetchBrands();
    }, []);

    useEffect(() => {
        let filtered = [...products];

        if (selectedBrands.length > 0) {
            filtered = filtered.filter((item) =>
                selectedBrands.includes(item.brand)
            );
        }

        filtered = filtered.filter(
            (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
        );

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [selectedBrands, priceRange, products]);

    const toggleBrandFilter = () => {
        setIsBrandOpen(!isBrandOpen);
        setIsPriceOpen(false);
    };

    const togglePriceFilter = () => {
        setIsPriceOpen(!isPriceOpen);
        setIsBrandOpen(false);
    };

    const handleProductClick = (productId) => {
        navigate(`${PathNames.PRODUCT_DETAILS}/${productId}`);
    };

    const resetFilters = () => {
        setSelectedBrands([]);
        setPriceRange([0, maxPrice]);

        setFilteredProducts(products);
    };

    // Tính toán sản phẩm hiển thị dựa trên trang hiện tại
    const indexOfLastProduct = currentPage * productsPerPage;
    const currentProducts = filteredProducts.slice(0, indexOfLastProduct);

    const handleLoadMore = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const fetchColorSize = async (productId) => {
        try {
            const response = await fetch(
                `${API_URL}/api/ColorSizes/ProductColorSize/${productId}`
            );

            if (response.ok) {
                const data = await response.json();
                console.log("data color", data);
                return data;
            } else {
                throw new Error("Failed to fetch product");
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            // setError("Failed to load product data. Please try again.");
        }
    };
    const handleBuyNow = async (product) => {
        const colors = await fetchColorSize(product.id);
        console.log("colorSizes", colors[0]);
        if (colors.length > 0) {
            const productBuyNow = {
                productId: product.id,
                image: product.image,
                name: product.name,
                quantity: 1,
                colorSizeId: colors[0].id,
                color: colors[0].color,
                size: colors[0].size,
                price: product?.price,
            };
            // console.log('product buy now ',productBuyNow);
            navigate("/checkout-buynow", { state: { product: productBuyNow } });
        } else {
            notification.error({
                message: "Lỗi",
                description: "Vui lòng chọn màu trước khi mua",
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true,
            });
        }
    };

    return (
        <div className="mb-32">
            <div className="container">
                <Heading title="Cửa Hàng" subtitle="Khám Phá Tất Cả Sản Phẩm" />

                <div className="mb-10 relative">
                    <div className="flex items-center space-x-4">
                        {/* Brand Filter */}
                        <div className="w-72">
                            <Select
                                mode="multiple"
                                placeholder="Thương hiệu"
                                value={selectedBrands}
                                onChange={setSelectedBrands}
                                style={{ width: "100%" }}
                                allowClear
                            >
                                {brands.map((brand, index) => (
                                    <Option key={index} value={brand}>
                                        {brand}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* Price Range Slider */}
                        <Popover
                            content={
                                <div className="w-80">
                                    <Slider
                                        range
                                        min={0}
                                        max={maxPrice}
                                        step={5000}
                                        value={priceRange}
                                        onChange={setPriceRange}
                                    />
                                    <div className="flex justify-between mt-2">
                                        <span>{priceRange[0].toLocaleString()} đ</span>
                                        <span>{priceRange[1].toLocaleString()} đ</span>
                                    </div>
                                </div>
                            }
                            title="Chọn khoảng giá"
                            trigger="click"
                            placement="bottomLeft"
                        >
                            <button className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">
                                Khoảng giá
                            </button>
                        </Popover>

                        {/* Reset Filters Button */}
                        <button
                            onClick={resetFilters}
                            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="mb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 place-items-center">
                        {currentProducts.map((item) => (
                            <div
                                key={item.id}
                                className="productcard-item group h-[21em] md:h-[23em] lg:h-[25.5em] rounded-2xl shadow p-4 cursor-pointer relative"
                            >
                                <div
                                    onClick={() => handleProductClick(item.id)}
                                    className="cursor-pointer"
                                >
                                    <div className="productcard-img relative">
                                        {item.image ? (
                                            <img
                                                src={
                                                    item?.image
                                                        ? `data:image/jpeg;base64,${item.image}`
                                                        : ""
                                                }
                                                alt={item.name}
                                                className="h-[13em] w-[13em] lg:h-[18em] lg:w-[18em] sm:h-[13em] sm:w-[13em] md:h-[13.5em] md:w-[16em] object-cover rounded-xl mb-3"
                                            />
                                        ) : (
                                            <p>Image not available</p>
                                        )}
                                    </div>
                                    <div className="productcard-content text-left">
                                        <h2 className="font-bold text-lg mb-2">
                                            {item.name}
                                        </h2>
                                        <p className="text-gray-600">
                                            {item.brand}
                                        </p>
                                        <p className="text-red-500 font-semibold">
                                            {item.price.toLocaleString()} đ
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleBuyNow(item)}
                                    className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Mua ngay
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Thêm nút "Xem thêm" */}
                    {currentProducts.length < filteredProducts.length && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={handleLoadMore}
                                className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600"
                            >
                                Xem thêm
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;
