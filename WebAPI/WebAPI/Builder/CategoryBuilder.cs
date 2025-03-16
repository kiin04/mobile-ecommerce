using WebAPI.Models;

namespace WebAPI.Builder
{
    public class CategoryBuilder
    {
        private readonly Category _category;

        public CategoryBuilder()
        {
            _category = new Category();
        }

        public CategoryBuilder SetName(string name)
        {
            _category.Name = name;
            return this;
        }

        public CategoryBuilder SetDescription(string? description)
        {
            _category.Description = description;
            return this;
        }

        public CategoryBuilder SetImage(byte[]? image)
        {
            _category.Image = image;
            return this;
        }

        public CategoryBuilder SetCreatedAt(DateTime? createdAt)
        {
            _category.CreatedAt = createdAt;
            return this;
        }

        public Category Build()
        {
            return _category;
        }
    }
}