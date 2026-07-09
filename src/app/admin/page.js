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
  const [editState, setEditState] = useState({ type: null, mainName: '', oldName: '', newName: '' });

  // Product form state
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  // Products list state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Image upload for existing product
  const [uploadingImageFor, setUploadingImageFor] = useState(null); // product id
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductData, setEditProductData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [imageUploadMsg, setImageUploadMsg] = useState("");

  // Active tab
  const [activeTab, setActiveTab] = useState("add"); // "add" | "manage" | "categories"

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchProducts();
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

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setProductsLoading(false);
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
    const catObj = categories.find((c) => c.name === mainCat);
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
        fetchProducts();
      } else {
        setMessage(data.error || "Failed to add product");
      }
    } catch (error) {
      setMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProductEdit = async (productId) => {
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      if (editProductData.name) formData.append("name", editProductData.name);
      if (editProductData.category) formData.append("category", editProductData.category);
      if (editProductData.subCategory !== undefined) formData.append("subCategory", editProductData.subCategory);
      if (editProductData.price !== undefined) formData.append("price", editProductData.price);
      if (editProductData.description !== undefined) formData.append("description", editProductData.description);

      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...editProductData } : p)));
        setEditingProduct(null);
        setEditProductData({});
      } else {
        setMessage(data.error || "Failed to update product");
      }
    } catch (error) {
      setMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleUploadImage = async (productId) => {
    if (!imageFile) {
      setImageUploadMsg("Please select an image first.");
      return;
    }
    setLoading(true);
    setImageUploadMsg("");
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImageUploadMsg("Image uploaded successfully!");
        setUploadingImageFor(null);
        setImageFile(null);
        fetchProducts();
      } else {
        setImageUploadMsg(data.error || "Failed to upload image.");
      }
    } catch (error) {
      setImageUploadMsg("An error occurred.");
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
    if (!confirm("Are you sure you want to delete this main category?")) return;
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
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
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

  const handleEditCategory = async (e) => {
    e.preventDefault();
    setCatMessage("");
    try {
      const action = editState.type === 'main' ? 'editMainCategory' : 'editSubCategory';
      const body = {
        action,
        oldName: editState.oldName,
        newName: editState.newName,
        mainCategory: editState.mainName
      };

      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
        setEditState({ type: null, mainName: '', oldName: '', newName: '' });
        setCatMessage(editState.type === 'main' ? "Main category renamed!" : "Subcategory renamed!");
      } else {
        setCatMessage(data.error || "Failed to rename category");
      }
    } catch (error) {
      setCatMessage("An error occurred");
    }
  };

  const tabStyle = (tab) => ({
    padding: "0.6rem 1.4rem",
    borderRadius: "var(--radius)",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
    backgroundColor: activeTab === tab ? "var(--primary)" : "var(--surface)",
    color: activeTab === tab ? "#fff" : "var(--foreground)",
    boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
  });

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
    <div className="container" style={{ maxWidth: "1200px", marginTop: "40px", marginBottom: "60px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo-round.jpg" alt="JA Logo" style={{ height: "40px", width: "40px", borderRadius: "50%", objectFit: "cover" }} />
          <img src="/logo-rect.jpg" alt="MCC Logo" style={{ height: "35px", width: "auto", objectFit: "contain" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0 }}>Admin Dashboard</h1>
        </div>
        <Link href="/" className="btn-primary" style={{ backgroundColor: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
          View Catalog
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <button style={tabStyle("add")} onClick={() => setActiveTab("add")}>➕ Add Product</button>
        <button style={tabStyle("manage")} onClick={() => { setActiveTab("manage"); fetchProducts(); }}>📦 Manage Products</button>
        <button style={tabStyle("categories")} onClick={() => setActiveTab("categories")}>🗂 Categories</button>
      </div>

      {/* ========== ADD PRODUCT TAB ========== */}
      {activeTab === "add" && (
        <div className="card" style={{ padding: "2rem", maxWidth: "600px" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Add New Product</h2>
          <form onSubmit={handleSubmitProduct} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Product Name *</label>
              <input type="text" name="name" className="input-field" required placeholder="e.g. Premium Wireless Headphones" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Main Category *</label>
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
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Product Image (optional)</label>
              <input type="file" name="image" accept="image/*" className="input-field" style={{ padding: "0.5rem" }} />
              <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.25rem" }}>
                You can skip the image now and add it later from "Manage Products".
              </p>
            </div>

            {message && (
              <div style={{ padding: "1rem", borderRadius: "var(--radius)", backgroundColor: message.includes("success") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", color: message.includes("success") ? "#15803d" : "#b91c1c" }}>
                {message}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "0.5rem", padding: "1rem" }}>
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </form>
        </div>
      )}

      {/* ========== MANAGE PRODUCTS TAB ========== */}
      {activeTab === "manage" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2>All Products ({products.length})</h2>
            <button className="btn-primary" onClick={fetchProducts} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
              🔄 Refresh
            </button>
          </div>

          {productsLoading ? (
            <p style={{ opacity: 0.5 }}>Loading products...</p>
          ) : products.length === 0 ? (
            <div className="card" style={{ padding: "3rem", textAlign: "center", opacity: 0.5 }}>
              No products found. Add some from the "Add Product" tab.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1.25rem" }}>
              {products.map((product) => (
                <div key={product.id} className="card" style={{ padding: "1.25rem", position: "relative" }}>
                  {/* Product Image */}
                  <div style={{ width: "100%", height: "160px", backgroundColor: "var(--surface)", borderRadius: "var(--radius)", marginBottom: "1rem", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1rem", cursor: "pointer" }} 
                        onClick={() => setModalImage(product.imageUrl)}
                      />
                    ) : (
                      <span style={{ opacity: 0.3, fontSize: "2.5rem" }}>📷</span>
                    )}
                  </div>

                  {/* Product Info */}
                  {editingProduct === product.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                      <input type="text" className="input-field" value={editProductData.name || ""} onChange={(e) => setEditProductData({...editProductData, name: e.target.value})} placeholder="Product Name" style={{ padding: "0.4rem", fontSize: "0.9rem" }} />
                      <select className="input-field" value={editProductData.category || ""} onChange={(e) => setEditProductData({...editProductData, category: e.target.value, subCategory: ""})} style={{ padding: "0.4rem", fontSize: "0.9rem" }}>
                        <option value="">Select Category...</option>
                        {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                      </select>
                      <select className="input-field" value={editProductData.subCategory || ""} onChange={(e) => setEditProductData({...editProductData, subCategory: e.target.value})} style={{ padding: "0.4rem", fontSize: "0.9rem" }}>
                        <option value="">Select Subcategory...</option>
                        {editProductData.category && categories.find(c => c.name === editProductData.category)?.subCategories.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                      <input type="text" className="input-field" value={editProductData.price || ""} onChange={(e) => setEditProductData({...editProductData, price: e.target.value})} placeholder="Price" style={{ padding: "0.4rem", fontSize: "0.9rem" }} />
                      <textarea className="input-field" value={editProductData.description || ""} onChange={(e) => setEditProductData({...editProductData, description: e.target.value})} placeholder="Description" style={{ padding: "0.4rem", fontSize: "0.9rem", minHeight: "60px" }} />
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                        <button className="btn-primary" style={{ flex: 1, padding: "0.4rem", fontSize: "0.8rem" }} onClick={() => handleSaveProductEdit(product.id)} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
                        <button style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "transparent" }} onClick={() => { setEditingProduct(null); setEditProductData({}); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.4rem" }}>{product.name}</h3>
                      <p style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: "0.25rem" }}>
                        {product.category}{product.subCategory ? ` › ${product.subCategory}` : ""}
                      </p>
                      {product.price && <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--primary)", marginBottom: "0.75rem" }}>{product.price}</p>}
                    </>
                  )}

                  {/* Badges */}
                  {!product.imageUrl && (
                    <span style={{ display: "inline-block", fontSize: "0.7rem", backgroundColor: "rgba(234,179,8,0.15)", color: "#b45309", padding: "0.2rem 0.5rem", borderRadius: "999px", marginBottom: "0.75rem", fontWeight: "600" }}>
                      No Image
                    </span>
                  )}

                  {/* Upload Image Section */}
                  {uploadingImageFor === product.id ? (
                    <div style={{ marginTop: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                      <input
                        type="file"
                        accept="image/*"
                        className="input-field"
                        style={{ padding: "0.4rem", fontSize: "0.8rem", marginBottom: "0.5rem" }}
                        onChange={(e) => setImageFile(e.target.files[0])}
                      />
                      {imageUploadMsg && (
                        <p style={{ fontSize: "0.8rem", color: imageUploadMsg.includes("success") ? "#15803d" : "#b91c1c", marginBottom: "0.5rem" }}>
                          {imageUploadMsg}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn-primary"
                          style={{ flex: 1, fontSize: "0.8rem", padding: "0.5rem" }}
                          onClick={() => handleUploadImage(product.id)}
                          disabled={loading}
                        >
                          {loading ? "Uploading..." : "Upload"}
                        </button>
                        <button
                          style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", cursor: "pointer", backgroundColor: "var(--surface)" }}
                          onClick={() => { setUploadingImageFor(null); setImageFile(null); setImageUploadMsg(""); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                      <button
                        className="btn-primary"
                        style={{ flex: 1, fontSize: "0.8rem", padding: "0.5rem" }}
                        onClick={() => { setUploadingImageFor(product.id); setImageFile(null); setImageUploadMsg(""); }}
                      >
                        {product.imageUrl ? "🔄 Change Image" : "📷 Add Image"}
                      </button>
                      <button
                        style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", cursor: "pointer", backgroundColor: "transparent" }}
                        onClick={() => { setEditingProduct(product.id); setEditProductData({ name: product.name, category: product.category, subCategory: product.subCategory || "", price: product.price || "", description: product.description || "" }); }}
                      >
                        ✏️
                      </button>
                      <button
                        style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", borderRadius: "var(--radius)", border: "1px solid #ef4444", color: "#ef4444", cursor: "pointer", backgroundColor: "transparent" }}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== CATEGORIES TAB ========== */}
      {activeTab === "categories" && (
        <div className="card" style={{ padding: "2rem", maxWidth: "600px" }}>
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

          <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
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
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Existing Categories</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {categories.map((cat, i) => (
                <div key={i} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", backgroundColor: "rgba(0,0,0,0.02)", borderBottom: cat.subCategories.length > 0 ? "1px solid var(--border)" : "none" }}>
                    {editState.type === 'main' && editState.oldName === cat.name ? (
                      <form onSubmit={handleEditCategory} style={{ display: "flex", gap: "0.5rem", flex: 1, marginRight: "1rem" }}>
                        <input type="text" className="input-field" value={editState.newName} onChange={e => setEditState({...editState, newName: e.target.value})} style={{ padding: "0.25rem 0.5rem", flex: 1 }} autoFocus required />
                        <button type="submit" className="btn-primary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}>Save</button>
                        <button type="button" onClick={() => setEditState({ type: null, mainName: '', oldName: '', newName: '' })} style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem", backgroundColor: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>Cancel</button>
                      </form>
                    ) : (
                      <>
                        <strong style={{ flex: 1, wordBreak: "break-word" }}>{cat.name}</strong>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => setEditState({ type: 'main', mainName: '', oldName: cat.name, newName: cat.name })} style={{ color: "var(--primary)", fontSize: "0.875rem", fontWeight: "bold" }}>Edit</button>
                          <button onClick={() => handleDeleteMainCategory(cat.name)} style={{ color: "#ef4444", fontSize: "0.875rem", fontWeight: "bold" }}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                  {cat.subCategories.length > 0 && (
                    <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                      {cat.subCategories.map((sub, j) => (
                        <li key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1rem 0.5rem 2rem", borderTop: j > 0 ? "1px solid var(--border)" : "none" }}>
                          {editState.type === 'sub' && editState.mainName === cat.name && editState.oldName === sub ? (
                            <form onSubmit={handleEditCategory} style={{ display: "flex", gap: "0.5rem", flex: 1, marginRight: "1rem" }}>
                              <input type="text" className="input-field" value={editState.newName} onChange={e => setEditState({...editState, newName: e.target.value})} style={{ padding: "0.25rem 0.5rem", flex: 1 }} autoFocus required />
                              <button type="submit" className="btn-primary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}>Save</button>
                              <button type="button" onClick={() => setEditState({ type: null, mainName: '', oldName: '', newName: '' })} style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem", backgroundColor: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>Cancel</button>
                            </form>
                          ) : (
                            <>
                              <span style={{ fontSize: "0.9rem", flex: 1, wordBreak: "break-word" }}>{sub}</span>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => setEditState({ type: 'sub', mainName: cat.name, oldName: sub, newName: sub })} style={{ color: "var(--primary)", fontSize: "0.75rem", fontWeight: "bold" }}>Edit</button>
                                <button onClick={() => handleDeleteSubCategory(cat.name, sub)} style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: "bold" }}>Delete</button>
                              </div>
                            </>
                          )}
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
      )}

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
