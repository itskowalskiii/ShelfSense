using System.Text.Json.Serialization;

namespace ShelfSense.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string Category { get; set; } = "";
    public int StockThreshold { get; set; } = 5;

    [JsonIgnore]
    public decimal DiscountedPrice => GetDiscountedPrice();
    public virtual decimal GetDiscountedPrice() => Price;
}