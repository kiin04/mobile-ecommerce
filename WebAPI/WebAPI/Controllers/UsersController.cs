using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.DTO;
using WebAPI.Factory;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        //factory design parttern
        private readonly IRepository<User> _UserRepository;
        private UserService _UserService;
        private readonly OrderService _OrderService;

        public UsersController(CSDLBanHang context, UserService userService, OrderService orderService)
        {
            _UserRepository = RepositoryFactory.CreateRepository<User>(context);
            _UserService = userService;
            _OrderService = orderService;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUser()
        {
            return Ok(await _UserRepository.GetAllAsync());
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            try
            {
                var User = await _UserRepository.GetByIdAsync(id);
                return Ok(User);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET: api/Users/CheckUser/1
        [HttpGet("CheckUser/{phone}")]
        public async Task<ActionResult<User>> CheckUser(string phone)
        {
            try
            {
                // Gọi phương thức CheckPhoneAsync từ service
                var user = await _UserService.CheckPhoneAsync(phone);

                return Ok(user);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }


        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, [FromForm] UserDTO userDTO, IFormFile? image)
        {
            try
            {
                var user = new User
                {
                    Id = id,
                    Name = userDTO.Name,
                    Phone = userDTO.Phone,
                    Address = userDTO.Address,
                    Role = userDTO.Role,
                    TotalBuy = userDTO.TotalBuy,
                    Account = userDTO.Account,
                    DateofBirth = userDTO.DateofBirth,
                    CreatedAt = userDTO.CreatedAt,
                };
                if (userDTO.CreatedAt == null)
                {
                    return BadRequest(new { message = "CreatedAt không được để trống." });
                }
                if (image != null)
                    await _UserRepository.UpdateAsync(user, image);
                else
                {
                    await _UserRepository.UpdateAsync(user);
                }

                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> PostUser([FromForm] UserDTO userDTO, IFormFile? image)
        {
            try
            {
                var user = new User
                {
                    Name = userDTO.Name,
                    Phone = userDTO.Phone,
                    Address = userDTO.Address,
                    Role = userDTO.Role,
                    TotalBuy = userDTO.TotalBuy,
                    Account = 0,
                    DateofBirth = userDTO.DateofBirth,
                };
                if (image == null)
                {
                    await _UserRepository.AddAsync(user);
                }
                else
                {
                    await _UserRepository.AddAsync(user, image);
                }
                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {

            try
            {
                // Preventing deletion if user has active orders (!= "Đã hủy")
                var orders = await _OrderService.GetOrdersByUserAsync(id);
                if (orders.Any(order =>
                    order.Status == "Chờ xác nhận" ||
                    order.Status == "Đã xác nhận" ||
                    order.Status == "Đang xử lý" ||
                    order.Status == "Đang giao hàng" ||
                    order.Status == "Đã thanh toán"))
                {
                    return BadRequest(new { message = "Người dùng đang có đơn đặt hàng." });
                }

                await _UserService.DeleteDependencieAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        // PUT: api/Users/UpdateRole/{id}
        [HttpPut("UpdateRole/{id}")]
        public async Task<IActionResult> UpdateUserRole(int id)
        {
            try
            {
                // Call the service to update the user's role
                var roleChanged = await _UserService.UpdateUserRoleAsync(id);

                // Return appropriate message
                if (roleChanged)
                {
                    return Ok(new { message = "User role updated successfully" });
                }
                else
                {
                    return Ok(new { message = "User role remains the same" });
                }
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
    }

    public class UpdateUserRoleRequest
    {
        public int UserId { get; set; }
    }
}
