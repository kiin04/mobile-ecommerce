using System;
using System.Collections.Generic;
using WebAPI.VisitorParttern;

namespace WebAPI.Models;

public partial class Category : BaseEntity, IHasImage
{
   

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public byte[]? Image { get; set; }

    public void Accept(IVisitor visitor)
    {
        visitor.Visit(this);
    }
}
