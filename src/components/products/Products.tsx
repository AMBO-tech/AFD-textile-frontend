import React, { useState } from 'react';
import { Plus, ChevronLeft, Package, Trash2 } from 'lucide-react';
import { useMockStore, type Produit } from '../../data/useMockStore';
import { toast } from 'sonner';
import type { ProductsProps } from './types';
import CategoryCard from './CategoryCard';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import ProductFormModal from './ProductFormModal';
import NewCategoryModal from './NewCategoryModal';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useArchiveProductMutation,
  useCategoriesQuery,
  useUnitesQuery,
} from '../../hooks/queries/useProductsQuery';
import { getErrorMessage } from '../../services/api';
import { mediaService } from '../../services/media.service';

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
  const [productToDelete, setProductToDelete] = useState<Produit | null>(null);

  const { data: apiCategories } = useCategoriesQuery();
  const { data: apiUnites } = useUnitesQuery();
  const { mutate: createProductApi } = useCreateProductMutation();
  const { mutate: updateProductApi } = useUpdateProductMutation();
  const { mutate: archiveProductApi } = useArchiveProductMutation();

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

  const handleSaveProduct = async (data: {
    nom: string;
    categorie: string;
    couleur: string;
    photo: string;
    photoFile?: File | null;
  }) => {
    let finalPhotoUrl = data.photo && data.photo.startsWith('http') ? data.photo : '';

    // Téléversement vers Cloudflare R2 via l'API NestJS si un fichier local a été sélectionné
    if (data.photoFile) {
      try {
        const uploaded = await mediaService.uploadTissuPhoto(data.photoFile);
        if (uploaded?.url) {
          finalPhotoUrl = uploaded.url;
        }
      } catch (uploadErr) {
        toast.error(getErrorMessage(uploadErr, "Échec du téléversement sur Cloudflare R2"));
      }
    }

    if (!finalPhotoUrl) {
      finalPhotoUrl =
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';
    }

    if (editing) {
      updateProduit(editing.id, {
        nom: data.nom,
        categorie: data.categorie,
        couleur: data.couleur,
        photo: finalPhotoUrl,
      });

      // Synchronisation API réelle
      updateProductApi(
        {
          id: editing.id,
          data: {
            nom: data.nom,
            couleur: data.couleur,
            photoUrl: finalPhotoUrl,
          },
        },
        {
          onError: (err) => {
            toast.error(getErrorMessage(err, 'Erreur lors de la modification du tissu'));
          },
        }
      );

      toast.success(`Modèle "${data.nom}" mis à jour`);
    } else {
      addProduit({
        nom: data.nom,
        categorie: data.categorie,
        couleur: data.couleur,
        photo: finalPhotoUrl,
      });

      // Trouver la vraie catégorie en base (ou fallback sur la 1ère active)
      const matchedCat =
        apiCategories?.find(
          (c: any) =>
            c.id === data.categorie ||
            c.code?.toLowerCase() === data.categorie?.toLowerCase() ||
            c.nom?.toLowerCase() === data.categorie?.toLowerCase()
        ) || apiCategories?.[0];

      // Trouver la vraie unité en base (ou fallback sur METRE)
      const matchedUnite =
        apiUnites?.find((u: any) => u.code === 'METRE') || apiUnites?.[0];

      if (matchedCat && matchedUnite) {
        createProductApi(
          {
            reference: `REF-${Date.now().toString().slice(-6)}`,
            nom: data.nom,
            categorieId: matchedCat.id,
            unitePrincipaleId: matchedUnite.id,
            uniteStockage: (matchedUnite.code === 'KG'
              ? 'KG'
              : matchedUnite.code === 'ROULEAU'
              ? 'ROULEAU'
              : 'METRE') as any,
            photoUrl: finalPhotoUrl,
            prixIndicatif: 5000,
            couleur: data.couleur || 'Non spécifiée',
          },
          {
            onError: (err) => {
              toast.error(getErrorMessage(err, "Erreur lors de l'enregistrement en base"));
            },
          }
        );
      }

      toast.success(`Nouveau tissu "${data.nom}" ajouté au catalogue`);
    }
    setShowForm(false);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const { id, nom } = productToDelete;
    deleteProduit(id);
    archiveProductApi(id, {
      onError: (err) => {
        toast.error(getErrorMessage(err, "Erreur lors de l'archivage du tissu"));
      },
    });
    toast.success(`Produit "${nom}" supprimé du catalogue`);
    setProductToDelete(null);
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
              onDelete={() => setProductToDelete(p)}
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

        {/* Modal de Confirmation de Suppression */}
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 size={24} />
                </div>
                <h3 className="font-display font-bold text-gray-900 text-base">
                  Confirmer la suppression
                </h3>
                <p className="text-xs text-gray-500">
                  Êtes-vous sûr de vouloir supprimer le tissu <strong>{productToDelete.nom}</strong> du catalogue ?
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
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
