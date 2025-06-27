/**
 * Tính khoảng cách giữa hai điểm trên trái đất sử dụng công thức Haversine
 * @param lat1 Vĩ độ của điểm 1 (latitude)
 * @param lon1 Kinh độ của điểm 1 (longitude)
 * @param lat2 Vĩ độ của điểm 2
 * @param lon2 Kinh độ của điểm 2
 * @returns Khoảng cách giữa hai điểm (đơn vị: mét)
 */
export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  // Bán kính trái đất (đơn vị: mét)
  const R = 6371000;

  // Chuyển đổi từ độ sang radian
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  // Công thức Haversine
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Khoảng cách (đơn vị: mét)
  const distance = R * c;

  return distance;
};

/**
 * Kiểm tra xem một vị trí có nằm trong bán kính của một điểm khác không
 * @param currentLocation Vị trí hiện tại
 * @param targetLocation Vị trí mục tiêu
 * @param radius Bán kính cho phép (đơn vị: mét)
 * @returns true nếu vị trí hiện tại nằm trong bán kính cho phép
 */
export const isWithinRadius = (
  currentLocation: {latitude: number; longitude: number},
  targetLocation: {latitude: number; longitude: number},
  radius: number,
): boolean => {
  const distance = haversineDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    targetLocation.latitude,
    targetLocation.longitude,
  );

  return distance <= radius;
};

/**
 * Chuyển đổi khoảng cách thành văn bản dễ đọc
 * @param distance Khoảng cách (đơn vị: mét)
 * @returns Chuỗi hiển thị khoảng cách
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return '< 1 mét';
  }
  if (distance < 1000) {
    return `${Math.round(distance)} mét`;
  }
  return `${(distance / 1000).toFixed(1)} km`;
};
