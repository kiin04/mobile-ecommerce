namespace WebAPI.Decorator
{
    public class LoggingCategoriesService : ICategoriesService
    {

        private readonly ILogger<LoggingCategoriesService> _logger;
        private readonly ICategoriesService _categoriesService;

        // Constructor
        public LoggingCategoriesService(ICategoriesService categoriesService, ILogger<LoggingCategoriesService> logger)
        {
            _categoriesService = categoriesService;
            _logger = logger;
        }

        // Add logging
        public async Task DeleteDependencieAsync(int id)
        {
            _logger.LogInformation("Starting to delete dependencies for Category ID: {CategoryId}", id);
            await _categoriesService.DeleteDependencieAsync(id);
            _logger.LogInformation("Successfully deleted dependencies for Category ID: {CategoryId}", id);
        }
    }
}