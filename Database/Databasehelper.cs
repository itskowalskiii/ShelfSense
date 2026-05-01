using MySqlConnector;
using ShelfSense.Database;
using ShelfSense.Models;


namespace ShelfSense.Database;

public class DatabaseHelper
{
    private readonly string _connectionString;

    public DatabaseHelper(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("MariaDB")!;
    }

    public MySqlConnection GetConnection()
        => new MySqlConnection(_connectionString);
}