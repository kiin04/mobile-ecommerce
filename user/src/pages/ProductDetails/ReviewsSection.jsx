import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { Rate } from "antd";
import {
    faStar,
    faStarHalfAlt
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import PropTypes from "prop-types";
import { Fragment, useState, useEffect } from "react";
import { API_URL } from "../../config";

const review = [
	{
		img: "https://cdn.easyfrontend.com/pictures/users/user18.jpg",
		name: "Freya Kemp",
		rating: 4.8,
		date: "Jan 24,2020",
		content:
			"Well received seems solid.",
	},
	{
		img: "https://cdn.easyfrontend.com/pictures/users/user4.jpg",
		name: "Issy Won",
		rating: 4.5,
		date: "June 10,2020",
		content:
			"A wonderful I should be.",
	},
	{
		img: "https://cdn.easyfrontend.com/pictures/users/user17.jpg",
		name: "Sophia Dunkley",
		rating: 3.9,
		date: "Sep 19,2020",
		content:
			"Sed velit.",
	},
];

const Rating = ({ rating, showLabel, className, ...rest }) => (
	<p className={classNames("text-sm", className)} {...rest}>
		<span className="text-yellow-500">
			{[...Array(5)].map((_, i) => {
				const index = i + 1;
				let content = "";
				if (index <= Math.floor(rating))
					content = <FontAwesomeIcon icon={faStar} />;
				else if (rating > i && rating < index + 1)
					content = <FontAwesomeIcon icon={faStarHalfAlt} />;
				else if (index > rating) content = <FontAwesomeIcon icon={farStar} />;

				return <Fragment key={i}>{content}</Fragment>;
			})}
		</span>
		{showLabel && <span className="mx-1">{rating.toFixed(1)}</span>}
	</p>
);

Rating.propTypes = {
	rating: PropTypes.number.isRequired,
	showLabel: PropTypes.bool,
	className: PropTypes.string,
};

const ReviewItem = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const imageUrl = item.image_base64
        ? `data:image/jpeg;base64,${item.image_base64}`
        : "https://cdn.easyfrontend.com/pictures/users/user1.jpg";

	return (
		<>
			<hr className="dark:border-slate-700 my-5" />
			<div>
				<div className="flex items-center mb-6">
					<div className="w-12 h-12 rounded-full mr-2 overflow-hidden">
						<img src={item.imageUrl} alt={item.name} className="max-w-full h-auto mx-auto" />
					</div>
					<div className="flex flex-grow justify-between">
						<div>
							<h5 className="font-medium mb-1">{item.name}</h5>
							<Rating rating={item.stars} showLabel={true} />
						</div>
						<p className="text-sm opacity-50 mb-0">{formattedDate}</p>
					</div>
				</div>
				<p className="text-sm leading-normal opacity-75 mb-6">{item.content}</p>
			</div>
		</>
	);
};

ReviewItem.propTypes = {
	item: PropTypes.object.isRequired,
};

// const BarItem = ({ info }) => {
// 	const progressBarStyle = {
// 		width: info.width,
// 	};

// 	return (
// 		<div className="flex justify-around items-center sm:w-1/2 mb-2">
// 			<div className="mr-3">
// 				<p className="text-sm font-bold mb-0">
// 					<span className="opacity-50">{info.star}</span>
// 					<span className="text-blue-600 ml-1">
// 						<FontAwesomeIcon icon={faStar} />
// 					</span>
// 				</p>
// 			</div>
// 			<div className="flex-grow mr-3">
// 				<div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
// 					<div
// 						className="w-8/12 h-full bg-blue-600"
// 						style={progressBarStyle}
// 					></div>
// 				</div>
// 			</div>
// 			<div>
// 				<p className="text-sm opacity-50 mb-0">{info.count}</p>
// 			</div>
// 		</div>
// 	);
// };

// BarItem.propTypes = {
// 	info: PropTypes.shape({
// 		star: PropTypes.string.isRequired,
// 		value: PropTypes.string.isRequired,
// 		width: PropTypes.string.isRequired,
// 		count: PropTypes.string.isRequired,
// 	}).isRequired,
// };

export const ReviewsSection = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Comment`);
                setComments(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching comments:", error);
                setLoading(false);
            }
        };
        fetchComments();
    }, []);

    const averageRating =
        comments.length > 0
            ? comments.reduce((sum, comment) => sum + comment.stars, 0) / comments.length
            : 0;


	return (
		<section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white relative overflow-hidden z-10">
			<div className="container px-4 mx-auto">
				<div className="flex justify-center max-w-4xl mx-auto">
					<div className="shadow-md dark:bg-slate-800 rounded p-4 lg:p-8 bg-gray-50">
						<div>
							<div className="p-3 md:p-6">
								<div className="flex flex-wrap items-center">
									<span className="text-[40px]">4.5</span>
									<Rating
										rating={averageRating}
										showLabel={false}
										className="text-yellow-500 ml-2"
									/>
								</div>
								<p className="text-sm opacity-75 mb-6">
									Average rating based on {comments.length} reviews
								</p>
							</div>
							<hr className="dark:border-slate-700 my-4" />
							<div className="p-3 pt-0 md:p-6 md:pt-0">
								<div className="flex justify-between items-center">
									<h2 className="text-2xl font-medium">Customer Review</h2>
								</div>
                                {loading ? (
                                    <p>Loading reviews...</p>
                                ) : comments.length > 0 ? (
                                    comments.map((item, i) => (
                                        <ReviewItem item={item} key={i} />
                                    ))
                                ) : (
                                    <p>Chưa có bình luận về sản phẩm</p>
                                )}
							</div>
							<div className="py-6 lg:py-12 text-center">
								<button className="bg-blue-600 text-white text-sm hover:bg-opacity-90 rounded py-2.5 px-6 md:px-10">
									Load More
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

