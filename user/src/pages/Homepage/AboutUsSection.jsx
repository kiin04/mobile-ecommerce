import { Link } from "react-router-dom";
import AboutUsImg from "../../assets/fakeAssets/aboutus.jpg";
import PathNames from "../../PathNames.js";
import ArrowTextBtn from "../../shared/ArrowTextBtn";

const AboutUsSection = () => {
    return (
        <div className="flex items-center justify-center my-48">
            <div className="2xl:max-w-[79rem] xl:max-w-[72rem] mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div
                    className="flex flex-col justify-center"
                    data-aos="fade-up"
                    data-aos-duration="500"
                    data-aos-once={false}
                    data-aos-anchor-placement="center-bottom"
                >
                    <div className="max-w-[23rem]">
                        <h1 className="lg:text-5xl md:text-5xl sm:text-5xl font-bold mb-4 text-primary">
                            Đây là SPhoneC
                        </h1>
                        <p className="text-lg mb-4 tracking-tight">
                            {`Khám phá công nghệ của thế giới các thiết bị di động cùng chúng tôi, một cách thật dễ dàng và thú vị.`}
                        </p>
                    </div>

                    <Link
                        to={PathNames.ABOUT}
                        className="text-lg font-semibold flex items-center"
                    >
                        <ArrowTextBtn text="Về chúng tôi" />
                    </Link>
                </div>

                <div
                    data-aos="fade-up"
                    data-aos-duration="500"
                    data-aos-once={false}
                    data-aos-anchor-placement="bottom-bottom"
                >
                    <img
                        src={AboutUsImg}
                        alt="Person holding a Fairphone with a message 'Change is in your hands'"
                        className="rounded-3xl shadow-2xl"
                    />
                </div>
            </div>
        </div>
    );
};

export default AboutUsSection;
