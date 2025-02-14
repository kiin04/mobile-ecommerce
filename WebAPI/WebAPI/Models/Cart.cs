using System;
using System.Collections.Generic;
using WebAPI.Controllers;

namespace WebAPI.Models;

public partial class Cart : BaseEntity
{
 

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public int? UserId { get; set; }

    public decimal Price { get; set; }

    
}
