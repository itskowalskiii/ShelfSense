using ShelfSense.Database;
using ShelfSense.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(opts =>
{
    opts.JsonSerializerOptions.Converters.Add(new ShelfSense.Models.ProductJsonConverter());
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
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "Frontend", "wwwroot")),
    RequestPath = ""
});
app.UseRouting();
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/html/index.html"));

app.Run();