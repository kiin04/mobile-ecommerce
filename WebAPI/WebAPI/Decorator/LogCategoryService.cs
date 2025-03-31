namespace WebAPI.Decorator
{
    public class LoggingCategoriesService : ICategoriesService
    {
        private readonly ICategoriesService _service;
        private readonly ILogger<LoggingCategoriesService> _logger;

        // constructor
        public LoggingCategoriesService(ICategoriesService service, ILogger<LoggingCategoriesService> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // add logging
        public async Task DeleteDependencieAsync(int id)
        {
            _logger.LogInformation("Starting to delete dependencies for Category ID: {CategoryId}", id);
            await _service.DeleteDependencieAsync(id);
            _logger.LogInformation("Successfully deleted dependencies for Category ID: {CategoryId}", id);
        }
    }
}