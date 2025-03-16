import { notification, Select } from "antd";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { API_URL } from "../../config";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ReviewsSection } from "./ReviewsSection";

const ProductDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [details, setDetails] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.user);
    const userId = user?.id;

    const [colorSizes, setColorSizes] = useState(null);
    const [availableColors, setAvailableColors] = useState([]);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [chooseColor, setChooseColor] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/Products/${productId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setProduct({ ...data });
                } else {
                    throw new Error("Failed to fetch product");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                setError("Failed to load product data. Please try again.");
            } finally {
                //setLoading(false);
            }
        };

        const fetchColorSize = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/ColorSizes/ProductColorSize/${productId}`
                );

                if (response.ok) {
                    const data = await response.json();

                    // Lọc danh sách các màu có quantity > 0
                    const colorsWithQuantity = data.filter(
                        (item) => item.quantity > 0
                    );

                    // Nhóm các màu duy nhất
                    const colors = [
                        ...new Set(colorsWithQuantity.map((item) => item.code)),
                    ];
                    // set  lưu các giá trị duy nhất
                    setAvailableColors(
                        colors.map((code) => ({
                            code,
                            items: colorsWithQuantity.filter(
                                (item) => item.code === code
                            ),
                        }))
                    );

                    setColorSizes(data);
                } else {
                    throw new Error("Failed to fetch product");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                setError("Failed to load product data. Please try again.");
            }
        };

        const fetchDetails = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/Details/ProductDetail/${productId}`
                );

                if (response.ok) {
                    const data = await response.json();
                    //console.log('Response data details :', data[0]);
                    setDetails(data[0]);
                } else {
                    throw new Error("Failed to fetch product");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                setError("Failed to load product data. Please try again.");
            } finally {
                //
            }
        };
        const fetchCartItems = async () => {
            if (!userId) {
                console.error("Xin hãy đăng nhập để sử dụng tính năng này");
            }
            try {
                const response = await fetch(
                    `${API_URL}/api/Carts/User/${user.id}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch cart items");
                }
                const data = await response.json();
                setCartItems(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching cart items:", error);
                setError(error.message);
                setLoading(false);
            }
        };
        fetchCartItems();
        fetchColorSize();
        fetchProduct();
        fetchDetails();
    }, [productId]);

    const handleColorClick = (colorGroup) => {
        setAvailableSizes(colorGroup.items);
        setChooseColor(colorGroup.code);
    };

    const handleSizeClick = (id) => {
        setSelectedColor(colorSizes.find((item) => item.id === id));
    };

    const getStock = () => {
        let stock = 0;
        if (Array.isArray(colorSizes)) {
            stock = colorSizes
                .filter((item) => item.productId == productId)
                .reduce((total, item) => total + (item.quantity || 0), 0);
        }

        return stock;
    };
    const checkCartItem = (cartItem) => {
        const check = cartItems.find(
            (item) =>
                item.productId == cartItem.productId &&
                item.colorSizeId == cartItem.colorSizeId
        );

        return check;
    };
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value > selectedColor.quantity) {
            setError("Số lượng bạn chọn đã đạt mức tối đa của sản phẩm này");
            notification.warning({
                message: "Lưu ý",
                description:
                    "Số lượng bạn chọn đã đạt mức tối đa của sản phẩm này",
                duration: 4,
                placement: "bottomLeft",
                showProgress: true,
                pauseOnHover: true,
            });
        } else {
            setError("");
        }
        setQuantity(value);
    };

    const handleAddCart = async () => {
        // if (!userId) {
        //     notification.warning({
        //         message: "Lưu ý",
        //         description: "Vui lòng đăng nhập để sử dụng giỏ hàng",
        //         duration: 4,
        //         placement: "bottomLeft",
        //         showProgress: true,
        //         pauseOnHover: true,
        //     });
        //     // window.location.href = "/login";
        //     return;
        // }

        if (!product || !product.id) {
            notification.error({
                message: "Lỗi",
                description: "Không tìm thấy thông tin sản phẩm",
                duration: 4,
                placement: "bottomLeft",
                showProgress: true,
                pauseOnHover: true,
            });
            return;
        }

        if (quantity <= 0 || quantity > selectedColor.quantity) {
            notification.error({
                message: "Lỗi",
                description: "Số lượng không hợp lệ!",
                duration: 4,
                placement: "bottomLeft",
                showProgress: true,
                pauseOnHover: true,
            });
            return;
        }

        const cartItem = {
            productId: product.id,
            userId: userId,
            price: product.price,
            colorSizeId: selectedColor ? selectedColor.id : colorSizes[0]?.id,
            quantity: parseInt(quantity),
            // image: product.image,
        };
        const check = checkCartItem(cartItem);
        console.log("check cart ", check);
        if (check) {
            const updatedData = {
                ...check,
                quantity: check.quantity + cartItem.quantity,
            };
            try {
                const response = await fetch(
                    `${API_URL}/api/Carts/${check?.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updatedData),
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(
                        data.message || "Có lỗi xảy ra khi thêm vào giỏ hàng"
                    );
                }

                notification.success({
                    message: "Thành công",
                    description: "Đã thêm sản phẩm vào giỏ hàng",
                    duration: 4,
                    placement: "bottomLeft",
                    showProgress: true,
                    pauseOnHover: true,
                });

                // Reset quantity sau khi thêm thành công
                setQuantity(1);
            } catch (error) {
                console.error("Error adding to cart:", error);
                notification.error({
                    message: "Lỗi",
                    description: error.message,
                    duration: 4,
                    placement: "bottomLeft",
                    showProgress: true,
                    pauseOnHover: true,
                });
            }
        } else {
            try {
                const response = await fetch(`${API_URL}/api/Carts`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(cartItem),
                    cache: "no-store"
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(
                        data.message || "Có lỗi xảy ra khi thêm vào giỏ hàng"
                    );
                }

                notification.success({
                    message: "Thành công",
                    description: "Đã thêm sản phẩm vào giỏ hàng",
                    duration: 4,
                    placement: "bottomLeft",
                    showProgress: true,
                    pauseOnHover: true,
                });

                // Reset quantity sau khi thêm thành công
                setQuantity(1);
            } catch (error) {
                console.error("Error adding to cart:", error);
                notification.error({
                    message: "Lỗi",
                    description: error.message,
                    duration: 4,
                    placement: "bottomLeft",
                    showProgress: true,
                    pauseOnHover: true,
                });
            }
        }
    };
    const handleBuyNow = () => {
        if (selectedColor) {
            const productBuyNow = {
                productId: productId,
                image: product.image,
                name: product.name,
                quantity: quantity,
                colorSizeId: selectedColor.id,
                color: selectedColor.color,
                size: selectedColor.size,
                price: product?.price,
            };
            navigate("/checkout-buynow", { state: { product: productBuyNow } });
        }
        // else {
        //     notification.error({
        //         message: "Lỗi",
        //         description: "Vui lòng chọn màu trước khi mua",
        //         duration: 4,
        //         placement: "bottomLeft",
        //         showProgress: true,
        //         pauseOnHover: true,
        //     });
        // }
    };
    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-screen p-5 text-lg">
                Đang tải thông tin sản phẩm...
            </div>
        );
    }

    const tableData = [
        {
            key: "Hệ điều hành",
            value: product?.os,
        },
        {
            key: "Thương hiệu",
            value: product.brand,
        },
        {
            key: "RAM",
            value: details?.ram,
        },
        {
            key: "Bộ nhớ trong",
            value: details?.internalStorage,
        },
        {
            key: "Pin",
            value: details?.battery,
        },
        {
            key: "Kích thước màn hình",
            value: details?.screenSize,
        },
        {
            key: "Công nghệ màn hình",
            value: details?.screenTechnology,
        },
        {
            key: "Camera sau",
            value: details?.rearCamera,
        },
        {
            key: "Camera trước",
            value: details?.frontCamera,
        },
        {
            key: "Chipset",
            value: details?.chipset,
        },
        {
            key: "GPU",
            value: details?.gpu,
        },
        {
            key: "Công nghệ NFC",
            value: details?.nfc,
        },
        {
            key: "Thẻ SIM",
            value: details?.simcard,
        },
        {
            key: "Độ phân giải màn hình",
            value: details?.screenResolution,
        },
        {
            key: "Cổng sạc",
            value: details?.chargingTechnology,
        },
    ];

    return (
        <div className="mt-14">
            <div className="container mx-auto px-4 py-8 flex flex-col mb-24 bg-gray-50">
                <div className="flex flex-wrap -mx-4 justify-center xl:ml-40 lg:ml-10">
                    {/* <!-- Product Images --> */}
                    <div className="w-full 2xl:w-[40%] xl:w-[50%] lg:w-[50%] md:w-[50%] sm:w-[50%] px-4 mb-8 -translate-x-4">
                        <img
                            src={`data:image/jpeg;base64,${product.image}`}
                            alt={product.name}
                            className="w-full h-auto rounded-lg shadow-md mb-4"
                            id="mainImage"
                        />
                    </div>

                    {/* <!-- Product Details --> */}
                    <div className="w-full md:w-1/2 px-4">
                        {/* Show how many items are left in stock */}
                        <p className="text-md text-gray-600 mb-4">
                            Trạng thái:{" "}
                            {selectedColor.quantity > 0 ? (
                                <span
                                    className={
                                        selectedColor.quantity > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }
                                >
                                    {selectedColor.quantity > 0
                                        ? `${selectedColor.quantity} sản phẩm còn lại`
                                        : "Hết hàng"}
                                </span>
                            ) : (
                                <span
                                    className={
                                        getStock() > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }
                                >
                                    {getStock() > 0
                                        ? `${getStock()} sản phẩm còn lại`
                                        : "Hết hàng"}
                                </span>
                            )}
                        </p>

                        <p className="text-red-500 mb-1 text-lg">
                            {product.brand}
                        </p>
                        <h2 className="text-3xl font-bold mb-2">
                            {product.name}
                        </h2>
                        <p className="text-gray-600 mb-4 text-xs">
                            SKU: {product.productId}
                        </p>
                        <div className="mb-4">
                            <span className="text-2xl font-bold mr-2 text-primary">
                                {product.price.toLocaleString()} đ
                            </span>
                        </div>

                        <p className="text-gray-700 mb-6">
                            {product.description}
                        </p>

                        {/* Color Selection */}
                        {availableColors.length > 0 && (
                            <div className="my-6">
                                <label
                                    htmlFor="color"
                                    className="block text-lg font-semibold mb-1"
                                >
                                    Màu:
                                </label>

                                <div className="flex space-x-5">
                                    {availableColors.map(
                                        (colorGroup, index) => (
                                            <button
                                                key={index}
                                                className={`w-9 h-9 rounded-full cursor-pointer border ${
                                                    chooseColor ===
                                                    colorGroup.code
                                                        ? "ring-1  ring-blue-500 "
                                                        : "border-gray-300"
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        colorGroup.code,
                                                }}
                                                onClick={() =>
                                                    handleColorClick(colorGroup)
                                                }
                                            ></button>
                                        )
                                    )}
                                </div>

                                {availableSizes.length > 0 && (
                                    <div className="flex gap-2 mt-4">
                                        {availableSizes.map((size) => (
                                            <div
                                                key={size.id}
                                                className={`p-2 h-9 border rounded cursor-pointer ${
                                                    selectedColor?.id ===
                                                    size.id
                                                        ? "bg-yellow-500 text-white border-yellow-600"
                                                        : "hover:bg-yellow-500 hover:text-white"
                                                }`}
                                                onClick={() =>
                                                    handleSizeClick(size.id)
                                                }
                                            >
                                                {size.size}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mb-6">
                            <label
                                htmlFor="quantity"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Số lượng:
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                min="1"
                                max={selectedColor.quantity}
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="w-12 text-center rounded-md border-gray-300  shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>

                        <div className="flex space-x-4 mb-6">
                            <button
                                className="bg-primary flex gap-2 items-center text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={handleAddCart}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                    />
                                </svg>
                                Thêm vào giỏ
                            </button>
                            <button
                                className="bg-green-600 flex gap-2 items-center text-white px-6 py-2 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={handleBuyNow}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                    />
                                </svg>
                                Mua ngay
                            </button>
                            {/* <button className="bg-gray-200 flex gap-2 items-center  text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                    />
                                </svg>
                                Wishlist
                            </button> */}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">
                                Tính năng nổi bật:
                            </h3>
                            <ul className="list-disc list-inside text-gray-700">
                                <li>Bền bỉ vượt trội</li>
                                <li>Thời lượng pin lên đến 30 giờ</li>
                                <li>Tích hợp trí tuệ nhân tạo tiên tiến</li>
                                <li>
                                    Hiệu năng mạnh mẽ với vi xử lý tiên tiến
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Specifications Section */}
                <div className="mt-20 flex justify-center">
                    <div className="w-full max-w-4xl">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2 text-left">
                            Thông số kỹ thuật
                        </h2>
                        <table className="min-w-full border border-gray-300 table-auto">
                            <tbody className="text-gray-600">
                                {tableData.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <strong>{item.key}</strong>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {item.value || "Không có thông tin"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reviews Section */}
                <ReviewsSection />
            </div>

            <script>
                {`
                    function changeImage(src) {
                    document.getElementById('mainImage').src = src;
                    }
                `}
            </script>
        </div>
    );
};

export default ProductDetails;
