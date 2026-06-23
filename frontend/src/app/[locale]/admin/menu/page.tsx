"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getToken } from "@/utils/auth";

type Product = {
  id: number;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
};

export default function MenuManagement() {
  const t = useTranslations("Admin");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: "",
    price: 0,
    image_url: "",
    category: "Burgers",
    is_active: true
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append("category", categoryFilter);
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter === "available") params.append("is_active", "true");
      if (statusFilter === "unavailable") params.append("is_active", "false");
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/products/?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        
        // Extract unique categories from ALL products (unfiltered) on first load
        if (!categoryFilter && !debouncedSearch && !statusFilter) {
          const cats = [...new Set(data.map((p: Product) => p.category))] as string[];
          setCategories(cats.sort());
        }
      }
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch all categories on mount (unfiltered)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/products/`);
        if (res.ok) {
          const data = await res.json();
          const cats = [...new Set(data.map((p: Product) => p.category))] as string[];
          setCategories(cats.sort());
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name_en: product.name_en,
        name_ar: product.name_ar,
        description_en: product.description_en,
        description_ar: product.description_ar,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        is_active: product.is_active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name_en: "",
        name_ar: "",
        description_en: "",
        description_ar: "",
        price: 0,
        image_url: "",
        category: "Burgers",
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    
    try {
      const url = editingProduct 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/products/${editingProduct.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/products/`;
        
      const method = editingProduct ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        fetchProducts();
        handleCloseModal();
      } else {
        alert(t("failedSaveProduct"));
      }
    } catch (error) {
      console.error("Error saving product", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteConfirm"))) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert(t("failedDeleteProduct"));
      }
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/products/${product.id}/toggle-active`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
      }
    } catch (error) {
      console.error("Error toggling product active state", error);
    }
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl text-on-surface mb-2">{t("menuManagement")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("menuSubtitle")}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-on-primary font-label-md text-label-md font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-on-primary-fixed-variant transition-colors shadow-sm self-stretch md:self-auto justify-center"
        >
          <span className="material-symbols-outlined">add_circle</span>
          {t("addNewItem")}
        </button>
      </div>

      {/* Controls Bar (Search & Filter) */}
      <div className="bg-surface rounded-xl shadow-sm border border-outline-variant p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            placeholder={t("searchMenu")}
          />
        </div>
        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 pr-10 rtl:pr-4 rtl:pl-10 font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 pr-10 rtl:pr-4 rtl:pl-10 font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="available">{t("available")}</option>
            <option value="unavailable">{t("unavailable")}</option>
          </select>
        </div>
      </div>

      {/* Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden animate-pulse">
              <div className="h-48 bg-surface-container-high" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-surface-container-high rounded w-3/4" />
                <div className="h-4 bg-surface-container-high rounded w-1/2" />
                <div className="h-6 bg-surface-container-high rounded w-1/4 mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 text-outline">restaurant_menu</span>
          <p className="font-title-md text-title-md">{t("noProducts")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden hover:shadow-md transition-shadow group ${
                !product.is_active ? "opacity-80" : ""
              }`}
            >
              {/* Image */}
              <div className="h-48 relative overflow-hidden">
                {product.image_url ? (
                  <img 
                    alt={product.name_en} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      product.is_active ? "group-hover:scale-105" : "grayscale-[30%]"
                    }`}
                    src={product.image_url}
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl">image</span>
                  </div>
                )}
                {!product.is_active && (
                  <div className="absolute inset-0 bg-on-background/10" />
                )}
                {/* Status badge */}
                <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                  <span className={`backdrop-blur-sm font-label-sm text-label-sm px-3 py-1 rounded-full font-bold ${
                    product.is_active
                      ? "bg-surface/90 text-primary border border-primary/20"
                      : "bg-surface/90 text-error border border-error/20"
                  }`}>
                    {product.is_active ? t("available") : t("unavailable")}
                  </span>
                </div>
                {/* Category badge */}
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                  <span className="bg-surface-container-highest/90 backdrop-blur-sm text-on-surface-variant font-label-sm text-label-sm px-2 py-1 rounded border border-outline-variant">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={`font-title-md text-title-md font-bold ${product.is_active ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {product.name_en}
                    </h3>
                    <p className={`font-body-md text-body-md ${product.is_active ? "text-on-surface-variant" : "text-outline"}`} dir="rtl">
                      {product.name_ar}
                    </p>
                  </div>
                  <span className={`font-headline-lg text-headline-lg-mobile font-bold whitespace-nowrap ms-3 ${product.is_active ? "text-primary" : "text-on-surface-variant"}`}>
                    {product.price.toFixed(0)} <span className="text-label-sm">{t("currency")}</span>
                  </span>
                </div>

                {/* Actions Row */}
                <div className="mt-6 flex justify-between items-center border-t border-surface-container-high pt-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="p-2 text-tertiary bg-surface-container-low rounded hover:bg-tertiary-container hover:text-on-tertiary-container transition-colors"
                      title={t("editProduct")}
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-error bg-surface-container-low rounded hover:bg-error-container hover:text-on-error-container transition-colors"
                      title={t("deleteProduct")}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                  {/* Active Toggle Switch */}
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={product.is_active}
                        onChange={() => handleToggleActive(product)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${
                        product.is_active 
                          ? "bg-primary-fixed-dim" 
                          : "bg-surface-variant border border-outline-variant"
                      }`} />
                      <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition transform ${
                        product.is_active
                          ? "translate-x-4 bg-primary"
                          : "bg-outline"
                      }`} />
                    </div>
                    <span className={`ms-3 font-label-sm text-label-sm ${
                      product.is_active ? "text-on-surface-variant" : "text-outline"
                    }`}>
                      {product.is_active ? t("active") : t("inactive")}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center bg-surface">
              <h2 className="font-headline-lg text-headline-lg-mobile text-on-background font-bold">
                {editingProduct ? t("editProduct") : t("addNewProduct")}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("nameEn")}</label>
                    <input required type="text" name="name_en" value={formData.name_en} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("nameAr")}</label>
                    <input required type="text" name="name_ar" value={formData.name_ar} onChange={handleChange} dir="rtl" className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("descriptionEn")}</label>
                    <textarea required name="description_en" value={formData.description_en} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("descriptionAr")}</label>
                    <textarea required name="description_ar" value={formData.description_ar} onChange={handleChange} rows={3} dir="rtl" className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("price")} ({t("currency")})</label>
                    <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("category")}</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("imageUrl")}</label>
                  <input required type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  {formData.image_url && (
                    <div className="mt-2">
                      <img src={formData.image_url} alt="Preview" className="h-32 object-cover rounded-lg border border-outline-variant" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-6 py-2.5 rounded-lg font-label-md text-label-md text-on-surface border border-outline-variant hover:bg-surface-container-low transition-colors"
              >
                {t("cancel")}
              </button>
              <button 
                type="submit" 
                form="product-form"
                className="px-6 py-2.5 rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-colors font-bold"
              >
                {editingProduct ? t("saveChanges") : t("createProduct")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
