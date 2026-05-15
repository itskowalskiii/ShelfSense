using System.Text.Json;
using System.Text.Json.Serialization;

namespace ShelfSense.Models;

public class ProductJsonConverter : JsonConverter<Product>
{
    public override Product? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using var doc = JsonDocument.ParseValue(ref reader);
        var root = doc.RootElement;

        string? category = null;
        if (root.TryGetProperty("category", out var cat) ||
            root.TryGetProperty("Category", out cat))
        {
            category = cat.GetString();
        }

        var json = root.GetRawText();

        // Use options WITHOUT this converter to avoid recursion on Read
        var safeOptions = MakeSafeOptions(options);

        return category switch
        {
            "Book" => JsonSerializer.Deserialize<Book>(json, safeOptions),
            "Magazine" => JsonSerializer.Deserialize<Magazine>(json, safeOptions),
            "Stationery" => JsonSerializer.Deserialize<Stationery>(json, safeOptions),
            _ => JsonSerializer.Deserialize<Product>(json, safeOptions)
        };
    }

    public override void Write(Utf8JsonWriter writer, Product value, JsonSerializerOptions options)
    {
        // Use options WITHOUT this converter to avoid infinite recursion on Write
        var safeOptions = MakeSafeOptions(options);
        JsonSerializer.Serialize(writer, value, value.GetType(), safeOptions);
    }

    private static JsonSerializerOptions MakeSafeOptions(JsonSerializerOptions original)
    {
        var safe = new JsonSerializerOptions(original);
        // Remove this converter so serialization doesn't call Write again
        for (int i = safe.Converters.Count - 1; i >= 0; i--)
        {
            if (safe.Converters[i] is ProductJsonConverter)
                safe.Converters.RemoveAt(i);
        }
        return safe;
    }
}