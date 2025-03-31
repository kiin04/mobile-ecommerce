using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Decorator
{
    public class ValidationCategoriesService : CategoriesService
    {
        private readonly ILogger<ValidationCategoriesService> _logger;

        // constructor
        public ValidationCategoriesService(CSDLBanHang context, ProductService productService, ILogger<ValidationCategoriesService> logger)
            : base(context, productService)
        {
            _logger = logger;
        }

        // add validation
        public override async Task DeleteDependencieAsync(int id)
        {
            if (id <= 0)
            {
                _logger.LogError("Validation failed: Category ID must be greater than 0. Provided ID: {CategoryId}", id);
                throw new ArgumentException("Category ID must be greater than 0.", nameof(id));
            }

            _logger.LogInformation("Validation passed: Proceeding with deletion for Category ID: {CategoryId}", id);
            await base.DeleteDependencieAsync(id);
        }
    }
}