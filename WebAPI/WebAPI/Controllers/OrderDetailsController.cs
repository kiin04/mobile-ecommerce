using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Factory;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderDetailsController : ControllerBase
    {
        private readonly IRepository<OrderDetail> _OrderDetailRepository;

        public OrderDetailsController(CSDLBanHang context)
        {
            _OrderDetailRepository = RepositoryFactory.CreateRepository<OrderDetail>(context);
        }

        // GET: api/OrderDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetails()
        {
            return Ok(await _OrderDetailRepository.GetAllAsync());
        }

        // GET: api/OrderDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetail>> GetOrderDetail(int id)
        {
            try
            {
                var OrderDetail = await _OrderDetailRepository.GetByIdAsync(id);
                return Ok(OrderDetail);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT: api/OrderDetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderDetail(int id, OrderDetail OrderDetail)
        {
           
            try
            {
                OrderDetail.Id = id;
                await _OrderDetailRepository.UpdateAsync(OrderDetail);
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
        public async Task<ActionResult<OrderDetail>> PostOrderDetail(OrderDetail OrderDetail)
        {
            try
            {
                await _OrderDetailRepository.AddAsync(OrderDetail);
                return CreatedAtAction(nameof(GetOrderDetail), new { id = OrderDetail.Id }, OrderDetail);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/OrderDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderDetail(int id)
        {
            try
            {
                await _OrderDetailRepository.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }

}
