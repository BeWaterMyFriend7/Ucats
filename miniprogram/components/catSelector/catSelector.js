Component({
  properties: {
    selectedCats: {
      type: Array,
      value: [],
      observer: function(newVal) {
        if (newVal && newVal.length > 0) {
          const selectedIds = newVal.map(cat => {
            if (typeof cat === 'string') {
              return String(cat); // 如果是字符串ID
            } else if (cat && cat._id) {
              return String(cat._id); // 如果是对象，取_id
            }
            return String(cat);
          });
          this.setData({
            selectedIds: selectedIds
          });
          this.updateSelectedCatsDisplay(selectedIds);
        } else {
          this.setData({
            selectedIds: [],
            selectedCatsDisplay: []
          });
        }
      }
    }
  },

  data: {
    showSelector: false,
    allCats: [],
    filteredCats: [],
    searchKeyword: '',
    selectedIds: [],
    loading: false,
    selectedCatsDisplay: [], // 用于显示已选择的猫咪
    searchTimer: null // 搜索防抖定时器
  },

  lifetimes: {
    attached() {
      this.loadAllCats();
    },
    ready() {
      // 在组件准备好后，确保已选择的猫咪能正确显示
      if (this.data.selectedCats && this.data.selectedCats.length > 0) {
        const selectedIds = this.data.selectedCats.map(cat => {
          if (typeof cat === 'string') {
            return String(cat);
          } else if (cat && cat._id) {
            return String(cat._id);
          }
          return String(cat);
        });
        this.setData({
          selectedIds: selectedIds
        });
        this.updateSelectedCatsDisplay(selectedIds);
      }
    },
    detached() {
      // 组件销毁时清除定时器
      if (this.data.searchTimer) {
        clearTimeout(this.data.searchTimer);
      }
    }
  },

  methods: {
    // 更新已选择猫咪的显示
    updateSelectedCatsDisplay(selectedIds) {
      console.log('updateSelectedCatsDisplay called with:', selectedIds);
      console.log('allCats length:', this.data.allCats ? this.data.allCats.length : 0);
      
      if (!this.data.allCats || this.data.allCats.length === 0) {
        // 如果allCats还没加载完成，延迟更新
        setTimeout(() => {
          this.updateSelectedCatsDisplay(selectedIds);
        }, 100);
        return;
      }
      
      // 确保数据类型一致性
      const normalizedSelectedIds = selectedIds.map(id => String(id));
      const selectedCatsDisplay = this.data.allCats.filter(cat => 
        normalizedSelectedIds.includes(String(cat._id))
      );
      
      console.log('selectedCatsDisplay:', selectedCatsDisplay);
      
      this.setData({
        selectedCatsDisplay: selectedCatsDisplay
      });
    },

    // 加载所有猫咪
    loadAllCats() {
      this.setData({ loading: true });
      const app = getApp();
      
      app.mpServerless.db.collection('ucats')
        .find({
          isDeleted: { $ne: true }
        }, {
          sort: { name: 1 }
        })
        .then(res => {
          this.setData({
            allCats: res.result || [],
            filteredCats: res.result || [],
            loading: false
          });
          
          // 加载完成后，更新已选择猫咪的显示
          if (this.data.selectedIds && this.data.selectedIds.length > 0) {
            this.updateSelectedCatsDisplay(this.data.selectedIds);
          }
        })
        .catch(err => {
          console.error('加载猫咪列表失败:', err);
          this.setData({ loading: false });
        });
    },

    // 显示选择器
    showCatSelector() {
      console.log('showCatSelector called, allCats length:', this.data.allCats.length);
      console.log('current selectedIds:', this.data.selectedIds);
      
      // 清除之前的搜索定时器
      if (this.data.searchTimer) {
        clearTimeout(this.data.searchTimer);
        this.setData({ searchTimer: null });
      }
      
      // 为每个猫咪添加isSelected属性
      const filteredCats = this.data.allCats.map(cat => ({
        ...cat,
        isSelected: this.data.selectedIds.includes(String(cat._id))
      }));
      
      // 一次性设置所有状态，避免多次setData
      this.setData({ 
        showSelector: true,
        searchKeyword: '',
        filteredCats: filteredCats,
        searchTimer: null
      });
      
      // 确保选中状态正确显示
      if (this.data.selectedIds && this.data.selectedIds.length > 0) {
        this.updateSelectedCatsDisplay(this.data.selectedIds);
      }
    },

    // 隐藏选择器
    hideCatSelector() {
      // 清除搜索定时器
      if (this.data.searchTimer) {
        clearTimeout(this.data.searchTimer);
      }
      
      this.setData({ 
        showSelector: false,
        searchTimer: null
      });
    },

    // 搜索框获得焦点
    onSearchFocus() {
      console.log('Search input focused');
      // 不需要重新设置showSelector，避免闪屏
      // 弹窗已经显示时保持现状即可
    },

    // 阻止事件冒泡
    stopPropagation() {
      // 空方法，仅用于阻止事件冒泡
    },

    // 搜索猫咪
    onSearchInput(e) {
      const keyword = e.detail.value.trim();
      
      // 清除之前的定时器
      if (this.data.searchTimer) {
        clearTimeout(this.data.searchTimer);
      }
      
      // 立即更新搜索关键词显示，但不执行搜索
      this.setData({
        searchKeyword: keyword
      });
      
      // 设置新的定时器，300ms后执行搜索
      const timer = setTimeout(() => {
        console.log('执行搜索:', keyword);
        
        let filtered = this.data.allCats;
        
        if (keyword) {
          filtered = this.data.allCats.filter(cat => {
            // 支持中文名称搜索，不区分大小写
            const catName = cat.name || '';
            const catAppearance = cat.appearance || '';
            
            // 包含搜索即匹配，支持中文
            return catName.includes(keyword) || 
                   catAppearance.includes(keyword) ||
                   catName.toLowerCase().includes(keyword.toLowerCase()) ||
                   catAppearance.toLowerCase().includes(keyword.toLowerCase());
          });
        }
        
        // 更新选中状态
        filtered = filtered.map(cat => ({
          ...cat,
          isSelected: this.data.selectedIds.includes(String(cat._id))
        }));
        
        console.log('搜索结果数量:', filtered.length);
        
        this.setData({
          filteredCats: filtered,
          searchTimer: null
        });
      }, 300);
      
      this.setData({
        searchTimer: timer
      });
    },

    // 选择/取消选择猫咪
    toggleCatSelection(e) {
      const catId = e.currentTarget.dataset.id;
      console.log('toggleCatSelection - clicked catId:', catId, 'type:', typeof catId);
      console.log('toggleCatSelection - current selectedIds:', this.data.selectedIds, 'types:', this.data.selectedIds.map(id => typeof id));
      
      // 确保ID类型一致性，统一转换为字符串
      const normalizedCatId = String(catId);
      const selectedIds = this.data.selectedIds.map(id => String(id));
      const index = selectedIds.indexOf(normalizedCatId);
      
      if (index > -1) {
        selectedIds.splice(index, 1);
        console.log('toggleCatSelection - removed cat from selection');
      } else {
        selectedIds.push(normalizedCatId);
        console.log('toggleCatSelection - added cat to selection');
      }
      
      console.log('toggleCatSelection - new selectedIds:', selectedIds);
      
      // 更新filteredCats中的isSelected状态
      const filteredCats = this.data.filteredCats.map(cat => ({
        ...cat,
        isSelected: selectedIds.includes(String(cat._id))
      }));
      
      // 只更新selectedIds和filteredCats，不更新显示列表，等待用户确认
      this.setData({ 
        selectedIds,
        filteredCats
      });
    },

    // 确认选择
    confirmSelection() {
      console.log('confirmSelection called, selectedIds:', this.data.selectedIds);
      const selectedCats = this.data.allCats.filter(cat => 
        this.data.selectedIds.includes(String(cat._id))
      );
      
      console.log('selectedCats to emit:', selectedCats);
      
      // 更新显示的猫咪列表
      this.updateSelectedCatsDisplay(this.data.selectedIds);
      
      this.triggerEvent('catselected', { cats: selectedCats });
      this.hideCatSelector();
    },

    // 删除已选择的猫咪
    removeSelectedCat(e) {
      const catId = e.currentTarget.dataset.id;
      const normalizedCatId = String(catId);
      const selectedIds = this.data.selectedIds.filter(id => String(id) !== normalizedCatId);
      this.setData({ selectedIds });
      
      // 更新显示的猫咪列表
      this.updateSelectedCatsDisplay(selectedIds);
      
      const selectedCats = this.data.allCats.filter(cat => 
        selectedIds.includes(String(cat._id))
      );
      
      this.triggerEvent('catselected', { cats: selectedCats });
    }
  }
});