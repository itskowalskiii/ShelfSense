namespace ShelfSense.Models;

public class Magazine : Product
{
    public int? Issue { get; set; }
    public string? PubDate { get; set; }

    public override decimal GetDiscountedPrice() => Price;
}