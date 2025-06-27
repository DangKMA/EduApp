import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderComponent from '../../components/HeaderCompunent';
import {appColors} from '../../constants/appColors';
import useMaterial from '../../hooks/useMaterial';
import {Material} from '../../types/materialType';

const MaterialDetailScreen = ({navigation, route}: any) => {
  const {materialId} = route.params;
  const [material, setMaterial] = useState<Material | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [relatedMaterials, setRelatedMaterials] = useState<Material[]>([]);

  // Sử dụng hook useMaterial
  const {
    isLoading,
    error,
    getMaterialDetail,
    getRelatedMaterials,
    incrementDownload,
  } = useMaterial();

  // Tải thông tin chi tiết tài liệu
  useEffect(() => {
    const loadMaterialDetail = async () => {
      try {
        const response = await getMaterialDetail(materialId);
        if (response.success) {
          setMaterial(response.data);
        } else {
          Alert.alert(
            'Lỗi',
            response.error?.toString() || 'Không thể tải thông tin tài liệu',
          );
        }
      } catch (err) {
        console.error('Error loading material detail:', err);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải thông tin tài liệu');
      }
    };

    const loadRelatedMaterials = async () => {
      try {
        const response = await getRelatedMaterials(materialId);
        if (response.success) {
          setRelatedMaterials(response.data);
        }
      } catch (err) {
        console.error('Error loading related materials:', err);
      }
    };

    loadMaterialDetail();
    loadRelatedMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  const getFileIcon = (type: any) => {
    switch (type) {
      case 'pdf':
        return (
          <IconMaterial name="file-pdf-box" size={36} color={appColors.red} />
        );
      case 'doc':
      case 'docx':
        return (
          <IconMaterial name="file-word" size={36} color={appColors.primary} />
        );
      case 'ppt':
      case 'pptx':
        return (
          <IconMaterial name="file-powerpoint" size={36} color="#FF6F00" />
        );
      case 'xls':
      case 'xlsx':
        return <IconMaterial name="file-excel" size={36} color="#4CAF50" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <IconMaterial name="file-video" size={36} color="#9C27B0" />;
      case 'mp3':
      case 'wav':
        return <IconMaterial name="file-music" size={36} color="#2196F3" />;
      case 'zip':
      case 'rar':
        return <IconMaterial name="folder-zip" size={36} color="#795548" />;
      default:
        return (
          <IconMaterial name="file-document" size={36} color={appColors.gray} />
        );
    }
  };

  const getCategoryName = (category: any) => {
    switch (category) {
      case 'book':
        return 'Giáo trình';
      case 'slide':
        return 'Bài giảng';
      case 'exercise':
        return 'Bài tập';
      case 'exam':
        return 'Đề thi';
      case 'video':
        return 'Video';
      case 'project':
        return 'Đồ án';
      default:
        return 'Khác';
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await incrementDownload(materialId);
      if (response.success) {
        setMaterial(prevMaterial => {
          if (!prevMaterial) return null;
          return {
            ...prevMaterial,
            downloadCount: prevMaterial.downloadCount + 1,
          };
        });
        Alert.alert('Thành công', 'Tài liệu đã được tải xuống thành công!');
      } else {
        Alert.alert(
          'Lỗi',
          response.error?.toString() || 'Không thể tải tài liệu',
        );
      }
    } catch (err) {
      console.error('Error during download:', err);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải tài liệu');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!material) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await Share.share({
        message: `Tài liệu học tập: ${material.title} - ${material.course}. Tải ứng dụng EduApp để xem thêm!`,
        title: material.title,
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chia sẻ tài liệu này');
    }
  };

  const handlePreview = () => {
    Alert.alert('Thông báo', 'Tính năng xem trước đang được phát triển');
  };

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <HeaderComponent
          title="Chi tiết tài liệu"
          showBack
          navigation={navigation}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <View style={styles.container}>
        <HeaderComponent
          title="Chi tiết tài liệu"
          showBack
          navigation={navigation}
        />
        <View style={styles.errorContainer}>
          <IconMaterial name="alert-circle" size={64} color={appColors.gray2} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Nếu không có dữ liệu tài liệu
  if (!material) {
    return (
      <View style={styles.container}>
        <HeaderComponent
          title="Chi tiết tài liệu"
          showBack
          navigation={navigation}
        />
        <View style={styles.errorContainer}>
          <IconMaterial name="file-search" size={64} color={appColors.gray2} />
          <Text style={styles.errorText}>Không tìm thấy tài liệu</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderComponent
        title="Chi tiết tài liệu"
        showBack
        navigation={navigation}
        rightIcons={[
          {
            name: 'share',
            onPress: handleShare,
          },
        ]}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSection}>
          <View style={styles.fileIconContainer}>
            {getFileIcon(material.type)}
          </View>
          <Text style={styles.title}>{material.title}</Text>
          <Text style={styles.course}>{material.course}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {material.type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {getCategoryName(material.category)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePreview}>
            <LinearGradient
              colors={['#56CCF2', '#2F80ED']}
              style={styles.actionButtonGradient}>
              <IconFeather name="eye" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionButtonText}>Xem trước</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownload}>
            <LinearGradient
              colors={[appColors.primary, '#1A73E8']}
              style={styles.actionButtonGradient}>
              {isDownloading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <IconFeather name="download" size={20} color="#FFFFFF" />
              )}
            </LinearGradient>
            <Text style={styles.actionButtonText}>
              {isDownloading ? 'Đang tải...' : 'Tải xuống'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.actionButtonGradient}>
              <IconFeather name="share-2" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionButtonText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <IconFeather name="user" size={16} color={appColors.gray2} />
            <Text style={styles.infoLabel}>Tác giả:</Text>
            <Text style={styles.infoValue}>{material.author}</Text>
          </View>

          <View style={styles.infoItem}>
            <IconFeather name="calendar" size={16} color={appColors.gray2} />
            <Text style={styles.infoLabel}>Ngày đăng:</Text>
            <Text style={styles.infoValue}>
              {new Date(material.uploadDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <IconFeather name="hard-drive" size={16} color={appColors.gray2} />
            <Text style={styles.infoLabel}>Kích thước:</Text>
            <Text style={styles.infoValue}>{material.size}</Text>
          </View>

          <View style={styles.infoItem}>
            <IconFeather name="download" size={16} color={appColors.gray2} />
            <Text style={styles.infoLabel}>Lượt tải:</Text>
            <Text style={styles.infoValue}>{material.downloadCount}</Text>
          </View>
        </View>

        {material.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descriptionText}>{material.description}</Text>
          </View>
        )}

        {material.chapters && material.chapters.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Nội dung</Text>
            {material.chapters.map((chapter, index) => (
              <View key={index} style={styles.chapterItem}>
                <IconMaterial
                  name="file-document-outline"
                  size={18}
                  color={appColors.primary}
                />
                <Text style={styles.chapterText}>{chapter}</Text>
              </View>
            ))}
          </View>
        )}

        {material.tags && material.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Thẻ</Text>
            <View style={styles.tagsContainer}>
              {material.tags.map((tag, index) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {relatedMaterials.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Tài liệu liên quan</Text>
            {relatedMaterials.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.relatedItem}
                onPress={() =>
                  navigation.push('MaterialDetail', {materialId: item._id})
                }>
                <View style={styles.relatedIconContainer}>
                  {getFileIcon(item.type)}
                </View>
                <Text style={styles.relatedTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <IconFeather
                  name="chevron-right"
                  size={20}
                  color={appColors.gray2}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: appColors.gray,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: appColors.gray,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: appColors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: appColors.white,
    fontWeight: '500',
  },
  headerSection: {
    backgroundColor: appColors.white,
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
  },
  fileIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  course: {
    fontSize: 14,
    color: appColors.gray,
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  typeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: appColors.primary,
  },
  categoryBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF9800',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: appColors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: appColors.text,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: appColors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: appColors.gray,
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: appColors.text,
    fontWeight: '500',
    flex: 1,
  },
  descriptionSection: {
    backgroundColor: appColors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: appColors.text,
    lineHeight: 22,
  },
  contentSection: {
    backgroundColor: appColors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chapterText: {
    fontSize: 14,
    color: appColors.text,
    marginLeft: 12,
    flex: 1,
  },
  tagsSection: {
    backgroundColor: appColors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: appColors.gray,
  },
  relatedSection: {
    backgroundColor: appColors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  relatedIconContainer: {
    marginRight: 12,
  },
  relatedTitle: {
    fontSize: 14,
    color: appColors.text,
    flex: 1,
  },
});

export default MaterialDetailScreen;
