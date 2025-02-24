using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        public UsersController(CSDLBanHang context, UserService userService)
        {
            _UserRepository = RepositoryFactory.CreateRepository<User>(context);
            _UserService = userService;
        }

        // GET: api/User
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUser()
        {
            return Ok(await _UserRepository.GetAllAsync());
        }

        // GET: api/User/5
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

        // GET: api/User/CheckUser/1
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


        // PUT: api/User/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User User)
        {
            try
            {
                await _UserRepository.UpdateAsync(User);
                return NoContent();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST: api/User
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User User)
        {
            try
            {
                await _UserRepository.AddAsync(User);
                return CreatedAtAction(nameof(GetUser), new { id = User.Id }, User);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/User/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {

            try
            {
               await _UserService.DeleteDependencieAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }

}
