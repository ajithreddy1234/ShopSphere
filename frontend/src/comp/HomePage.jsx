// src/comp/HomePage.jsx
import React, { useEffect } from "react";
import { useProductStore } from "../store/product";
import ProductCard from "./ProductCard";

const HomePage = ({ theme }) => {
  const { fetchProducts, products, loading, error } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="container">
      <h2 className="page-title" style={{
        fontSize: 32,
        fontWeight: 700,
        margin: "32px 0 24px 0",
        textAlign: "center",
        letterSpacing: 1,
      }}>
        Your product catalogue
      </h2>
      {loading && <p role="status">Loading your catalogue…</p>}
      {error && <p role="alert">{error} <button onClick={fetchProducts}>Retry</button></p>}
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} theme={theme} />
        ))}
      </div>
      {!loading && !error && products.length === 0 && (
        <div style={{ textAlign: "center", color: theme.text, margin: "40px 0" }}>
          No products found 😢
        </div>
      )}
    </div>
  );
};

export default HomePage;
