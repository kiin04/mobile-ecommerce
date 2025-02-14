using System;
using System.Collections.Generic;
using WebAPI.Controllers;

namespace WebAPI.Models;

public partial class Promotion : BaseEntity
{
   

    public string Name { get; set; } = null!;

    public decimal Value { get; set; }

   

    public DateTime? EndAt { get; set; }
}
