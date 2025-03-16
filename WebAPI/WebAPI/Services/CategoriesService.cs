using WebAPI.Models;
using Microsoft.EntityFrameworkCore;


namespace WebAPI.Services
{
    public class CategoriesService
    {
        protected readonly CSDLBanHang _context;
        protected readonly ProductService _productService;

        // Constructor
        public CategoriesService(CSDLBanHang context, ProductService productService)
        {
            _context = context;
            _productService = productService;
        }

        // Virtual method for deletion
        public virtual async Task DeleteDependencieAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return;

            var productIds = await _context.Products
                .Where(p => p.CategoryId == id)
                .Select(p => p.Id)
                .ToListAsync();

            // Delete all related products
            if (productIds.Any())
            {
                await Task.WhenAll(productIds.Select(proId => _productService.DeleteDependencieAsync(proId)));
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }

}
