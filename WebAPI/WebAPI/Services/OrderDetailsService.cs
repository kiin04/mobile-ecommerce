using WebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Services
{
    public class OrderDetailsService
    {
        private readonly CSDLBanHang _context;

        public OrderDetailsService(CSDLBanHang context)
        {
            _context = context;
        }
        public async Task<List<OrderDetails>> GetByOrderId(int orderid)
        {
            var orders = await _context.OrderDetails
                .Where(o => o.OrderId == orderid)
                .ToListAsync();

            if (orders == null || !orders.Any())
            {
                throw new KeyNotFoundException($"No orders found for User with ID: {orderid}");
            }

            return orders;
        }

    }
}
