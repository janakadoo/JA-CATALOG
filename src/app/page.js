"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [categories, setCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeMainCatObj = categories.find(c => c.name === selectedMainCategory);
  const availableSubCategories = activeMainCatObj ? activeMainCatObj.subCategories : [];

  const handleMainCategorySelect = (mainCat) => {
    setSelectedMainCategory(mainCat);
    setSelectedSubCategory("All"); // Reset sub category when main changes
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMain = selectedMainCategory === "All" || product.category === selectedMainCategory;
    const matchesSub = selectedSubCategory === "All" || product.subCategory === selectedSubCategory;
    return matchesSearch && matchesMain && matchesSub;
  });

  return (
    <div>
      <header style={{ 
        borderBottom: "1px solid var(--border)", 
        padding: "1rem 0", 
        backgroundColor: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary)" }}>StoreFront</h1>
          <Link href="/admin" style={{ fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.6, textDecoration: "none" }}>
            Admin Login
          </Link>
        </div>
      </header>

      <main className="container" style={{ padding: "3rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "1rem" }}>Our Products</h2>
          <p style={{ color: "var(--foreground)", opacity: 0.8, maxWidth: "600px", margin: "0 auto" }}>
            Browse our exclusive collection. Find exactly what you're looking for using the search and filters below.
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "3rem" }}>
          <div style={{ display: "flex", gap: "1rem", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
            <input
              type="text"
              placeholder="Search products by name..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: "1rem", fontSize: "1rem", borderRadius: "50px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => handleMainCategorySelect("All")}
              style={{
                padding: "0.5rem 1.5rem",
                borderRadius: "50px",
                border: `1px solid ${selectedMainCategory === "All" ? "var(--primary)" : "var(--border)"}`,
                backgroundColor: selectedMainCategory === "All" ? "var(--primary)" : "var(--surface)",
                color: selectedMainCategory === "All" ? "#fff" : "var(--foreground)",
                fontWeight: "500",
                transition: "all 0.2s ease",
                boxShadow: selectedMainCategory === "All" ? "0 4px 6px rgba(37, 99, 235, 0.2)" : "none"
              }}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => handleMainCategorySelect(category.name)}
                style={{
                  padding: "0.5rem 1.5rem",
                  borderRadius: "50px",
                  border: `1px solid ${selectedMainCategory === category.name ? "var(--primary)" : "var(--border)"}`,
                  backgroundColor: selectedMainCategory === category.name ? "var(--primary)" : "var(--surface)",
                  color: selectedMainCategory === category.name ? "#fff" : "var(--foreground)",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  boxShadow: selectedMainCategory === category.name ? "0 4px 6px rgba(37, 99, 235, 0.2)" : "none"
                }}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Subcategory filters if a main category is selected */}
          {selectedMainCategory !== "All" && availableSubCategories.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.5rem", padding: "1rem", backgroundColor: "rgba(0,0,0,0.02)", borderRadius: "var(--radius)" }}>
              <button
                onClick={() => setSelectedSubCategory("All")}
                style={{
                  padding: "0.3rem 1rem",
                  borderRadius: "50px",
                  fontSize: "0.875rem",
                  border: `1px solid ${selectedSubCategory === "All" ? "var(--foreground)" : "var(--border)"}`,
                  backgroundColor: selectedSubCategory === "All" ? "var(--foreground)" : "transparent",
                  color: selectedSubCategory === "All" ? "var(--background)" : "var(--foreground)",
                  fontWeight: "500",
                  transition: "all 0.2s ease"
                }}
              >
                All in {selectedMainCategory}
              </button>
              {availableSubCategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  style={{
                    padding: "0.3rem 1rem",
                    borderRadius: "50px",
                    fontSize: "0.875rem",
                    border: `1px solid ${selectedSubCategory === sub ? "var(--foreground)" : "var(--border)"}`,
                    backgroundColor: selectedSubCategory === sub ? "var(--foreground)" : "transparent",
                    color: selectedSubCategory === sub ? "var(--background)" : "var(--foreground)",
                    fontWeight: "500",
                    transition: "all 0.2s ease"
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {filteredProducts.map(product => (
              <div key={product.id} className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ 
                  position: "relative", 
                  width: "100%", 
                  paddingTop: "75%", 
                  backgroundColor: "#f1f5f9",
                  overflow: "hidden"
                }}>
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      style={{ 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain",
                        padding: "1rem",
                        transition: "transform 0.3s ease",
                        cursor: "pointer"
                      }}
                      onClick={() => setModalImage(product.imageUrl)}
                      onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                    />
                  ) : (
                    <div style={{
                      position: "absolute",
                      top: 0, left: 0, width: "100%", height: "100%",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      backgroundColor: "var(--surface)",
                      color: "var(--foreground)",
                      opacity: 0.4
                    }}>
                      <span style={{ fontSize: "3rem" }}>📷</span>
                      <span style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>No image yet</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>{product.name}</h3>
                    {product.price && (
                      <span style={{ 
                        backgroundColor: "var(--primary)", 
                        color: "#fff", 
                        padding: "0.25rem 0.75rem", 
                        borderRadius: "50px", 
                        fontSize: "0.875rem",
                        fontWeight: "bold"
                      }}>
                        {product.price}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: "500" }}>
                      {product.category}
                    </span>
                    {product.subCategory && (
                      <span style={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.6 }}>
                        ↳ {product.subCategory}
                      </span>
                    )}
                  </div>
                  
                  <p style={{ 
                    fontSize: "0.875rem", 
                    opacity: 0.8, 
                    margin: 0, 
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {product.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--surface)", borderRadius: "var(--radius)" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No products found</h3>
            <p style={{ opacity: 0.7 }}>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>

      {/* Image Modal */}
      {modalImage && (
        <div 
          onClick={() => setModalImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem"
          }}
        >
          <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", maxWidth: "800px", paddingBottom: "10px" }}>
            <button 
              onClick={() => setModalImage(null)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer"
              }}
            >
              &times;
            </button>
          </div>
          <img 
            src={modalImage} 
            alt="Full size" 
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
            }} 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
