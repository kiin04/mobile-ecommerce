using System;
using System.Collections.Generic;

namespace WebAPI.Models;

public partial class Promotion : BaseEntity
{
   

    public string Name { get; set; } = null!;

    public decimal Value { get; set; }

   

    public DateTime? EndAt { get; set; }
}
