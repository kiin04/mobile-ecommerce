using WebAPI.Models;
using WebAPI.VisitorParttern;

public class ValidationVisitor : IVisitor
{
    public void Visit(Product product)
    {
        if (string.IsNullOrWhiteSpace(product.Name))
        {
            throw new InvalidOperationException("Tên sản phẩm không được để trống.");
        }

        if (product.Price <= 0)
        {
            throw new InvalidOperationException("Giá sản phẩm phải lớn hơn 0.");
        }
    }

    public void Visit(Category category)
    {
        if (string.IsNullOrWhiteSpace(category.Name))
        {
            throw new InvalidOperationException("Tên danh mục không được để trống.");
        }

        if (category.Description.Length > 200)
        {
            throw new InvalidOperationException("Mô tả danh mục không được vượt quá 200 ký tự.");
        }
    }
}
