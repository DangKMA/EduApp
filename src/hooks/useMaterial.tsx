import {useState, useCallback} from 'react';
import {Material, FilterParams} from '../types/materialType';
import {materialService} from '../services/materialService';

const useMaterial = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAllMaterials = useCallback(async (params?: FilterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      // Sử dụng materialService thay vì gọi API trực tiếp
      const response = await materialService.getAllMaterials(params);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Đã xảy ra lỗi khi tải tài liệu');
      return {success: false, data: [], error: err.message};
    }
  }, []);

  // Lấy thống kê
  const getMaterialStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Sử dụng materialService
      const response = await materialService.getMaterialStats();
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Đã xảy ra lỗi khi tải thông tin thống kê');
      return {
        success: false,
        data: {totalMaterials: 0, courseCount: 0, totalDownloads: 0},
      };
    }
  }, []);

  // Lấy chi tiết tài liệu
  const getMaterialDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Sử dụng materialService
      const response = await materialService.getMaterialDetail(id);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Đã xảy ra lỗi khi tải chi tiết tài liệu');
      return {success: false, data: null as unknown as Material};
    }
  }, []);

  // Tạo tài liệu mới
  const createMaterial = useCallback(
    async (materialData: Omit<Material, '_id' | 'createdAt' | 'updatedAt'>) => {
      setIsLoading(true);
      setError(null);
      try {
        // Sử dụng materialService
        const response = await materialService.createMaterial(materialData);
        setIsLoading(false);
        return response;
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Đã xảy ra lỗi khi tạo tài liệu');
        return {success: false, data: null as unknown as Material};
      }
    },
    [],
  );

  // Cập nhật tài liệu
  const updateMaterial = useCallback(
    async (id: string, materialData: Partial<Material>) => {
      setIsLoading(true);
      setError(null);
      try {
        // Sử dụng materialService
        const response = await materialService.updateMaterial(id, materialData);
        setIsLoading(false);
        return response;
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Đã xảy ra lỗi khi cập nhật tài liệu');
        return {success: false, data: null as unknown as Material};
      }
    },
    [],
  );

  // Xóa tài liệu
  const deleteMaterial = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Sử dụng materialService
      const response = await materialService.deleteMaterial(id);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Đã xảy ra lỗi khi xóa tài liệu');
      return {success: false, data: {}};
    }
  }, []);

  // Tăng lượt tải xuống
  const incrementDownload = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Sử dụng materialService
      const response = await materialService.incrementDownload(id);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật lượt tải');
      return {success: false, data: null as unknown as Material};
    }
  }, []);

  // Lấy tài liệu liên quan
  const getRelatedMaterials = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Sử dụng materialService
      const response = await materialService.getRelatedMaterials(id);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Đã xảy ra lỗi khi tải tài liệu liên quan');
      return {success: false, data: []};
    }
  }, []);

  // Cập nhật tài liệu liên quan
  const updateRelatedMaterials = useCallback(
    async (id: string, relatedMaterialIds: string[]) => {
      setIsLoading(true);
      setError(null);
      try {
        // Sử dụng materialService
        const response = await materialService.updateRelatedMaterials(
          id,
          relatedMaterialIds,
        );
        setIsLoading(false);
        return response;
      } catch (err: any) {
        setIsLoading(false);
        setError(
          err.message || 'Đã xảy ra lỗi khi cập nhật tài liệu liên quan',
        );
        return {success: false, data: null as unknown as Material};
      }
    },
    [],
  );

  return {
    isLoading,
    error,
    getAllMaterials,
    getMaterialStats,
    getMaterialDetail,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    incrementDownload,
    getRelatedMaterials,
    updateRelatedMaterials,
  };
};

export default useMaterial;
