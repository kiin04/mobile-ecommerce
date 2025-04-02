import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import Heading from "../../shared/Heading";
import { notification } from "antd";
import PathNames from "../../PathNames.js";
import AddtoCartBtn from "../../shared/AddtoCartBtn.jsx";

const NewReleases = ({ calculateCartItemCount }) => {
    const userId = localStorage.getItem("userId");
    const [products, setProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Products`);
                setProducts(response.data);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            }
        };
        fetchProducts();
    }, []);

    const getProductsById = () => {
        return products
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4);
    };
    const NReleaseProducts = getProductsById();
    console.log("NReleaseProducts: ", NReleaseProducts);

    const handleAddtoCart = async (selectedProduct) => {
        if (!selectedProduct || !selectedProduct.id) {
            notification.error({
                message: "Lỗi",
                description: "Không tìm thấy thông tin sản phẩm",
                duration: 4,
                placement: "bottomRight",
                pauseOnHover: true,
            });
            return;
        }

        // Fetch available color/size options for the product
        let colorSizeId;
        let availableQuantity;
        try {
            const response = await fetch(
                `${API_URL}/api/ColorSizes/ProductColorSize/${selectedProduct.id}`
            );
            if (response.ok) {
                const colorSizes = await response.json();
                const availableColorSizes = colorSizes.filter(
                    (cs) => cs.quantity > 0
                );
                if (availableColorSizes.length === 0) {
                    throw new Error(
                        "Không có màu/size khả dụng cho sản phẩm này!"
                    );
                }
                colorSizeId = availableColorSizes[0].id; // Select the first available colorSizeId
                availableQuantity = availableColorSizes[0].quantity; // Get the quantity
            } else {
                throw new Error("Không thể lấy thông tin màu/size!");
            }
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.message,
                duration: 4,
                placement: "bottomRight",
                pauseOnHover: true,
            });
            return;
        }

        // Validate quantity before proceeding
        if (quantity > availableQuantity || quantity <= 0) {
            notification.error({
                message: "Lỗi",
                description: `Chỉ còn ${availableQuantity} sản phẩm.`,
                duration: 4,
                placement: "bottomRight",
                pauseOnHover: true,
            });
            return;
        }

        const cartItem = {
            productId: selectedProduct.id,
            quantity: parseInt(quantity),
            userId: userId,
            price: selectedProduct.price,
            colorSizeId: colorSizeId,
            name: selectedProduct.name,
            image: selectedProduct.image,
        };

        if (!userId) {
            // Handle guest user with localStorage
            try {
                const localCart = JSON.parse(
                    localStorage.getItem("localCart") || "[]"
                );
                const existingItem = localCart.find(
                    (item) =>
                        item.productId === cartItem.productId &&
                        item.colorSizeId === cartItem.colorSizeId
                );

                if (existingItem) {
                    if (
                        existingItem.quantity + cartItem.quantity >
                        availableQuantity
                    ) {
                        notification.error({
                            message: "Lỗi",
                            description: `Chỉ còn ${availableQuantity} sản phẩm.`,
                            duration: 4,
                            placement: "bottomRight",
                            pauseOnHover: true,
                        });
                        return;
                    }
                    existingItem.quantity += cartItem.quantity;
                } else {
                    cartItem.ids = [Date.now()];
                    localCart.push(cartItem);
                }

                localStorage.setItem("localCart", JSON.stringify(localCart));
                window.dispatchEvent(new Event("cartUpdated"));

                // Update cart item count
                calculateCartItemCount();

                notification.success({
                    message: "Thành công",
                    description: "Đã thêm sản phẩm vào giỏ hàng",
                    duration: 4,
                    placement: "bottomRight",
                    pauseOnHover: true,
                });
            } catch (error) {
                console.error("Error adding to localCart:", error);
                notification.error({
                    message: "Lỗi",
                    description: "Có lỗi khi thêm vào giỏ hàng",
                    duration: 4,
                    placement: "bottomRight",
                    pauseOnHover: true,
                });
            }
        } else {
            // Handle logged-in user cart
            try {
                const { data: existingCartItems } = await axios.get(
                    `${API_URL}/api/Carts`,
                    {
                        params: { userId },
                    }
                );

                const existingItem = existingCartItems.find(
                    (item) =>
                        item.productId === cartItem.productId &&
                        item.colorSizeId === cartItem.colorSizeId
                );

                if (existingItem) {
                    if (existingItem.quantity + cartItem.quantity > availableQuantity)
                    {
                        notification.error({
                            message: "Lỗi",
                            description: `Chỉ còn ${availableQuantity} sản phẩm.`,
                            duration: 4,
                            placement: "bottomRight",
                            pauseOnHover: true,
                        });
                        return;
                    }
                    cartItem.quantity += existingItem.quantity;
                }

                const response = await axios.post(
                    `${API_URL}/api/Carts`,
                    cartItem,
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                );

                // Update cart item count
                calculateCartItemCount();

                notification.success({
                    message: "Thành công",
                    description: "Đã thêm sản phẩm vào giỏ hàng",
                    duration: 4,
                    placement: "bottomRight",
                    pauseOnHover: true,
                });
            } catch (error) {
                // Check if the error is due to quantity exceeding stock
                if (
                    error.response?.status === 400 &&
                    error.response?.data?.message
                ) {
                    notification.error({
                        message: "Lỗi",
                        description: error.response.data.message,
                        duration: 4,
                        placement: "bottomRight",
                        pauseOnHover: true,
                    });
                } else {
                    console.error("Error adding to cart:", error);
                    notification.error({
                        message: "Lỗi",
                        description:
                            "Có lỗi xảy ra khi thêm vào giỏ hàng: " +
                            error.message,
                        duration: 4,
                        placement: "bottomRight",
                        pauseOnHover: true,
                    });
                }
            }
        }
    };

    const handleProductClick = (productId) => {
        navigate(`${PathNames.PRODUCT_DETAILS}/${productId}`);
    };

    const formatCurrency = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    return (
        <div className="mb-32 mt-80">
            <div className="container">
                {/* Phần tiêu đề */}
                <Heading
                    title="Sản Phẩm Mới"
                    subtitle="Khám Phá Sản Phẩm Mới Nhất"
                />
                {/* Phần nội dung */}
                <div className="mb-10">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 place-items-center">
                        {/* card selection */}
                        {NReleaseProducts.map((item) => (
                            <div
                                key={item.id}
                                className="w-[19rem] mx-2 my-2 bg-white border xl:scale-90 lg:scale-90 md:scale-75 sm:scale-50 border-gray-200 rounded-2xl shadow dark:bg-gray-800 dark:border-gray-700"
                            >
                                {item.image ? (
                                    <img
                                        className="p-8 rounded-t-lg cursor-pointer"
                                        src={`data:image/jpeg;base64,${item.image}`}
                                        alt="product image"
                                        onClick={() =>
                                            handleProductClick(item.id)
                                        }
                                    />
                                ) : (
                                    <div className="h-[180px] w-[260px] flex items-center justify-center mb-3">
                                        <span>Missing Image</span>
                                    </div>
                                )}
                                <div className="px-5 pb-5">
                                    <Link
                                        to={`${PathNames.PRODUCT_DETAILS}/${item.id}`}
                                    >
                                        <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                            {item.name}
                                        </h5>
                                    </Link>
                                    <div className="flex items-center justify-between mt-5">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(item.price)}
                                        </span>
                                        <AddtoCartBtn
                                            onClick={() =>
                                                handleAddtoCart(item)
                                            }
                                            className="text-white bg-[#f42c37] focus:outline-none font-medium rounded-xl hover:scale-105 ease transition-transform text-sm px-5 py-2.5 text-center"
                                            text={"Thêm vào giỏ"}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewReleases;
