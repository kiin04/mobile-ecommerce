using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;
using Google.Apis.Auth;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoogleController : ControllerBase
    {
        private readonly CSDLBanHang _context;

        public GoogleController(CSDLBanHang context)
        {
            _context = context;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);
                if (string.IsNullOrEmpty(payload.Email))
                {
                    return BadRequest(new { success = false, message = "Không lấy được email từ Google" });
                }

                var account = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == payload.Email);

                User user;
                if (account == null)
                {
                    var defaultRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Khách hàng thường");
                    if (defaultRole == null)
                    {
                        return StatusCode(500, new { success = false, message = "Vai trò 'Khách hàng thường' không tồn tại" });
                    }

                    user = new User
                    {
                        Name = payload.Name ?? "Google User",
                        Phone = "0000000000",
                        Address = "Vui lòng cập nhật địa chỉ",
                        Role = defaultRole.Id,
                        TotalBuy = 0,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };

                    // Truncate email to 20 characters to use as a unique username
                    string username = payload.Email.Length > 20 ? payload.Email.Substring(0, 20) : payload.Email;
                    // Check for uniqueness
                    int suffix = 1;
                    string baseUsername = username;
                    while (await _context.Accounts.AnyAsync(a => a.Username == username))
                    {
                        username = $"{baseUsername[..Math.Min(15, baseUsername.Length)]}{suffix++}";
                    }

                    account = new Account
                    {
                        Username = username,
                        Email = payload.Email,
                        Password = "",
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now,
                        UserId = user.Id // Will be set after saving user
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                    account.UserId = user.Id;
                    user.Account = account.Id; // Update the User.Account foreign key
                    _context.Accounts.Add(account);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    user = await _context.Users.FindAsync(account.UserId);
                    if (user == null)
                    {
                        return NotFound(new { success = false, message = "Không tìm thấy thông tin người dùng" });
                    }
                }

                var role = await _context.Roles.FindAsync(user.Role);
                var responseData = new
                {
                    UserId = user.Id,
                    account.Username,
                    FullName = user.Name,
                    account.Email,
                    Role = role?.Name ?? "Unknown Role",
                    account.CreatedAt
                };

                return Ok(new { success = true, message = "Đăng nhập bằng Google thành công", data = responseData });
            }
            catch (InvalidJwtException)
            {
                return Unauthorized(new { success = false, message = "Token Google không hợp lệ" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi", details = ex.Message });
            }
        }

        private IActionResult Forbidden(object value)
        {
            return StatusCode(403, value);
        }
    }

    public class GoogleLoginRequest
    {
        public string IdToken { get; set; }
    }
}