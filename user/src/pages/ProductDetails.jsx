import { notification, Select } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { BASE_URL } from "../config";

const ProductDetails = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState("");
    const userId = sessionStorage.getItem("userId");

    const [availableColors, setAvailableColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState("");

    useEffect(() => {
        fetch(`${BASE_URL}/api/products/${productId}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data); // Check the structure of the data
                setProduct(data.product);
                setAvailableColors(data.availableColors);

                const defaultColor = data.availableColors.find(
                    (color) => color.color === data.product.color
                );
                if (defaultColor) {
                    setSelectedColor(defaultColor.id);
                }
            })
            .catch((error) => {
                console.error("Error fetching product details:", error);
            });
    }, [productId]);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value > product.quantity) {
            setError("Số lượng bạn chọn đã đạt mức tối đa của sản phẩm này");
            notification.warning({
                message: "Lưu ý",
                description:
                    "Số lượng bạn chọn đã đạt mức tối đa của sản phẩm này",
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true,
            });
        } else {
            setError("");
        }
        setQuantity(value);
    };

    const handleBuyNow = async () => {
        if (!userId) {
            notification.warning({
                message: "Lưu ý",
                description: "Vui lòng đăng nhập để sử dụng giỏ hàng",
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true,
            });
            // window.location.href = "/login";
            return;
        }

        if (!product || !product.id) {
            notification.error({
                message: "Lỗi",
                description: "Không tìm thấy thông tin sản phẩm",
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true,
            });
            return;
        }

        if (quantity <= 0 || quantity > product.quantity) {
            notification.error({
                message: "Lỗi",
                description: "Số lượng không hợp lệ!",
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true,
            });
            return;
        }

        const cartItem = {
            productId: product.id,
            name: product.name,
            price: product.price,
            color: selectedColor
                ? availableColors.find((c) => c.id === selectedColor)?.color
                : product.color,
            quantity: parseInt(quantity),
            image: product.image,
        };

        try {
            const response = await fetch(`${BASE_URL}/api/cart/${userId}/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cartItem),
                cache: "no-store",
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
                placement: "bottomRight",
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
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true,
            });
        }
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
            key: "Màu sắc",
            value: product.color,
        },
        {
            key: "Hệ điều hành",
            value: product.os,
        },
        {
            key: "Thương hiệu",
            value: product.brand,
        },
        {
            key: "RAM",
            value: product.cauhinh?.dungLuongRAM,
        },
        {
            key: "Bộ nhớ trong",
            value: product.cauhinh?.boNhoTrong,
        },
        {
            key: "Pin",
            value: product.cauhinh?.pin,
        },
        {
            key: "Kích thước màn hình",
            value: product.cauhinh?.kichThuocManHinh,
        },
        {
            key: "Công nghệ màn hình",
            value: product.cauhinh?.congNgheManHinh,
        },
        {
            key: "Camera sau",
            value: product.cauhinh?.cameraSau,
        },
        {
            key: "Camera trước",
            value: product.cauhinh?.cameraTruoc,
        },
        {
            key: "Chipset",
            value: product.cauhinh?.chipset,
        },
        {
            key: "GPU",
            value: product.cauhinh?.gpu,
        },
        {
            key: "Công nghệ NFC",
            value: product.cauhinh?.congNgheNFC,
        },
        {
            key: "Thẻ SIM",
            value: product.cauhinh?.theSIM,
        },
        {
            key: "Độ phân giải màn hình",
            value: product.cauhinh?.doPhanGiaiManHinh,
        },
        {
            key: "Cổng sạc",
            value: product.cauhinh?.congSac,
        },
    ];

    return (
        <div className="mt-14">
            <div className="container mx-auto px-4 py-8 flex flex-col mb-24">
                <div className="flex flex-wrap -mx-4 justify-center xl:ml-40 lg:ml-10">
                    {/* <!-- Product Images --> */}
                    <div className="w-full 2xl:w-[40%] xl:w-[50%] lg:w-[50%] md:w-[50%] sm:w-[50%] px-4 mb-8 -translate-x-4">
                        <img
                            src={`${BASE_URL}/${product.image}`}
                            alt={product.name}
                            className="w-full h-auto rounded-lg shadow-md mb-4"
                            id="mainImage"
                        />
                        {/* <div className="flex gap-4 py-4 justify-center overflow-x-auto">
                            <img
                                src="https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxMnx8aGVhZHBob25lfGVufDB8MHx8fDE3MjEzMDM2OTB8MA&ixlib=rb-4.0.3&q=80&w=1080"
                                alt="Thumbnail 1"
                                className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                                onClick="changeImage(this.src)"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1484704849700-f032a568e944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw0fHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080"
                                alt="Thumbnail 2"
                                className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                                onClick="changeImage(this.src)"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1496957961599-e35b69ef5d7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw4fHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080"
                                alt="Thumbnail 3"
                                className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                                onClick="changeImage(this.src)"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1528148343865-51218c4a13e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwzfHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080"
                                alt="Thumbnail 4"
                                className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                                onClick="changeImage(this.src)"
                            />
                        </div> */}
                    </div>

                    {/* <!-- Product Details --> */}
                    <div className="w-full md:w-1/2 px-4">
                        {/* Show how many items are left in stock */}
                        {/* <p className="text-md text-gray-600 mb-4">
                            Trạng thái:{" "}
                            <span
                                className={
                                    product.quantity > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                }
                            >
                                {product.quantity > 0
                                    ? `${product.quantity} sản phẩm còn lại`
                                    : "Hết hàng"}
                            </span>
                        </p> */}

                        <p className="text-red-500 mb-1 text-lg">{product.brand}</p>
                        <h2 className="text-3xl font-bold mb-2">
                            {product.name}
                        </h2>
                        <p className="text-gray-600 mb-4 text-xs">SKU: {product.id}</p>
                        <div className="mb-4">
                            <span className="text-2xl font-bold mr-2 text-primary">
                                {product.price.toLocaleString()} đ
                            </span>
                        </div>

                        <p className="text-gray-700 mb-6">
                            {product.description}
                        </p>

                        {/* <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Màu:</h3>
                            <div className="flex space-x-2">
                                <button className="w-8 h-8 bg-black rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"></button>
                                <button className="w-8 h-8 bg-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"></button>
                                <button className="w-8 h-8 bg-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"></button>
                            </div>
                        </div> */}

                        {/* Color Selection */}
                        {availableColors.length >= 0 && (
                            <div className="my-6">
                                <label
                                    htmlFor="color"
                                    className="block text-lg font-semibold mb-1"
                                >
                                    Màu:
                                </label>
                                <Select
                                    size="large"
                                    id="color"
                                    value={selectedColor}
                                    onChange={(e) => {
                                        const newColorId = e.target.value;
                                        setSelectedColor(newColorId); // Update selected color
                                        const newProduct = availableColors.find(
                                            (color) => color.id === newColorId
                                        );
                                        if (newProduct) {
                                            window.location.href = `/product/${newProduct.id}`; // Redirect to the new product
                                        }
                                    }}
                                    className="w-32 rounded-lg focus:outline-none"
                                >
                                    {availableColors.map((colorOption) => (
                                        <option
                                            key={colorOption.id}
                                            value={colorOption.id}
                                        >
                                            {colorOption.color}
                                        </option>
                                    ))}
                                </Select>
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
                                max={product.quantity}
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="w-12 text-center rounded-md border-gray-300  shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>

                        <div className="flex space-x-4 mb-6">
                            <button
                                className="bg-primary flex gap-2 items-center text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                                Thêm vào giỏ
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
            </div>

            <script>
                {`
                    function changeImage(src) {
                    document.getElementById('mainImage').src = src;
                    }
                `}
            </script>
        </div>

        // <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gray-100">
        //     <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md w-full max-w-6xl overflow-hidden">
        //         {/* Image Section */}
        //         <div className="w-full md:w-1/3 p-4">
        //             <img
        //                 src={`${BASE_URL}/${product.image}`}
        //                 alt={product.name}
        //                 className="w-full h-auto object-cover rounded-lg border border-gray-300"
        //             />
        //         </div>

        //         {/* Description Section */}
        //         <div className="flex-1 p-4">
        //             <h1 className="text-2xl font-bold text-gray-800 mb-2">
        //                 {product.name}
        //             </h1>
        //             <p className="text-xl text-gray-700 mb-2">
        //                 Giá:{" "}
        //                 <span className="font-semibold">
        //                     {product.price.toLocaleString()} VND
        //                 </span>
        //             </p>
        //             <p className="text-md text-gray-600 mb-4">
        //                 Mô tả: {product.description}
        //             </p>

        //             {/* Show how many items are left in stock */}
        //             <p className="text-md text-gray-600 mb-4">
        //                 Trạng thái:{" "}
        //                 <span
        //                     className={
        //                         product.quantity > 0
        //                             ? "text-green-600"
        //                             : "text-red-600"
        //                     }
        //                 >
        //                     {product.quantity > 0
        //                         ? `${product.quantity} sản phẩm còn lại`
        //                         : "Hết hàng"}
        //                 </span>
        //             </p>
        //             {/* Color Selection */}
        //             {availableColors.length > 1 && (
        //                 <div className="mt-4">
        //                     <label
        //                         htmlFor="color"
        //                         className="text-lg font-semibold mr-2"
        //                     >
        //                         Màu sắc:
        //                     </label>
        //                     <select
        //                         id="color"
        //                         value={selectedColor}
        //                         onChange={(e) => {
        //                             const newColorId = e.target.value;
        //                             setSelectedColor(newColorId); // Update selected color
        //                             const newProduct = availableColors.find(
        //                                 (color) => color.id === newColorId
        //                             );
        //                             if (newProduct) {
        //                                 window.location.href = `/product/${newProduct.id}`; // Redirect to the new product
        //                             }
        //                         }}
        //                         className="w-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        //                     >
        //                         {availableColors.map((colorOption) => (
        //                             <option
        //                                 key={colorOption.id}
        //                                 value={colorOption.id}
        //                             >
        //                                 {colorOption.color}
        //                             </option>
        //                         ))}
        //                     </select>
        //                 </div>
        //             )}

        //             {/* Quantity Selection */}
        //             {product.quantity > 0 && (
        //                 <div className="mt-4 flex items-center">
        //                     <label
        //                         htmlFor="quantity"
        //                         className="text-lg font-semibold mr-2"
        //                     >
        //                         Số lượng:
        //                     </label>
        //                     <input
        //                         type="number"
        //                         id="quantity"
        //                         min="1"
        //                         max={product.quantity}
        //                         value={quantity}
        //                         onChange={handleQuantityChange}
        //                         className="w-16 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        //                     />
        //                     <button
        //                         className={`ml-4 py-2 px-4 rounded-md transition-colors duration-200 bg-primary text-white hover:bg-red-600`}
        //                         onClick={handleBuyNow}
        //                         // disabled={!userId}
        //                     >
        //                         {/* {userId
        //                             ? "Thêm vào giỏ hàng"
        //                             : "Vui lòng đăng nhập"} */}
        //                         Thêm vào giỏ hàng
        //                     </button>
        //                 </div>
        //             )}

        //             {error && <p className="text-red-500 mt-2">{error}</p>}
        //         </div>
        //     </div>

        //     {/* Specifications Section */}
        //     <div className="mt-6 w-full max-w-6xl">
        //         <h2 className="text-lg font-semibold text-gray-800 mb-2">
        //             Thông số kỹ thuật:
        //         </h2>
        //         <table className="min-w-full border border-gray-300 table-auto">
        //             <thead>
        //                 <tr className="bg-gray-200">
        //                     <th className="border border-gray-300 px-4 py-2 text-left">
        //                         Thông số
        //                     </th>
        //                     <th className="border border-gray-300 px-4 py-2 text-left">
        //                         Chi tiết
        //                     </th>
        //                 </tr>
        //             </thead>
        //             <tbody className="text-gray-600">
        //                 {tableData.map((item, index) => (
        //                     <tr key={index}>
        //                         <td className="border border-gray-300 px-4 py-2">
        //                             <strong>{item.key}</strong>
        //                         </td>
        //                         <td className="border border-gray-300 px-4 py-2">
        //                             {item.value || "Không có thông tin"}
        //                         </td>
        //                     </tr>
        //                 ))}
        //             </tbody>
        //         </table>
        //     </div>
        // </div>
    );
};

export default ProductDetails;
