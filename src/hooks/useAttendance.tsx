import {useState, useCallback, useEffect, useRef} from 'react';
import {
  Platform,
  PermissionsAndroid,
  Alert,
  Linking,
  AppState,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import attendanceService from '../services/attendanceService';
import {
  // Core interfaces
  AttendanceSession,
  StudentAttendance,
  AttendanceStats,
  Location,
  ClassLocation,

  // Request interfaces
  CreateSessionRequest,
  SubmitManualAttendanceRequest,
  CreateClassLocationRequest,
  UpdateClassLocationRequest,

  // Response interfaces
  AttendanceStatusResponse,
  CheckInResponse,
  SessionDetailResponse,
  AttendanceHistoryResponse,
  AttendanceStatsResponse,
  AttendanceListResponse,
  SessionCreateResponse,
  CreateSessionFromScheduleResponse,
  UpdateSessionStatusResponse,
  ManualCheckInResponse,
  SubmitManualAttendanceResponse,
  ClassLocationResponse,
  CreateClassLocationResponse,
  UpdateClassLocationResponse,
  DeleteLocationResponse,
  AttendanceStatusType,
  ATTENDANCE_STATUS,
  CHECK_IN_METHOD,
  getAttendanceStatusColor,
  getAttendanceStatusLabel,
  geoJSONToLatLng,
  latLngToGeoJSON,
  getLocationCoordinates,
} from '../types/attendanceType';

// Local interfaces cho hook
interface SessionWithLocation extends AttendanceSession {
  location?: Location;
  radius?: number;
}

interface StudentWithAttendance {
  _id: string;
  fullName: string;
  userID: string;
  attendanceStatus: AttendanceStatusType | null;
  attendanceTime?: string;
  distance?: number;
}

export const useAttendance = () => {
  // ===========================
  // STATES
  // ===========================
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [history, setHistory] = useState<StudentAttendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<SessionWithLocation | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [classLocations, setClassLocations] = useState<ClassLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [attendanceDistance, setAttendanceDistance] = useState<number | null>(
    null,
  );

  // ✅ THÊM STATES THIẾU
  const [myAttendanceStatus, setMyAttendanceStatus] = useState<any>(null);
  const [sessionStudentsStatus, setSessionStudentsStatus] = useState<any>(null);
  const [studentAttendanceStatus, setStudentAttendanceStatus] =
    useState<any>(null);

  // Refs
  const isInitialized = useRef(false);
  const watchIdRef = useRef<number | null>(null);
  const isLocationWatchActive = useRef(false);

  // ===========================
  // LOCATION UTILITIES - IMPROVED WITH COMPREHENSIVE ERROR HANDLING
  // ===========================

  /**
   * ✅ Kiểm tra và yêu cầu quyền truy cập vị trí với bắt lỗi toàn diện
   */
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        try {
          const auth = await Geolocation.requestAuthorization('whenInUse');
          const granted = auth === 'granted';
          setLocationPermissionGranted(granted);

          if (!granted) {
            console.warn('iOS location permission denied:', auth);
            setError(
              'Quyền truy cập vị trí bị từ chối. Vui lòng vào Cài đặt để bật quyền.',
            );

            Alert.alert(
              'Quyền truy cập vị trí',
              'Ứng dụng cần quyền truy cập vị trí để điểm danh. Vui lòng vào Cài đặt để bật quyền.',
              [
                {text: 'Hủy', style: 'cancel'},
                {text: 'Mở Cài đặt', onPress: () => Linking.openSettings()},
              ],
            );
          }

          return granted;
        } catch (iosError: any) {
          console.error('iOS permission request error:', iosError);
          setError('Lỗi khi yêu cầu quyền truy cập vị trí trên iOS');
          setLocationPermissionGranted(false);
          return false;
        }
      }

      // Android permission handling
      try {
        const fineLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        const coarseLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        );

        if (fineLocationGranted && coarseLocationGranted) {
          setLocationPermissionGranted(true);
          return true;
        }

        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const fineLocationPermission =
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
        const coarseLocationPermission =
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

        const isGranted =
          fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED &&
          coarseLocationPermission === PermissionsAndroid.RESULTS.GRANTED;

        setLocationPermissionGranted(isGranted);

        if (!isGranted) {
          console.warn('Android location permissions denied:', granted);

          if (
            fineLocationPermission === PermissionsAndroid.RESULTS.DENIED ||
            coarseLocationPermission === PermissionsAndroid.RESULTS.DENIED
          ) {
            setError('Quyền truy cập vị trí bị từ chối');
            Alert.alert(
              'Quyền truy cập vị trí bị từ chối',
              'Ứng dụng cần quyền truy cập vị trí để điểm danh. Bạn có thể thử lại hoặc vào Cài đặt để cấp quyền.',
              [
                {text: 'Thử lại', onPress: () => requestLocationPermission()},
                {text: 'Mở Cài đặt', onPress: () => Linking.openSettings()},
                {text: 'Hủy', style: 'cancel'},
              ],
            );
          } else if (
            fineLocationPermission ===
              PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
            coarseLocationPermission ===
              PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ) {
            setError('Quyền truy cập vị trí bị chặn vĩnh viễn');
            Alert.alert(
              'Quyền truy cập vị trí bị chặn',
              'Quyền truy cập vị trí đã bị chặn vĩnh viễn. Vui lòng vào Cài đặt ứng dụng để bật quyền.',
              [
                {text: 'Mở Cài đặt', onPress: () => Linking.openSettings()},
                {text: 'Hủy', style: 'cancel'},
              ],
            );
          }
        }

        return isGranted;
      } catch (androidError: any) {
        console.error('Android permission request error:', androidError);
        setError('Lỗi khi yêu cầu quyền truy cập vị trí trên Android');
        setLocationPermissionGranted(false);
        return false;
      }
    } catch (generalError: any) {
      console.error('General permission request error:', generalError);
      setError('Lỗi không xác định khi yêu cầu quyền truy cập vị trí');
      setLocationPermissionGranted(false);
      return false;
    }
  }, []);
  const validateCreateFromScheduleData = useCallback(
    (data: {scheduleId: string; date: string}): string[] => {
      return attendanceService.validateCreateFromScheduleData(data);
    },
    [],
  );

  /**
   * ✅ Validate dữ liệu điểm danh thủ công
   */
  const validateManualAttendanceData = useCallback(
    (data: {
      sessionId: string;
      studentId: string;
      status: string;
      note?: string;
    }): string[] => {
      return attendanceService.validateManualAttendanceData(data);
    },
    [],
  );

  /**
   * ✅ Format trạng thái điểm danh để hiển thị
   */
  const formatAttendanceStatusForDisplay = useCallback(
    (status: AttendanceStatusType) => {
      return attendanceService.formatAttendanceStatusForDisplay(status);
    },
    [],
  );

  /**
   * ✅ Kiểm tra có thể điểm danh không
   */
  const canAttendSession = useCallback(
    (session: {
      date: string;
      startTime: string;
      endTime: string;
      isOpen: boolean;
    }) => {
      return attendanceService.canAttendSession(session);
    },
    [],
  );

  /**
   * ✅ Tính toán thống kê buổi học
   */
  const calculateSessionStatistics = useCallback(
    (
      studentsData: Array<{
        attendanceStatus: {
          status: AttendanceStatusType;
          hasCheckedIn: boolean;
        };
      }>,
    ) => {
      return attendanceService.calculateSessionStatistics(studentsData);
    },
    [],
  );

  /**
   * ✅ Format khoảng cách hiển thị
   */
  const formatDistance = useCallback((distance: number): string => {
    return attendanceService.formatDistance(distance);
  }, []);

  /**
   * ✅ Lấy thời gian hiện tại cho session
   */
  const getCurrentTimeForSession = useCallback((): string => {
    return attendanceService.getCurrentTimeForSession();
  }, []);

  /**
   * ✅ Kiểm tra format thời gian hợp lệ
   */
  const isValidTimeFormat = useCallback((time: string): boolean => {
    return attendanceService.isValidTimeFormat(time);
  }, []);

  /**
   * ✅ So sánh hai thời gian
   */
  const compareTimes = useCallback((time1: string, time2: string): number => {
    return attendanceService.compareTimes(time1, time2);
  }, []);

  /**
   * ✅ Lấy vị trí hiện tại với bắt lỗi toàn diện
   */
  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        setError('Không có quyền truy cập vị trí');
        return null;
      }

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(
            new Error('Timeout: Không thể lấy vị trí trong thời gian quy định'),
          );
        }, 20000); // 20 second timeout

        Geolocation.getCurrentPosition(
          position => {
            try {
              clearTimeout(timeoutId);

              if (!position || !position.coords) {
                throw new Error('Dữ liệu vị trí không hợp lệ');
              }

              const {latitude, longitude, accuracy} = position.coords;

              // Validate coordinates
              if (
                typeof latitude !== 'number' ||
                typeof longitude !== 'number' ||
                isNaN(latitude) ||
                isNaN(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
              ) {
                throw new Error('Tọa độ vị trí không hợp lệ');
              }

              const location: Location = {
                latitude,
                longitude,
                accuracy: accuracy || 0,
              };

              setCurrentLocation(location);
              setError(null);
              resolve(location);
            } catch (processError: any) {
              clearTimeout(timeoutId);
              console.error('Error processing location data:', processError);
              reject(processError);
            }
          },
          error => {
            clearTimeout(timeoutId);

            let errorMessage = 'Không thể lấy vị trí hiện tại';

            try {
              switch (error.code) {
                case 1: // PERMISSION_DENIED
                  errorMessage = 'Quyền truy cập vị trí bị từ chối';
                  setLocationPermissionGranted(false);
                  break;
                case 2: // POSITION_UNAVAILABLE
                  errorMessage =
                    'Không thể xác định vị trí. Hãy kiểm tra GPS đã bật chưa';
                  break;
                case 3: // TIMEOUT
                  errorMessage = 'Lấy vị trí bị quá thời gian. Hãy thử lại';
                  break;
                case 4: // PLAY_SERVICE_NOT_AVAILABLE (Android only)
                  errorMessage = 'Google Play Services không khả dụng';
                  break;
                case 5: // SETTINGS_NOT_SATISFIED (Android only)
                  errorMessage =
                    'Cài đặt vị trí không phù hợp. Vui lòng bật GPS độ chính xác cao';
                  break;
                default:
                  errorMessage = `Lỗi không xác định: ${
                    error.message || 'Unknown error'
                  }`;
              }
            } catch (switchError) {
              console.error('Error in switch statement:', switchError);
              errorMessage = 'Lỗi khi xử lý lỗi vị trí';
            }

            console.error('Location error:', {
              code: error.code,
              message: error.message,
              errorMessage,
            });

            setError(errorMessage);

            // Fallback với low accuracy nếu high accuracy fail
            if (error.code === 3 || error.code === 2) {
              console.log('Trying fallback with low accuracy...');

              const fallbackTimeoutId = setTimeout(() => {
                reject(new Error('Fallback timeout: Không thể lấy vị trí'));
              }, 15000);

              Geolocation.getCurrentPosition(
                fallbackPosition => {
                  try {
                    clearTimeout(fallbackTimeoutId);

                    if (!fallbackPosition || !fallbackPosition.coords) {
                      throw new Error('Dữ liệu vị trí fallback không hợp lệ');
                    }

                    const location: Location = {
                      latitude: fallbackPosition.coords.latitude,
                      longitude: fallbackPosition.coords.longitude,
                      accuracy: fallbackPosition.coords.accuracy || 0,
                    };

                    setCurrentLocation(location);
                    setError(null);
                    resolve(location);
                  } catch (fallbackProcessError: any) {
                    clearTimeout(fallbackTimeoutId);
                    console.error(
                      'Fallback processing error:',
                      fallbackProcessError,
                    );
                    reject(fallbackProcessError);
                  }
                },
                fallbackError => {
                  clearTimeout(fallbackTimeoutId);
                  console.error('Fallback location error:', fallbackError);
                  reject(new Error(errorMessage));
                },
                {
                  enableHighAccuracy: false,
                  timeout: 12000,
                  maximumAge: 30000,
                },
              );
            } else {
              reject(new Error(errorMessage));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 18000,
            maximumAge: 10000,
          },
        );
      });
    } catch (error: any) {
      console.error('getCurrentLocation catch error:', error);
      setError(error.message || 'Lỗi không xác định khi lấy vị trí');
      return null;
    }
  }, [requestLocationPermission]);

  /**
   * ✅ Cải thiện watchLocation với bắt lỗi toàn diện
   */
  const startLocationWatch = useCallback(async (): Promise<number | null> => {
    try {
      if (isLocationWatchActive.current) {
        console.warn('Location watch is already active');
        return watchIdRef.current;
      }

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Không có quyền truy cập vị trí để theo dõi');
        return null;
      }

      // Clear existing watch
      if (watchIdRef.current !== null) {
        try {
          Geolocation.clearWatch(watchIdRef.current);
        } catch (clearError) {
          console.warn('Error clearing existing watch:', clearError);
        }
        watchIdRef.current = null;
      }

      const watchId = Geolocation.watchPosition(
        position => {
          try {
            if (!position || !position.coords) {
              console.warn('Invalid position data received');
              return;
            }

            const location: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy || 0,
            };

            // Validate coordinates
            if (
              isNaN(location.latitude) ||
              isNaN(location.longitude) ||
              location.latitude < -90 ||
              location.latitude > 90 ||
              location.longitude < -180 ||
              location.longitude > 180
            ) {
              console.warn('Invalid coordinates received:', location);
              return;
            }

            setCurrentLocation(location);
            setError(null);
          } catch (watchSuccessError: any) {
            console.error(
              'Error processing watch position:',
              watchSuccessError,
            );
          }
        },
        error => {
          try {
            // Chỉ log error nghiêm trọng, không spam console với timeout
            if (error.code !== 3) {
              console.error('Watch position error:', error);
              setError(`Lỗi theo dõi vị trí: ${error.message}`);
            }
          } catch (watchErrorError) {
            console.error('Error handling watch error:', watchErrorError);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 15000,
          distanceFilter: 10,
          interval: 15000,
          fastestInterval: 8000,
        },
      );

      if (typeof watchId === 'number') {
        watchIdRef.current = watchId;
        isLocationWatchActive.current = true;
        return watchId;
      } else {
        console.error('Invalid watch ID received:', watchId);
        return null;
      }
    } catch (error: any) {
      console.error('startLocationWatch error:', error);
      setError(
        'Không thể theo dõi vị trí: ' + (error.message || 'Lỗi không xác định'),
      );
      return null;
    }
  }, [requestLocationPermission]);

  /**
   * ✅ Cải thiện stopLocationWatch với cleanup toàn diện
   */
  const stopLocationWatch = useCallback(() => {
    try {
      if (watchIdRef.current !== null) {
        try {
          Geolocation.clearWatch(watchIdRef.current);
          console.log('Location watch cleared successfully');
        } catch (clearError) {
          console.error('Error clearing watch:', clearError);
        }
        watchIdRef.current = null;
      }

      isLocationWatchActive.current = false;

      // Stop observing với error handling
      try {
        Geolocation.stopObserving();
      } catch (stopError) {
        // Silent fail - không quan trọng nếu không có gì để stop
        console.log('stopObserving not available or already stopped');
      }
    } catch (error: any) {
      console.error('stopLocationWatch error:', error);
    }
  }, []);

  /**
   * ✅ Function lấy vị trí nhanh với bắt lỗi
   */
  const getQuickLocation = useCallback(async (): Promise<Location | null> => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Không có quyền truy cập vị trí');
        return null;
      }

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Quick location timeout'));
        }, 8000);

        Geolocation.getCurrentPosition(
          position => {
            try {
              clearTimeout(timeoutId);

              if (!position || !position.coords) {
                throw new Error('Invalid quick location data');
              }

              const location: Location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy || 0,
              };

              resolve(location);
            } catch (processError: any) {
              clearTimeout(timeoutId);
              reject(processError);
            }
          },
          error => {
            clearTimeout(timeoutId);
            console.error('Quick location error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 30000,
          },
        );
      });
    } catch (error: any) {
      console.error('getQuickLocation error:', error);
      return null;
    }
  }, [requestLocationPermission]);

  /**
   * ✅ Function check GPS status với bắt lỗi
   */
  const checkGPSStatus = useCallback(async (): Promise<boolean> => {
    try {
      return new Promise(resolve => {
        const timeoutId = setTimeout(() => {
          resolve(false);
        }, 5000);

        Geolocation.getCurrentPosition(
          () => {
            clearTimeout(timeoutId);
            resolve(true);
          },
          error => {
            clearTimeout(timeoutId);
            if (error.code === 2) {
              resolve(false);
            } else {
              resolve(true);
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 4000,
            maximumAge: 60000,
          },
        );
      });
    } catch (error: any) {
      console.error('checkGPSStatus error:', error);
      return false;
    }
  }, []);

  // ===========================
  // COMMON FUNCTIONS WITH COMPREHENSIVE ERROR HANDLING
  // ===========================

  /**
   * ✅ Lấy danh sách buổi điểm danh với bắt lỗi toàn diện
   */
  const getSessionsByCourse = useCallback(
    async (courseId: string): Promise<AttendanceSession[]> => {
      try {
        if (
          !courseId ||
          typeof courseId !== 'string' ||
          courseId.trim() === ''
        ) {
          throw new Error('Course ID không hợp lệ');
        }

        setLoading(true);
        setError(null);

        const response: AttendanceListResponse =
          await attendanceService.getAttendanceSessions(courseId);

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          console.log('getSessionsByCourse response:', response.data);
          if (Array.isArray(response.data)) {
            setSessions(response.data);
            return response.data;
          } else {
            throw new Error('Dữ liệu phản hồi không đúng định dạng');
          }
        } else {
          const errorMessage =
            response.message || 'Không thể tải danh sách điểm danh';
          setError(errorMessage);
          return [];
        }
      } catch (error: any) {
        let errorMessage = 'Không thể tải danh sách điểm danh';

        if (error.response) {
          // API error
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          // Network or other error
          errorMessage = error.message;
        }

        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * ✅ Lấy trạng thái điểm danh cá nhân của sinh viên trong session
   */
  /**
   * ✅ Lấy trạng thái điểm danh cá nhân của sinh viên trong session
   * - Tương thích với attendanceController.js
   * - Xử lý response structure chính xác
   * - Error handling toàn diện
   * - Caching và performance optimization
   */
  const getMyAttendanceStatus = useCallback(
    async (sessionId: string): Promise<any> => {
      try {
        // ✅ VALIDATE INPUT
        if (
          !sessionId ||
          typeof sessionId !== 'string' ||
          sessionId.trim() === ''
        ) {
          throw new Error('Session ID không hợp lệ');
        }

        // ✅ CHECK CACHE FIRST (Optional - có thể bỏ nếu không cần)
        if (myAttendanceStatus && myAttendanceStatus.sessionId === sessionId) {
          const cacheAge = Date.now() - (myAttendanceStatus.cachedAt || 0);
          if (cacheAge < 30000) {
            // Cache 30 seconds
            console.log('📦 Using cached attendance status');
            return myAttendanceStatus;
          }
        }

        setLoading(true);
        setError(null);

        console.log(`🔍 Fetching attendance status for session: ${sessionId}`);

        // ✅ CALL API - ENDPOINT KHỚP VỚI CONTROLLER
        // Controller: GET /api/attendance/sessions/:sessionId/my-status
        const response = await attendanceService.getMyAttendanceStatus(
          sessionId,
        );

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        console.log('📡 Raw API response:', response);

        // ✅ XỬ LÝ RESPONSE THEO CẤU TRÚC CONTROLLER TRẢ VỀ
        if (response.success && response.data) {
          const {data} = response;

          // Controller structure:
          // {
          //   success: true,
          //   data: {
          //     session: {...},
          //     attendanceStatus: {
          //       hasCheckedIn: boolean,
          //       status: string,
          //       checkInTime: string,
          //       checkInMethod: string,
          //       attendanceStatus: string,
          //       distanceFromSchool: number,
          //       isValidLocation: boolean,
          //       note: string
          //     },
          //     canAttend: boolean,
          //     canAttendReason: string,
          //     message: string
          //   }
          // }

          // ✅ EXTRACT ATTENDANCE STATUS
          const attendanceStatus = data.attendanceStatus || {
            hasCheckedIn: false,
            status: 'not_marked',
            checkInTime: null,
            checkInMethod: null,
            attendanceStatus: 'not_checked_in',
            distanceFromSchool: null,
            isValidLocation: null,
            note: null,
          };

          // ✅ ENHANCE WITH ADDITIONAL DATA
          const enhancedStatus = {
            ...attendanceStatus,
            sessionId: sessionId,
            session: data.session,
            canAttend: data.canAttend,
            canAttendReason: data.canAttendReason,
            message: data.message,
            cachedAt: Date.now(),

            // ✅ COMPUTED FIELDS
            isAttended: attendanceStatus.hasCheckedIn,
            statusDisplay: getAttendanceStatusLabel(attendanceStatus.status),
            statusColor: getAttendanceStatusColor(attendanceStatus.status),

            // ✅ TIME FORMATTING
            checkInTimeFormatted: attendanceStatus.checkInTime
              ? new Date(attendanceStatus.checkInTime).toLocaleString('vi-VN')
              : null,

            // ✅ DISTANCE FORMATTING
            distanceFormatted:
              typeof attendanceStatus.distanceFromSchool === 'number'
                ? `${Math.round(attendanceStatus.distanceFromSchool)}m`
                : null,

            // ✅ METHOD DISPLAY
            checkInMethodDisplay:
              attendanceStatus.checkInMethod === 'location'
                ? 'Vị trí GPS'
                : attendanceStatus.checkInMethod === 'manual'
                ? 'Thủ công'
                : attendanceStatus.checkInMethod === 'qr_code'
                ? 'QR Code'
                : attendanceStatus.checkInMethod || 'Không xác định',
          };

          console.log('✅ Processed attendance status:', enhancedStatus);

          // ✅ UPDATE STATE
          setMyAttendanceStatus(enhancedStatus);

          // ✅ UPDATE DISTANCE IF AVAILABLE
          if (typeof attendanceStatus.distanceFromSchool === 'number') {
            setAttendanceDistance(attendanceStatus.distanceFromSchool);
          }

          return enhancedStatus;
        } else {
          // ✅ HANDLE API SUCCESS BUT NO DATA
          const errorMessage =
            response.message || 'Không thể lấy trạng thái điểm danh cá nhân';
          console.warn('⚠️ API success but no data:', errorMessage);

          setError(errorMessage);

          // ✅ RETURN DEFAULT STATUS
          const defaultStatus = {
            sessionId: sessionId,
            hasCheckedIn: false,
            status: 'not_marked',
            checkInTime: null,
            checkInMethod: null,
            attendanceStatus: 'not_checked_in',
            distanceFromSchool: null,
            isValidLocation: null,
            note: null,
            canAttend: false,
            canAttendReason: errorMessage,
            message: errorMessage,
            cachedAt: Date.now(),
            isAttended: false,
            statusDisplay: 'Chưa điểm danh',
            statusColor: '#9CA3AF',
          };

          setMyAttendanceStatus(defaultStatus);
          return defaultStatus;
        }
      } catch (error: any) {
        console.error('❌ getMyAttendanceStatus error:', error);

        // ✅ DETAILED ERROR HANDLING
        let errorMessage = 'Không thể lấy trạng thái điểm danh cá nhân';
        let errorCode = 'UNKNOWN_ERROR';

        if (error.response) {
          // ✅ API ERROR RESPONSES
          const status = error.response.status;
          const serverMessage = error.response.data?.message;

          switch (status) {
            case 400:
              errorMessage = serverMessage || 'Yêu cầu không hợp lệ';
              errorCode = 'BAD_REQUEST';
              break;
            case 401:
              errorMessage = 'Bạn cần đăng nhập để xem trạng thái điểm danh';
              errorCode = 'UNAUTHORIZED';
              break;
            case 403:
              errorMessage = 'Bạn không có quyền xem trạng thái điểm danh này';
              errorCode = 'FORBIDDEN';
              break;
            case 404:
              errorMessage =
                'Không tìm thấy buổi điểm danh hoặc bạn không phải sinh viên của lớp này';
              errorCode = 'NOT_FOUND';
              break;
            case 429:
              errorMessage = 'Quá nhiều yêu cầu, vui lòng thử lại sau';
              errorCode = 'RATE_LIMITED';
              break;
            case 500:
            case 502:
            case 503:
            case 504:
              errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau';
              errorCode = 'SERVER_ERROR';
              break;
            default:
              errorMessage = serverMessage || `Lỗi HTTP ${status}`;
              errorCode = `HTTP_${status}`;
          }
        } else if (
          error.code === 'ECONNABORTED' ||
          error.message?.includes('timeout')
        ) {
          // ✅ TIMEOUT ERROR
          errorMessage = 'Kết nối bị timeout, vui lòng thử lại';
          errorCode = 'TIMEOUT';
        } else if (
          error.message?.includes('Network Error') ||
          !error.response
        ) {
          // ✅ NETWORK ERROR
          errorMessage = 'Lỗi kết nối mạng, vui lòng kiểm tra internet';
          errorCode = 'NETWORK_ERROR';
        } else if (error.message) {
          // ✅ OTHER ERRORS
          errorMessage = error.message;
          errorCode = 'CLIENT_ERROR';
        }

        // ✅ LOG DETAILED ERROR
        console.error('📊 Detailed error info:', {
          sessionId,
          errorCode,
          errorMessage,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config?.url,
        });

        setError(errorMessage);

        // ✅ RETURN ERROR STATUS OBJECT
        const errorStatus = {
          sessionId: sessionId,
          hasCheckedIn: false,
          status: 'error',
          checkInTime: null,
          checkInMethod: null,
          attendanceStatus: 'error',
          distanceFromSchool: null,
          isValidLocation: null,
          note: null,
          canAttend: false,
          canAttendReason: errorMessage,
          message: errorMessage,
          error: true,
          errorCode: errorCode,
          cachedAt: Date.now(),
          isAttended: false,
          statusDisplay: 'Lỗi',
          statusColor: '#EF4444',
        };

        setMyAttendanceStatus(errorStatus);
        return errorStatus;
      } finally {
        setLoading(false);
      }
    },
    [myAttendanceStatus], // ✅ Dependencies cho useCallback
  );

  const getSessionStudentsStatus = useCallback(
    async (sessionId: string): Promise<any> => {
      try {
        if (
          !sessionId ||
          typeof sessionId !== 'string' ||
          sessionId.trim() === ''
        ) {
          throw new Error('Session ID không hợp lệ');
        }

        setLoading(true);
        setError(null);

        const response = await attendanceService.getSessionStudentsStatus(
          sessionId,
        );

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          setSessionStudentsStatus(response.data);
          return response.data;
        } else {
          const errorMessage =
            response.message || 'Không thể lấy danh sách sinh viên';
          setError(errorMessage);
          return null;
        }
      } catch (error: any) {
        console.error('getSessionStudentsStatus error:', error);

        let errorMessage = 'Không thể lấy danh sách sinh viên';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );
  /**
   * ✅ Lấy chi tiết buổi điểm danh với bắt lỗi toàn diện
   */
  const getSessionDetail = useCallback(
    async (sessionId: string): Promise<SessionWithLocation | null> => {
      try {
        if (
          !sessionId ||
          typeof sessionId !== 'string' ||
          sessionId.trim() === ''
        ) {
          throw new Error('Session ID không hợp lệ');
        }

        setLoading(true);
        setError(null);

        const response: SessionDetailResponse =
          await attendanceService.getSessionDetail(sessionId);

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          const sessionData: SessionWithLocation = {...response.data};

          // Extract location safely
          try {
            if (sessionData.schoolLocationId) {
              const coords = getLocationCoordinates(
                sessionData.schoolLocationId,
              );
              sessionData.location = coords;
              sessionData.radius = sessionData.schoolLocationId.radius;
            }
          } catch (locationError) {
            console.warn('Error extracting location:', locationError);
            // Continue without location data
          }

          setSelectedSession(sessionData);

          // Calculate distance safely
          try {
            if (currentLocation && sessionData.location) {
              const distance = attendanceService.calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                sessionData.location.latitude,
                sessionData.location.longitude,
              );
              setAttendanceDistance(distance);
            }
          } catch (distanceError) {
            console.warn('Error calculating distance:', distanceError);
            // Continue without distance data
          }

          return sessionData;
        } else {
          const errorMessage =
            response.message || 'Không thể tải chi tiết buổi điểm danh';
          setError(errorMessage);
          return null;
        }
      } catch (error: any) {
        console.error('getSessionDetail error:', error);

        let errorMessage = 'Không thể tải chi tiết buổi điểm danh';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentLocation],
  );

  /**
   * ✅ Lấy danh sách vị trí lớp học với bắt lỗi toàn diện
   */
  const getClassLocations = useCallback(async (): Promise<ClassLocation[]> => {
    try {
      setLoading(true);
      setError(null);

      const response: ClassLocationResponse =
        await attendanceService.getClassLocations();

      if (!response) {
        throw new Error('Không nhận được phản hồi từ server');
      }

      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setClassLocations(response.data);
          return response.data;
        } else {
          throw new Error('Dữ liệu vị trí lớp học không đúng định dạng');
        }
      } else {
        const errorMessage =
          response.message || 'Không thể tải danh sách vị trí lớp học';
        setError(errorMessage);
        return [];
      }
    } catch (error: any) {
      console.error('getClassLocations error:', error);

      let errorMessage = 'Không thể tải danh sách vị trí lớp học';

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ===========================
  // STUDENT FUNCTIONS WITH COMPREHENSIVE ERROR HANDLING
  // ===========================

  /**
   * ✅ Lấy lịch sử điểm danh với bắt lỗi toàn diện
   */
  const getAttendanceHistory = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
    }): Promise<StudentAttendance[]> => {
      try {
        setLoading(true);
        setError(null);

        // Validate params
        if (params) {
          if (
            params.page &&
            (typeof params.page !== 'number' || params.page < 1)
          ) {
            throw new Error('Page number không hợp lệ');
          }
          if (
            params.limit &&
            (typeof params.limit !== 'number' ||
              params.limit < 1 ||
              params.limit > 100)
          ) {
            throw new Error('Limit không hợp lệ');
          }
        }

        const response: AttendanceHistoryResponse =
          await attendanceService.getAttendanceHistory(params);

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            setHistory(response.data);
            return response.data;
          } else {
            throw new Error('Dữ liệu lịch sử điểm danh không đúng định dạng');
          }
        } else {
          const errorMessage =
            response.message || 'Không thể tải lịch sử điểm danh';
          setError(errorMessage);
          return [];
        }
      } catch (error: any) {
        console.error('getAttendanceHistory error:', error);

        let errorMessage = 'Không thể tải lịch sử điểm danh';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * ✅ Lấy thống kê điểm danh với bắt lỗi toàn diện
   */
  const getAttendanceStats =
    useCallback(async (): Promise<AttendanceStats | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: AttendanceStatsResponse =
          await attendanceService.getAttendanceStats();

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          setStats(response.data);
          return response.data;
        } else {
          const errorMessage =
            response.message || 'Không thể tải thống kê điểm danh';
          setError(errorMessage);
          return null;
        }
      } catch (error: any) {
        console.error('getAttendanceStats error:', error);

        let errorMessage = 'Không thể tải thống kê điểm danh';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * ✅ Kiểm tra trạng thái điểm danh với bắt lỗi toàn diện
   */
  const checkStudentAttendanceStatus = useCallback(async (courseId: string) => {
    try {
      if (!courseId || typeof courseId !== 'string' || courseId.trim() === '') {
        throw new Error('Course ID không hợp lệ');
      }

      setLoading(true);
      setError(null);

      const response: AttendanceStatusResponse =
        await attendanceService.checkStudentAttendanceStatus(courseId);

      if (!response) {
        throw new Error('Không nhận được phản hồi từ server');
      }

      if (response.success && response.data) {
        return response.data;
      } else {
        const errorMessage =
          response.message || 'Không thể kiểm tra trạng thái điểm danh';
        setError(errorMessage);
        return null;
      }
    } catch (error: any) {
      console.error('checkStudentAttendanceStatus error:', error);

      let errorMessage = 'Không thể kiểm tra trạng thái điểm danh';

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ✅ Điểm danh bằng vị trí với bắt lỗi toàn diện
   */
  /**
   * ✅ Điểm danh bằng vị trí với bắt lỗi toàn diện
   */
  /**
   * ✅ Điểm danh bằng vị trí với bắt lỗi toàn diện
   * - Tương thích hoàn toàn với attendanceController.js
   * - Xử lý response structure chính xác
   * - Error handling chi tiết và user-friendly
   * - Location validation trước khi gửi API
   * - Auto refresh data sau khi thành công
   */
  const checkInWithLocation = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        // ✅ VALIDATE INPUT
        if (
          !sessionId ||
          typeof sessionId !== 'string' ||
          sessionId.trim() === ''
        ) {
          throw new Error('Session ID không hợp lệ');
        }

        console.log(`🚀 Starting check-in process for session: ${sessionId}`);

        setLoading(true);
        setError(null);

        // ✅ GET CURRENT LOCATION WITH RETRY MECHANISM
        console.log('📍 Getting current location...');
        let location: Location | null = null;

        try {
          location = await getCurrentLocation();
          if (!location) {
            throw new Error('Không thể lấy vị trí hiện tại');
          }
          console.log('✅ Location obtained:', {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
          });
        } catch (locationError: any) {
          console.error('❌ Location error:', locationError);
          setError(
            'Không thể lấy vị trí hiện tại. Vui lòng kiểm tra GPS và thử lại.',
          );
          return false;
        }

        // ✅ VALIDATE LOCATION WITH CLASS LOCATION (Optional pre-check)
        if (selectedSession?.location && selectedSession?.radius) {
          try {
            console.log('🔍 Pre-validating location against class location...');

            const validation = attendanceService.validateLocationForCheckIn(
              location,
              selectedSession as unknown as ClassLocation,
            );

            console.log('📊 Location validation result:', validation);

            if (!validation.isValid) {
              const errorMsg =
                validation.message || 'Vị trí không hợp lệ để điểm danh';
              console.warn('⚠️ Location validation failed:', errorMsg);
              setError(errorMsg);
              setAttendanceDistance(validation.distance);
              return false;
            }

            // Update distance for UI
            setAttendanceDistance(validation.distance);
            console.log(
              `✅ Pre-validation passed. Distance: ${validation.distance}m`,
            );
          } catch (validationError: any) {
            console.warn(
              '⚠️ Location validation error (continuing anyway):',
              validationError,
            );
            // Continue with check-in even if pre-validation fails
          }
        }

        // ✅ CALL CHECK-IN API
        console.log('🌐 Calling check-in API...');
        const response: CheckInResponse =
          await attendanceService.checkInWithLocation(sessionId, location);

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        console.log('📡 API Response received:', {
          success: response.success,
          hasData: !!response.data,
          message: response.message,
        });

        // ✅ HANDLE SUCCESSFUL RESPONSE
        if (response.success && response.data) {
          const {data} = response;

          // Controller trả về structure:
          // {
          //   message: string,
          //   status: string,
          //   checkInTime: string,
          //   courseName: string,
          //   courseCode: string,
          //   distance: number,
          //   attendance: {
          //     _id: string,
          //     sessionId: string,
          //     studentId: string,
          //     status: string,
          //     checkInTime: string,
          //     checkInMethod: string,
          //     isValidLocation: boolean,
          //     distanceFromSchool: number,
          //     // ... other fields
          //   }
          // }

          console.log('🎉 Check-in successful:', {
            status: data.status,
            checkInTime: data.checkInTime,
            courseName: data.courseName,
            courseCode: data.courseCode,
            distance: data.distance,
            attendanceId: data.attendance?._id,
            isValidLocation: data.attendance?.isValidLocation,
            checkInMethod: data.attendance?.checkInMethod,
          });

          // ✅ UPDATE ATTENDANCE DISTANCE FROM RESPONSE
          if (typeof data.distance === 'number') {
            setAttendanceDistance(data.distance);
            console.log(`📏 Distance updated: ${data.distance}m`);
          }

          // ✅ UPDATE MY ATTENDANCE STATUS
          if (data.attendance) {
            const updatedStatus = {
              sessionId: sessionId,
              hasCheckedIn: true,
              status: data.attendance.status,
              checkInTime: data.attendance.checkInTime,
              checkInMethod: data.attendance.checkInMethod,
              attendanceStatus:
                data.attendance.attendanceStatus || 'checked_in',
              distanceFromSchool: data.attendance.distanceFromSchool,
              isValidLocation: data.attendance.isValidLocation,
              note: data.attendance.note,

              // Enhanced fields
              isAttended: true,
              statusDisplay: getAttendanceStatusLabel(data.attendance.status),
              statusColor: getAttendanceStatusColor(data.attendance.status),
              checkInTimeFormatted: new Date(
                data.attendance.checkInTime,
              ).toLocaleString('vi-VN'),
              distanceFormatted:
                typeof data.attendance.distanceFromSchool === 'number'
                  ? `${Math.round(data.attendance.distanceFromSchool)}m`
                  : null,
              checkInMethodDisplay:
                data.attendance.checkInMethod === 'location'
                  ? 'Vị trí GPS'
                  : data.attendance.checkInMethod === 'manual'
                  ? 'Thủ công'
                  : data.attendance.checkInMethod === 'qr_code'
                  ? 'QR Code'
                  : data.attendance.checkInMethod || 'Không xác định',
              cachedAt: Date.now(),
            };

            setMyAttendanceStatus(updatedStatus);
            console.log('✅ My attendance status updated');
          }

          // ✅ UPDATE SELECTED SESSION WITH LATEST INFO
          if (selectedSession && data.attendance) {
            try {
              const updatedSession = {
                ...selectedSession,
                lastCheckIn: data.checkInTime,
                totalAttended: (selectedSession as any).totalAttended
                  ? (selectedSession as any).totalAttended + 1
                  : 1,
                lastAttendanceStatus: data.attendance.status,
                lastAttendanceDistance: data.attendance.distanceFromSchool,
              };
              setSelectedSession(updatedSession);
              console.log('✅ Selected session updated');
            } catch (updateError: any) {
              console.warn('⚠️ Error updating selected session:', updateError);
              // Don't fail check-in if session update fails
            }
          }

          // ✅ REFRESH ATTENDANCE HISTORY
          try {
            console.log('🔄 Refreshing attendance history...');
            await getAttendanceHistory();
            console.log('✅ Attendance history refreshed');
          } catch (historyError: any) {
            console.warn('⚠️ Error refreshing history:', historyError);
            // Don't fail check-in if history refresh fails
          }

          // ✅ REFRESH ATTENDANCE STATS
          try {
            console.log('📊 Refreshing attendance stats...');
            await getAttendanceStats();
            console.log('✅ Attendance stats refreshed');
          } catch (statsError: any) {
            console.warn('⚠️ Error refreshing stats:', statsError);
            // Don't fail check-in if stats refresh fails
          }

          // ✅ SUCCESS LOG
          console.log('🎊 Check-in process completed successfully');
          return true;
        } else {
          // ✅ HANDLE API SUCCESS BUT NO DATA OR FAILURE
          const errorMessage = response.message || 'Điểm danh thất bại';
          console.warn('⚠️ API success but no data or failure:', errorMessage);
          setError(errorMessage);
          return false;
        }
      } catch (error: any) {
        console.error('❌ checkInWithLocation error:', error);

        let errorMessage = 'Điểm danh thất bại';
        let errorCode = 'UNKNOWN_ERROR';

        // ✅ DETAILED ERROR HANDLING BY TYPE
        if (error.response) {
          const status = error.response.status;
          const serverMessage = error.response.data?.message;

          console.error('🚫 API Error Details:', {
            status,
            serverMessage,
            data: error.response.data,
            url: error.config?.url,
          });

          switch (status) {
            case 400:
              // Bad Request - có thể là đã điểm danh, vị trí không hợp lệ, etc.
              if (
                serverMessage?.includes('đã điểm danh') ||
                serverMessage?.includes('already checked in') ||
                serverMessage?.includes('duplicate attendance')
              ) {
                errorMessage = 'Bạn đã điểm danh cho buổi học này rồi';
                errorCode = 'ALREADY_CHECKED_IN';
              } else if (
                serverMessage?.includes('cách vị trí') ||
                serverMessage?.includes('too far') ||
                serverMessage?.includes('distance') ||
                serverMessage?.includes('phạm vi') ||
                serverMessage?.includes('ngoài khu vực')
              ) {
                errorMessage =
                  serverMessage || 'Bạn đang ở quá xa vị trí trường học';
                errorCode = 'LOCATION_TOO_FAR';
              } else if (
                serverMessage?.includes('session') &&
                (serverMessage?.includes('closed') ||
                  serverMessage?.includes('đóng'))
              ) {
                errorMessage = 'Buổi điểm danh đã đóng';
                errorCode = 'SESSION_CLOSED';
              } else if (
                serverMessage?.includes('time') ||
                (serverMessage?.includes('thời gian') &&
                  serverMessage?.includes('kết thúc'))
              ) {
                errorMessage = 'Đã hết thời gian điểm danh';
                errorCode = 'TIME_EXPIRED';
              } else {
                errorMessage =
                  serverMessage || 'Yêu cầu điểm danh không hợp lệ';
                errorCode = 'BAD_REQUEST';
              }
              break;

            case 401:
              errorMessage = 'Bạn cần đăng nhập để điểm danh';
              errorCode = 'UNAUTHORIZED';
              break;

            case 403:
              errorMessage = 'Bạn không có quyền điểm danh buổi học này';
              errorCode = 'FORBIDDEN';
              break;

            case 404:
              errorMessage =
                'Không tìm thấy buổi học hoặc bạn không phải sinh viên của lớp này';
              errorCode = 'NOT_FOUND';
              break;

            case 409:
              // Conflict - thường là duplicate attendance
              errorMessage = 'Bạn đã điểm danh cho buổi học này rồi';
              errorCode = 'DUPLICATE_ATTENDANCE';
              break;

            case 422:
              errorMessage = serverMessage || 'Dữ liệu điểm danh không hợp lệ';
              errorCode = 'VALIDATION_ERROR';
              break;

            case 429:
              errorMessage =
                'Quá nhiều yêu cầu điểm danh, vui lòng thử lại sau';
              errorCode = 'RATE_LIMITED';
              break;

            case 500:
            case 502:
            case 503:
            case 504:
              errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau';
              errorCode = 'SERVER_ERROR';
              break;

            default:
              errorMessage = serverMessage || `Lỗi HTTP ${status}`;
              errorCode = `HTTP_${status}`;
          }
        } else if (
          error.code === 'ECONNABORTED' ||
          error.message?.includes('timeout')
        ) {
          // ✅ TIMEOUT ERROR
          errorMessage = 'Kết nối bị timeout, vui lòng thử lại';
          errorCode = 'TIMEOUT';
        } else if (
          error.message?.includes('Network Error') ||
          error.code === 'NETWORK_ERROR' ||
          !error.response
        ) {
          // ✅ NETWORK ERROR
          errorMessage =
            'Lỗi kết nối mạng, vui lòng kiểm tra internet và thử lại';
          errorCode = 'NETWORK_ERROR';
        } else if (
          error.message?.includes('coordinates') ||
          error.message?.includes('location') ||
          error.message?.includes('GPS')
        ) {
          // ✅ LOCATION ERROR
          errorMessage = error.message || 'Lỗi xử lý vị trí GPS';
          errorCode = 'LOCATION_ERROR';
        } else if (error.message?.includes('Session ID')) {
          // ✅ VALIDATION ERROR
          errorMessage = error.message;
          errorCode = 'VALIDATION_ERROR';
        } else if (error.message) {
          // ✅ OTHER KNOWN ERRORS
          errorMessage = error.message;
          errorCode = 'CLIENT_ERROR';
        }

        // ✅ LOG COMPREHENSIVE ERROR INFO
        console.error('📋 Comprehensive Error Report:', {
          sessionId,
          errorCode,
          errorMessage,
          originalError: error.message,
          httpStatus: error.response?.status,
          serverResponse: error.response?.data,
          requestUrl: error.config?.url,
          requestMethod: error.config?.method,
          hasLocation: !!location,
          locationAccuracy: location?.accuracy,
          timestamp: new Date().toISOString(),
        });

        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
        console.log('🏁 Check-in process finished');
      }
    },
    [
      getCurrentLocation,
      getAttendanceHistory,
      getAttendanceStats,
      selectedSession,
      myAttendanceStatus,
    ], // ✅ Dependencies for useCallback
  );

  // ===========================
  // TEACHER FUNCTIONS WITH COMPREHENSIVE ERROR HANDLING
  // ===========================

  /**
   * ✅ Tạo buổi điểm danh mới với bắt lỗi toàn diện
   */
  const createAttendanceSession = useCallback(
    async (
      sessionData: CreateSessionRequest,
    ): Promise<AttendanceSession | null> => {
      try {
        if (!sessionData || typeof sessionData !== 'object') {
          throw new Error('Dữ liệu session không hợp lệ');
        }

        setLoading(true);
        setError(null);

        // Validate session data
        try {
          const validationErrors =
            attendanceService.validateSessionData(sessionData);
          if (validationErrors.length > 0) {
            throw new Error(
              `Dữ liệu không hợp lệ: ${validationErrors.join(', ')}`,
            );
          }
        } catch (validationError) {
          console.warn('Validation error:', validationError);
          // Continue without validation if service method doesn't exist
        }

        const response: SessionCreateResponse =
          await attendanceService.createAttendanceSession(sessionData);

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          setSessions(prev => [response.data!, ...prev]);
          return response.data;
        } else {
          const errorMessage =
            response.message || 'Không thể tạo buổi điểm danh';
          setError(errorMessage);
          return null;
        }
      } catch (error: any) {
        console.error('createAttendanceSession error:', error);

        let errorMessage = 'Không thể tạo buổi điểm danh';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * ✅ Tạo buổi điểm danh từ lịch học với bắt lỗi toàn diện
   */
  const createAttendanceFromSchedule = useCallback(
    async (
      scheduleId: string,
      date: string,
    ): Promise<AttendanceSession | null> => {
      try {
        if (
          !scheduleId ||
          typeof scheduleId !== 'string' ||
          scheduleId.trim() === ''
        ) {
          throw new Error('Schedule ID không hợp lệ');
        }

        if (!date || typeof date !== 'string' || date.trim() === '') {
          throw new Error('Ngày không hợp lệ');
        }

        setLoading(true);
        setError(null);

        const response: CreateSessionFromScheduleResponse =
          await attendanceService.createAttendanceFromSchedule(
            scheduleId,
            date,
          );

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          setSessions(prev => [response.data!, ...prev]);
          return response.data;
        } else {
          const errorMessage =
            response.message || 'Không thể tạo buổi điểm danh từ lịch học';
          setError(errorMessage);
          return null;
        }
      } catch (error: any) {
        console.error('createAttendanceFromSchedule error:', error);

        let errorMessage = 'Không thể tạo buổi điểm danh từ lịch học';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * ✅ Cập nhật trạng thái buổi điểm danh với bắt lỗi toàn diện
   */
  const updateSessionStatus = useCallback(
    async (sessionId: string, isOpen: boolean): Promise<boolean> => {
      try {
        if (
          !sessionId ||
          typeof sessionId !== 'string' ||
          sessionId.trim() === ''
        ) {
          throw new Error('Session ID không hợp lệ');
        }

        if (typeof isOpen !== 'boolean') {
          throw new Error('Trạng thái không hợp lệ');
        }

        setLoading(true);
        setError(null);

        const response: UpdateSessionStatusResponse =
          await attendanceService.updateSessionStatus(sessionId, isOpen);

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          // Update selected session
          if (selectedSession && selectedSession._id === sessionId) {
            const updatedSession: SessionWithLocation = {
              ...response.data,
              location: selectedSession.location,
              radius: selectedSession.radius,
            };
            setSelectedSession(updatedSession);
          }

          // Update sessions list
          setSessions(prev =>
            prev.map(session =>
              session._id === sessionId ? {...session, isOpen} : session,
            ),
          );

          return true;
        } else {
          const errorMessage =
            response.message || 'Cập nhật trạng thái thất bại';
          setError(errorMessage);
          return false;
        }
      } catch (error: any) {
        console.error('updateSessionStatus error:', error);

        let errorMessage = 'Cập nhật trạng thái thất bại';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [selectedSession],
  );

  /**
   * ✅ Điểm danh thủ công với bắt lỗi toàn diện
   */
  const manualCheckIn = useCallback(
    async (
      sessionId: string,
      studentId: string,
      status: AttendanceStatusType,
      note?: string,
    ): Promise<boolean> => {
      try {
        if (
          !sessionId ||
          typeof sessionId !== 'string' ||
          sessionId.trim() === ''
        ) {
          throw new Error('Session ID không hợp lệ');
        }

        if (
          !studentId ||
          typeof studentId !== 'string' ||
          studentId.trim() === ''
        ) {
          throw new Error('Student ID không hợp lệ');
        }

        if (!status || !Object.values(ATTENDANCE_STATUS).includes(status)) {
          throw new Error('Trạng thái điểm danh không hợp lệ');
        }

        setLoading(true);
        setError(null);

        const response: ManualCheckInResponse =
          await attendanceService.manualCheckIn(
            sessionId,
            studentId,
            status,
            note,
          );

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success) {
          // Refresh session detail
          try {
            await getSessionDetail(sessionId);
          } catch (refreshError) {
            console.warn('Error refreshing session detail:', refreshError);
            // Don't fail the check-in if refresh fails
          }
          return true;
        } else {
          const errorMessage =
            response.message || 'Điểm danh thủ công thất bại';
          setError(errorMessage);
          return false;
        }
      } catch (error: any) {
        console.error('manualCheckIn error:', error);

        let errorMessage = 'Điểm danh thủ công thất bại';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getSessionDetail],
  );

  /**
   * ✅ Nộp danh sách điểm danh thủ công với bắt lỗi toàn diện
   */
  const submitManualAttendance = useCallback(
    async (attendanceData: SubmitManualAttendanceRequest) => {
      try {
        if (!attendanceData || typeof attendanceData !== 'object') {
          throw new Error('Dữ liệu điểm danh không hợp lệ');
        }

        if (
          !attendanceData.sessionId ||
          typeof attendanceData.sessionId !== 'string'
        ) {
          throw new Error('Session ID không hợp lệ');
        }

        setLoading(true);
        setError(null);

        const response: SubmitManualAttendanceResponse =
          await attendanceService.submitManualAttendance(attendanceData);

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          // Refresh session detail if needed
          if (
            selectedSession &&
            selectedSession._id === attendanceData.sessionId
          ) {
            try {
              await getSessionDetail(attendanceData.sessionId);
            } catch (refreshError) {
              console.warn('Error refreshing session detail:', refreshError);
            }
          }

          return response.data;
        } else {
          const errorMessage =
            response.message || 'Điểm danh thủ công thất bại';
          setError(errorMessage);
          return null;
        }
      } catch (error: any) {
        console.error('submitManualAttendance error:', error);

        let errorMessage = 'Điểm danh thủ công thất bại';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getSessionDetail, selectedSession],
  );

  // ===========================
  // LOCATION MANAGEMENT WITH COMPREHENSIVE ERROR HANDLING
  // ===========================

  /**
   * ✅ Tạo vị trí lớp học mới với bắt lỗi toàn diện
   */
  const createClassLocation = useCallback(
    async (
      locationData: CreateClassLocationRequest,
    ): Promise<ClassLocation | null> => {
      try {
        if (!locationData || typeof locationData !== 'object') {
          throw new Error('Dữ liệu vị trí không hợp lệ');
        }

        setLoading(true);
        setError(null);

        // Validate location data
        try {
          const validationErrors =
            attendanceService.validateLocationData(locationData);
          if (validationErrors.length > 0) {
            throw new Error(
              `Dữ liệu không hợp lệ: ${validationErrors.join(', ')}`,
            );
          }
        } catch (validationError) {
          console.warn('Location validation error:', validationError);
          // Continue without validation if service method doesn't exist
        }

        const response: CreateClassLocationResponse =
          await attendanceService.createClassLocation(locationData);

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          setClassLocations(prev => [response.data!, ...prev]);
          return response.data;
        } else {
          const errorMessage =
            response.message || 'Không thể tạo vị trí lớp học';
          setError(errorMessage);
          return null;
        }
      } catch (error: any) {
        console.error('createClassLocation error:', error);

        let errorMessage = 'Không thể tạo vị trí lớp học';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * ✅ Cập nhật vị trí lớp học với bắt lỗi toàn diện
   */
  const updateClassLocation = useCallback(
    async (
      locationId: string,
      updateData: UpdateClassLocationRequest,
    ): Promise<ClassLocation | null> => {
      try {
        if (
          !locationId ||
          typeof locationId !== 'string' ||
          locationId.trim() === ''
        ) {
          throw new Error('Location ID không hợp lệ');
        }

        if (!updateData || typeof updateData !== 'object') {
          throw new Error('Dữ liệu cập nhật không hợp lệ');
        }

        setLoading(true);
        setError(null);

        const response: UpdateClassLocationResponse =
          await attendanceService.updateClassLocation(locationId, updateData);

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success && response.data) {
          setClassLocations(prev =>
            prev.map(location =>
              location._id === locationId ? response.data! : location,
            ),
          );
          return response.data;
        } else {
          const errorMessage =
            response.message || 'Không thể cập nhật vị trí lớp học';
          setError(errorMessage);
          return null;
        }
      } catch (error: any) {
        console.error('updateClassLocation error:', error);

        let errorMessage = 'Không thể cập nhật vị trí lớp học';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * ✅ Xóa vị trí lớp học với bắt lỗi toàn diện
   */
  const deleteClassLocation = useCallback(
    async (locationId: string): Promise<boolean> => {
      try {
        if (
          !locationId ||
          typeof locationId !== 'string' ||
          locationId.trim() === ''
        ) {
          throw new Error('Location ID không hợp lệ');
        }

        setLoading(true);
        setError(null);

        const response: DeleteLocationResponse =
          await attendanceService.deleteClassLocation(locationId);

        if (!response) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        if (response.success) {
          setClassLocations(prev =>
            prev.filter(location => location._id !== locationId),
          );
          return true;
        } else {
          const errorMessage =
            response.message || 'Không thể xóa vị trí lớp học';
          setError(errorMessage);
          return false;
        }
      } catch (error: any) {
        console.error('deleteClassLocation error:', error);

        let errorMessage = 'Không thể xóa vị trí lớp học';

        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ===========================
  // UTILITY FUNCTIONS WITH COMPREHENSIVE ERROR HANDLING
  // ===========================

  /**
   * ✅ Kiểm tra vị trí có phù hợp với lớp học không
   */
  const isWithinClassLocation = useCallback(
    (classLocation: ClassLocation): boolean => {
      try {
        if (!currentLocation) {
          return false;
        }

        if (!classLocation || typeof classLocation !== 'object') {
          console.warn('Invalid class location data');
          return false;
        }

        const result = attendanceService.isWithinRadius(
          currentLocation,
          classLocation,
        );

        if (typeof result.distance === 'number') {
          setAttendanceDistance(result.distance);
        }

        return result.isWithin;
      } catch (error: any) {
        console.error('isWithinClassLocation error:', error);
        return false;
      }
    },
    [currentLocation],
  );

  /**
   * ✅ Tính khoảng cách đến lớp học
   */
  const calculateDistanceToClass = useCallback(
    (classLocation: ClassLocation): number | null => {
      try {
        if (!currentLocation) {
          return null;
        }

        if (!classLocation || typeof classLocation !== 'object') {
          console.warn('Invalid class location data');
          return null;
        }

        const coords = getLocationCoordinates(classLocation);

        if (
          !coords ||
          typeof coords.latitude !== 'number' ||
          typeof coords.longitude !== 'number'
        ) {
          console.warn('Invalid coordinates from class location');
          return null;
        }

        return attendanceService.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          coords.latitude,
          coords.longitude,
        );
      } catch (error: any) {
        console.error('calculateDistanceToClass error:', error);
        return null;
      }
    },
    [currentLocation],
  );

  /**
   * ✅ Convert AttendanceSession thành StudentWithAttendance[]
   */
  const convertToStudentsWithAttendance = useCallback(
    (
      session: AttendanceSession,
      courseStudents: any[],
    ): StudentWithAttendance[] => {
      try {
        if (!session || typeof session !== 'object') {
          console.warn('Invalid session data');
          return [];
        }

        if (!Array.isArray(courseStudents)) {
          console.warn('Invalid course students data');
          return [];
        }

        return courseStudents.map(student => {
          try {
            // Find attendance record for this student
            const attendanceRecord = (session as any).attendedStudents?.find(
              (attended: any) => attended.studentId._id === student._id,
            );

            return {
              _id: student._id || '',
              fullName:
                student.fullName ||
                `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                'Chưa có tên',
              userID: student.userID || student.studentId || student._id || '',
              attendanceStatus: attendanceRecord?.status || null,
              attendanceTime: attendanceRecord?.checkInTime,
              distance: attendanceRecord?.distance,
            };
          } catch (studentError) {
            console.warn('Error processing student:', studentError);
            return {
              _id: student._id || '',
              fullName: 'Lỗi dữ liệu sinh viên',
              userID: student._id || '',
              attendanceStatus: null,
            };
          }
        });
      } catch (error: any) {
        console.error('convertToStudentsWithAttendance error:', error);
        return [];
      }
    },
    [],
  );

  /**
   * ✅ Làm mới dữ liệu với bắt lỗi toàn diện
   */
  const refreshData = useCallback(async (): Promise<void> => {
    try {
      setRefreshing(true);
      setError(null);

      // Get current location
      let location: Location | null = null;
      try {
        location = await getCurrentLocation();
      } catch (locationError) {
        console.warn('Error getting location during refresh:', locationError);
        // Continue without location
      }

      // Refresh data in parallel
      const promises = [
        getAttendanceHistory().catch(error => {
          console.warn('Error refreshing history:', error);
          return [];
        }),
        getAttendanceStats().catch(error => {
          console.warn('Error refreshing stats:', error);
          return null;
        }),
        getClassLocations().catch(error => {
          console.warn('Error refreshing locations:', error);
          return [];
        }),
      ];

      await Promise.allSettled(promises);

      // Calculate distance if we have session and location
      if (selectedSession?._id && location && selectedSession?.location) {
        try {
          const distance = attendanceService.calculateDistance(
            location.latitude,
            location.longitude,
            selectedSession.location.latitude,
            selectedSession.location.longitude,
          );
          setAttendanceDistance(distance);
        } catch (distanceError) {
          console.warn(
            'Error calculating distance during refresh:',
            distanceError,
          );
        }
      }
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      setError('Có lỗi xảy ra khi làm mới dữ liệu');
    } finally {
      setRefreshing(false);
    }
  }, [
    getCurrentLocation,
    getAttendanceHistory,
    getAttendanceStats,
    getClassLocations,
    selectedSession,
  ]);

  // ===========================
  // CLEANUP EFFECTS WITH COMPREHENSIVE ERROR HANDLING
  // ===========================

  /**
   * ✅ Cleanup effect - tránh memory leak
   */
  useEffect(() => {
    return () => {
      try {
        console.log('Cleaning up attendance hook...');
        stopLocationWatch();

        // Clear any remaining timeouts
        if (watchIdRef.current && typeof watchIdRef.current === 'number') {
          try {
            clearTimeout(watchIdRef.current);
          } catch (clearError) {
            console.warn('Error clearing timeout:', clearError);
          }
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
    };
  }, [stopLocationWatch]);

  /**
   * ✅ App state changes handler
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      try {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          console.log('App going to background - stopping location watch');
          stopLocationWatch();
        } else if (nextAppState === 'active') {
          console.log('App became active');
          // Don't auto-restart watch, let user action trigger
        }
      } catch (error) {
        console.error('Error handling app state change:', error);
      }
    };

    let subscription: any;

    try {
      subscription = AppState?.addEventListener?.(
        'change',
        handleAppStateChange,
      );
    } catch (error) {
      console.warn('Error setting up app state listener:', error);
    }

    return () => {
      try {
        subscription?.remove?.();
      } catch (error) {
        console.warn('Error removing app state listener:', error);
      }
    };
  }, [stopLocationWatch]);

  /**
   * ✅ Initialization effect
   */
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      (async () => {
        try {
          console.log('Initializing attendance hook...');

          // Check permission first
          const hasPermission = await requestLocationPermission();

          if (hasPermission) {
            // Get initial location
            try {
              await getCurrentLocation();
            } catch (locationError) {
              console.warn('Error getting initial location:', locationError);
              // Don't fail initialization if location fails
            }
          } else {
            console.log('Location permission not granted');
          }
        } catch (error) {
          console.error('Initialization error:', error);
          // Don't throw error to avoid crashing app
        }
      })();
    }
  }, [requestLocationPermission, getCurrentLocation]);

  // ===========================
  // RETURN HOOK INTERFACE
  // ===========================

  return {
    sessions,
    history,
    stats,
    selectedSession,
    currentLocation,
    classLocations,
    loading,
    error,
    refreshing,
    locationPermissionGranted,
    attendanceDistance,

    // ===== NEW STATES (THÊM) =====
    myAttendanceStatus,
    sessionStudentsStatus,
    studentAttendanceStatus,

    // ===== SETTERS (THÊM) =====
    setSessions,
    setHistory,
    setStats,
    setSelectedSession,
    setCurrentLocation,
    setClassLocations,
    setLoading,
    setError,
    setRefreshing,
    setLocationPermissionGranted,
    setAttendanceDistance,
    setMyAttendanceStatus,
    setSessionStudentsStatus,
    setStudentAttendanceStatus,

    // ===== LOCATION UTILITIES =====
    getCurrentLocation,
    requestLocationPermission,
    startLocationWatch,
    stopLocationWatch,
    getQuickLocation,
    checkGPSStatus,

    // ===== COMMON FUNCTIONS =====
    getSessionsByCourse,
    getSessionDetail,
    getClassLocations,

    // ===== STUDENT FUNCTIONS =====
    getAttendanceHistory,
    getAttendanceStats,
    checkStudentAttendanceStatus,
    checkInWithLocation,
    getMyAttendanceStatus, // NEW

    // ===== TEACHER FUNCTIONS =====
    createAttendanceSession,
    createAttendanceFromSchedule,
    updateSessionStatus,
    manualCheckIn,
    submitManualAttendance,
    getSessionStudentsStatus, // NEW

    // ===== LOCATION MANAGEMENT =====
    createClassLocation,
    updateClassLocation,
    deleteClassLocation,

    // ===== UTILITIES (NEW) =====
    validateCreateFromScheduleData,
    validateManualAttendanceData,
    formatAttendanceStatusForDisplay,
    canAttendSession,
    calculateSessionStatistics,
    formatDistance,
    getCurrentTimeForSession,
    isValidTimeFormat,
    compareTimes,

    // ===== HELPER UTILITIES =====
    isWithinClassLocation,
    calculateDistanceToClass,
    convertToStudentsWithAttendance,
    refreshData,

    // ===== FORMAT UTILITIES từ service =====
    formatTime: attendanceService.formatTime,
    formatDate: attendanceService.formatDate,
    calculateAttendanceRate: attendanceService.calculateAttendanceRate,
    formatAttendanceRate: attendanceService.formatAttendanceRate,
    getAttendanceStatusColor,
    getAttendanceStatusLabel,

    // ===== GeoJSON UTILITIES =====
    geoJSONToLatLng,
    latLngToGeoJSON,
    getLocationCoordinates,

    // ===== CONSTANTS =====
    ATTENDANCE_STATUS,
    CHECK_IN_METHOD,

    // ===== ADDITIONAL UTILITIES =====
    prepareLocationForCheckIn: attendanceService.prepareLocationForCheckIn,
    extractLocationCoordinates: attendanceService.extractLocationCoordinates,
    validateLocationForCheckIn: attendanceService.validateLocationForCheckIn,
    getTodayDateISO: attendanceService.getTodayDateISO,
    generateSessionTitle: attendanceService.generateSessionTitle,
  };
};
export default useAttendance;
