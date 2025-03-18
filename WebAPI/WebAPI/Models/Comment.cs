namespace WebAPI.Models;

public partial class Comment : BaseEntity
{

    public int ProductId { get; set; }

    public int UserId { get; set; }

    public required string Name { get; set; }

    public float Stars { get; set; }

    public string? Content { get; set; }

    public new DateTime CreatedAt { get; set; }
}
