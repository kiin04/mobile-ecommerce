import Button from "../../shared/Button";
import Image1 from "../../assets/fakeAssets/category/sony.png";
import Image2 from "../../assets/fakeAssets/category/kvr-2560.png";
import Image3 from "../../assets/fakeAssets/category/file.png";
import Samsung from "../../assets/BrandLogos/Samsung_Logo.svg";
import Oppo from "../../assets/BrandLogos/OPPO_LOGO.svg";
import Sony from "../../assets/BrandLogos/Sony_logo.svg";
import { useNavigate } from "react-router-dom";

// TODO: Điều hướng đến trang sản phẩm được lọc theo thương hiệu đó
const Featured2 = () => {
    const navigate = useNavigate();

    const handleCategoryBrowse = (brand) => {
        // navigate(`/products?brand=${brand}`);
    }

    return (
        <section className="py-8 mt-2 mb-40">
            <div className="container">
                <div className="grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* cột thứ nhất */}
                    <div
                        className="col-span-1 sm:col-span-2 py-6 sm:py-10 pl-3 sm:pl-5 text-white rounded-2xl sm:rounded-3xl relative h-[250px] sm:h-[320px] flex items-end"
                        style={{background: "linear-gradient(135deg, rgba(0,0,128,1) 0%, rgba(176,196,222,1) 80%, rgba(255,255,255,1) 100%)"}}>
                        <div>
                            <div className="mb-4">
                                <p className="mb-[2px] text-gray-300 text-sm sm:text-base">Trải nghiệm</p>
                                <p className="text-xl sm:text-2xl font-semibold mb-[2px]">
                                    Cùng
                                </p>
                                <p className="my-4 sm:my-6">
                                    <img
                                        src={Sony}
                                        alt="Sony logo"
                                        className="w-[40%] sm:w-[50%]"
                                    />
                                </p>
                                <Button
                                    text="Khám phá"
                                    bgColor={"bg-white"}
                                    fontSize= {"text-sm"}
                                    textColor="text-[rgba(0,0,128,1)]"
                                />
                            </div>
                        </div>
                        <img
                            src={Image1}
                            alt=""
                            className="absolute top-1/2 -translate-y-1/2 2xl:right-9 md:right-9 sm:right-9 right-3 2xl:w-[35%] xl:w-[] lg:max-xl:right-1"
                        />
                    </div>

                    {/* cột thứ hai */}
                    <div className="py-6 sm:py-10 pl-3 sm:pl-5 bg-gradient-to-br from-brandGreen/90 to-brandGreen/70 text-white rounded-2xl sm:rounded-3xl relative h-[250px] sm:h-[320px] flex items-start overflow-hidden">
                        <div>
                            <div className="mb-4">
                                <p className="mb-[2px] text-white text-sm sm:text-base">Trải nghiệm</p>
                                <p className="text-xl sm:text-2xl font-semibold mb-[2px]">
                                    Cùng
                                </p>
                                <p className="my-4 sm:my-6">
                                    <img
                                        src={Oppo}
                                        alt="Oppo logo"
                                        className="w-[60%] sm:w-[80%]"
                                    />
                                </p>
                                <Button
                                    text="Khám phá"
                                    bgColor={"bg-white"}
                                    textColor={"text-brandGreen"}
                                    fontSize= {"text-sm"}
                                />
                            </div>
                        </div>
                        <img
                            src={Image2}
                            alt=""
                            className="w-[150px] sm:w-[200px] md:w-[170px] lg:w-[180px] 2xl:w-[160px] absolute bottom-0 right-0 translate-y-8"
                        />
                    </div>

                    {/* cột thứ ba */}
                    <div className="py-6 sm:py-10 pl-3 sm:pl-5 bg-gradient-to-br from-brandBlue to-brandBlue/70 text-white rounded-2xl sm:rounded-3xl relative h-[250px] sm:h-[320px] flex items-start">
                        <div>
                            <div className="mb-4">
                                <p className="mb-[2px] text-white text-sm sm:text-base">Trải nghiệm</p>
                                <p className="text-xl sm:text-2xl font-semibold mb-[2px]">
                                    Cùng
                                </p>
                                <p className="mb-2 overflow-hidden">
                                    <img
                                        src={Samsung}
                                        alt="Samsung logo"
                                        className="w-[70%] sm:w-72 2xl:-translate-x-9 xl:-translate-x-8 lg:-translate-x-5  md:-translate-x-9 sm:-translate-x-7"
                                    />
                                </p>
                                <Button
                                    text="Khám phá"
                                    bgColor={"bg-white"}
                                    textColor={"text-brandBlue"}
                                    fontSize= {"text-sm"}
                                />
                            </div>
                        </div>
                        <img
                            src={Image3}
                            alt=""
                            className="w-[150px] sm:w-[200px] absolute bottom-0 right-0"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Featured2;
