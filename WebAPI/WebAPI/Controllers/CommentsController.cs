using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Factory;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly IRepository<Comment> _commentRepository;
        private readonly CommentService _commentService;
        public CommentsController(CSDLBanHang context, CommentService commentService)
        {
            _commentRepository = RepositoryFactory.CreateRepository<Comment>(context);
            _commentService = commentService;
        }

        // GET: api/Comment
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComment()
        {
            return Ok(await _commentRepository.GetAllAsync());
        }

        // GET: api/Comment/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Comment>> GetComment(int id)
        {
            try
            {
                var Comment = await _commentRepository.GetByIdAsync(id);
                return Ok(Comment);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        [HttpGet("ProductComment/{id}")]
        public async Task<ActionResult<Comment>> GetColorSizeByProduct(int id)
        {
            try
            {
                var Comment = await _commentService.GetByProductAsync(id);
                return Ok(Comment);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        [HttpGet("User/{userId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetCommentsByUser(int userId)
        {
            try
            {
                var comments = await _commentRepository.GetAllAsync();
                var userComments = comments.Where(c => c.UserId == userId).ToList();
                return Ok(userComments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving user comments: " + ex.Message });
            }
        }
        // PUT: api/Comment/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutComment(int id, Comment comment)
        {
            try
            {
                // Ensure the comment ID matches the route parameter
                if (id != comment.Id)
                {
                    return BadRequest(new { message = "Comment ID mismatch." });
                }

                // Check if the comment exists
                var existingComment = await _commentRepository.GetByIdAsync(id);
                if (existingComment == null)
                {
                    return NotFound(new { message = "Comment not found." });
                }

                // Update the existing comment
                existingComment.Stars = comment.Stars;
                existingComment.Content = comment.Content;
                existingComment.CreatedAt = DateTime.UtcNow;

                await _commentRepository.UpdateAsync(existingComment);

                return NoContent(); // Return 204 No Content on success
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

        // POST: api/Comment
        [HttpPost]
        public async Task<ActionResult<Comment>> PostComment(Comment comment)
        {
            try
            {
                // Check if the user has already reviewed this product
                var existingComment = (await _commentRepository.GetAllAsync())
                    .FirstOrDefault(c => c.ProductId == comment.ProductId && c.UserId == comment.UserId);

                if (existingComment != null)
                {
                    return Conflict(new { message = "You have already reviewed this product." });
                }

                // Create a new review
                comment.CreatedAt = DateTime.UtcNow;
                await _commentRepository.AddAsync(comment);

                return CreatedAtAction(nameof(GetComment), new { id = comment.Id }, comment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // DELETE: api/Comment/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            try
            {
                await _commentRepository.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }

}
