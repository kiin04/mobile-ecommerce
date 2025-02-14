using System;
using System.Collections.Generic;
using WebAPI.Controllers;

namespace WebAPI.Models;

public partial class Order : BaseEntity
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public decimal TotalPrice { get; set; }

    public string? Status { get; set; }

   

    public string? Phone { get; set; }

    public string? Address { get; set; }

   
}
