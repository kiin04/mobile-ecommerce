using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Factory;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartsController : ControllerBase
    {
        //factory design parttern
        private readonly IRepository<Cart> _CartRepository;
      

        public CartsController(CSDLBanHang context)
        {
            _CartRepository = RepositoryFactory.CreateRepository<Cart>(context);
           
        }

        // GET: api/Carts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cart>>> GetCarts()
        {
            return Ok(await _CartRepository.GetAllAsync());
        }

        // GET: api/Carts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cart>> GetCart(int id)
        {
            try
            {
                var Cart = await _CartRepository.GetByIdAsync(id);
                return Ok(Cart);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT: api/Carts/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCart(int id, Cart Cart)
        {
            try
            {
                await _CartRepository.UpdateAsync(Cart);
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

        // POST: api/Carts
        [HttpPost]
        public async Task<ActionResult<Cart>> PostCart(Cart Cart)
        {
            try
            {
                await _CartRepository.AddAsync(Cart);
                return CreatedAtAction(nameof(GetCart), new { id = Cart.Id }, Cart);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Carts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCart(int id)
        {
           
            try
            {
                await _CartRepository.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }

}
