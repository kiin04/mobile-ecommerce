import Heading from "../../shared/Heading";

import Img1 from "../../assets/fakeAssets/blogs/blog-1.jpg";
import Img2 from "../../assets/fakeAssets/blogs/blog-2.jpg";
import Img3 from "../../assets/fakeAssets/blogs/blog-3.jpg";

const BlogData = [
    {
        id: 1,
        title: "Cách chọn đồng hồ thông minh phù hợp",
        subtitle:
            "Đồng hồ thông minh là một máy tính đeo tay dưới dạng đồng hồ đeo tay; các đồng hồ thông minh hiện đại cung cấp giao diện cảm ứng cục bộ để sử dụng hàng ngày, trong khi ứng dụng điện thoại thông minh liên kết cung cấp khả năng quản lý và theo dõi (như theo dõi sinh học dài hạn).",
        publisher: "bởi The Pink Cat",
        image: Img1,
        aosDelay: "200",
    },
    {
        id: 2,
        title: "Hướng dẫn chọn điện thoại thông minh tiếp theo của bạn",
        subtitle:
            "Điện thoại thông minh kết hợp các chức năng điện thoại di động và máy tính thành một thiết bị. Chúng khác biệt với điện thoại phổ thông bởi khả năng phần cứng mạnh mẽ hơn và hệ điều hành di động mở rộng, tạo điều kiện cho phần mềm, internet (bao gồm duyệt web qua băng thông rộng di động), và chức năng đa phương tiện (bao gồm nhạc, video, camera và trò chơi), bên cạnh các chức năng điện thoại cơ bản như gọi điện và nhắn tin.",
        publisher: "bởi The Pink Kitten",
        image: Img2,
        aosDelay: "400",
    },
    {
        id: 3,
        title: "Kính thực tế ảo nào phù hợp nhất với bạn?",
        subtitle:
            "Đây là thiết bị đeo đầu cung cấp thực tế ảo cho người đeo. Kính thực tế ảo (VR) được sử dụng rộng rãi với trò chơi điện tử nhưng chúng cũng được sử dụng trong các ứng dụng khác, bao gồm mô phỏng và đào tạo. Chúng bao gồm màn hình gắn đầu lập thể (cung cấp hình ảnh riêng cho mỗi mắt), âm thanh nổi và cảm biến theo dõi chuyển động đầu (có thể bao gồm con quay hồi chuyển, gia tốc kế, hệ thống ánh sáng cấu trúc, v.v.).",
        publisher: "bởi The Pink Kitty",
        image: Img3,
        aosDelay: "600",
    },
];

const Blogs = () => {
    return (
        <div className="my-12">
            <div className="container">
                {/* Phần tiêu đề */}
                <Heading title="Tin Tức Mới Nhất" subtitle="" />

                {/* Phần blog */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 gap-y-8 sm:gap-4 md:gap-7">
                    {/* Thẻ blog */}
                    {BlogData.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-gray-900"
                            data-aos="fade-up"
                            data-aos-duration="500"
                            data-aos-anchor-placement="bottom-bottom"
                            data-aos-once={false}
                            data-aos-delay={item.aosDelay}
                        >
                            {/* Phần hình ảnh */}
                            <div className="overflow-hidden rounded-2xl mb-2">
                                <img
                                    src={item.image}
                                    alt=""
                                    className="w-full h-[220px] object-cover rounded-2xl hover:scale-[1.1] ease-linear transition-transform duration-150"
                                />
                            </div>
                            {/* Phần nội dung */}
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500">
                                    {item.publisher}
                                </p>
                                <p className="font-bold line-clamp-1">
                                    {item.title}
                                </p>
                                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                    {item.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blogs;
