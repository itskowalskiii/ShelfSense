using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using ShelfSense.Database;
using ShelfSense.Models;
using ShelfSense.Services;

namespace ShelfSense.Controllers;

[ApiController]
[Route("api/inventory")]
public class InventoryController : ControllerBase
{
    private readonly DatabaseHelper _db;
    private readonly StockAlertService _alerts;

    public InventoryController(DatabaseHelper db, StockAlertService alerts)
    {
        _db = db;
        _alerts = alerts;
    }

    // GET /api/inventory
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = new List<Product>();
        using var conn = _db.GetConnection();
        await conn.OpenAsync();

        var sql = @"
            SELECT p.id, p.name, p.price, p.quantity, p.category,
                   b.author, b.isbn, b.genre,
                   m.issue, DATE_FORMAT(m.pub_date,'%Y-%m-%d') AS pub_date,
                   s.brand, s.size
            FROM products p
            LEFT JOIN books      b ON p.id = b.id
            LEFT JOIN magazines  m ON p.id = m.id
            LEFT JOIN stationery s ON p.id = s.id";

        using var cmd = new MySqlCommand(sql, conn);
        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            list.Add(new Product
            {
                Id = reader.GetInt32("id"),
                Name = reader.GetString("name"),
                Price = reader.GetDecimal("price"),
                Quantity = reader.GetInt32("quantity"),
                Category = reader.GetString("category"),
                Author = reader.IsDBNull(reader.GetOrdinal("author")) ? null : reader.GetString("author"),
                Isbn = reader.IsDBNull(reader.GetOrdinal("isbn")) ? null : reader.GetString("isbn"),
                Genre = reader.IsDBNull(reader.GetOrdinal("genre")) ? null : reader.GetString("genre"),
                Issue = reader.IsDBNull(reader.GetOrdinal("issue")) ? null : reader.GetInt32("issue"),
                PubDate = reader.IsDBNull(reader.GetOrdinal("pub_date")) ? null : reader.GetString("pub_date"),
                Brand = reader.IsDBNull(reader.GetOrdinal("brand")) ? null : reader.GetString("brand"),
                Size = reader.IsDBNull(reader.GetOrdinal("size")) ? null : reader.GetString("size"),
            });
        }
        return Ok(list);
    }

    // GET /api/inventory/alerts
    [HttpGet("alerts")]
    public async Task<IActionResult> GetAlerts()
    {
        var low = await _alerts.GetLowStockAsync();
        return Ok(low);
    }

    // POST /api/inventory
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Product p)
    {
        using var conn = _db.GetConnection();
        await conn.OpenAsync();
        using var tx = await conn.BeginTransactionAsync();

        try
        {
            var sql = @"INSERT INTO products (name, price, quantity, category)
                        VALUES (@n, @p, @q, @c)";
            using var cmd = new MySqlCommand(sql, conn, tx);
            cmd.Parameters.AddWithValue("@n", p.Name);
            cmd.Parameters.AddWithValue("@p", p.Price);
            cmd.Parameters.AddWithValue("@q", p.Quantity);
            cmd.Parameters.AddWithValue("@c", p.Category);
            await cmd.ExecuteNonQueryAsync();
            int newId = (int)cmd.LastInsertedId;

            if (p.Category == "Book")
            {
                using var c2 = new MySqlCommand(
                    "INSERT INTO books (id, author, isbn, genre) VALUES (@id,@a,@i,@g)", conn, tx);
                c2.Parameters.AddWithValue("@id", newId);
                c2.Parameters.AddWithValue("@a", p.Author ?? "");
                c2.Parameters.AddWithValue("@i", p.Isbn ?? "");
                c2.Parameters.AddWithValue("@g", p.Genre ?? "");
                await c2.ExecuteNonQueryAsync();
            }
            else if (p.Category == "Magazine")
            {
                using var c2 = new MySqlCommand(
                    "INSERT INTO magazines (id, issue, pub_date) VALUES (@id,@i,@d)", conn, tx);
                c2.Parameters.AddWithValue("@id", newId);
                c2.Parameters.AddWithValue("@i", p.Issue);
                c2.Parameters.AddWithValue("@d", string.IsNullOrEmpty(p.PubDate) ? DBNull.Value : p.PubDate);
                await c2.ExecuteNonQueryAsync();
            }
            else if (p.Category == "Stationery")
            {
                using var c2 = new MySqlCommand(
                    "INSERT INTO stationery (id, brand, size) VALUES (@id,@b,@s)", conn, tx);
                c2.Parameters.AddWithValue("@id", newId);
                c2.Parameters.AddWithValue("@b", p.Brand ?? "");
                c2.Parameters.AddWithValue("@s", p.Size ?? "");
                await c2.ExecuteNonQueryAsync();
            }

            await tx.CommitAsync();
            return Ok(new { id = newId });
        }
        catch
        {
            await tx.RollbackAsync();
            return StatusCode(500, "Failed to add product.");
        }
    }

    // PUT /api/inventory/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Product p)
    {
        using var conn = _db.GetConnection();
        await conn.OpenAsync();

        var sql = "UPDATE products SET quantity=@q, price=@p WHERE id=@id";
        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@q", p.Quantity);
        cmd.Parameters.AddWithValue("@p", p.Price);
        cmd.Parameters.AddWithValue("@id", id);
        await cmd.ExecuteNonQueryAsync();

        return Ok();
    }

    // DELETE /api/inventory/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        using var conn = _db.GetConnection();
        await conn.OpenAsync();

        using var cmd = new MySqlCommand("DELETE FROM products WHERE id=@id", conn);
        cmd.Parameters.AddWithValue("@id", id);
        await cmd.ExecuteNonQueryAsync();

        return Ok();
    }
}