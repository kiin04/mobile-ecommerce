using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;
using WebAPI.Services;
using Newtonsoft.Json.Serialization;
using WebAPI.Decorator;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình Database (Đã sửa để nhận biến môi trường Docker)
// builder.Configuration mặc định sẽ tự động gộp appsettings.json và Environment Variables
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<CSDLBanHang>(otp => otp.UseSqlServer(connectionString));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "External";
    options.DefaultChallengeScheme = "External";
})
.AddGoogle(googleOptions =>
{
    googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    googleOptions.SignInScheme = "External";
});

builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
    });

builder.Services.AddEndpointsApiExplorer();

// Swagger: Cho phép cả trong môi trường Development trên Docker
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen();
}

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 40 * 1024 * 1024; // 40MB
});

// Đăng ký Services
builder.Services.AddScoped<ColorSizesService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<CategoriesService>();
builder.Services.AddScoped<ICategoriesService>(provider =>
{
    var baseService = provider.GetRequiredService<CategoriesService>();
    var validationLogger = provider.GetRequiredService<ILogger<ValidationCategoriesService>>();
    var loggingLogger = provider.GetRequiredService<ILogger<LoggingCategoriesService>>();
    var validationService = new ValidationCategoriesService(baseService, validationLogger);
    var loggingService = new LoggingCategoriesService(validationService, loggingLogger);
    return loggingService;
});

builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<RoleService>();
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<OrderDetailsService>();
builder.Services.AddScoped<CommentService>();

builder.Services.AddHttpClient();
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var app = builder.Build();
app.UseHttpMetrics();

// 2. Cấu hình HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AppName v1");
        c.RoutePrefix = "swagger"; // Truy cập tại /swagger
    });
}

// LƯU Ý: Tạm thời comment dòng này nếu bạn không dùng HTTPS/SSL trên Server Ubuntu
// app.UseHttpsRedirection(); 

app.UseCors(builder => builder
   .AllowAnyOrigin()
   .AllowAnyMethod()
   .AllowAnyHeader());

app.MapMetrics("/status/metrics");

app.UseAuthorization();

app.MapControllers();

app.Run();