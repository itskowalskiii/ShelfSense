namespace ShelfSense.Models;

public class Book : Product
{
    public string? Author { get; set; }
    public string? Isbn { get; set; }
    public string? Genre { get; set; }

    public override decimal GetDiscountedPrice() => Price * 0.90m;
}