namespace WebAPI.Decorator
{
    public class ValidationCategoriesService : ICategoriesService
    {

        private readonly ILogger<ValidationCategoriesService> _logger;
        private readonly ICategoriesService _categoriesService;

        // Constructor
        public ValidationCategoriesService(ICategoriesService categoriesService, ILogger<ValidationCategoriesService> logger)
        {
            _categoriesService = categoriesService;
            _logger = logger;
        }

        // Add validation
        public async Task DeleteDependencieAsync(int id)
        {
            if (id <= 0)
            {
                _logger.LogError("Validation failed: Category ID must be greater than 0. Provided ID: {CategoryId}", id);
                throw new ArgumentException("Category ID must be greater than 0.", nameof(id));
            }

            _logger.LogInformation("Validation passed: Proceeding with deletion for Category ID: {CategoryId}", id);
            await _categoriesService.DeleteDependencieAsync(id);
        }
    }
}