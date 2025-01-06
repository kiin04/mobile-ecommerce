import React, { useEffect } from 'react';
// Import các ảnh avatar
import Avatar1 from '../assets/avatar/a1.jpg';
import Avatar2 from '../assets/avatar/a2.jpg';
import Avatar3 from '../assets/avatar/a3.jpg';
import Avatar4 from '../assets/avatar/a4.jpg';
import Avatar5 from '../assets/avatar/a5.jpg';

const About = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="about-page">
           <section className="hero-section h-96 flex items-center justify-center text-center text-white" style={{ background: "linear-gradient(to bottom, rgba(30, 58, 138, 0.8), rgba(30, 58, 138, 0.8)), url('/path-to-your-background-image.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="bg-black bg-opacity-70 p-10 rounded-lg shadow-lg">
                    <h1 className="text-5xl font-bold">Về Chúng Tôi</h1>
                    <p className="mt-4 text-xl">Đối tác công nghệ đáng tin cậy của bạn.</p>
                </div>
            </section>

            {/* Tổng quan về công ty */}
            <section className="company-overview py-16 px-8 text-center bg-white">
                <h2 className="text-4xl font-bold mb-4">Câu Chuyện Của Chúng Tôi</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Kể từ khi thành lập vào năm 2020, chúng tôi đã và đang nỗ lực không ngừng để mang đến những giải pháp sáng tạo và dịch vụ xuất sắc cho khách hàng trên toàn quốc. Chúng tôi tin tưởng vào chất lượng, sự chính trực và cam kết.
                </p>
            </section>

            {/* Phần giá trị cốt lõi */}
            <section className="values-section bg-gray-100 py-16 px-8 text-center">
                <h2 className="text-4xl font-bold mb-8">Giá Trị Cốt Lõi</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="value-item p-6 bg-white rounded shadow-md">
                        <h3 className="text-2xl font-semibold">Đổi Mới</h3>
                        <p className="text-gray-600 mt-4">Chúng tôi luôn nỗ lực để đi đầu trong công nghệ, không ngừng cải tiến và phát triển.</p>
                    </div>
                    <div className="value-item p-6 bg-white rounded shadow-md">
                        <h3 className="text-2xl font-semibold">Khách Hàng Là Trọng Tâm</h3>
                        <p className="text-gray-600 mt-4">Khách hàng là ưu tiên hàng đầu. Chúng tôi lắng nghe và đáp ứng nhu cầu của họ.</p>
                    </div>
                    <div className="value-item p-6 bg-white rounded shadow-md">
                        <h3 className="text-2xl font-semibold">Chính Trực</h3>
                        <p className="text-gray-600 mt-4">Chúng tôi điều hành doanh nghiệp với sự trung thực và minh bạch.</p>
                    </div>
                </div>
            </section>

            {/* Phần thành viên đội ngũ */}
            <section className="team-section py-16 px-8 text-center">
                <h2 className="text-4xl font-bold mb-8">Đội Ngũ Của Chúng Tôi</h2>
                <div className="container mx-auto">
                    {/* Hàng đầu tiên - 3 thành viên */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="team-member">
                            <img 
                                src={Avatar1} 
                                alt="N.Phát"
                                className="rounded-full w-32 h-32 mx-auto mb-4 object-cover border-4 border-primary hover:scale-110 transition-transform duration-300" 
                            />
                            <h3 className="text-xl font-semibold">Hồng Phát</h3>
                            <p className="text-gray-600">Scrum Master</p>
                        </div>
                        <div className="team-member">
                            <img 
                                src={Avatar5} 
                                alt="H.Phát"
                                className="rounded-full w-32 h-32 mx-auto mb-4 object-cover border-4 border-primary hover:scale-110 transition-transform duration-300" 
                            />
                            <h3 className="text-xl font-semibold">Quốc Bảo</h3>
                            <p className="text-gray-600">Trưởng Nhóm</p>
                        </div>
                        <div className="team-member">
                            <img 
                                src={Avatar2} 
                                alt="Q.Bảo"
                                className="rounded-full w-32 h-32 mx-auto mb-4 object-cover border-4 border-primary hover:scale-110 transition-transform duration-300" 
                            />
                            <h3 className="text-xl font-semibold">Minh Quân</h3>
                            <p className="text-gray-600">Product Owner</p>
                        </div>
                    </div>

                    {/* Hàng thứ hai - 2 thành viên căn giữa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        <div className="team-member">
                            <img 
                                src={Avatar4} 
                                alt="M.Quân"
                                className="rounded-full w-32 h-32 mx-auto mb-4 object-cover border-4 border-primary hover:scale-110 transition-transform duration-300" 
                            />
                            <h3 className="text-xl font-semibold">Nhật Phát</h3>
                            <p className="text-gray-600">Lập Trình Viên</p>
                        </div>
                        <div className="team-member">
                            <img 
                                src={Avatar3} 
                                alt="H.Tha"
                                className="rounded-full w-32 h-32 mx-auto mb-4 object-cover border-4 border-primary hover:scale-110 transition-transform duration-300" 
                            />
                            <h3 className="text-xl font-semibold">Hoàng Thanh</h3>
                            <p className="text-gray-600">Lập Trình Viên</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kêu gọi hành động */}
            <section className="cta-section py-16 px-8 bg-primary text-white text-center">
                <h2 className="text-3xl font-bold mb-4">Sẵn sàng kết nối với chúng tôi?</h2>
                <p className="text-lg mb-8">Hãy cùng chúng tôi đổi mới ngành công nghiệp.</p>
                <a href="/contactus" className="px-8 py-3 bg-white text-primary rounded-full hover:bg-gray-200">
                    Liên Hệ Ngay
                </a>
            </section>
        </main>
    );
};

export default About;
