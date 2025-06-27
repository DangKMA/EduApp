import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderComponent from '../../components/HeaderCompunent';
import SearchBar from '../../components/SearchBarComponent';
import {appColors} from '../../constants/appColors';
import useMaterial from '../../hooks/useMaterial';
import {Material as MaterialType} from '../../types/materialType';

const TAB_WIDTH = 110;

const Material = ({navigation}: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialType[]>(
    [],
  );
  const [stats, setStats] = useState({
    totalMaterials: 0,
    courseCount: 0,
    totalDownloads: 0,
  });

  const {
    isLoading,
    error,
    getAllMaterials,
    getMaterialStats,
    incrementDownload,
  } = useMaterial();

  useEffect(() => {
    loadMaterials();
    loadStats();
  }, []);

  // ✅ FIX: Updated loadMaterials để handle response structure đúng
  const loadMaterials = async () => {
    try {
      const params = activeTab !== 'all' ? {category: activeTab} : {};
      const response = await getAllMaterials(params);

      if (response?.success && response?.data) {
        // ✅ FIX: Backend trả về response.data.data là array materials
        const materialsArray = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        setMaterials(materialsArray);
        setFilteredMaterials(materialsArray);
      } else {
        setMaterials([]);
        setFilteredMaterials([]);
      }
    } catch (err) {
      console.error('Error loading materials:', err);
      setMaterials([]);
      setFilteredMaterials([]);
    }
  };

  // ✅ FIX: Updated loadStats để lấy stats từ materials hiện tại
  const loadStats = async () => {
    try {
      // Nếu getMaterialStats không hoạt động, tính từ materials hiện tại
      if (materials && Array.isArray(materials)) {
        const totalDownloads = materials.reduce((sum, material) => {
          return sum + (material?.downloadCount || 0);
        }, 0);

        const uniqueAuthors = new Set(
          materials
            .filter(material => material?.author)
            .map(material => material.author),
        ).size;

        setStats({
          totalMaterials: materials.length,
          courseCount: uniqueAuthors,
          totalDownloads: totalDownloads,
        });
        return;
      }

      // Fallback: Thử gọi API
      const response = await getMaterialStats();
      if (response?.success && response?.data) {
        setStats({
          totalMaterials: response.data.totalMaterials || 0,
          courseCount: response.data.courseCount || 0,
          totalDownloads: response.data.totalDownloads || 0,
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      // Tính stats từ materials local
      if (materials && Array.isArray(materials)) {
        setStats({
          totalMaterials: materials.length,
          courseCount: 0,
          totalDownloads: 0,
        });
      }
    }
  };

  // ✅ FIX: Update stats khi materials thay đổi
  useEffect(() => {
    if (materials && Array.isArray(materials) && materials.length > 0) {
      const totalDownloads = materials.reduce((sum, material) => {
        return sum + (material?.downloadCount || 0);
      }, 0);

      const uniqueAuthors = new Set(
        materials
          .filter(material => material?.author)
          .map(material => material.author),
      ).size;

      setStats({
        totalMaterials: materials.length,
        courseCount: uniqueAuthors,
        totalDownloads: totalDownloads,
      });
    }
  }, [materials]);

  useEffect(() => {
    loadMaterials();
  }, [activeTab]);

  // ✅ FIX: Safe filtering với null checks
  useEffect(() => {
    if (!Array.isArray(materials)) {
      setFilteredMaterials([]);
      return;
    }

    if (searchQuery && searchQuery.trim()) {
      const filtered = materials.filter(item => {
        if (!item) return false;

        const title = item.title?.toLowerCase() || '';
        const author = item.author?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();

        return title.includes(query) || author.includes(query);
      });
      setFilteredMaterials(filtered);
    } else {
      setFilteredMaterials(materials);
    }
  }, [searchQuery, materials]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // ✅ FIX: Safe handleDownload với null checks
  const handleDownload = async (id: string) => {
    if (!id) return;

    try {
      const response = await incrementDownload(id);
      if (response?.success) {
        loadStats();
        setMaterials(prevMaterials =>
          prevMaterials.map(material =>
            material?._id === id
              ? {...material, downloadCount: (material.downloadCount || 0) + 1}
              : material,
          ),
        );
      }
    } catch (err) {
      console.error('Error incrementing download:', err);
    }
  };

  // ✅ FIX: Safe getFileIcon với null checks
  const getFileIcon = (item: MaterialType) => {
    const type = item?.type || '';

    switch (type.toLowerCase()) {
      case 'pdf':
        return <IconMaterial name="file-pdf-box" size={28} color="#FF5722" />;
      case 'doc':
      case 'docx':
        return (
          <IconMaterial name="file-word" size={28} color={appColors.primary} />
        );
      case 'ppt':
      case 'pptx':
        return (
          <IconMaterial name="file-powerpoint" size={28} color="#FF6F00" />
        );
      case 'xls':
      case 'xlsx':
        return <IconMaterial name="file-excel" size={28} color="#4CAF50" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <IconMaterial name="file-video" size={28} color="#9C27B0" />;
      case 'mp3':
      case 'wav':
        return <IconMaterial name="file-music" size={28} color="#2196F3" />;
      case 'zip':
      case 'rar':
        return <IconMaterial name="folder-zip" size={28} color="#795548" />;
      default:
        return <IconMaterial name="file-document" size={28} color="#9E9E9E" />;
    }
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'book':
        return '#4A6FFF';
      case 'slide':
        return '#FF6B6B';
      case 'exercise':
        return '#56CCF2';
      case 'exam':
        return '#9C27B0';
      case 'video':
        return '#FF6F00';
      case 'project':
        return '#6FCF97';
      default:
        return '#9E9E9E';
    }
  };

  const getCategoryName = (category: string) => {
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

  // ✅ FIX: Safe renderMaterialItem với comprehensive null checks
  const renderMaterialItem = ({item}: {item: MaterialType}) => {
    if (!item || !item._id) return null;

    return (
      <TouchableOpacity
        style={styles.materialItem}
        onPress={() =>
          navigation.navigate('MaterialDetail', {materialId: item._id})
        }>
        <View style={styles.materialIconContainer}>{getFileIcon(item)}</View>
        <View style={styles.materialContent}>
          <Text style={styles.materialTitle} numberOfLines={2}>
            {item.title || 'Không có tiêu đề'}
          </Text>
          <Text style={styles.materialCourse} numberOfLines={1}>
            {item.author || 'Không có tác giả'}
          </Text>
          <View style={styles.materialDetails}>
            <Text style={styles.materialSize}>{item.size || '0 KB'}</Text>
            <Text style={styles.materialDate}>
              {item.uploadDate
                ? new Date(item.uploadDate).toLocaleDateString('vi-VN')
                : 'Không có ngày'}
            </Text>
            <View
              style={[
                styles.materialBadge,
                {backgroundColor: `${getBadgeColor(item.category || '')}15`},
              ]}>
              <Text
                style={[
                  styles.materialBadgeText,
                  {color: getBadgeColor(item.category || '')},
                ]}>
                {getCategoryName(item.category || '')}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownload(item._id)}>
          <LinearGradient
            colors={[appColors.primary, '#1A73E8']}
            style={styles.downloadIconContainer}>
            <IconFeather name="download" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderTabButton = (tabId: string, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabId && styles.activeTabButton]}
      onPress={() => setActiveTab(tabId)}>
      <IconMaterial
        name={icon}
        size={20}
        color={activeTab === tabId ? appColors.white : '#64748B'}
      />
      <Text
        style={[styles.tabLabel, activeTab === tabId && styles.activeTabLabel]}
        numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderComponent
        title="Tài liệu học tập"
        showBack
        navigation={navigation}
      />

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Tìm kiếm tài liệu..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.statsContainer}>
        <LinearGradient
          colors={[appColors.primary, '#1A73E8']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalMaterials}</Text>
              <Text style={styles.statLabel}>Tài liệu</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.courseCount}</Text>
              <Text style={styles.statLabel}>Tác giả</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalDownloads}</Text>
              <Text style={styles.statLabel}>Đã tải</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ✅ FIX: Wrap tabs in proper container */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
          style={styles.tabsContainer}>
          {renderTabButton('all', 'Tất cả', 'file-document-multiple')}
          {renderTabButton('book', 'Giáo trình', 'book-open-variant')}
          {renderTabButton('slide', 'Bài giảng', 'presentation')}
          {renderTabButton('exercise', 'Bài tập', 'clipboard-text')}
          {renderTabButton('exam', 'Đề thi', 'file-certificate')}
          {renderTabButton('video', 'Video', 'video')}
          {renderTabButton('project', 'Đồ án', 'folder-open')}
        </ScrollView>
      </View>

      {/* ✅ FIX: Content area with proper flex */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={appColors.primary} />
            <Text style={styles.loadingText}>Đang tải tài liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <IconMaterial name="alert-circle" size={64} color="#94A3B8" />
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={loadMaterials}>
              <Text style={styles.resetButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : !Array.isArray(filteredMaterials) ||
          filteredMaterials.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconMaterial name="file-search" size={64} color="#94A3B8" />
            <Text style={styles.emptyText}>
              Không tìm thấy tài liệu phù hợp
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}>
              <Text style={styles.resetButtonText}>Đặt lại tìm kiếm</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredMaterials}
            renderItem={renderMaterialItem}
            keyExtractor={(item, index) => item?._id || index.toString()}
            contentContainerStyle={styles.materialsListContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <IconMaterial name="file-search" size={64} color="#94A3B8" />
                <Text style={styles.emptyText}>Danh sách tài liệu trống</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.white,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  // ✅ FIX: New wrapper for tabs
  tabsWrapper: {
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  tabsContainer: {
    flexGrow: 0,
    maxHeight: 50,
  },
  tabsScrollContainer: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    alignItems: 'center',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    width: TAB_WIDTH,
    height: 40,
    backgroundColor: appColors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTabButton: {
    backgroundColor: appColors.primary,
    shadowColor: appColors.primary,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 6,
    flexShrink: 1,
  },
  activeTabLabel: {
    color: appColors.white,
  },
  // ✅ FIX: New content container
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: appColors.primary,
    borderRadius: 8,
  },
  resetButtonText: {
    color: appColors.white,
    fontWeight: '500',
  },
  materialsListContainer: {
    padding: 16,
    flexGrow: 1,
  },
  materialItem: {
    flexDirection: 'row',
    backgroundColor: appColors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  materialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  materialContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 20,
  },
  materialCourse: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  materialDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  materialSize: {
    fontSize: 12,
    color: '#94A3B8',
    marginRight: 12,
  },
  materialDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginRight: 12,
  },
  materialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  materialBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  downloadButton: {
    marginLeft: 8,
  },
  downloadIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Material;
