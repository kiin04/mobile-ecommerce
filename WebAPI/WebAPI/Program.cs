using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;
using WebAPI.Services;
using Newtonsoft.Json.Serialization;
using WebAPI.Decorator;

var builder = WebApplication.CreateBuilder(args);

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
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddEndpointsApiExplorer();

// Only allow swagger in development
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen();
}

IConfigurationRoot cf = new ConfigurationBuilder().SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                                                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true).Build();
builder.Services.AddDbContext<CSDLBanHang>(otp => otp.UseSqlServer(cf.GetConnectionString("DefaultConnection")));

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 40 * 1024 * 1024; // Cho phép file tối đa 10MB
});


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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "AppName v1"));
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseCors(builder => builder
   .AllowAnyOrigin()
   .AllowAnyMethod()
   .AllowAnyHeader());

app.MapControllers();

app.Run();
