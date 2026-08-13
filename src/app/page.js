"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    setSearchQuery(""); // Clear search to fix category filtering
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
        padding: "0.25rem 0", 
        backgroundColor: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <img src="/logo-round.jpg" alt="JA Logo" style={{ height: "45px", width: "45px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          
          <div style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <h1 style={{ fontSize: "clamp(1.2rem, 5vw, 1.8rem)", fontWeight: "900", color: "var(--primary)", margin: 0, textTransform: "uppercase", lineHeight: 1.1 }}>MCC Product Catalog</h1>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
            <img src="/logo-rect.jpg" alt="MCC Logo" style={{ height: "40px", width: "auto", objectFit: "contain" }} />
            <Link href="/admin" className="hide-on-mobile" style={{ fontSize: "0.65rem", color: "var(--foreground)", opacity: 0.6, textDecoration: "none", marginTop: "2px" }}>
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: "1rem 0.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "0 0 0.25rem 0" }}>Our Products</h2>
          <p style={{ color: "var(--foreground)", opacity: 0.8, maxWidth: "600px", margin: "0 auto", fontSize: "0.8rem", lineHeight: 1.2 }}>
            Browse our exclusive collection. Find exactly what you're looking for using the search and filters below.
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "1rem", maxWidth: "600px", margin: "0 auto", width: "100%", position: "relative" }}>
            <input
              type="text"
              placeholder="Search products by name..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              style={{ flex: 1, padding: "1rem", fontSize: "1rem", borderRadius: "50px" }}
            />
            
            {/* Search Suggestions Dropdown */}
            {isSearchFocused && searchQuery && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 0.5rem)",
                left: 0,
                right: 0,
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 50,
                maxHeight: "300px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}>
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 8)
                  .map(product => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSearchQuery(product.name);
                        setSelectedMainCategory("All");
                        setSelectedSubCategory("All");
                        setIsSearchFocused(false);
                      }}
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        color: "var(--foreground)",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(0,0,0,0.03)"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      {product.name}
                      <span style={{ display: "block", fontSize: "0.7rem", opacity: 0.6 }}>{product.category}</span>
                    </button>
                  ))}
                {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div style={{ padding: "1rem", textAlign: "center", opacity: 0.6, fontSize: "0.9rem" }}>
                    No matching products found
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <button
              onClick={() => handleMainCategorySelect("All")}
              style={{
                padding: "0.4rem 0.2rem",
                borderRadius: "50px",
                fontSize: "0.85rem",
                border: `1px solid ${selectedMainCategory === "All" ? "var(--primary)" : "var(--border)"}`,
                backgroundColor: selectedMainCategory === "All" ? "var(--primary)" : "var(--surface)",
                color: selectedMainCategory === "All" ? "#fff" : "var(--foreground)",
                fontWeight: "500",
                transition: "all 0.2s ease",
                boxShadow: selectedMainCategory === "All" ? "0 4px 6px rgba(37, 99, 235, 0.2)" : "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => handleMainCategorySelect(category.name)}
                style={{
                  padding: "0.4rem 0.2rem",
                  borderRadius: "50px",
                  fontSize: "0.85rem",
                  border: `1px solid ${selectedMainCategory === category.name ? "var(--primary)" : "var(--border)"}`,
                  backgroundColor: selectedMainCategory === category.name ? "var(--primary)" : "var(--surface)",
                  color: selectedMainCategory === category.name ? "#fff" : "var(--foreground)",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  boxShadow: selectedMainCategory === category.name ? "0 4px 6px rgba(37, 99, 235, 0.2)" : "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
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
                onClick={() => { setSelectedSubCategory("All"); setSearchQuery(""); }}
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
                  onClick={() => { setSelectedSubCategory(sub); setSearchQuery(""); }}
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
                  backgroundColor: "#ffffff",
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
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            cursor: "pointer",
            zIndex: 1000,
            transition: "all 0.3s ease"
          }}
          aria-label="Scroll to top"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
}
