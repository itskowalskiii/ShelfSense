using ShelfSense.Database;
using ShelfSense.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(opts =>
{
    opts.JsonSerializerOptions.Converters.Add(new ShelfSense.Models.ProductJsonConverter());
    // Prevents recursive serialization issues with DiscountedPrice
    opts.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
builder.Services.AddSingleton<DatabaseHelper>();
builder.Services.AddScoped<StockAlertService>();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader()));

var app = builder.Build();

app.UseCors();
app.UseStaticFiles();  // static files first (serves HTML/CSS/JS)
app.UseRouting();      // ← add this
app.MapControllers();  // controllers after routing is established
app.MapGet("/", () => Results.Redirect("/html/index.html"));

app.Run();