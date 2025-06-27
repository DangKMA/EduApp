import apiClient from '../apis/apiClient';
import {
  Material,
  MaterialStats,
  FilterParams,
  ApiResponse,
  GetMaterialsResponse,
} from '../types/materialType';

const API_PATH = '/materials';

export const materialService = {
  getAllMaterials: async (
    params?: FilterParams,
  ): Promise<ApiResponse<Material[]>> => {
    try {
      const response = await apiClient.get<GetMaterialsResponse>(
        API_PATH,
        params,
      );

      if (
        response.success &&
        response.data?.data &&
        Array.isArray(response.data.data)
      ) {
        return {
          success: true,
          timestamp: response.timestamp,
          data: response.data.data,
          message:
            response.meta?.pagination?.total ||
            'Lấy danh sách tài liệu thành công',
          meta: response.meta,
        };
      } else {
        return {
          success: true,
          timestamp: response.timestamp || new Date().toISOString(),
          data: [],
          message: 'Không có tài liệu nào',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải tài liệu',
        data: [],
        error: err.message || 'Đã xảy ra lỗi khi tải tài liệu',
      };
    }
  },

  getMaterialStats: async (): Promise<ApiResponse<MaterialStats>> => {
    try {
      const materialsResponse = await materialService.getAllMaterials();

      if (materialsResponse.success && Array.isArray(materialsResponse.data)) {
        const materials = materialsResponse.data;

        const stats: MaterialStats = {
          totalMaterials: materials.length,
          courseCount: calculateUniqueCourses(materials),
          totalDownloads: calculateTotalDownloads(materials),
        };

        return {
          success: true,
          timestamp: new Date().toISOString(),
          data: stats,
          message: 'Lấy thống kê thành công',
        };
      } else {
        return {
          success: true,
          timestamp: new Date().toISOString(),
          data: {
            totalMaterials: 0,
            courseCount: 0,
            totalDownloads: 0,
          },
          message: 'Không có dữ liệu để tính thống kê',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải thông tin thống kê',
        data: {
          totalMaterials: 0,
          courseCount: 0,
          totalDownloads: 0,
        },
        error: err.message || 'Đã xảy ra lỗi khi tải thông tin thống kê',
      };
    }
  },

  getMaterialDetail: async (id: string): Promise<ApiResponse<Material>> => {
    try {
      const response = await apiClient.get<ApiResponse<Material>>(
        `${API_PATH}/${id}`,
      );

      if (response.success && response.data) {
        return response;
      } else {
        throw new Error(response.message || 'Không thể tải chi tiết tài liệu');
      }
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải chi tiết tài liệu',
        error: err.message || 'Đã xảy ra lỗi khi tải chi tiết tài liệu',
      } as ApiResponse<Material>;
    }
  },

  createMaterial: async (
    materialData: Omit<Material, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ApiResponse<Material>> => {
    try {
      const response = await apiClient.post<ApiResponse<Material>>(
        API_PATH,
        materialData,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tạo tài liệu',
        error: err.message || 'Đã xảy ra lỗi khi tạo tài liệu',
      } as ApiResponse<Material>;
    }
  },

  updateMaterial: async (
    id: string,
    materialData: Partial<Material>,
  ): Promise<ApiResponse<Material>> => {
    try {
      const response = await apiClient.put<ApiResponse<Material>>(
        `${API_PATH}/${id}`,
        materialData,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi cập nhật tài liệu',
        error: err.message || 'Đã xảy ra lỗi khi cập nhật tài liệu',
      } as ApiResponse<Material>;
    }
  },

  deleteMaterial: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(
        `${API_PATH}/${id}`,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi xóa tài liệu',
        data: null,
        error: err.message || 'Đã xảy ra lỗi khi xóa tài liệu',
      };
    }
  },

  incrementDownload: async (id: string): Promise<ApiResponse<Material>> => {
    try {
      const response = await apiClient.put<ApiResponse<Material>>(
        `${API_PATH}/${id}/download`,
        {},
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi cập nhật lượt tải',
        error: err.message || 'Đã xảy ra lỗi khi cập nhật lượt tải',
      } as ApiResponse<Material>;
    }
  },

  getRelatedMaterials: async (id: string): Promise<ApiResponse<Material[]>> => {
    try {
      const response = await apiClient.get<GetMaterialsResponse>(
        `${API_PATH}/${id}/related`,
      );

      if (response.success && response.data?.data) {
        return {
          success: true,
          timestamp: response.timestamp,
          data: response.data.data,
          message: 'Lấy tài liệu liên quan thành công',
        };
      } else {
        return {
          success: true,
          timestamp: new Date().toISOString(),
          data: [],
          message: 'Không có tài liệu liên quan',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải tài liệu liên quan',
        data: [],
        error: err.message || 'Đã xảy ra lỗi khi tải tài liệu liên quan',
      };
    }
  },

  updateRelatedMaterials: async (
    id: string,
    relatedMaterialIds: string[],
  ): Promise<ApiResponse<Material>> => {
    try {
      const response = await apiClient.put<ApiResponse<Material>>(
        `${API_PATH}/${id}/related`,
        {relatedMaterialIds},
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi cập nhật tài liệu liên quan',
        error: err.message || 'Đã xảy ra lỗi khi cập nhật tài liệu liên quan',
      } as ApiResponse<Material>;
    }
  },

  uploadMaterialFile: async (
    formData: FormData,
  ): Promise<ApiResponse<{fileUrl: string}>> => {
    try {
      const response = await apiClient.upload<ApiResponse<{fileUrl: string}>>(
        `${API_PATH}/upload`,
        formData,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải lên file tài liệu',
        data: {fileUrl: ''},
        error: err.message || 'Đã xảy ra lỗi khi tải lên file tài liệu',
      };
    }
  },
};

const calculateUniqueCourses = (materials: Material[]): number => {
  const uniqueAuthors = new Set(materials.map(m => m.author));
  return uniqueAuthors.size;
};

const calculateTotalDownloads = (materials: Material[]): number => {
  return materials.reduce(
    (total, material) => total + (material.downloadCount || 0),
    0,
  );
};

export default materialService;
