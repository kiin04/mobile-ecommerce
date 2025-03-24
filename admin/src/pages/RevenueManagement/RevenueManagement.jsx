// import React, { useState, useEffect } from "react";

// const RevenueManagement = () => {
//     const [totalRevenue, setTotalRevenue] = useState(0);
//     const [totalOrders, setTotalOrders] = useState(0);
//     const [successOrders, setSuccessOrders] = useState(0);
//     const [revenueData, setRevenueData] = useState([]);
//     const [orders, setOrders] = useState([]);
//     const [selectedOrder, setSelectedOrder] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalOrdersCount, setTotalOrdersCount] = useState(0);
//     const [showOrderList, setShowOrderList] = useState(false);
//     const [currentPaymentMethod, setCurrentPaymentMethod] = useState("");
//     const [fromDate, setFromDate] = useState("");
//     const [toDate, setToDate] = useState("");

//     const pageSize = 10;

//     useEffect(() => {
//         getTotalStats();
//     }, []);

//     const getTotalStats = async () => {
//         try {
//             const response = await fetch("/RevenueManagement/GetRevenue");
//             const data = await response.json();

//             let revenue = 0;
//             let ordersCount = 0;

//             data.revenueData.forEach((item) => {
//                 revenue += item.totalAmount;
//                 ordersCount += item.orderCount;
//             });

//             setTotalRevenue(revenue);
//             setTotalOrders(ordersCount);
//             setSuccessOrders(data.totalSuccessOrders);
//         } catch (error) {
//             console.error("Error fetching total stats:", error);
//         }
//     };

//     const getRevenue = async () => {
//         // Implementation similar to the original script
//         // Add your fetch logic here
//     };

//     const showOrderList = (paymentMethod) => {
//         setCurrentPaymentMethod(paymentMethod);
//         setCurrentPage(1);
//         setShowOrderList(true);
//         // Add loadOrders logic here
//     };

//     const closeOrderList = () => {
//         setShowOrderList(false);
//     };

//     const viewOrderDetail = async (orderId) => {
//         // Add fetch logic for order details
//         // Set selectedOrder with response data
//     };

//     const closeOrderDetail = () => {
//         setSelectedOrder(null);
//     };

//     const formatDate = (dateString) => {
//         return new Date(dateString).toLocaleString("vi-VN");
//     };

//     const getStatusClass = (status) => {
//         switch (status) {
//             case "Đã thanh toán":
//                 return "bg-green-100 text-green-800";
//             case "Đang xử lý":
//                 return "bg-yellow-100 text-yellow-800";
//             case "Đã hủy":
//                 return "bg-red-100 text-red-800";
//             default:
//                 return "bg-gray-100 text-gray-800";
//         }
//     };

//     return (
//         <div className="w-full h-full p-6">
//             <h1 className="text-2xl font-bold mb-6">Quản lý doanh thu</h1>

//             {/* Total Statistics */}
//             <div className="bg-white rounded-lg shadow p-6 mb-8">
//                 <h2 className="text-xl font-semibold mb-4">
//                     Thống kê tổng doanh thu
//                 </h2>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div className="bg-blue-50 p-4 rounded-lg">
//                         <p className="text-sm text-blue-600 mb-1">
//                             Tổng doanh thu
//                         </p>
//                         <p className="text-2xl font-bold text-blue-700">
//                             {totalRevenue.toLocaleString("vi-VN")} đ
//                         </p>
//                     </div>
//                     <div className="bg-green-50 p-4 rounded-lg">
//                         <p className="text-sm text-green-600 mb-1">
//                             Tổng đơn hàng
//                         </p>
//                         <p className="text-2xl font-bold text-green-700">
//                             {totalOrders}
//                         </p>
//                     </div>
//                     <div className="bg-purple-50 p-4 rounded-lg">
//                         <p className="text-sm text-purple-600 mb-1">
//                             Đơn hàng giao thành công
//                         </p>
//                         <p className="text-2xl font-bold text-purple-700">
//                             {successOrders}
//                         </p>
//                     </div>
//                 </div>
//             </div>

//             {/* Detailed Statistics */}
//             <div className="bg-white rounded-lg shadow p-6">
//                 <h2 className="text-xl font-semibold mb-4">
//                     Thống kê chi tiết theo bộ lọc
//                 </h2>
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                             Từ ngày
//                         </label>
//                         <input
//                             type="datetime-local"
//                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                             onChange={(e) => setFromDate(e.target.value)}
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                             Đến ngày
//                         </label>
//                         <input
//                             type="datetime-local"
//                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                             onChange={(e) => setToDate(e.target.value)}
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                             Phương thức thanh toán
//                         </label>
//                         <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
//                             <option value="">Tất cả</option>
//                             <option value="COD">COD</option>
//                             <option value="Paypal">Paypal</option>
//                             <option value="MoMo">MoMo</option>
//                         </select>
//                     </div>
//                     <div className="flex items-end">
//                         <button
//                             onClick={getRevenue}
//                             className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
//                         >
//                             <i className="fas fa-search mr-2"></i>Thống kê
//                         </button>
//                     </div>
//                 </div>

//                 <div className="mt-6">
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         Phương thức thanh toán
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         Tổng doanh thu
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         Số đơn hàng
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         Thao tác
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {/* Add revenue data mapping here */}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>

//             {/* Order List Section */}
//             {showOrderList && (
//                 <div className="bg-white rounded-lg shadow p-6 mt-8">
//                     <div className="flex justify-between items-center mb-4">
//                         <h2 className="text-xl font-semibold">
//                             Danh sách đơn hàng -{" "}
//                             <span>{currentPaymentMethod}</span>
//                         </h2>
//                         <button
//                             onClick={closeOrderList}
//                             className="text-gray-500 hover:text-gray-700"
//                         >
//                             <i className="fas fa-times"></i> Đóng
//                         </button>
//                     </div>
//                     {/* Add order table content here */}
//                 </div>
//             )}

//             {/* Order Detail Modal */}
//             {selectedOrder && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto py-10">
//                     <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
//                         <button
//                             onClick={closeOrderDetail}
//                             className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 z-10"
//                         >
//                             <i className="fas fa-times"></i>
//                         </button>
//                         {/* Add order detail content here */}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default RevenueManagement;
