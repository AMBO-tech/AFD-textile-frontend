import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../../services/products.service';
import type { CreateProduitDto, UpdateProduitDto, ProductQueryParams } from '../../types/products';

export const PRODUCT_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_KEYS.all, 'list'] as const,
  list: (params?: ProductQueryParams) => [...PRODUCT_KEYS.lists(), params] as const,
  details: () => [...PRODUCT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
};

/**
 * Récupère la liste paginée ou filtrée des produits
 */
export const useProductsQuery = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productsService.getAll(params),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};

/**
 * Récupère le détail d'un produit par ID
 */
export const useProductDetailQuery = (id: string) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () => productsService.getById(id),
    enabled: Boolean(id),
  });
};

/**
 * Mutation pour créer un nouveau produit
 */
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProduitDto) => productsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
    },
  });
};

/**
 * Mutation pour mettre à jour un produit
 */
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProduitDto }) => productsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(variables.id) });
    },
  });
};

/**
 * Mutation pour archiver un produit
 */
export const useArchiveProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
    },
  });
};
