using WebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Services
{
    public class CartService
    {
        private readonly CSDLBanHang _context;

        public CartService(CSDLBanHang context)
        {
            _context = context;
        }

        public async Task<List<Cart>> GetByUserAsync(int id)
        {
            var carts = await _context.Carts
           .Where(cart => cart.UserId == id)
           .ToListAsync();

            return carts;
        }
    }
}
