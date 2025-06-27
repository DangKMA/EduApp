import {useState, useCallback, useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

interface SimpleLocationHook {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<{
    latitude: number;
    longitude: number;
  } | null>;
  checkPermissionStatus: () => Promise<boolean>; // ✅ Add this
}

const useSimpleLocation = (): SimpleLocationHook => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Check current permission status
  const checkPermissionStatus = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'android') {
        setHasPermission(true);
        return true; // iOS handles differently
      }

      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      setHasPermission(result);
      return result;
    } catch (error) {
      console.error('❌ Error checking permission:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  // ✅ Request Android location permission
  const requestAndroidPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'android') {
        return true; // iOS handles this differently
      }

      // Check if already granted
      const isAlreadyGranted = await checkPermissionStatus();
      if (isAlreadyGranted) {
        setError(null);
        return true;
      }

      ('📍 Requesting Android location permission...');

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Quyền truy cập vị trí',
          message: 'Ứng dụng cần quyền truy cập vị trí để thực hiện điểm danh',
          buttonNeutral: 'Hỏi sau',
          buttonNegative: 'Hủy',
          buttonPositive: 'Đồng ý',
        },
      );

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      setHasPermission(isGranted);

      if (!isGranted) {
        setError('Quyền truy cập vị trí bị từ chối');
        ('❌ Location permission denied by user');
      } else {
        setError(null);
        ('✅ Location permission granted');
      }

      return isGranted;
    } catch (error) {
      console.error('❌ Error requesting Android permission:', error);
      setError('Không thể yêu cầu quyền truy cập vị trí');
      setHasPermission(false);
      return false;
    }
  }, [checkPermissionStatus]);

  // ✅ Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      ('📍 Starting permission request process...');

      if (Platform.OS === 'android') {
        const result = await requestAndroidPermission();
        return result;
      } else {
        // For iOS, we'll just try to get location and handle error
        setHasPermission(true);
        return true;
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      setError('Không thể yêu cầu quyền truy cập vị trí');
      setHasPermission(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [requestAndroidPermission]);

  // ✅ Get current location
  const getCurrentLocation = useCallback(async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    try {
      setIsLoading(true);
      setError(null);

      ('📍 Getting current location...');

      // Check permission first
      const currentPermissionStatus = await checkPermissionStatus();

      if (!currentPermissionStatus) {
        ('📍 No permission, requesting...');
        const granted = await requestPermission();
        if (!granted) {
          setError('Vui lòng cấp quyền truy cập vị trí');
          return null;
        }
      }

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout: Không thể lấy vị trí trong 15 giây'));
        }, 15000);

        ('📍 Calling Geolocation.getCurrentPosition...');

        Geolocation.getCurrentPosition(
          position => {
            clearTimeout(timeoutId);
            const {latitude, longitude} = position.coords;

            setError(null);
            resolve({latitude, longitude});
          },
          error => {
            clearTimeout(timeoutId);
            console.error('❌ Geolocation error:', error);

            let errorMessage = 'Không thể lấy vị trí hiện tại';

            switch (error.code) {
              case 1: // PERMISSION_DENIED
                errorMessage = 'Vui lòng cấp quyền truy cập vị trí';
                break;
              case 2: // POSITION_UNAVAILABLE
                errorMessage = 'Vị trí không khả dụng. Vui lòng bật GPS';
                break;
              case 3: // TIMEOUT
                errorMessage = 'Timeout khi lấy vị trí. Vui lòng thử lại';
                break;
              default:
                errorMessage = `Lỗi vị trí: ${error.message || 'Unknown'}`;
            }

            setError(errorMessage);
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          },
        );
      });
    } catch (error) {
      console.error('❌ Error getting current location:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Lỗi không xác định khi lấy vị trí';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkPermissionStatus, requestPermission]);

  // ✅ Check permission on mount
  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  return {
    hasPermission,
    isLoading,
    error,
    requestPermission,
    getCurrentLocation,
    checkPermissionStatus, // ✅ Export this
  };
};

export default useSimpleLocation;
