using System;
using System.Collections.Generic;
using WebAPI.Controllers;

namespace WebAPI.Models;

public partial class ColorSize : BaseEntity
{
  

    public int ProductId { get; set; }

    public string Color { get; set; } = null!;

    public string Size { get; set; } = null!;

    public int Quantity { get; set; }

 
}
