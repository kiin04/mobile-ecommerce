using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Decorator
{
    public class LoggingCategoriesService : CategoriesService
    {
        private readonly ILogger<LoggingCategoriesService> _logger;
        private readonly CategoriesService _categoriesService;

        // Constructor with logging
        public LoggingCategoriesService(CSDLBanHang context, ProductService productService, ILogger<LoggingCategoriesService> logger)
            : base(context, productService)
        {
            _logger = logger;
            _categoriesService = this;
        }

        // Override DeleteDependencieAsync to add logging
        public override async Task DeleteDependencieAsync(int id)
        {
            _logger.LogInformation("Starting to delete dependencies for Category ID: {CategoryId}", id);
            await base.DeleteDependencieAsync(id);
            _logger.LogInformation("Successfully deleted dependencies for Category ID: {CategoryId}", id);
        }
    }

}