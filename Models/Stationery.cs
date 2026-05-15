namespace ShelfSense.Models;

public class Stationery : Product
{
    public string? Brand { get; set; }
    public string? Size { get; set; }

    public override decimal GetDiscountedPrice() =>
        Quantity >= 10 ? Price * 0.95m : Price;
}