using System;
using System.Collections.Generic;
using WebAPI.Controllers;

namespace WebAPI.Models;

public partial class Product : BaseEntity
{
    
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? Unit { get; set; }

    public int CategoryId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public byte[]? Image { get; set; }

    public int? Sold { get; set; }

    public int? Rate { get; set; }

     
}
