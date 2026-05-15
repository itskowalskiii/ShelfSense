<div align="center">

# ShelfSense

### Smart Bookstore Inventory Management System

![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-net10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)

*A web-based inventory system built for bookstores — accessible from any browser.*

</div>

---

## Description

**ShelfSense** is a web-based bookstore inventory management system. It allows bookstore owners and staff to manage their catalog of Books, Magazines, and Stationery through a browser interface — no app installation required.

The system is built on **ASP.NET Core (.NET 10)** for the backend and plain **HTML, CSS, and JavaScript** for the frontend. All data is stored in a **MySQL** database. The architecture follows a clean **3-layer OOP design** (UI → Service → Data), and the product type system uses C# inheritance so that a `Book`, `Magazine`, or `Stationery` is defined by its class — not a text label.

> The goal of ShelfSense is to replace manual inventory tracking with a reliable, centralized digital system that reduces errors and keeps stock levels visible at all times.

<div align="center">

| | |
|:--|:--|
| **Platform** | Web (browser-based) |
| **Backend** | C# / ASP.NET Core (.NET 10) |
| **Frontend** | HTML, CSS, JavaScript |
| **Database** | MySQL — MySqlConnector 2.5.0 |
| **Architecture** | 3-layer OOP: UI / Service / Data |
| **Product types** | Book, Magazine, Stationery |

</div>

---

## UML Diagram

<div align="center">

<!-- Add your UML diagram here -->
<!-- ![UML Diagram](./docs/uml-diagram.png) -->

</div>

---

## Features

<div align="center">

| Feature | Description |
|:--|:--|
| Add product | Register a Book, Magazine, or Stationery item into the inventory |
| Update product | Edit the details or stock quantity of any existing product |
| Delete product | Remove a product that is no longer in the catalog |
| Search | Find items by name or keyword |
| Filter by category | Browse only Books, only Magazines, or only Stationery |
| Smart pricing | Automatically applies discounts based on product type |
| Low stock alerts | Flags products below a set threshold and triggers dashboard alerts |
| Product details | Shows type-specific fields (e.g., ISBN for books, issue number for magazines) |

</div>

---

## Pricing Rules by Product Type

<div align="center">

| Product type | Discount rule | Example |
|:--:|:--|:--|
| Book | 10% student discount — always applied | P500.00 → P450.00 |
| Magazine | No discount | P120.00 → P120.00 |
| Stationery | 5% bulk discount when quantity is 10 or more | P15.00 → P14.25 |

</div>

---

## Stock Alert Levels

<div align="center">

| Condition | Status | System action |
|:--:|:--:|:--|
| Quantity above threshold | Normal | No action |
| Quantity at or below threshold | Low stock | Alert triggered — highlighted on dashboard |
| Quantity is zero | Out of stock | Critical alert — flagged as unavailable |

</div>

---

## How the Program Works

```
                                  ┌─────────────────────────────────────────────┐
                                  │           Frontend  (wwwroot/)              │
                                  │        HTML + CSS + JavaScript              │
                                  │     User opens this in their browser        │
                                  └──────────────────┬──────────────────────────┘
                                                     │  HTTP requests (fetch API)
                                                     │  
                                  ┌──────────────────▼──────────────────────────┐
                                  │         ASP.NET Core Backend                │
                                  │            Controller Layer                 │
                                  │  Receives requests, routes them to services │
                                  └──────────────────┬──────────────────────────┘
                                                     │  calls
                                                     │  
                                  ┌──────────────────▼──────────────────────────┐
                                  │            Service Layer                    │
                                  │   InventoryService · StockAlertService      │
                                  │  All business rules and logic live here     │
                                  └──────────────────┬──────────────────────────┘
                                                     │  reads / writes
                                                     │  
                                  ┌──────────────────▼──────────────────────────┐
                                  │           Database Layer                    │
                                  │         DatabaseHelper + MySQL              │
                                  │  Stores and retrieves all product data      │
                                  └─────────────────────────────────────────────┘
```

When a user interacts with the app (e.g., clicks "Add Book"), the browser sends a request to the ASP.NET Core backend. The **Controller** receives it and delegates to the **Service layer**, which applies the business logic (e.g., validating the product or checking stock). The **DatabaseHelper** then communicates with MySQL to save or retrieve data, and the result is sent back to the browser.

### OOP Principles Applied

**Abstraction** — The abstract `Product` class defines a shared contract for all product types. Every product has a name, price, quantity, and date added. Subclasses must implement `ShowDetails()` and `CalculateFinalPrice()`.

**Inheritance** — `Book`, `Magazine`, and `Stationery` all extend `Product`. The subclass *is* the category — no string labels or extra category tables needed.

**Polymorphism** — The service layer works against the `Product` base type. C# resolves the correct subclass behavior at runtime automatically.

```csharp
foreach (Product p in products)
{
    string details = p.ShowDetails();         // different output per type
    decimal price  = p.CalculateFinalPrice(); // different discount per type
    bool low       = p.IsLowStock(5);         // shared — no override needed
}
```

**Encapsulation** — The frontend never touches the database directly. All communication goes through the API: Controllers call Services, which call the Database layer.

---

## Project Structure

```
ShelfSense/
│
├── Controller/           API endpoints — receives and routes requests
├── Database/             DatabaseHelper — MySQL connection and queries
├── Models/               Product (abstract), Book, Magazine, Stationery
├── Services/             InventoryService, StockAlertService
│
├── wwwroot/              Frontend — served as static files
│   ├── html/             HTML pages
│   ├── css/              Stylesheets
│   └── js/               JavaScript — fetch API calls to backend
│
├── Program.cs            Entry point — registers services, sets up routing
├── appsettings.json      Configuration (MySQL connection string)
├── appsettings.Development.json
└── ShelfSense.csproj     Project file — net10.0 + MySqlConnector 2.5.0
```

---

## Getting Started

### Prerequisites

| Tool | Purpose |
|:--|:--|
| [.NET SDK 10.0+](https://dotnet.microsoft.com/en-us/download/dotnet/10.0) | Run the application |
| [XAMPP](https://www.apachefriends.org/download.html) | MySQL database |
| [Visual Studio Code](https://code.visualstudio.com/) | Code editor |

### How to Run

```bash
# 1. Open XAMPP and start MySQL

# 2. Open a terminal and connect
mysql -u root -p

# 3. Select the database
use ShelfSenseDatabase;

# 4. Open the project in VS Code, then run
dotnet run

# 5. Press F5 to launch in the browser
```

> Make sure MySQL is running in XAMPP before launching the application.

---

## Troubleshooting

| Problem | Solution |
|:--|:--|
| Cannot connect to database | Verify that MySQL is running in XAMPP and that the credentials in `appsettings.json` are correct |
| `dotnet` command not found | Install the .NET 10 SDK from [dotnet.microsoft.com](https://dotnet.microsoft.com/en-us/download/dotnet/10.0) |
| Page does not load | Confirm `dotnet run` is active and visit the exact URL shown in the terminal output |
| `MySqlConnector` error | Run `dotnet restore` to reinstall NuGet packages |

---

## Developers

<div align="center">

| Name | Role |
|:--:|:--:|
| Alday, Paul Dharren | GUI Designer |
| Larga, Erika Ysobelle U. | Project Manager |
| Tosino, Myk Angelo | Logic Developer |

</div>

---

<div align="center">

Made with love by the ShelfSense Team · Powered by ASP.NET Core & MySQL

</div>
