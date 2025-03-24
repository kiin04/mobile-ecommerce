using WebAPI.Models;

namespace WebAPI.VisitorParttern
{
    public interface IVisitor

    {
        void Visit(Product product);
        void Visit(Category category);
    }
}
