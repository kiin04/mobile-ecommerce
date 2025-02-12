using System;
using System.Collections.Generic;
using WebAPI.Controllers;

namespace WebAPI.Models;

public partial class Role : BaseEntity
{
   
    public string Name { get; set; } = null!;

    public int? Promo { get; set; }

   
}
