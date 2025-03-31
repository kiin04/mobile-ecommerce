namespace WebAPI.Decorator
{
    public class ValidationCategoriesService : ICategoriesService
    {
        private readonly ICategoriesService _service;
        private readonly ILogger<ValidationCategoriesService> _logger;

        // constructor
        public ValidationCategoriesService(ICategoriesService service, ILogger<ValidationCategoriesService> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // add validation
        public async Task DeleteDependencieAsync(int id)
        {
            if (id <= 0)
            {
                _logger.LogError("Validation failed: Category ID must be greater than 0. Provided ID: {CategoryId}", id);
                throw new ArgumentException("Category ID must be greater than 0.", nameof(id));
            }

            _logger.LogInformation("Validation passed: Proceeding with deletion for Category ID: {CategoryId}", id);
            await _service.DeleteDependencieAsync(id);
        }
    }
}