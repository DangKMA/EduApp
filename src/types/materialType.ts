export interface Material {
  _id: string;
  title: string;
  course?: string; // ✅ Optional vì backend không trả về field này
  author: string;
  type: string;
  size: string;
  uploadDate: string;
  category: string;
  downloadCount: number;
  description: string;
  chapters: string[];
  tags: string[];
  filePath: string;
  relatedMaterials: MaterialBasic[]; // ✅ Bỏ optional vì backend luôn trả về array
  createdAt: string;
  updatedAt: string;
}

export interface MaterialBasic {
  _id: string;
  title: string;
  type: string;
}

export interface MaterialStats {
  totalMaterials: number;
  courseCount: number;
  totalDownloads: number;
}

export interface FilterParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ✅ Update Pagination interface để match backend exactly
export interface Pagination {
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ✅ Update MaterialData interface để match backend response exactly
export interface MaterialData {
  count: number;
  total: number;
  pagination: Pagination;
  data: Material[];
}

// ✅ Fix Meta interface - backend trả về string cho total
export interface Meta {
  pagination: {
    total: string; // ✅ "Lấy danh sách tài liệu thành công"
    totalPages: number | null;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

// ✅ Update ApiResponse để match backend structure exactly
export interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
  data?: T;
  message?: string;
  meta?: Meta;
  error?: string | string[];
}

// ✅ Specific type cho getAllMaterials response
export interface GetMaterialsResponse extends ApiResponse<MaterialData> {
  data: MaterialData;
  meta: Meta;
}

export interface RelatedMaterialsRequest {
  relatedMaterialIds: string[];
}
