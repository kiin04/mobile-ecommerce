using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Factory;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        //factory design parttern
        private readonly IRepository<Account> _accountRepository;
       
        public AccountsController(CSDLBanHang context)
        {
            _accountRepository = RepositoryFactory.CreateRepository<Account>(context);
        }

        // GET: api/Account
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccount()
        {
            return Ok(await _accountRepository.GetAllAsync());
        }

        // GET: api/Account/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Account>> GetAccount(int id)
        {
            try
            {
                var Account = await _accountRepository.GetByIdAsync(id);
                return Ok(Account);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT: api/Account/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccount(int id, Account Account)
        {
            try
            {
                await _accountRepository.UpdateAsync(Account);
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

        // POST: api/Account
        [HttpPost]
        public async Task<ActionResult<Account>> PostAccount(Account Account)
        {
            try
            {
                await _accountRepository.AddAsync(Account);
                return CreatedAtAction(nameof(GetAccount), new { id = Account.Id }, Account);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Account/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {

            try
            {
               await _accountRepository.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }

}
