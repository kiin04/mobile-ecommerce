import Button from "../../shared/Button";
import Image1 from "../../assets/fakeAssets/category/huawei.png";
import Image3 from "../../assets/fakeAssets/category/Iphone16.png";
import XiaomiPhone from "../../assets/fakeAssets/category/xiaomi_phone.png";
import Apple from "../../assets/BrandLogos/Apple.svg";
import Xiaomi from "../../assets/BrandLogos/Xiaomi_logo.svg";
import Huawei from "../../assets/BrandLogos/Huawei_logo.svg";
import { useNavigate } from "react-router-dom";

// TODO: Điều hướng đến trang sản phẩm được lọc theo thương hiệu đó
const Featured = () => {
    const navigate = useNavigate();

    const handleCategoryBrowse = (brand) => {
        // navigate(`/products?brand=${brand}`);
    }

    return (
        <section className="py-8">
            <div className="container">
                <div className="grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* cột đầu tiên */}
                    <div className="py-10 pl-5 bg-gradient-to-tr from-gray-400/90 to-gray-100 text-white rounded-3xl relative h-[250px] sm:h-[320px] flex items-end">
                        <div>
                            <div className="mb-4">
                                <p className="mb-[2px] text-gray-500">Trải nghiệm</p>
                                <p className="text-2xl font-semibold mb-[2px]">
                                    Cùng
                                </p>
                                <p className="my-3 text-4xl translate-x-2 xl:text-5xl">
                                    <img
                                        src={Huawei}
                                        alt=""
                                        style={{
                                            width: "50%",
                                            "@media (minWidth: 640px)": {
                                                width: "50%",
                                            },
                                            "@media (minWidth: 768px)": {
                                                width: "33.33%",
                                            },
                                            "@media (minWidth: 1024px)": {
                                                width: "25%",
                                            },
                                            "@media (minWidth: 1280px)": {
                                                width: "20%",
                                            },
                                        }}
                                    />
                                </p>
                                <Button
                                    text="Khám phá"
                                    bgColor={"bg-primary"}
                                    textColor={"text-white"}
                                    fontSize= {"text-sm"}
                                />
                            </div>
                        </div>
                        <img
                            src={Image1}
                            alt=""
                            className="2xl:w-[220px] xl:w-48 lg:w-32 md:w-52 sm:w-44 w-48 absolute bottom-0 right-2 sm:-right-4 md:-right-3 lg:-right-2 xl:-right-4 2xl:-right-2 object-contain top-1/2 -translate-y-1/2"
                        />
                    </div>

                    {/* cột thứ hai */}
                    <div className="py-10 pl-5 bg-gradient-to-br from-brandYellow/90 to-brandYellow/90 text-white rounded-3xl relative h-[320px] flex items-end">
                        <div>
                            <div className="mb-4">
                                <p className="mb-[2px] text-white">Trải nghiệm</p>
                                <p className="text-2xl font-semibold mb-[2px]">
                                    Cùng
                                </p>
                                <p className="text-4xl font-bold xl:text-5xl 2xl:my-[0.15rem] xl:-my-2 2xl:-translate-x-4 lg:-translate-x-3 md:-translate-x-3 sm:-translate-x-3">
                                    <img
                                        src={Xiaomi}
                                        alt="Xiaomi logo"
                                        style={{
                                            width: "100px",
                                            "@media (minWidth: 640px)": {
                                                width: "50%",
                                            },
                                            "@media (minWidth: 768px)": {
                                                width: "33.33%",
                                            },
                                            "@media (minWidth: 1024px)": {
                                                width: "25%",
                                            },
                                            "@media (minWidth: 1280px)": {
                                                width: "20%",
                                            },
                                        }}
                                    />
                                </p>
                                <Button
                                    text="Khám phá"
                                    bgColor={"bg-white"}
                                    textColor={"text-brandYellow"}
                                    fontSize= {"text-sm"}
                                />
                            </div>
                        </div>
                        <img
                            src={XiaomiPhone}
                            alt=""
                            className="absolute w-[160px] sm:w-[70%] right-0 top-[3em] 2xl:-right-3 xl:-right-1 lg:-right-2 md:-right-2 sm:-right-2 xl:top-[2em] lg:top-[4em] md:top-[2em] sm:top-[3em]"
                        />
                    </div>

                    {/* cột thứ ba */}
                    <div className="col-span-1 sm:col-span-2 py-10 pl-5 bg-gradient-to-br from-black/90 to-black/70 text-white rounded-3xl relative h-[250px] sm:h-[320px] flex items-end">
                        <div>
                            <div className="mb-4">
                                <p className="mb-[2px] text-white">Trải nghiệm</p>
                                <p className="text-2xl font-semibold">Cùng</p>
                                <p className="mt-3 font-bold 2xl:text-6xl xl:text-6xl md:text-5xl sm:text-6xl opacity-40 my-7">
                                    <img
                                        src={Apple}
                                        alt="Apple logo"
                                        className="w-8 inline -translate-y-1.5"
                                    />{" "}
                                    Apple
                                </p>
                                <Button
                                    text="Khám phá"
                                    bgColor={"bg-white"}
                                    textColor={"text-[#1b1b1b]"}
                                    fontSize= {"text-sm"}
                                />
                            </div>
                        </div>
                        <img
                            src={Image3}
                            alt=""
                            className="w-[200px] sm:w-[290px] h-auto object-contain absolute top-1/2 -translate-y-1/2 right-2 sm:right-2 md:right-16 lg:-right-3 xl:right-7 2xl:right-14 max-h-full"
                            style={{ maxHeight: "calc(100%)" }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Featured;
