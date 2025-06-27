import React, {useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {appColors} from '../../../constants/appColors';
import {Location} from '../../../types/attendanceType';

interface LocationStatusProps {
  error: string | null;
  locationPermissionGranted: boolean;
  currentLocation: Location | null;
  attendanceDistance: number | null;
  onRequestPermission: () => void;
}

const LocationStatus: React.FC<LocationStatusProps> = ({
  error,
  locationPermissionGranted,
  currentLocation,
  attendanceDistance,
  onRequestPermission,
}) => {
  const locationStatus = useMemo(() => {
    if (error) {
      return {
        icon: '❌',
        text: error,
        color: appColors.error,
        showButton: !locationPermissionGranted,
        buttonText: 'Cấp quyền vị trí',
      };
    }

    if (!locationPermissionGranted) {
      return {
        icon: '📍',
        text: 'Chưa cấp quyền truy cập vị trí',
        color: appColors.warning,
        showButton: true,
        buttonText: 'Cấp quyền vị trí',
      };
    }

    if (!currentLocation) {
      return {
        icon: '🔄',
        text: 'Đang xác định vị trí...',
        color: appColors.info,
        showButton: false,
      };
    }

    if (attendanceDistance !== null) {
      const isWithinRange = attendanceDistance <= 400;
      return {
        icon: isWithinRange ? '✅' : '⚠️',
        text: isWithinRange
          ? `Trong phạm vi điểm danh (${attendanceDistance}m)`
          : `Ngoài phạm vi điểm danh (${attendanceDistance}m)`,
        color: isWithinRange ? appColors.success : appColors.warning,
        showButton: false,
      };
    }

    return {
      icon: '✅',
      text: `Vị trí: ${currentLocation.latitude.toFixed(
        6,
      )}, ${currentLocation.longitude.toFixed(6)}`,
      color: appColors.success,
      showButton: false,
    };
  }, [error, locationPermissionGranted, currentLocation, attendanceDistance]);

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Text style={styles.statusIcon}>{locationStatus.icon}</Text>
        <Text style={[styles.statusText, {color: locationStatus.color}]}>
          {locationStatus.text}
        </Text>
      </View>

      {locationStatus.showButton && (
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={onRequestPermission}>
          <Text style={styles.permissionButtonText}>
            {locationStatus.buttonText}
          </Text>
        </TouchableOpacity>
      )}

      {currentLocation && (
        <View style={styles.locationDetails}>
          <Text style={styles.locationDetailText}>
            📍 Tọa độ: {currentLocation.latitude.toFixed(6)},{' '}
            {currentLocation.longitude.toFixed(6)}
          </Text>
          {currentLocation.accuracy && (
            <Text style={styles.locationDetailText}>
              📏 Độ chính xác: ±{Math.round(currentLocation.accuracy)}m
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  permissionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  permissionButtonText: {
    color: appColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  locationDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  locationDetailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginVertical: 2,
  },
});

export default LocationStatus;
