using MySqlConnector;
using ShelfSense.Database;
using ShelfSense.Models;

namespace ShelfSense.Services;

public class StockAlertService
{
    private readonly DatabaseHelper _db;
    public static readonly Dictionary<string, int> Thresholds = new()
    {
        { "Book",       10 },
        { "Magazine",   10 },
        { "Stationery", 30 },
    };

    public StockAlertService(DatabaseHelper db)
    {
        _db = db;
    }

    public async Task<List<Product>> GetLowStockAsync()
    {
        var alerts = new List<Product>();
        using var conn = _db.GetConnection();
        await conn.OpenAsync();

        var sql = @"
            SELECT id, name, quantity, category
            FROM products
            WHERE quantity <= CASE category
                WHEN 'Book'       THEN 10
                WHEN 'Magazine'   THEN 10
                WHEN 'Stationery' THEN 30
                ELSE 10
            END";
        using var cmd = new MySqlCommand(sql, conn);
        
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            alerts.Add(new Product
            {
                Id = reader.GetInt32("id"),
                Name = reader.GetString("name"),
                Quantity = reader.GetInt32("quantity"),
                Category = reader.GetString("category"),
            });
        }
        return alerts;
    }
}