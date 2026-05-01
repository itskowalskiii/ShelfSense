using MySqlConnector;
using ShelfSense.Database;
using ShelfSense.Models;

namespace ShelfSense.Services;

public class StockAlertService
{
    private readonly DatabaseHelper _db;
    private const int LOW_STOCK_THRESHOLD = 5;

    public StockAlertService(DatabaseHelper db)
    {
        _db = db;
    }

    public async Task<List<Product>> GetLowStockAsync()
    {
        var alerts = new List<Product>();
        using var conn = _db.GetConnection();
        await conn.OpenAsync();

        var sql = "SELECT id, name, quantity, category FROM products WHERE quantity <= @threshold";
        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@threshold", LOW_STOCK_THRESHOLD);

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