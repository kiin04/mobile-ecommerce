using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Factory;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderDetailsController : ControllerBase
    {
        private readonly IRepository<OrderDetails> _OrderDetailsRepository;
        OrderDetailsService _ordererService;

        public OrderDetailsController(CSDLBanHang context , OrderDetailsService orderDetailsService)
        {
            _OrderDetailsRepository = RepositoryFactory.CreateRepository<OrderDetails>(context);
            _ordererService = orderDetailsService;
        }

        // GET: api/OrderDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDetails>>> GetOrderDetails()
        {
            return Ok(await _OrderDetailsRepository.GetAllAsync());
        }

        // GET: api/OrderDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetails>> GetOrderDetails(int id)
        {
            try
            {
                var OrderDetails = await _OrderDetailsRepository.GetByIdAsync(id);
                return Ok(OrderDetails);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        // GET: apiByOrder/OrderDetails/5
        [HttpGet("ByOrder/{id}")]
        public async Task<ActionResult<OrderDetails>> GetByOrderId(int id)
        {
            try
            {
                var OrderDetails = await _ordererService.GetByOrderId(id);
                return Ok(OrderDetails);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT: api/OrderDetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderDetails(int id, OrderDetails OrderDetails)
        {
            try
            {
                OrderDetails.Id = id;
                await _OrderDetailsRepository.UpdateAsync(OrderDetails);
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

        // POST: api/OrderDetails
        [HttpPost]
        public async Task<ActionResult<OrderDetails>> PostOrderDetails(OrderDetails OrderDetails)
        {
            try
            {
                await _OrderDetailsRepository.AddAsync(OrderDetails);
                return CreatedAtAction(nameof(GetOrderDetails), new { id = OrderDetails.Id }, OrderDetails);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/OrderDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderDetails(int id)
        {
            try
            {
                await _OrderDetailsRepository.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }

}
