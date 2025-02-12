using WebAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;


namespace WebAPI.Services
{
    public class ProductService
    {
        private readonly CSDLBanHang _context;
        private readonly ColorSizesService _colorSizesService;

        public ProductService(CSDLBanHang context, ColorSizesService colorSizesService)
        {
            _context = context;
            _colorSizesService = colorSizesService;
        }


        public async Task<IActionResult> AddProduct([FromForm] Product productDto, IFormFile? image)
        {
            try
            {
                byte[]? imageData = null;

                // Kiểm tra nếu có tệp ảnh được tải lên
                if (image != null && image.Length > 0)
                {
                    using var memoryStream = new MemoryStream();
                    await image.CopyToAsync(memoryStream);
                    imageData = memoryStream.ToArray();
                }

                var product = new Product
                {
                    Name = productDto.Name,
                    Price = productDto.Price,
                    Unit = productDto.Unit,
                    Image = imageData, // Lưu ảnh dưới dạng byte[]
                   
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return new OkObjectResult(new { message = "Sản phẩm đã được thêm thành công!", product });
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(new { message = "Lỗi khi thêm sản phẩm", error = ex.Message });
            }
        }

        public async Task DeleteDependencieAsync(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return;
            
            var colorSizeIds = await _context.ColorSizes
                .Where(cs => cs.ProductId == productId)
                .Select(cs => cs.Id)
                .ToListAsync();

            if (colorSizeIds.Any())
            {
                await Task.WhenAll(colorSizeIds.Select(colorSizeId => _colorSizesService.DeleteDependencieAsync(colorSizeId)));
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }

    }

}
