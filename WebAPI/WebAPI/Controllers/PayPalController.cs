using System.Text;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayPalController : ControllerBase
    {
        private string PayPalClientId { get; set; } = "";
        private string PayPalSecret { get; set; } = "";
        private string PayPalUrl { get; set; } = "";

        public PayPalController(IConfiguration configuration)
        {
            PayPalClientId = configuration["PayPalSettings:ClientId"];
            PayPalSecret = configuration["PayPalSettings:Secret"];
            PayPalUrl = configuration["PayPalSettings:Url"];
        }

        [HttpGet("Token")]
        public async Task<string> Token()
        {
            return await GetPayPalAccessToken();
        }

        private async Task<string> GetPayPalAccessToken()
        {
            string accessToken = "";

            string url = PayPalUrl + "/v1/oauth2/token";

            using (var client = new HttpClient())
            {
                string credentials64 = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{PayPalClientId}:{PayPalSecret}"));
                client.DefaultRequestHeaders.Add("Authorization", $"Basic {credentials64}");

                var requestMessage = new HttpRequestMessage(HttpMethod.Post, url);
                requestMessage.Content = new StringContent("grant_type=client_credentials", null, "application/x-www-form-urlencoded");

                var httpResponse = await client.SendAsync(requestMessage);

                if (httpResponse.IsSuccessStatusCode)
                {
                    var strResponse = await httpResponse.Content.ReadAsStringAsync();

                    var jsonResponse = JsonNode.Parse(strResponse);
                    if (jsonResponse != null)
                    {
                        accessToken = jsonResponse["access_token"]?.ToString() ?? "";
                    }
                }
            }

            return accessToken;
        }

        // [HttpPost("process-payment")]
        // public IActionResult ProcessPayment([FromBody] PaymentRequest request)
        // {
        //     // Add logic to process PayPal payment
        //     if (request == null || string.IsNullOrEmpty(request.TransactionId))
        //     {
        //         return BadRequest("Invalid payment request.");
        //     }

        //     // Simulate payment processing
        //     var paymentResult = new
        //     {
        //         Success = true,
        //         TransactionId = request.TransactionId,
        //         Message = "Payment processed successfully."
        //     };

        //     return Ok(paymentResult);
        // }

        // [HttpGet("payment-status/{transactionId}")]
        // public IActionResult GetPaymentStatus(string transactionId)
        // {
        //     // Add logic to retrieve payment status
        //     if (string.IsNullOrEmpty(transactionId))
        //     {
        //         return BadRequest("Transaction ID is required.");
        //     }

        //     // Simulate payment status retrieval
        //     var paymentStatus = new
        //     {
        //         TransactionId = transactionId,
        //         Status = "Completed",
        //         Message = "Payment was successful."
        //     };

        //     return Ok(paymentStatus);
        // }
    }

    // public class PaymentRequest
    // {
    //     public string TransactionId { get; set; }
    //     public decimal Amount { get; set; }
    //     public string Currency { get; set; }
    // }
}