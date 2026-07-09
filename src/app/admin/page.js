"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [categories, setCategories] = useState([]);
  const [newMainCategory, setNewMainCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [selectedMainCatForSub, setSelectedMainCatForSub] = useState("");
  
  const [catMessage, setCatMessage] = useState("");

  // Form State for Add Product
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Invalid password");
    }
  };

  const handleMainCategoryChange = (e) => {
    const mainCat = e.target.value;
    setSelectedMainCategory(mainCat);
    const catObj = categories.find(c => c.name === mainCat);
    setAvailableSubCategories(catObj ? catObj.subCategories : []);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.target);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Product added successfully!");
        e.target.reset();
        setSelectedMainCategory("");
        setAvailableSubCategories([]);
      } else {
        setMessage(data.error || "Failed to add product");
      }
    } catch (error) {
      setMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMainCategory = async (e) => {
    e.preventDefault();
    setCatMessage("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addMainCategory", mainCategory: newMainCategory }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
        setNewMainCategory("");
        setCatMessage("Main category added!");
      } else {
        setCatMessage(data.error || "Failed to add category");
      }
    } catch (error) {
      setCatMessage("An error occurred");
    }
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    setCatMessage("");
    if (!selectedMainCatForSub) {
      setCatMessage("Please select a main category first");
      return;
    }
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addSubCategory", mainCategory: selectedMainCatForSub, subCategory: newSubCategory }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
        setNewSubCategory("");
        setCatMessage("Subcategory added!");
      } else {
        setCatMessage(data.error || "Failed to add subcategory");
      }
    } catch (error) {
      setCatMessage("An error occurred");
    }
  };

  const handleDeleteMainCategory = async (category) => {
    setCatMessage("");
    try {
      const res = await fetch(`/api/categories?mainCategory=${encodeURIComponent(category)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
        setCatMessage("Main category deleted!");
        if (selectedMainCatForSub === category) setSelectedMainCatForSub("");
      } else {
        setCatMessage(data.error || "Failed to delete category");
      }
    } catch (error) {
      setCatMessage("An error occurred");
    }
  };

  const handleDeleteSubCategory = async (mainCategory, subCategory) => {
    setCatMessage("");
    try {
      const res = await fetch(`/api/categories?mainCategory=${encodeURIComponent(mainCategory)}&subCategory=${encodeURIComponent(subCategory)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
        setCatMessage("Subcategory deleted!");
      } else {
        setCatMessage(data.error || "Failed to delete subcategory");
      }
    } catch (error) {
      setCatMessage("An error occurred");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ maxWidth: "400px", marginTop: "100px" }}>
        <div className="card" style={{ padding: "2rem" }}>
          <h1 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Admin Login</h1>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            {message && <p style={{ color: "red", fontSize: "0.875rem" }}>{message}</p>}
            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
              Login
            </button>
          </form>
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <Link href="/" style={{ color: "var(--primary)", fontSize: "0.875rem" }}>&larr; Back to Catalog</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "1200px", marginTop: "40px", marginBottom: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Admin Dashboard</h1>
        <Link href="/" className="btn-primary" style={{ backgroundColor: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
          View Catalog
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Add Product Section */}
        <div className="card" style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Add New Product</h2>
          <form onSubmit={handleSubmitProduct} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Product Name</label>
              <input type="text" name="name" className="input-field" required placeholder="e.g. Premium Wireless Headphones" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Main Category</label>
              <select name="category" className="input-field" required value={selectedMainCategory} onChange={handleMainCategoryChange}>
                <option value="">Select main category</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Subcategory (Optional)</label>
              <select name="subCategory" className="input-field" disabled={!selectedMainCategory}>
                <option value="">Select subcategory</option>
                {availableSubCategories.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Price (optional)</label>
              <input type="text" name="price" className="input-field" placeholder="e.g. $99.99" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Description (optional)</label>
              <textarea name="description" className="input-field" rows="4" placeholder="Enter product details..."></textarea>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Product Image</label>
              <input type="file" name="image" accept="image/*" className="input-field" required style={{ padding: "0.5rem" }} />
            </div>

            {message && (
              <div style={{ padding: "1rem", borderRadius: "var(--radius)", backgroundColor: message.includes("success") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", color: message.includes("success") ? "#15803d" : "#b91c1c" }}>
                {message}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem", padding: "1rem" }}>
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </form>
        </div>

        {/* Manage Categories Section */}
        <div className="card" style={{ padding: "2rem", height: "fit-content" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Manage Categories</h2>
          
          {catMessage && (
            <div style={{ marginBottom: "1.5rem", padding: "0.75rem", borderRadius: "var(--radius)", backgroundColor: catMessage.includes("added") || catMessage.includes("deleted") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", color: catMessage.includes("added") || catMessage.includes("deleted") ? "#15803d" : "#b91c1c", fontSize: "0.875rem" }}>
              {catMessage}
            </div>
          )}

          <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Add Main Category</h3>
            <form onSubmit={handleAddMainCategory} style={{ display: "flex", gap: "0.5rem" }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="New main category" 
                value={newMainCategory}
                onChange={(e) => setNewMainCategory(e.target.value)}
                required 
              />
              <button type="submit" className="btn-primary">Add</button>
            </form>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Add Subcategory</h3>
            <form onSubmit={handleAddSubCategory} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <select 
                className="input-field" 
                value={selectedMainCatForSub}
                onChange={(e) => setSelectedMainCatForSub(e.target.value)}
                required
              >
                <option value="">Select Main Category...</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="New subcategory" 
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value)}
                  required 
                />
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>
          </div>

          <div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Existing Categories structure</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "400px", overflowY: "auto", paddingRight: "0.5rem" }}>
              {categories.map((cat, i) => (
                <div key={i} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", backgroundColor: "rgba(0,0,0,0.02)", borderBottom: cat.subCategories.length > 0 ? "1px solid var(--border)" : "none" }}>
                    <strong>{cat.name}</strong>
                    <button onClick={() => handleDeleteMainCategory(cat.name)} style={{ color: "#ef4444", fontSize: "0.875rem", fontWeight: "bold" }}>Delete</button>
                  </div>
                  {cat.subCategories.length > 0 && (
                    <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                      {cat.subCategories.map((sub, j) => (
                        <li key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1rem 0.5rem 2rem", borderTop: j > 0 ? "1px solid var(--border)" : "none" }}>
                          <span style={{ fontSize: "0.9rem" }}>{sub}</span>
                          <button onClick={() => handleDeleteSubCategory(cat.name, sub)} style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: "bold" }}>Del</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <p style={{ opacity: 0.5 }}>No categories found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
