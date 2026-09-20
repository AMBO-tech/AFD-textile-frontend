import React, { useState } from 'react';
import { Plus, ChevronLeft, Package } from 'lucide-react';
import { useMockStore, type Produit } from '../../data/useMockStore';
import { toast } from 'sonner';
import type { ProductsProps } from './types';
import CategoryCard from './CategoryCard';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import ProductFormModal from './ProductFormModal';
import NewCategoryModal from './NewCategoryModal';

export const Products: React.FC<ProductsProps> = ({ role = 'gerant' }) => {
  const {
    produits,
    categories,
    addProduit,
    updateProduit,
    deleteProduit,
    addCategorie,
  } = useMockStore();

  const [catChoisie, setCatChoisie] = useState<string | null>(null);
  const [showFormCat, setShowFormCat] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [detail, setDetail] = useState<Produit | null>(null);

  const produitsCategorie = catChoisie
    ? produits.filter((p) => p.categorie === catChoisie)
    : [];

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: Produit) => {
    setEditing(p);
    setShowForm(true);
  };

  const handleSaveProduct = (data: {
    nom: string;
    categorie: string;
    couleur: string;
    photo: string;
  }) => {
    if (editing) {
      updateProduit(editing.id, {
        nom: data.nom,
        categorie: data.categorie,
        couleur: data.couleur,
        photo: data.photo,
      });
      toast.success(`Modèle "${data.nom}" mis à jour`);
    } else {
      addProduit({
        nom: data.nom,
        categorie: data.categorie,
        couleur: data.couleur,
        photo: data.photo,
      });
      toast.success(`Nouveau tissu "${data.nom}" ajouté au catalogue`);
    }
    setShowForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    const prod = produits.find((p) => p.id === id);
    if (confirm(`Supprimer le modèle "${prod?.nom || id}" du catalogue ?`)) {
      deleteProduit(id);
      toast.success(`Produit "${prod?.nom || id}" supprimé du catalogue`);
    }
  };

  // Niveau 2 : page produits d'une catégorie
  if (catChoisie !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCatChoisie(null)}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-gray-900 text-lg">
              {catChoisie}
            </h1>
            <p className="text-sm text-gray-400">
              {produitsCategorie.length} produit
              {produitsCategorie.length !== 1 ? 's' : ''}
            </p>
          </div>
          {role === 'gerant' && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg,#0F3D5E,#1E88E5)' }}
            >
              <Plus size={15} /> Ajouter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {produitsCategorie.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              role={role}
              onClick={() => setDetail(p)}
              onEdit={() => openEdit(p)}
              onDelete={() => handleDeleteProduct(p.id)}
            />
          ))}

          {produitsCategorie.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun produit dans cette catégorie</p>
            </div>
          )}
        </div>

        {/* Modal Détail */}
        <ProductDetailModal
          product={detail}
          onClose={() => setDetail(null)}
        />

        {/* Modal Formulaire Produit */}
        <ProductFormModal
          isOpen={showForm && role === 'gerant'}
          onClose={() => setShowForm(false)}
          editingProduct={editing}
          categories={categories}
          defaultCategory={catChoisie}
          onSave={handleSaveProduct}
        />
      </div>
    );
  }

  // Niveau 1 : page catégories
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-gray-900">Produits</h1>
        {role === 'gerant' && (
          <button
            onClick={() => setShowFormCat(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#0F3D5E,#1E88E5)' }}
          >
            <Plus size={16} /> Catégorie
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const count = produits.filter((p) => p.categorie === cat.nom).length;
          return (
            <CategoryCard
              key={cat.nom}
              nom={cat.nom}
              photo={cat.photo}
              productCount={count}
              onClick={() => setCatChoisie(cat.nom)}
            />
          );
        })}
      </div>

      {/* Modal Ajout Catégorie */}
      <NewCategoryModal
        isOpen={showFormCat && role === 'gerant'}
        onClose={() => setShowFormCat(false)}
        onSave={(cat) => {
          addCategorie(cat);
          toast.success(`Catégorie "${cat.nom}" créée avec succès`);
          setShowFormCat(false);
        }}
      />
    </div>
  );
};

export default Products;
